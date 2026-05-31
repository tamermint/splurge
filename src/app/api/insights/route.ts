import { computeForecast } from "@/domain/engine/computeForecast";
import {
  ForecastInput,
  ForecastOutput,
  ForecastOverrides,
  ForecastOverrideSchema,
} from "@/domain/types/forecast";
import { auth } from "@/lib/auth";
import {
  ForecastError,
  IncompleteUser,
  InvalidUser,
  ValidationError,
} from "@/lib/errors";
import { generateSplurgeInsights } from "@/services/ai/aiInsights";
import { getForecastInputOfUser } from "@/services/data/forecastService";
import { NextResponse } from "next/server";
import z from "zod";
import { Redis } from "@upstash/redis";

/**
 * @module api/insights/route
 * @description
 * The Insights Route Handler is the orchestration layer for the Splurge AI "Brain."
 * It serves as a high-fidelity gateway that validates engine-computed forecasts
 * before submitting them for strategic LLM analysis.
 * * @param {Request} req - The standard Web Request containing the forecast results to be analyzed.
 * @returns {Promise<NextResponse>}
 * - **200 OK:** Returns `{ success: true, insights: string }` containing the AI briefing.
 * - **400 Bad Request:** Returns a `validation_error` (schema mismatch) or `forecast_error` (logic failure).
 * - **500 Internal Error:** Returns a `system_error` for unhandled runtime exceptions.
 * * @throws {ForecastError} Caught and mapped to a 400 status for handled domain exceptions.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorised access!",
          type: "auth_error",
        },
        {
          status: 401,
        },
      );
    }
    const userId = session.user.id;
    //extract the overrides
    let overrides: ForecastOverrides = {};
    try {
      const text = await request.text();
      if (text) {
        const rawJson = JSON.parse(text);
        const parsed = ForecastOverrideSchema.safeParse(rawJson);

        if (!parsed.success) {
          const formattedErrors = z.prettifyError(parsed.error);
          throw new ValidationError(`Validation failed: ${formattedErrors}`);
        }

        overrides = parsed.data;
      }
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Invalid JSON Payload for overrides");
    }

    //build the domain input
    const domainInput: ForecastInput = await getForecastInputOfUser(
      userId,
      overrides,
    );

    //recompute the forecast with today's date
    const today: Date = new Date();
    const forecastOutput: ForecastOutput = computeForecast(domainInput, today);

    //generate insights
    const insights = await generateSplurgeInsights(forecastOutput);

    //Redis injection
    if (
      insights.suggestedOverrides &&
      Object.keys(insights.suggestedOverrides).length > 0
    ) {
      const draftKey = `splurge:draft:${userId}`;

      await redis.set(draftKey, JSON.stringify(insights.suggestedOverrides));
    }

    return NextResponse.json({ success: true, insights });
  } catch (error: unknown) {
    let status = 500;
    let type = "system_error";
    let message = "An unexpected error occurred";
    if (error instanceof ForecastError) {
      status = 400;
      type = "forecast_error";
      message = error.message;
    } else if (error instanceof IncompleteUser) {
      status = 400;
      type = "incomplete_user_error";
      message = error.message;
    } else if (error instanceof InvalidUser) {
      status = 404;
      type = "invalid_user_error";
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { success: false, error: message, type },
      { status },
    );
  }
}

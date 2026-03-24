import { ForecastOutput, ForecastOutputSchema } from "@/domain/types/forecast";
import { ForecastError } from "@/lib/errors";
import { generateSplurgeInsights } from "@/services/ai/aiInsights";
import { NextResponse } from "next/server";
import z from "zod";

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

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const rawForecast = body.data ?? body;

    const validation = ForecastOutputSchema.safeParse(rawForecast);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid forecast data structure for AI analysis",
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const forecast: ForecastOutput = validation.data;
    const insights = await generateSplurgeInsights(forecast);

    return NextResponse.json({ success: true, insights });
  } catch (error: unknown) {
    let status = 500;
    let type = "system_error";
    let message = "An unexpected error occurred";
    if (error instanceof ForecastError) {
      status = 400;
      type = "forecast_error";
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

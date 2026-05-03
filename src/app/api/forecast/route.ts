import { NextResponse } from "next/server";
import { computeForecast } from "@/domain/engine/computeForecast";
import { IncompleteUser, InvalidUser, ValidationError } from "@/lib/errors";
import { auth } from "@/lib/auth";
import {
  ForecastInput,
  ForecastOutput,
  ForecastOverrides,
  ForecastOverrideSchema,
} from "@/domain/types/forecast";
import { getForecastInputOfUser } from "@/services/data/forecastService";
import z from "zod";

/**
 * @module api/forecast/route
 * @description
 * The Forecast Route Handler is one of the primary API gateway for the Splurge Engine.
 * It gets the details of the user from the database (postgres) and then requests a
 * financial forecast, acting as the bridge between the client and the core domain logic.
 * *
 * * @param {Request} request - The incoming standard Web Request object containing the ForecastInput.
 * @returns {Promise<NextResponse>}
 * - **200 OK:** Returns a JSON object with `success: true` and the `ForecastOutput`.
 * - **400 Bad Request:** Returns a `validation_error` if the input fails the DTO mapping.
 * - **500 Internal Server Error:** Returns a `system_error` for unhandled exceptions.
 * * @throws {ValidationError} Handled internally and mapped to a 400 response.
 */

export async function POST(request: Request): Promise<NextResponse> {
  try {
    //Validate the user
    const session = await auth();

    if (!session?.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access",
          type: "auth_error",
        },
        {
          status: 401,
        },
      );
    }
    const userId = session.user.id;
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
      throw new ValidationError("Invalid override payload");
    }
    //get domain input of the user
    //Use the anti-corruption layer in the forecast service to merge the overrides
    const domainInput: ForecastInput = await getForecastInputOfUser(
      userId,
      overrides,
    );
    const today: Date = new Date();
    const forecastOutput: ForecastOutput = computeForecast(domainInput, today);

    //return the response
    return NextResponse.json({ success: true, data: forecastOutput });
  } catch (error: unknown) {
    //catch the errors from different domains
    let status = 500;
    let type = "system_error";
    let message = "An unexpected error occured";
    if (error instanceof ValidationError) {
      status = 400;
      type = "validation_error";
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

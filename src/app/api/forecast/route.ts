import { NextResponse } from "next/server";
import { computeForecast } from "@/domain/engine/computeForecast";
import { transformIntoDTO } from "./DTOMapper";
import { ValidationError } from "@/lib/errors";

/**
 * @module api/forecast/route
 * @description
 * The Forecast Route Handler is the primary API gateway for the Splurge Engine.
 * It orchestrates the transformation of a raw HTTP request into a multi-tier
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
    const today: Date = new Date();
    const input = await request.json();
    const transformedInput = transformIntoDTO(input);
    const forecastOutput = await computeForecast(transformedInput, today);
    return NextResponse.json({ success: true, data: forecastOutput });
  } catch (error: unknown) {
    let status = 500;
    let type = "system_error";
    let message = "An unexpected error occured";
    if (error instanceof ValidationError) {
      status = 400;
      type = "validation_error";
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

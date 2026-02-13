"use server";

import { computeForecast } from "domain/engine/computeForecast";
import { transformIntoDTO } from "./datemapper";

export async function POST(request: Request): Promise<Response> {
  try {
    const today: Date = new Date();
    const input = await request.json();
    const transformedInput = transformIntoDTO(input);
    const forecastOutput = await computeForecast(transformedInput, today);
    return Response.json({ success: true, data: forecastOutput });
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error(e);

    // Distinguish between validation errors (user input) and system errors
    const isValidationError = errorMessage.includes("Validation failed");
    const status = isValidationError ? 400 : 500;
    const errorType = isValidationError ? "validation_error" : "system_error";

    return Response.json({ error: errorMessage, type: errorType }, { status });
  }
}

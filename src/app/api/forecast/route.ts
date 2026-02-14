"use server";

import { computeForecast } from "domain/engine/computeForecast";
import { transformIntoDTO } from "./datemapper";
import { ValidationError } from "@/lib/errors";

export async function POST(request: Request): Promise<Response> {
  try {
    const today: Date = new Date();
    const input = await request.json();
    const transformedInput = transformIntoDTO(input);
    const forecastOutput = await computeForecast(transformedInput, today);
    return Response.json({ success: true, data: forecastOutput });
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
    return Response.json({ success: false, error: message, type }, { status });
  }
}

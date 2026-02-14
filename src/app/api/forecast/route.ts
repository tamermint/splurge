"use server";

import { computeForecast } from "domain/engine/computeForecast";
import { transformIntoDTO } from "./datemapper";
import { DateMappingError, ValidationError } from "@/lib/errors";

export async function POST(request: Request): Promise<Response> {
  try {
    const today: Date = new Date();
    const input = await request.json();
    const transformedInput = transformIntoDTO(input);
    const forecastOutput = await computeForecast(transformedInput, today);
    return Response.json({ success: true, data: forecastOutput });
  } catch (error: any) {
    let status = 500;
    let type = "system_error";
    if (error instanceof DateMappingError || error instanceof ValidationError) {
      status = 400;
      type = "validation_error";
    }
    return Response.json({ success: false, error: error.message }, { status });
  }
}

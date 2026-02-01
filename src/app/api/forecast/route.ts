import { computeForecast } from "domain/engine/computeForecast";
import { transformIntoDTO } from "./datemapper";

export async function POST(request: Request): Promise<Response> {
  try {
    const today: Date = new Date();
    const input = await request.json();
    const transformedInput = transformIntoDTO(input);
    const forecastOutput = await computeForecast(transformedInput, today);
    return Response.json(forecastOutput);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "API Failure!" }, { status: 500 });
  }
}

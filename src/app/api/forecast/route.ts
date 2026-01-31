import { computeForecast } from "domain/engine/computeForecast";

export async function POST(request: Request): Promise<Response> {
  try {
    const input = await request.json();
    const forecastOutput = await computeForecast(input);
    return Response.json(forecastOutput);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "API Failure!" }, { status: 500 });
  }
}

import { computeForecast } from "domain/engine/computeForecast";
import { ApiError } from "next/dist/server/api-utils";

export async function POST(
  request: Request,
): Promise<ForecastOutput | undefined> {
  try {
    const res = await request.json();
    const forecastOutput = computeForecast(res);
    return forecastOutput;
  } catch (e) {
    console.error(e);
    window.alert("API Failure!");
  }
}

import { computeForecast } from "domain/engine/computeForecast";

export async function POST(request: Request) {
  const res = await request.json();
  const forecastOutput = computeForecast(res);
}

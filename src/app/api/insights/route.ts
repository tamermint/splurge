import { ForecastOutput } from "@/domain/types/forecast";
import { ForecastError } from "@/lib/errors";
import { generateSplurgeInsights } from "@/services/ai/aiInsights";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const forecast: ForecastOutput = await req.json();

    if (!forecast) {
      return NextResponse.json(
        { error: "No forecast data provided!" },
        { status: 400 },
      );
    }

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

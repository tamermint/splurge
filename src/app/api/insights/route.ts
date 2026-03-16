import { ForecastOutput, ForecastOutputSchema } from "@/domain/types/forecast";
import { ForecastError } from "@/lib/errors";
import { generateSplurgeInsights } from "@/services/ai/aiInsights";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const rawForecast = body.data ?? body;

    const validation = ForecastOutputSchema.safeParse(rawForecast);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid forecast data structure for AI analysis",
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const forecast: ForecastOutput = validation.data;
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

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { ForecastError, ValidationError } from "@/lib/errors";
import { trimForecastOutputForAI } from "@/services/ai/forecastOutputTrimmer";
import { ForecastOutput } from "../types/forecast";

export async function generateTeaserInsights(
  forecast: ForecastOutput,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ValidationError("AI API key is not defined in the environment");
  }

  const client = new GoogleGenAI({ apiKey });

  const promptPath = path.join(
    process.cwd(),
    "src/domain/teaser/teaser-system-prompt.md",
  );

  const systemInstructions = fs.readFileSync(promptPath, "utf-8");

  const trimmedData = trimForecastOutputForAI(forecast);

  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: {
        systemInstruction: systemInstructions,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this sequence: ${JSON.stringify(trimmedData)}`,
            },
          ],
        },
      ],
    });
    return result.text || "";
  } catch (error) {
    console.error("Gemini SDK error: ", error);
    throw new ForecastError("Strategic Analysis failed");
  }
}

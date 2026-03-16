import { GoogleGenAI } from "@google/genai";
import { ForecastOutput, TrimmedForecastOutput } from "@/domain/types/forecast";
import fs from "fs";
import path from "path";
import { ForecastError, ValidationError } from "@/lib/errors";
import { trimForecastOutputForAI } from "./forecastOutputTrimmer";

export async function generateSplurgeInsights(
  forecast: ForecastOutput,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ValidationError("AI API key is not defined in the environment");
  }

  const client = new GoogleGenAI({ apiKey });

  const trimmedForecastOutput: TrimmedForecastOutput =
    trimForecastOutputForAI(forecast);

  const promptPath = path.join(
    process.cwd(),
    "src/services/ai/system-prompt.md",
  );

  const systemInstructions = fs.readFileSync(promptPath, "utf-8");
  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.0,
        topP: 1,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this sequence: ${JSON.stringify(trimmedForecastOutput)}`,
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

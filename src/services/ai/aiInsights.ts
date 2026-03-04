import { GoogleGenAI } from "@google/genai";
import { ForecastOutput } from "@/domain/types/forecast";
import fs from "fs";
import path from "path";
import { ForecastError, ValidationError } from "@/lib/errors";

export async function generateSplurgeInsights(
  forecast: ForecastOutput,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ValidationError("AI API key is not defined in the environment");
  }

  const client = new GoogleGenAI({ apiKey });

  const promptPath = path.join(
    process.cwd(),
    "src/services/ai/system-prompt.md",
  );
  const systemInstructions = fs.readFileSync(promptPath, "utf-8");
  try {
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstructions,
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: `Analyze this sequence: ${JSON.stringify(forecast)}` },
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

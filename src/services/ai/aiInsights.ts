import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ForecastOutput, TrimmedForecastOutput } from "@/domain/types/forecast";
import fs from "fs";
import path from "path";
import { ForecastError, ValidationError } from "@/lib/errors";
import { trimForecastOutputForAI } from "./forecastOutputTrimmer";

/**
 * @module services/ai/aiInsights
 * @description
 * The AI Insights module serves as the strategic "Brain" of the Autonomous Treasury.
 * It interfaces with the Google Gemini LLM to transform raw, deterministic forecast
 * data into blunt, actionable financial briefings.
 * * ### Architectural Principles:
 * 1. **Context Window Optimization:** Uses `trimForecastOutputForAI` to strip
 * redundant metadata, ensuring the model stays within high-performance context
 * limits and reduces latency/token cost.
 * 2. **Deterministic Reasoning:** Hard-coded `temperature: 0.0`, `topP: 0` and `topK: 1`
 * constraints force the model to behave as a "Strategic Renderer" of the engine's
 * math, eliminating creative "hallucinations" in liquidity reporting.
 * 3. **Externalized Persona:** The "Splurge Strategic Analyst" persona and
 * procedural rules are decoupled from the code and maintained in `system-prompt.md`
 * for rapid iteration without logic deployments.
 * *
 * * @param {ForecastOutput} forecast - The full, computed result from the forecast engine.
 * @returns {Promise<string>} A markdown-formatted strategic briefing (the "Insight").
 * * @throws {ValidationError} If the `GEMINI_API_KEY` is missing from the environment.
 * @throws {ForecastError} If the GenAI SDK fails or the model returns an empty sequence.
 */

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
        topP: 0,
        topK: 1,
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

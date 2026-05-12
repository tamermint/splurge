import "server-only";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { generateText, Output } from "ai";
import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { zodSchema } from "ai";
import {
  ForecastOutput,
  ForecastOverrideSchema,
  TrimmedForecastOutput,
} from "@/domain/types/forecast";
import fs from "fs";
import path from "path";
import { ForecastError, ValidationError } from "@/lib/errors";
import { trimForecastOutputForAI } from "./forecastOutputTrimmer";
import z from "zod";

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

export const AIActionPlanSchema = z.object({
  coachMessage: z
    .string()
    .describe(
      "The markdown-formatted strategic briefing and advice from the AI coach.",
    ),
  suggestedOverrides: ForecastOverrideSchema.describe(
    "The strict JSON modifications to apply to the user's financial state. Leave as an empty object {} if no changes are required.",
  ),
});

export type AIActionPlan = z.infer<typeof AIActionPlanSchema>;

export async function generateSplurgeInsights(
  forecast: ForecastOutput,
): Promise<string> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new ValidationError("AI API key is not defined in the environment");
  }

  const trimmedForecastOutput: TrimmedForecastOutput =
    trimForecastOutputForAI(forecast);

  const promptPath = path.join(
    process.cwd(),
    "src/services/ai/system-prompt.md",
  );

  const systemInstructions = fs.readFileSync(promptPath, "utf-8");
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      system: systemInstructions,
      topP: 0,
      topK: 1,
      temperature: 0.0,
      prompt: `Analyze this sequence: ${JSON.stringify(trimmedForecastOutput)}`,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingLevel: "high",
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_UNSPECIFIED",
              threshold: "BLOCK_LOW_AND_ABOVE",
            },
          ],
        } satisfies GoogleLanguageModelOptions,
      },
      output: Output.object({
        schema: AIActionPlanSchema,
      }),
    });
    return text || "";
  } catch (error) {
    console.error("Gemini SDK error: ", error);
    throw new ForecastError("Strategic Analysis failed");
  }
}

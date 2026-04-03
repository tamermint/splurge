import { computeForecast } from "../engine/computeForecast";
import { ForecastInput, ForecastOutput, TeaserInput } from "../types/forecast";
import { generateTeaserInsights } from "./teaserAIInsights";

/**
 * @description The teaser service will call the computeForecast with a stripped down version of the forecast input
 * and utilize the forecast output to feed a smaller Gemini LLM model - gemini-3-flash to get a quick summary and advertise
 * the switch to the pro version for detailed insights.
 * @constraints Rate limit the API call to 10 per hour for guest/anonymous users
 */

export async function forecastTeaser(input: TeaserInput) {
  const { monthlyIncome, totalMonthlyBills, currentBalance, targetSplurge } =
    input;

  //Building a synthetic input
  const synthInput: ForecastInput = {
    paySchedule: {
      frequency: "monthly",
      inflows: [
        {
          amount: monthlyIncome,
          date: new Date(new Date().setDate(new Date().getDate() + 14)),
          label: "Estimated Salary",
        },
      ],
    },
    bills: [
      {
        id: 999,
        name: "Monthly obligations",
        amount: totalMonthlyBills,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        scheduleType: "monthly",
        payRail: "BANK",
        payType: "manual",
      },
    ],
    commitments: [],
    baselines: [],
    expenses:
      targetSplurge > 0
        ? [
            {
              name: "Desired Splurge",
              amount: targetSplurge,
              date: new Date(),
            },
          ]
        : [],
    buffer: 100,
    startingBalance: currentBalance,
  };

  const forecast: ForecastOutput = await computeForecast(
    synthInput,
    new Date(),
  );

  const insights = await generateTeaserInsights(forecast);

  return {
    verdict: forecast.now.status,
    shortfall: forecast.structuralDeficit?.shortfall ?? 0,
    safeToSplurge: forecast.now.safeToSplurge,
    insights,
  };
}

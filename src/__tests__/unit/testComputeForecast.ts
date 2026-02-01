import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
} from "@/domain/types/forecast";
import { computeForecast } from "@/domain/engine/computeForecast";
import "next/jest.js";

describe("computeForecast", () => {
  it("should correctly predict the splurge", async () => {
    const date = new Date("2026-02-01");
    const paySchedule: PaySchedule = {
      payDate: new Date("2026-02-04"),
      frequency: "fortnightly",
      totalAmount: 3704.32,
      optionalSplit: false,
    };
    const bills: Bill[] = [
      {
        id: 1,
        name: "Internet",
        amount: 55,
        dueDate: new Date("2026-02-02"),
        scheduleType: "monthly",
        payRail: "AMEX",
      },
      {
        id: 2,
        name: "Electricity",
        amount: 120,
        dueDate: new Date("2026-02-10"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
      {
        id: 3,
        name: "Phone",
        amount: 40,
        dueDate: new Date("2026-02-16"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
    ];
    const commitments: Commitment[] = [{ savingsAmount: 1100 }];
    const baselines: Baseline[] = [
      { name: "groceries", amount: 300 },
      { name: "transport", amount: 70 },
    ];
    const buffer: number = 50;
    const forecastInput: ForecastInput = {
      paySchedule: paySchedule,
      bills: bills,
      commitments: commitments,
      baselines: baselines,
      buffer: buffer,
    };
    const expectedForecastOutput: ForecastOutput = {
      now: {
        safeToSplurge: 2129.32,
        status: "green",
        breakdown: {
          income: 3704.32,
          commitments: [
            {
              savingsAmount: 1100,
            },
          ],
          baselines: [
            {
              name: "groceries",
              amount: 300,
            },
            {
              name: "transport",
              amount: 70,
            },
          ],
          buffer: 50,
          totalBillAmount: 55,
          allBills: [
            {
              id: 1,
              name: "Internet",
              amount: 55,
              dueDate: new Date("2026-02-02"),
              scheduleType: "monthly",
              payRail: "AMEX",
            },
          ],
        },
      },
      ifWait: {
        safeToSplurge: 2024.32,
        status: "green",
        breakdown: {
          income: 3704.32,
          commitments: [
            {
              savingsAmount: 1100,
            },
          ],
          baselines: [
            {
              name: "groceries",
              amount: 300,
            },
            {
              name: "transport",
              amount: 70,
            },
          ],
          buffer: 50,
          totalBillAmount: 160,
          allBills: [
            {
              id: 2,
              name: "Electricity",
              amount: 120,
              dueDate: new Date("2026-02-10"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
            {
              id: 3,
              name: "Phone",
              amount: 40,
              dueDate: new Date("2026-02-16"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
          ],
        },
      },
    };
    const result = await computeForecast(forecastInput, date);
    expect(result).toStrictEqual(expectedForecastOutput);
  });
});

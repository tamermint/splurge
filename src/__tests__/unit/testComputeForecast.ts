import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
} from "@/domain/types/forecast";
import { computeForecast } from "@/domain/engine/computeForecast";

describe("computeForecast", () => {
  it("should validate input and return error for invalid data", async () => {
    const date = new Date("2026-02-01");
    const invalidInput = {
      paySchedule: {
        payDate: new Date("2026-02-04"),
        frequency: "fortnightly",
        totalAmount: "invalid", // Invalid: should be number
        optionalSplit: false,
      },
      bills: [],
      commitments: [],
      baselines: [],
      buffer: 50,
    } as unknown as ForecastInput;

    await expect(computeForecast(invalidInput, date)).rejects.toThrow(
      "Validation failed",
    );
  });

  it("should correctly predict the splurge when window A carry over is positive", async () => {
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
              name: "Internet",
              amount: 55,
              dueDate: new Date("2026-02-02"),
              scheduleType: "monthly",
              payRail: "AMEX",
            },
          ],
          carryOver: 0,
        },
      },
      ifWait: {
        safeToSplurge: 4153.64,
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
              name: "Electricity",
              amount: 120,
              dueDate: new Date("2026-02-10"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
            {
              name: "Phone",
              amount: 40,
              dueDate: new Date("2026-02-16"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
          ],
          carryOver: 2129.32,
        },
      },
    };
    const result = await computeForecast(forecastInput, date);
    expect(result).toStrictEqual(expectedForecastOutput);
  });
  it("should correctly predict the splurge when window A carry over is negative", async () => {
    const date = new Date("2026-02-01");
    const paySchedule: PaySchedule = {
      payDate: new Date("2026-02-04"),
      frequency: "fortnightly",
      totalAmount: 3500.32,
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
    const commitments: Commitment[] = [{ savingsAmount: 3500 }];
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
        safeToSplurge: -474.68,
        status: "insolvent",
        breakdown: {
          income: 3500.32,
          commitments: [
            {
              savingsAmount: 3500,
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
              name: "Internet",
              amount: 55,
              dueDate: new Date("2026-02-02"),
              scheduleType: "monthly",
              payRail: "AMEX",
            },
          ],
          carryOver: 0,
        },
      },
      ifWait: {
        safeToSplurge: -1054.36,
        status: "insolvent",
        breakdown: {
          income: 3500.32,
          commitments: [
            {
              savingsAmount: 3500,
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
              name: "Electricity",
              amount: 120,
              dueDate: new Date("2026-02-10"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
            {
              name: "Phone",
              amount: 40,
              dueDate: new Date("2026-02-16"),
              scheduleType: "monthly",
              payRail: "BANK",
            },
          ],
          carryOver: -474.68,
        },
      },
    };
    const result = await computeForecast(forecastInput, date);
    expect(result).toStrictEqual(expectedForecastOutput);
  });
});

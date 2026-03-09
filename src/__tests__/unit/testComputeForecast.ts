// src/__tests__/unit/testComputeForecast.ts

import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
  oneOffExpense,
} from "@/domain/types/forecast";
import { computeForecast } from "@/domain/engine/computeForecast";

describe("computeForecast", () => {
  // Test 1: Validation still works exactly the same
  it("should validate input and return error for invalid data", async () => {
    const date = new Date("2026-02-01");
    const invalidInput = {
      paySchedule: {
        frequency: "fortnightly",
        inflows: [
          { amount: "invalid", date: new Date("2026-02-04"), label: "Salary" },
        ],
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

  it("should correctly predict splurge using the sequential timeline", async () => {
    // Strategy: Set today to the Payday so Window A includes the income
    const date = new Date("2026-02-04T00:00:00.000Z");

    const paySchedule: PaySchedule = {
      frequency: "fortnightly",
      inflows: [
        {
          amount: 3704.32,
          date: new Date("2026-02-04T00:00:00.000Z"),
          label: "Salary",
        },
      ],
    };

    const bills: Bill[] = [
      {
        id: 1,
        name: "Internet",
        amount: 55,
        dueDate: new Date("2026-02-04T00:00:00.000Z"),
        scheduleType: "monthly",
        payRail: "AMEX",
        payType: "auto-debit",
      },
    ];

    const commitments: Commitment[] = [
      {
        commitmentType: "savings",
        commitmentAmount: 1100,
        constraint: "soft",
        priority: 1,
      },
    ];
    const baselines: Baseline[] = [
      { name: "groceries", amount: 300 },
      { name: "transport", amount: 70 },
    ];

    const forecastInput: ForecastInput = {
      paySchedule,
      bills,
      commitments,
      baselines,
      buffer: 50,
    };

    const result: ForecastOutput = await computeForecast(forecastInput, date);

    // Math: 3704.32 (Inflow) - 1100 (Savings) - 300 (Groc) - 70 (Trans) - 55 (Bill) = 2179.32
    // Safe to Splurge: 2179.32 - 50 (Buffer) = 2129.32
    expect(result.now.safeToSplurge).toBe(2129.32);
    expect(result.now.status).toBe("green");

    // Verify the timeline is populated
    expect(result.now.breakdown.timeline.length).toBeGreaterThan(0);
    expect(result.now.breakdown.timeline[0].type).toBe("inflow");
  });
  it("should trigger a suggested relief plan when a looming expense creates a deficit", async () => {
    const date = new Date("2026-02-04T00:00:00.000Z");

    const paySchedule: PaySchedule = {
      frequency: "fortnightly",
      inflows: [
        {
          amount: 2000,
          date: new Date("2026-02-04T00:00:00.000Z"),
          label: "Salary",
        },
      ],
    };

    const expenses: oneOffExpense[] = [
      {
        name: "Emergency Car Repair",
        amount: 2500, // This is $500 more than the paycheck
        date: new Date("2026-02-10T00:00:00.000Z"),
      },
    ];

    const commitments: Commitment[] = [
      {
        commitmentType: "Vacation Fund",
        commitmentAmount: 800,
        constraint: "soft",
        priority: 10, // Least important, should be drained first
      },
    ];

    const forecastInput: ForecastInput = {
      paySchedule,
      bills: [], // Schema requires this array
      expenses,
      commitments,
      baselines: [],
      buffer: 100,
    };

    const result: ForecastOutput = await computeForecast(forecastInput, date);

    /**
     * Math Trace:
     * 1. Starting Balance: 0
     * 2. Inflow: +2000
     * 3. Commitment: -800 (Running: 1200)
     * 4. Expense: -2500 (Running: -1300) -> This is the minEvent
     * * Relief Gap calculation:
     * abs(-1300) + 100 (Buffer) = 1400
     * * Waterfall Drain:
     * Vacation Fund available: 800
     * Relief Amount taken: 800 (all of it)
     */

    // 1. Splurge should be negative: -1300 - 100 = -1400
    expect(result.now.safeToSplurge).toBe(-1400);
    expect(result.now.status).toBe("critical");

    // 2. Relief logic check
    expect(result.suggestedRelief).not.toBeNull();
    const relief = result.suggestedRelief!;

    expect(relief.actions).toHaveLength(1);
    expect(relief.actions[0].label).toBe("Vacation Fund");
    expect(relief.actions[0].amountUnlocked).toBe(800);
    expect(relief.totalReliefAmount).toBe(800);

    // 3. Predicted Balance check: -1300 + 800 = -500
    expect(relief.predictedBalance).toBe(-500);

    // 4. Resolution check: 800 < 1400 gap, so it's not fully resolved
    expect(relief.isFullyResolved).toBe(false);
  });
});

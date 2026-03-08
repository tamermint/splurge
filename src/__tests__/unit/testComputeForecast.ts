// src/__tests__/unit/testComputeForecast.ts

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
});

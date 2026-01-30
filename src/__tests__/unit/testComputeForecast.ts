import { billsInWindow } from "domain/schedules/scheduleHelper";
import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastOutput,
  ForecastInput,
} from "@/domain/types/forecast";

describe("computeForecast", () => {
  it("should compute safe to splurge or not for window A", () => {
    const baseDate: Date = new Date("2026-02-04");
    const paySchedule: PaySchedule = {
      frequency: "fortnightly",
      payDate: baseDate,
      totalAmount: 3250,
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
        name: "Insurance",
        amount: 162.75,
        dueDate: new Date("2026-02-18"),
        scheduleType: "monthly",
        payRail: "AMEX",
      },
      {
        id: 54,
        name: "Gym membership",
        amount: 34.38,
        dueDate: new Date("2026-02-06"),
        scheduleType: "fortnightly",
        payRail: "Bank Account",
      },
      {
        id: 27,
        name: "Amazon prime membership",
        amount: 9.99,
        dueDate: new Date("2026-02-10"),
        scheduleType: "fortnightly",
        payRail: "AMEX",
      },
    ];
    const commitment: Commitment[] = [
      {
        savingsAmount: 1100,
      },
    ];
    const baseline: Baseline[] = [
      {
        name: "supplements",
        amount: 50,
      },
    ];
    const forecastInput: ForecastInput = {
      paySchedule: paySchedule,
      bills: bills,
      commitments: commitment,
      baselines: baseline,
      buffer: 50,
    };
  });
});

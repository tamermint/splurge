import {
  Bill,
  PaySchedule,
  ForecastInput,
  ForecastOutput,
} from "@/domain/types/forecast";
import { computeForecast } from "@/domain/engine/computeForecast";

describe("computeForecast - Magic Month Scenario", () => {
  /**
   * Scenario: May 2026 (Triple Pay Month)
   * Pay dates: May 1, May 15, May 29
   * Reference Date (Today): April 30, 2026
   * * This test validates that even when the calendar month is "lumpy,"
   * the engine accurately segments the 14-day windows.
   */
  it("should handle a monthly bill correctly across a triple-pay cycle", async () => {
    // Setting "Today" to just before the first payday of the magic month
    const today = new Date("2026-04-30T00:00:00.000Z");

    const paySchedule: PaySchedule = {
      payDate: new Date("2026-05-01T00:00:00.000Z"),
      frequency: "fortnightly",
      totalAmount: 3000,
      optionalSplit: false,
    };

    const bills: Bill[] = [
      {
        id: 101,
        name: "Rent",
        amount: 2000,
        dueDate: new Date("2026-05-05T00:00:00.000Z"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
    ];

    const forecastInput: ForecastInput = {
      paySchedule,
      bills,
      commitments: [],
      baselines: [],
      buffer: 0, // Zero buffer for clean math validation
    };

    /**
     * Logic Verification:
     * Window A (Now): Apr 30 -> May 1. Bills: None.
     * Window B (If Wait): May 1 -> May 15. Bills: Rent (May 5).
     * * Even though May has 3 paychecks, Window B only looks at the
     * first 14-day gap.
     */
    const result = await computeForecast(forecastInput, today);

    // Window A: Income (3000) - Bills (0) = 3000
    expect(result.now.safeToSplurge).toBe(3000);
    expect(result.now.breakdown.allBills).toHaveLength(0);

    // Window B: (Income 3000 - Bills 2000) + CarryOver 3000 = 4000
    expect(result.ifWait.safeToSplurge).toBe(4000);
    expect(result.ifWait.breakdown.allBills).toHaveLength(1);
    expect(result.ifWait.breakdown.allBills[0].name).toBe("Rent");
  });

  it("should ensure monthly bills aren't double-counted during payday shifts", async () => {
    // Advancing the clock to the middle of the magic month
    const midMonthToday = new Date("2026-05-14T00:00:00.000Z");

    const paySchedule: PaySchedule = {
      payDate: new Date("2026-05-15T00:00:00.000Z"),
      frequency: "fortnightly",
      totalAmount: 3000,
      optionalSplit: false,
    };

    const bills: Bill[] = [
      {
        id: 101,
        name: "Rent",
        amount: 2000,
        dueDate: new Date("2026-05-05T00:00:00.000Z"), // Already paid in previous window
        scheduleType: "monthly",
        payRail: "BANK",
      },
    ];

    const forecastInput: ForecastInput = {
      paySchedule,
      bills,
      commitments: [],
      baselines: [],
      buffer: 0,
    };

    const result = await computeForecast(forecastInput, midMonthToday);

    /**
     * Window A: May 14 -> May 15.
     * Window B: May 15 -> May 29.
     * * The May 5th Rent bill should NOT appear in either window because the
     * recurrence generator starts from 'Today'.
     */
    expect(result.now.breakdown.allBills).toHaveLength(0);
    expect(result.ifWait.breakdown.allBills).toHaveLength(0);
    expect(result.ifWait.safeToSplurge).toBe(6000); // 3000 (Now) + 3000 (Wait)
  });
  it("should correctly project and capture a yearly bill falling in a magic month window", async () => {
    /**
     * Today is the start of the Magic Month.
     * We have a large Yearly bill with an anchor in the previous year.
     */
    const today = new Date("2026-05-01T00:00:00.000Z");

    const paySchedule: PaySchedule = {
      payDate: new Date("2026-05-01T00:00:00.000Z"),
      frequency: "fortnightly",
      totalAmount: 3000,
      optionalSplit: false,
    };

    const bills: Bill[] = [
      {
        id: 202,
        name: "Car Insurance",
        amount: 1200,
        dueDate: new Date("2025-05-20T00:00:00.000Z"), // Anchor from last year
        scheduleType: "yearly",
        payRail: "AMEX",
      },
    ];

    const forecastInput: ForecastInput = {
      paySchedule,
      bills,
      commitments: [],
      baselines: [],
      buffer: 50, // Buffer for safety
    };

    const result = await computeForecast(forecastInput, today);

    /**
     * Logic Check:
     * Window A (Now): May 1 -> May 15.
     * Window B (If Wait): May 15 -> May 29.
     * * The Yearly bill (May 20) MUST land in Window B.
     * If the generator fails to project from 2025 to 2026, safeToSplurge will be dangerously high.
     */

    // Window A: Income (3000) - Buffer (50) = 2950
    expect(result.now.safeToSplurge).toBe(2950);
    expect(result.now.breakdown.allBills).toHaveLength(0);

    // Window B: (Income 3000 - Bill 1200 - Buffer 50) + CarryOver 2950 = 4700
    expect(result.ifWait.safeToSplurge).toBe(4700);
    expect(result.ifWait.breakdown.allBills).toHaveLength(1);
    expect(result.ifWait.breakdown.allBills[0].name).toBe("Car Insurance");
    expect(result.ifWait.breakdown.allBills[0].dueDate.toISOString()).toContain(
      "2026-05-20",
    ); // Projected correctly
  });
});

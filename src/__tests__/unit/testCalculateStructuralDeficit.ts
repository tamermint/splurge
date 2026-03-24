import { calculateStructuralDeficit } from "@/domain/engine/calculateStructuralDeficit";
import {
  TimelineEvent,
  SavingsRelief,
  DeferralPlan,
} from "@/domain/types/forecast";
import { ValidationError } from "@/lib/errors";

const buildTimelineEvent = (
  overrides: Partial<TimelineEvent>,
): TimelineEvent => ({
  id: "ev-1",
  timestamp: new Date("2026-04-01"),
  type: "inflow",
  label: "Salary",
  amount: 1000,
  paymentConstraints: "hard",
  runningBalance: 1000,
  liquidityStatus: "stable",
  headroom: 500,
  ...overrides,
});

const buildRelief = (overrides: Partial<SavingsRelief>): SavingsRelief => ({
  minBalanceDate: new Date("2026-04-10"),
  actions: [],
  totalReliefAmount: 0,
  predictedBalance: -200, // Short $200
  isFullyResolved: false,
  ...overrides,
});

const buildDeferrals = (overrides: Partial<DeferralPlan>): DeferralPlan => ({
  actions: [],
  isNowResolved: false,
  ...overrides,
});

describe("calculateStructuralDeficit", () => {
  describe("1. Guard Clauses", () => {
    test("returns null if the situation is already resolved", () => {
      const timeline = [buildTimelineEvent({ runningBalance: 100 })];
      const relief = buildRelief({ isFullyResolved: true });
      const deferrals = buildDeferrals({ isNowResolved: false });

      const result = calculateStructuralDeficit(
        timeline,
        relief,
        deferrals,
        50,
      );
      expect(result).toBeNull();
    });

    test("throws ValidationError on empty timeline", () => {
      const relief = buildRelief({});
      const deferrals = buildDeferrals({});
      expect(() =>
        calculateStructuralDeficit([], relief, deferrals, 50),
      ).toThrow(ValidationError);
    });
  });

  describe("2. Shortfall Calculation", () => {
    test("calculates correct shortfall (abs(predictedBalance) + buffer - deferredAmount)", () => {
      const timeline = [
        buildTimelineEvent({
          timestamp: new Date("2026-04-01"),
          runningBalance: -100,
        }),
        buildTimelineEvent({
          timestamp: new Date("2026-04-30"),
          runningBalance: 500,
        }),
      ];

      const relief = buildRelief({ predictedBalance: -200 }); // Ditch is -$200
      const deferrals = buildDeferrals({
        actions: [{ id: "b1", label: "Bill", amount: 50, date: new Date() }],
      });

      // Math: |-200| + 50 (buffer) - 50 (deferred) = 200
      const result = calculateStructuralDeficit(
        timeline,
        relief,
        deferrals,
        50,
      );
      expect(result?.shortfall).toBe(200);
    });
  });

  describe("3. Temporal Metrics (Onset & Resolution)", () => {
    test("identifies the onset (criticalDate) as the first point of insolvency", () => {
      const timeline = [
        buildTimelineEvent({
          timestamp: new Date("2026-04-01"),
          runningBalance: 100,
        }),
        buildTimelineEvent({
          timestamp: new Date("2026-04-05"),
          runningBalance: -50,
        }), // Onset
        buildTimelineEvent({
          timestamp: new Date("2026-04-10"),
          runningBalance: -200,
        }),
      ];

      const result = calculateStructuralDeficit(
        timeline,
        buildRelief({}),
        buildDeferrals({}),
        50,
      );
      expect(result?.criticalDate).toEqual(new Date("2026-04-05"));
    });

    test("identifies resolutionDate when balance returns above zero", () => {
      const timeline = [
        buildTimelineEvent({
          timestamp: new Date("2026-04-05"),
          runningBalance: -50,
        }),
        buildTimelineEvent({
          timestamp: new Date("2026-04-06"),
          runningBalance: -20,
        }),
        buildTimelineEvent({
          timestamp: new Date("2026-04-07"),
          runningBalance: 100,
        }), // Resolution
      ];

      const result = calculateStructuralDeficit(
        timeline,
        buildRelief({}),
        buildDeferrals({}),
        50,
      );
      expect(result?.resolutionDate).toEqual(new Date("2026-04-07"));
    });

    test("isTerminal is true if the last event in the window is still negative", () => {
      const timeline = [
        buildTimelineEvent({
          timestamp: new Date("2026-04-05"),
          runningBalance: -50,
        }),
        buildTimelineEvent({
          timestamp: new Date("2026-04-30"),
          runningBalance: -10,
        }), // Last event
      ];

      const result = calculateStructuralDeficit(
        timeline,
        buildRelief({}),
        buildDeferrals({}),
        50,
      );
      expect(result?.isTerminal).toBe(true);
      expect(result?.resolutionDate).toBeNull();
    });
  });

  describe("4. Psychological/Stability Metrics", () => {
    test("counts daysUnderBuffer correctly using Integer Supremacy", () => {
      const buffer = 50;
      const timeline = [
        buildTimelineEvent({ runningBalance: 100 }), // Stable
        buildTimelineEvent({ runningBalance: 40 }), // Under Buffer
        buildTimelineEvent({ runningBalance: -10 }), // Under Buffer
        buildTimelineEvent({ runningBalance: 50 }), // Exactly Buffer (Not under)
      ];

      const result = calculateStructuralDeficit(
        timeline,
        buildRelief({}),
        buildDeferrals({}),
        buffer,
      );
      expect(result?.daysUnderBuffer).toBe(2);
    });
  });
});

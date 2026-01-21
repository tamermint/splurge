import { nextPayday, billsInWindow } from "@/domain/schedules/scheduleHelper";
import type {
  PaySchedule,
  Bill,
  ForecastOutput,
} from "@/domain/types/forecast";
import "next/jest.js";

describe("scheduleHelper", () => {
  describe("nextPayday", () => {
    it("should add 7 days when frequency is weekly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-01-27");
      console.log(newDate);
      const paySchedule: PaySchedule = {
        payDate: baseDate,
        frequency: "weekly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result: Date = nextPayday(paySchedule);
      expect(result.toDateString()).toBe(newDate.toDateString());
    });
    it("should add 14 days when frequency is fortnightly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-02-03");
      console.log(newDate);
      const paySchedule: PaySchedule = {
        payDate: baseDate,
        frequency: "fortnightly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result: Date = nextPayday(paySchedule);
      expect(result.toDateString()).toBe(newDate.toDateString());
    });
    it("should add 1 month when frequency is monthly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-02-20");
      console.log(newDate);
      const paySchedule: PaySchedule = {
        payDate: baseDate,
        frequency: "monthly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result: Date = nextPayday(paySchedule);
      expect(result.toDateString()).toBe(newDate.toDateString());
    });
  });
});

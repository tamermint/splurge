import { nextPayday, billsInWindow } from "@/domain/schedules/scheduleHelper";
import type { PaySchedule, Bill } from "@/domain/types/forecast";
import "next/jest.js";

describe("nextPayday", () => {
  describe("nextPayday", () => {
    it("should add 7 days when frequency is weekly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-01-27");
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
  describe("billsInWindow", () => {
    it("should return all bills in bill window when pay is weekly", () => {
      const startDate: Date = new Date("2026-01-21");
      const endDate: Date = new Date("2026-01-28");
      const expectedBillAmount: number = 55;
      const expectedBillOccurence: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-01-27"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
      ];
      const bills: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-01-27"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
        {
          id: 2,
          name: "Insurance",
          amount: 162.75,
          dueDate: new Date("2026-01-28"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
        {
          id: 54,
          name: "Gym membership",
          amount: 34.38,
          dueDate: new Date("2026-01-31"),
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
      const result = billsInWindow(bills, startDate, endDate);
      expect(result.totalAmount).toBe(expectedBillAmount);
      expect(result.bills).toStrictEqual(expectedBillOccurence);
    });
    it("should return all bills in bill window when pay is fortnightly", () => {
      const startDate: Date = new Date("2026-01-21");
      const endDate: Date = new Date("2026-02-04");
      const expectedBillAmount: number = 55;
      const expectedBillOccurence: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-02-02"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
      ];
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
      const result = billsInWindow(bills, startDate, endDate);
      expect(result.totalAmount).toBe(expectedBillAmount);
      expect(result.bills).toStrictEqual(expectedBillOccurence);
    });
    it("should return all bills in bill window when pay is monthly", () => {
      const startDate: Date = new Date("2026-01-21");
      const endDate: Date = new Date("2026-02-18");
      const expectedBillAmount: number = 262.12;
      const expectedBillOccurence: Bill[] = [
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
          dueDate: new Date("2026-02-17"),
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
          dueDate: new Date("2026-02-17"),
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
      const result = billsInWindow(bills, startDate, endDate);
      expect(result.totalAmount).toBe(expectedBillAmount);
      expect(result.bills).toStrictEqual(expectedBillOccurence);
    });
    it("should use windowStart parameter and not currentDate", () => {
      const startDate: Date = new Date("2026-01-15");
      const endDate: Date = new Date("2026-01-29");
      const expectedBillAmount: number = 55;
      const expectedBillOccurence: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-01-20"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
      ];
      const bills: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-01-20"),
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
      const result = billsInWindow(bills, startDate, endDate);
      expect(result.totalAmount).toBe(expectedBillAmount);
      expect(result.bills).toStrictEqual(expectedBillOccurence);
    });
  });
});

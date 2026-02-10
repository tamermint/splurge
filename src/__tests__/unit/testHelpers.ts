import {
  nextPayday,
  billsInWindow,
  nextPayDayAfter,
} from "@/domain/schedules/scheduleHelper";
import type { PaySchedule, Bill } from "@/domain/types/forecast";
import "next/jest.js";

describe("scheduleHelper", () => {
  describe("nextPayday", () => {
    it("should add 7 days when frequency is weekly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-01-27");
      const frequency = "weekly";
      const result: Date = nextPayday(baseDate, frequency);
      expect(result.toDateString().slice(0, 10)).toBe(
        newDate.toDateString().slice(0, 10),
      );
    });
    it("should add 14 days when frequency is fortnightly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-02-03");
      const frequency = "fortnightly";
      const result: Date = nextPayday(baseDate, frequency);
      expect(result.toDateString().slice(0, 10)).toBe(
        newDate.toDateString().slice(0, 10),
      );
    });
    it("should add 1 month when frequency is monthly", () => {
      const baseDate = new Date("2026-01-20");
      const newDate = new Date("2026-02-20");
      const frequency = "monthly";
      const result: Date = nextPayday(baseDate, frequency);
      expect(result.toDateString().slice(0, 10)).toBe(
        newDate.toDateString().slice(0, 10),
      );
    });
  });
  describe("nextPayDayAfter", () => {
    it("should return the next payday when fromDate is before payDate", () => {
      const fromDate = new Date("2026-01-15");
      const paySchedule: PaySchedule = {
        payDate: new Date("2026-01-20"),
        frequency: "weekly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result = nextPayDayAfter(fromDate, paySchedule);
      expect(result.toDateString().slice(0, 10)).toBe(
        "Tue Jan 20 2026".slice(0, 10),
      );
    });
    it("should skip to next occurrence when fromDate is after payDate", () => {
      const fromDate = new Date("2026-01-25");
      const paySchedule: PaySchedule = {
        payDate: new Date("2026-01-20"),
        frequency: "weekly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result = nextPayDayAfter(fromDate, paySchedule);
      expect(result.toDateString().slice(0, 10)).toBe(
        new Date("2026-01-27").toDateString().slice(0, 10),
      );
    });
    it("should skip to next occurrence when fromDate equals payDate", () => {
      const fromDate = new Date("2026-01-20");
      const paySchedule: PaySchedule = {
        payDate: new Date("2026-01-20"),
        frequency: "fortnightly",
        totalAmount: 2000,
        optionalSplit: false,
      };
      const result = nextPayDayAfter(fromDate, paySchedule);
      expect(result.toDateString().slice(0, 10)).toBe(
        new Date("2026-02-03").toDateString().slice(0, 10),
      );
    });
  });
  describe("billsInWindow", () => {
    it("should return empty array when no bills are in window", () => {
      const startDate: Date = new Date("2026-02-20");
      const endDate: Date = new Date("2026-03-10");
      const bills: Bill[] = [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: new Date("2026-02-02"),
          scheduleType: "monthly",
          payRail: "AMEX",
        },
      ];
      const result = billsInWindow(bills, startDate, endDate);
      expect(result.totalAmount).toBe(0);
      expect(result.bills).toStrictEqual([]);
    });

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

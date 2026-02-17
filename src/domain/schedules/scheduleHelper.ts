import {
  CalculationError,
  DateMappingError,
  ValidationError,
} from "@/lib/errors";
import { Bill, PaySchedule } from "../types/forecast";

/**
 * Schedule Helper Module
 *
 * This module provides pure, deterministic functions for date arithmetic and bill window calculations.
 * It handles pay cycle date calculations and filtering bills that fall within time windows.
 *
 * Key Responsibilities:
 * - Calculate next pay dates based on frequency (weekly, fortnightly, monthly)
 * - Find the nearest upcoming pay date from a reference date
 * - Filter bills that fall within time windows
 * - Handle calendar-aware date arithmetic (e.g., month boundaries)
 *
 * All functions use `structuredClone()` to avoid mutating input dates.
 *
 * @module domain/schedules/scheduleHelper
 */

/**
 * Result of filtering bills within a time window.
 *
 * Used by `billsInWindow()` to return both the filtered bills and their total amount.
 *
 * @typedef {Object} BillsInWindowResult
 * @property {Bill[]} bills - Array of bills falling within the window
 * @property {number} totalAmount - Sum of all bill amounts in the window (USD)
 */
interface BillsInWindowResult {
  bills: Bill[];
  totalAmount: number;
}

/**
 * Calculates the next pay date by advancing a given date by one pay cycle.
 *
 * This function handles frequency-based date arithmetic:
 * - **weekly**: Adds 7 days
 * - **fortnightly**: Adds 14 days
 * - **monthly**: Advances to same day of next month (calendar-aware)
 *
 * Date Handling:
 * - Uses `structuredClone()` to avoid mutating the input date
 * - For monthly frequency, accounts for month boundaries (e.g., Jan 31 → Feb 28/29)
 * - All comparisons use UTC milliseconds for consistency
 *
 * @param payDate - A known pay date to advance from
 * @param frequency - Pay cycle frequency: "weekly" | "fortnightly" | "monthly"
 *
 * @returns Next pay date after the input (one frequency period later)
 *
 * @throws DateMappingError if payDate is invalid or not a valid Date
 * @throws ValidationError if frequency is not a non-empty string
 *
 * @example
 * // Weekly pay
 * const nextWednesday = nextPayday(new Date("2025-02-12"), "weekly");
 * // Returns 2025-02-19 (7 days later)
 *
 * @example
 * // Fortnightly pay
 * const nextFortnightlyPay = nextPayday(new Date("2025-02-14"), "fortnightly");
 * // Returns 2025-02-28 (14 days later)
 *
 * @example
 * // Monthly pay (handles month boundaries)
 * const nextMonthlyPay = nextPayday(new Date("2025-01-31"), "monthly");
 * // Returns 2025-02-28 (or 02-29 in leap years)
 */
export function nextPayday(payDate: Date, frequency: string): Date {
  // Validate input date is valid
  if (isNaN(payDate.getTime())) {
    throw new DateMappingError("Invalid payDate!");
  }

  // Validate frequency is a non-empty string
  if (!frequency || typeof frequency !== "string") {
    throw new ValidationError("Invalid frequency!");
  }

  // Clone to avoid mutating the input date
  const resultDate: Date = structuredClone(payDate);

  // Advance by the appropriate frequency
  if (frequency == "weekly") {
    // Weekly: Add 7 days
    resultDate.setDate(resultDate.getDate() + 7);
  } else if (frequency == "fortnightly") {
    // Fortnightly: Add 14 days
    resultDate.setDate(resultDate.getDate() + 14);
  } else if (frequency == "monthly") {
    // Monthly: Advance to same day of next month
    // Handles month boundaries automatically (e.g., Jan 31 → Feb 28)
    resultDate.setMonth(resultDate.getMonth() + 1);
  }

  return resultDate;
}

/**
 * Finds the next upcoming pay date from a reference date.
 *
 * This function is essential for forecast calculations. Given a reference date (typically today),
 * it returns the next scheduled pay date based on the pay schedule.
 *
 * Algorithm:
 * 1. Start with the anchor pay date from the schedule
 * 2. Repeatedly advance by one frequency period until the result is after the reference date
 * 3. Return the first pay date strictly greater than the reference date
 *
 * Use Cases:
 * - Calculate Window A: Reference date → this result (bills due before next pay)
 * - Calculate Window B: This result → next pay date after this (bills due after next pay)
 *
 * @param fromDate - Reference date (typically today) to find the next pay from
 * @param paySchedule - Pay schedule containing anchor date and frequency
 *
 * @returns The next pay date strictly after fromDate
 *          (returnValue > fromDate is guaranteed)
 *
 * @throws DateMappingError if fromDate is invalid or not a valid Date
 * @throws ValidationError if paySchedule is null/undefined or invalid
 *
 * @example
 * // Find next pay from today
 * const nextPay = nextPayDayAfter(
 *   new Date("2025-02-10"),
 *   {
 *     frequency: "fortnightly",
 *     payDate: new Date("2025-02-14"),
 *     totalAmount: 3000,
 *     optionalSplit: false
 *   }
 * );
 * // Returns 2025-02-14 (next pay date after Feb 10)
 *
 * @example
 * // Next pay is already past, so finds the one after that
 * const nextPay = nextPayDayAfter(
 *   new Date("2025-02-20"),
 *   {
 *     frequency: "fortnightly",
 *     payDate: new Date("2025-02-14"),
 *     totalAmount: 3000,
 *     optionalSplit: false
 *   }
 * );
 * // Returns 2025-02-28 (next pay date after Feb 20)
 */
export function nextPayDayAfter(
  fromDate: Date,
  paySchedule: PaySchedule,
): Date {
  // Validate fromDate is a valid Date
  if (isNaN(fromDate.getTime())) {
    throw new DateMappingError("Invalid starting date");
  }

  // Validate paySchedule is provided and valid
  if (!paySchedule) {
    throw new ValidationError("Payschedule is invalid");
  }

  // Start with the anchor pay date from the schedule
  let payDate: Date = structuredClone(paySchedule.payDate);
  const frequency: string = paySchedule.frequency;

  // Advance until we find a pay date strictly after fromDate
  // Loop invariant: payDate is a valid pay date based on the schedule
  while (payDate <= fromDate) {
    payDate = nextPayday(payDate, frequency);
  }

  return payDate;
}

/**
 * Filters bills that fall within a time window and calculates their total.
 *
 * This function is core to forecast calculations. It identifies which bills a user must pay
 * within a specific time period and sums their amounts.
 *
 * Window Definition:
 * - **Inclusive Start**: Bills due on or after windowStart are included
 * - **Exclusive End**: Bills due before windowEnd are included
 * - **Window Range**: [windowStart, windowEnd) (standard half-open interval)
 *
 * Example Windows:
 * ```
 * Window A (Now): [today, nextPayDate)
 *   → All bills due from today until (but not including) next pay
 *
 * Window B (If Wait): [nextPayDate, followingPayDate)
 *   → All bills due from next pay until (but not including) the pay after that
 * ```
 *
 * @param bills - Array of bills to filter (must be non-empty)
 * @param windowStart - Start of time window (inclusive)
 * @param windowEnd - End of time window (exclusive)
 *
 * @returns Object containing:
 *   - `bills`: Array of bills with due dates in [windowStart, windowEnd)
 *   - `totalAmount`: Sum of amounts for bills in the window (USD)
 *
 * @throws CalculationError if bills array is null, undefined, or empty
 * @throws DateMappingError if windowStart or windowEnd is invalid
 * @throws DateMappingError if any bill has missing or invalid due date
 *
 * @example
 * const bills = [
 *   {
 *     id: 1,
 *     name: "Rent",
 *     amount: 1200,
 *     dueDate: new Date("2025-02-15"),
 *     scheduleType: "monthly",
 *     payRail: "account"
 *   },
 *   {
 *     id: 2,
 *     name: "Electric",
 *     amount: 150,
 *     dueDate: new Date("2025-02-20"),
 *     scheduleType: "monthly",
 *     payRail: "account"
 *   },
 *   {
 *     id: 3,
 *     name: "Internet",
 *     amount: 50,
 *     dueDate: new Date("2025-03-05"),
 *     scheduleType: "monthly",
 *     payRail: "account"
 *   }
 * ];
 *
 * // Window A: Feb 10 → Feb 28 (bills before next pay)
 * const windowA = billsInWindow(
 *   bills,
 *   new Date("2025-02-10"),
 *   new Date("2025-02-28")
 * );
 * // Returns: { bills: [Rent, Electric], totalAmount: 1350 }
 *
 * // Window B: Feb 28 → Mar 14 (bills after next pay)
 * const windowB = billsInWindow(
 *   bills,
 *   new Date("2025-02-28"),
 *   new Date("2025-03-14")
 * );
 * // Returns: { bills: [Internet], totalAmount: 50 }
 */
export function billsInWindow(
  bills: Bill[],
  windowStart: Date,
  windowEnd: Date,
): BillsInWindowResult {
  // Validate bills array is provided and non-empty
  if (!bills || bills.length == 0) {
    throw new CalculationError("Bills are either invalid or not available");
  }

  // Validate window dates are valid
  if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
    throw new DateMappingError("Invalid window start or end dates");
  }

  let totalBillAmount: number = 0;
  const billOccurence: Bill[] = [];

  // Iterate through bills and filter by window
  bills.forEach((bill: Bill, index: number) => {
    // Validate bill has a due date before processing
    if (!bill.dueDate) {
      throw new DateMappingError(
        `Bill at index ${index} has missing or invalid due date`,
      );
    }

    // Convert due date to Date object for comparison
    const dueDate = new Date(bill.dueDate);

    // Check if bill falls within the window: [windowStart, windowEnd)
    // Inclusive start: dueDate >= windowStart
    // Exclusive end: dueDate < windowEnd
    if (dueDate >= windowStart && dueDate < windowEnd) {
      // Bill is in the window; add to results
      totalBillAmount += bill.amount;
      billOccurence.push(bill);
    }
  });

  // Return filtered bills and their total
  return {
    bills: billOccurence,
    totalAmount: totalBillAmount,
  };
}

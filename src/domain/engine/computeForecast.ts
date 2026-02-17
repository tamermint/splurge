import {
  billsInWindow,
  nextPayday,
  nextPayDayAfter,
} from "domain/schedules/scheduleHelper";
import { getSplurgeStatus, getSplurgeAmount } from "./calculateSplurge";
import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
  Breakdown,
  BillsInWindowResult,
  ForecastInputSchema,
  FutureBill,
} from "@/domain/types/forecast";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { recurrenceGenerator } from "../rules/recurrenceGenerator";

/**
 * Computes a dual-window forecast of safe-to-splurge amounts.
 *
 * This function calculates how much a user can safely spend in two scenarios:
 * 1. **Now (Window A)**: From today until the next pay date
 * 2. **If You Wait (Window B)**: From the next pay date until the pay date after that
 *
 * For each window, it sums all obligations (bills, commitments, baselines, buffer)
 * and subtracts from the pay amount to determine discretionary spending.
 *
 * @param input - Forecast input configuration containing pay schedule, bills, commitments, baselines, and buffer
 * @param today - Reference date for calculating forward-looking windows (typically current date)
 *
 * @returns Promise<ForecastOutput> containing:
 *   - `now`: Safe-to-splurge amount and status for Window A (today → next pay)
 *   - `ifWait`: Safe-to-splurge amount and status for Window B (next pay → following pay)
 *   Each includes detailed breakdown of income, expenses, and carry-over amounts
 *
 * @throws ValidationError if input fails schema validation
 * @throws DateMappingError if date calculations are invalid
 * @throws CalculationError if bill window calculations fail
 *
 * @example
 * const forecast = await computeForecast({
 *   paySchedule: {
 *     frequency: "fortnightly",
 *     payDate: new Date("2025-02-14"),
 *     totalAmount: 3000,
 *     optionalSplit: false
 *   },
 *   bills: [...],
 *   commitments: [{ savingsAmount: 500 }],
 *   baselines: [{ name: "Groceries", amount: 200 }],
 *   buffer: 50
 * }, new Date("2025-02-10"));
 */
export async function computeForecast(
  input: ForecastInput,
  today: Date,
): Promise<ForecastOutput> {
  // ============================================================================
  // STEP 1: Validate Input
  // ============================================================================
  // Ensure all input data conforms to the expected schema before processing
  const validationResult = ForecastInputSchema.safeParse(input);
  if (!validationResult.success) {
    const flattenedError = z.flattenError(validationResult.error);
    const errorMsg = JSON.stringify(flattenedError.fieldErrors);
    throw new ValidationError(`Validation failed: ${errorMsg}`);
  }

  // ============================================================================
  // STEP 2: Extract and Aggregate Input Components
  // ============================================================================

  // Pay schedule defines frequency and upcoming pay dates
  const paySchedule: PaySchedule = validationResult.data.paySchedule;
  const frequency: string = validationResult.data.paySchedule.frequency;
  const payAmount: number = validationResult.data.paySchedule.totalAmount;

  // Bills include all scheduled outflows (rent, utilities, subscriptions, etc.)
  const bills: Bill[] = validationResult.data.bills;

  // Baselines are essential recurring expenses (groceries, transport, etc.)
  const baselines: Baseline[] = validationResult.data.baselines;
  let totalBaselineAmount: number = 0;
  for (const baseline of baselines) {
    totalBaselineAmount += baseline.amount;
  }

  // Commitments are protected savings or fixed allocations that cannot be splurged
  const commitments: Commitment[] = validationResult.data.commitments;
  let totalCommitmentAmount: number = 0;
  for (const commitment of commitments) {
    totalCommitmentAmount += commitment.savingsAmount;
  }

  // Buffer is a safety cushion to prevent overspending (default: $50)
  const expenseBuffer: number = validationResult.data.buffer;

  // ============================================================================
  // STEP 3: Calculate Forecast Windows
  // ============================================================================
  // Window A (Now): from today until the next scheduled pay date
  // Window B (If Wait): from next pay date until the pay date after that
  //
  // This allows users to see two scenarios:
  // 1. Spend now → Must cover bills with upcoming paycheck
  // 2. Wait until next pay → Access larger splurge amount after upcoming bills

  const activePayDay: Date = nextPayDayAfter(today, paySchedule);
  const followingPayDay: Date = nextPayday(activePayDay, frequency);

  // ============================================================================
  // STEP 4: Calculate bills due between today and following pay day
  // ============================================================================

  const allBills: FutureBill[] = bills.flatMap((bill) => {
    return recurrenceGenerator(bill, today, followingPayDay);
  });

  // ============================================================================
  // STEP 5: Window A - Calculate bills due between today and next pay
  // ============================================================================

  const windowAResult: BillsInWindowResult = billsInWindow(
    allBills,
    today,
    activePayDay,
  );
  const allBillsInWindowA: (Bill | FutureBill)[] = windowAResult.bills;
  const totalBillAmountInWindowA: number = windowAResult.totalAmount;

  // ============================================================================
  // STEP 6: Window B - Calculate bills due between next pay and following pay
  // ============================================================================

  const windowBresult: BillsInWindowResult = billsInWindow(
    allBills,
    activePayDay,
    followingPayDay,
  );
  const allBillsInWindowB: (Bill | FutureBill)[] = windowBresult.bills;
  const totalBillAmountInWindowB: number = windowBresult.totalAmount;

  // ============================================================================
  // STEP 7: Window A Forecast - Calculate safe-to-splurge NOW
  // ============================================================================
  // Safe-to-Splurge Now = Income - (Bills + Commitments + Baselines + Buffer)
  //
  // This shows how much can be spent immediately while still covering:
  // - Bills due before the next paycheck
  // - Fixed savings commitments
  // - Essential baseline expenses
  // - Safety buffer

  const totalAmountInWindowA: number =
    totalBillAmountInWindowA +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;

  const splurgeNowA: number = getSplurgeAmount(payAmount, totalAmountInWindowA);
  const statusA: string = getSplurgeStatus(splurgeNowA);

  /**
   * Breakdown for Window A
   * This itemizes all components that reduce available splurge amount
   */
  const breakdownA: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowA,
    allBills: allBillsInWindowA,
    carryOver: 0, // No balance carried from previous window
  };

  // ============================================================================
  // STEP 8: Window B Forecast - Calculate safe-to-splurge IF YOU WAIT
  // ============================================================================
  // Safe-to-Splurge If Wait = (Income Window B - Bills B) + Splurge Now (carry-over)
  //
  // This shows the benefit of waiting until after the next paycheck to spend:
  // - Upcoming bills in Window A are already paid with current paycheck
  // - Money from Window A splurge can be accumulated
  // - Bills in Window B are paid from the second paycheck
  //
  // The carry-over (splurgeNowA) represents unspent discretionary income that
  // accumulates if the user chooses to defer spending

  const totalAmountInWindowB: number =
    totalBillAmountInWindowB +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;

  const splurgeNowB: number =
    getSplurgeAmount(payAmount, totalAmountInWindowB) + splurgeNowA;

  const statusB: string = getSplurgeStatus(splurgeNowB);

  /**
   * Breakdown for Window B
   * carryOver represents unspent discretionary income from Window A
   * that could be accumulated if the user waits
   */
  const breakdownB: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowB,
    allBills: allBillsInWindowB,
    carryOver: splurgeNowA, // Unspent amount from Window A
  };

  // ============================================================================
  // STEP 8: Return Dual-Window Forecast Output
  // ============================================================================
  // Construct and return the complete forecast containing both scenarios

  return {
    now: {
      safeToSplurge: splurgeNowA,
      status: statusA,
      breakdown: breakdownA,
    },
    ifWait: {
      safeToSplurge: splurgeNowB,
      status: statusB,
      breakdown: breakdownB,
    },
  };
}

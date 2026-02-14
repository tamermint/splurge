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
} from "@/domain/types/forecast";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export async function computeForecast(
  input: ForecastInput,
  today: Date,
): Promise<ForecastOutput> {
  // Validate input using Zod schema
  const validationResult = ForecastInputSchema.safeParse(input);
  if (!validationResult.success) {
    const flattenedError = z.flattenError(validationResult.error);
    const errorMsg = JSON.stringify(flattenedError.fieldErrors);
    throw new ValidationError(`Validation failed: ${errorMsg}`);
  }

  //get paySchedule
  const paySchedule: PaySchedule = validationResult.data.paySchedule;

  //get frequency
  const frequency: string = validationResult.data.paySchedule.frequency;

  //get the bills
  const bills: Bill[] = validationResult.data.bills;

  //get pay amount
  const payAmount: number = validationResult.data.paySchedule.totalAmount;
  //get bills and total bill amounts

  //get all baselines
  const baselines: Baseline[] = validationResult.data.baselines;
  let totalBaselineAmount: number = 0;
  for (const baseline of baselines) {
    totalBaselineAmount += baseline.amount;
  }
  //get all commitments
  const commitments: Commitment[] = validationResult.data.commitments;
  let totalCommitmentAmount: number = 0;
  for (const commitment of commitments) {
    totalCommitmentAmount += commitment.savingsAmount;
  }
  //add all amounts
  //Get buffer
  const expenseBuffer: number = validationResult.data.buffer;

  const activePayDay: Date = nextPayDayAfter(today, paySchedule);
  const followingPayDay: Date = nextPayday(activePayDay, frequency);

  const windowAResult: BillsInWindowResult = billsInWindow(
    bills,
    today,
    activePayDay,
  );
  const allBillsInWindowA: Bill[] = windowAResult.bills;
  const totalBillAmountInWindowA: number = windowAResult.totalAmount;

  const windowBresult: BillsInWindowResult = billsInWindow(
    bills,
    activePayDay,
    followingPayDay,
  );
  const allBillsInWindowB: Bill[] = windowBresult.bills;
  const totalBillAmountInWindowB: number = windowBresult.totalAmount;

  //Compute Window A: today -> next pay
  //payDate is upcoming
  //add all amounts
  const totalAmountInWindowA: number =
    totalBillAmountInWindowA +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;
  //splurgeNow = pay amount - commitment - all bills - all baselines - buffer
  const splurgeNowA: number = getSplurgeAmount(payAmount, totalAmountInWindowA);
  //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
  const statusA: string = getSplurgeStatus(splurgeNowA);
  //breakdown
  const breakdownA: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowA,
    allBills: allBillsInWindowA,
    carryOver: 0,
  };

  //add all amounts
  const totalAmountInWindowB: number =
    totalBillAmountInWindowB +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;
  //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
  const splurgeNowB: number =
    getSplurgeAmount(payAmount, totalAmountInWindowB) + splurgeNowA;
  const statusB: string = getSplurgeStatus(splurgeNowB);
  //breakdown
  const breakdownB: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowB,
    allBills: allBillsInWindowB,
    carryOver: splurgeNowA,
  };

  //return ForecastOutput
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

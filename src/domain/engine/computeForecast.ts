import {
  billsInWindow,
  nextPayday,
  nextPayDayAfter,
} from "domain/schedules/scheduleHelper";
import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
  Breakdown,
  BillsInWindowResult,
} from "@/domain/types/forecast";

export async function computeForecast(
  input: ForecastInput,
  today: Date,
): Promise<ForecastOutput | undefined> {
  /*Determine the compute windows */

  //Declare the compute window variables
  let windowAResult: BillsInWindowResult;
  let windowBresult: BillsInWindowResult;

  let allBillsInWindowA: Bill[];
  let allBillsInWindowB: Bill[];

  let totalBillAmountInWindowA: number;
  let totalBillAmountInWindowB: number;

  //get paySchedule
  const paySchedule: PaySchedule = input.paySchedule;

  //get the bills
  const bills: Bill[] = input.bills;

  let activePayDay: Date = nextPayDayAfter(today, paySchedule);
  let followingPayDay: Date = nextPayday(activePayDay, paySchedule.frequency);

  windowAResult = billsInWindow(bills, today, activePayDay);
  allBillsInWindowA = windowAResult.bills;
  totalBillAmountInWindowA = windowAResult.totalAmount;

  windowBresult = billsInWindow(bills, activePayDay, followingPayDay);
  allBillsInWindowB = windowBresult.bills;
  totalBillAmountInWindowB = windowBresult.totalAmount;

  //get pay amount
  const payAmount: number = input.paySchedule.totalAmount;
  //get bills and total bill amounts

  //get all baselines
  const baselines: Baseline[] = input.baselines;
  let totalBaselineAmount: number = 0;
  for (let baseline of baselines) {
    totalBaselineAmount += baseline.amount;
  }
  //get all commitments
  const commitments: Commitment[] = input.commitments;
  let totalCommitmentAmount: number = 0;
  for (let commitment of commitments) {
    totalCommitmentAmount += commitment.savingsAmount;
  }
  //add all amounts
  //Get buffer
  let expenseBuffer: number = input.buffer;
  if (!input.buffer) {
    expenseBuffer = 50;
  }

  //for Window A
  let splurgeNowA: number = 0;
  let splurgeNowB: number = 0;
  let statusA: string = "";
  let statusB: string = "";
  //Compute Window A: today -> next pay
  //payDate is upcoming
  //add all amounts
  const totalAmountInWindowA: number =
    totalBillAmountInWindowA +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;
  //splurgeNow = pay amount - commitment - all bills - all baselines - buffer
  splurgeNowA = Math.round((payAmount - totalAmountInWindowA) * 100) / 100;
  //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
  splurgeNowA >= 100
    ? (statusA = "green")
    : splurgeNowA < 100 && splurgeNowA >= 50
      ? (statusA = "amber")
      : (statusA = "red");
  //breakdown
  const breakdownA: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowA,
    allBills: allBillsInWindowA,
  };

  //add all amounts
  const totalAmountInWindowB: number =
    totalBillAmountInWindowB +
    totalCommitmentAmount +
    totalBaselineAmount +
    expenseBuffer;
  //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
  splurgeNowB = Math.round((payAmount - totalAmountInWindowB) * 100) / 100;
  splurgeNowB >= 100
    ? (statusB = "green")
    : splurgeNowB < 100 && splurgeNowB >= 50
      ? (statusB = "amber")
      : (statusB = "red");
  //breakdown
  const breakdownB: Breakdown = {
    income: payAmount,
    commitments: commitments,
    baselines: baselines,
    buffer: expenseBuffer,
    totalBillAmount: totalBillAmountInWindowB,
    allBills: allBillsInWindowB,
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

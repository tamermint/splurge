import { billsInWindow, nextPayday } from "domain/schedules/scheduleHelper";
import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastInput,
  ForecastOutput,
  Breakdown,
  BillsInWindowResult,
} from "@/domain/types/forecast"; // Adjust the import path as needed

export async function computeForecast(
  input: ForecastInput,
): Promise<ForecastOutput | undefined> {
  /*Determine the compute windows */
  //get paySchedule
  const paySchedule: PaySchedule = input.paySchedule;

  // get date ranges - windowStart and windowEnd
  const today: Date = new Date();

  let windowEnd: Date;

  //get the payDate
  const payDate: Date = new Date(input.paySchedule.payDate);

  //get the bills
  const bills: Bill[] = input.bills;

  let windowAResult: BillsInWindowResult;
  let windowBresult: BillsInWindowResult;

  let allBillsInWindowA: Bill[];
  let allBillsInWindowB: Bill[];

  let totalBillAmountInWindowA: number;
  let totalBillAmountInWindowB: number;

  windowAResult = billsInWindow(bills, today, payDate);
  allBillsInWindowA = windowAResult.bills;
  totalBillAmountInWindowA = windowAResult.totalAmount;

  windowEnd = nextPayday(paySchedule);
  windowBresult = billsInWindow(bills, payDate, windowEnd);
  allBillsInWindowB = windowBresult.bills;
  totalBillAmountInWindowB = windowBresult.totalAmount;

  //get pay amount
  const payAmount: number = input.paySchedule.totalAmount;
  //get bills and total bill amounts

  //get all baselines
  const baselines: Baseline[] = input.baselines;
  let totalBaselineAmount: number = 0;
  for (let baseline in baselines) {
    totalBaselineAmount += baselines[baseline].amount;
  }
  //get all commitments
  const commitments: Commitment[] = input.commitments;
  let totalCommitmentAmount: number = 0;
  for (let commitment in commitments) {
    totalCommitmentAmount += commitments[commitment].savingsAmount;
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

import { billsInWindow } from "domain/schedules/scheduleHelper";
import {
  Baseline,
  Bill,
  PaySchedule,
  Commitment,
  ForecastOutput,
} from "@/domain/types/forecast"; // Adjust the import path as needed

interface ForecastInput {
  paySchedule: PaySchedule;
  bills: Bill[];
  commitments: Commitment[];
  baselines: Baseline[];
  buffer: number;
}

export async function computeForecast(
  input: ForecastInput,
): Promise<ForecastOutput[] | undefined> {
  //Determine compute window
  // get current date
  const today: Date = new Date();
  //get the payDate
  const payDate: Date = input.paySchedule.payDate;
  //get paySchedule
  const paySchedule = input.paySchedule;
  //get pay amount
  const payAmount: number = input.paySchedule.totalAmount;
  //get bills and total bill amounts
  const bills: Bill[] = input.bills;

  //isolate bills in windowA
  const allBillsInWindowA = billsInWindow(bills, today, paySchedule).bills;
  const totalBillAmountInWindowA = billsInWindow(
    bills,
    today,
    paySchedule,
  ).totalAmount;
  //isolate bills in windowB
  const allBillsInWindowB = billsInWindow(bills, payDate, paySchedule).bills;
  const totalBillAmountInWindowB = billsInWindow(
    bills,
    payDate,
    paySchedule,
  ).totalAmount;
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
  if (today < payDate) {
    //payDate is upcoming
    //add all amounts
    const totalAmountInWindowA: number =
      totalBillAmountInWindowA +
      totalCommitmentAmount +
      totalBaselineAmount +
      expenseBuffer;
    //splurgeNow = pay amount - commitment - all bills - all baselines - buffer
    splurgeNowA = payAmount - totalAmountInWindowA;
    //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
    splurgeNowA == 100
      ? (statusA = "green")
      : splurgeNowA < 100 && splurgeNowA > 50
        ? (statusA = "amber")
        : (statusA = "red");
    //breakdown
    console.log("Pay amount in window A: ", payAmount);
    console.log("Obligations in window A: ", allBillsInWindowA);
    console.log("Safe to splurge this window: ", splurgeNowA);
    console.log("Status is: ", statusA);
  } else {
    //add all amounts
    const totalAmountInWindowB: number =
      totalBillAmountInWindowB +
      totalCommitmentAmount +
      totalBaselineAmount +
      expenseBuffer;
    //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
    splurgeNowB = payAmount - totalAmountInWindowB;
    splurgeNowB == 100
      ? (statusB = "green")
      : splurgeNowB < 100 && splurgeNowB > 50
        ? (statusB = "amber")
        : (statusB = "red");
    //breakdown
    console.log("Pay amount in window B: ", payAmount);
    console.log("Obligations in window B: ", allBillsInWindowB);
    console.log("Safe to splurge this window: ", splurgeNowB);
    console.log("Status is: ", statusB);
  }

  //return ForecastOutput
  return [
    {
      safeToSplurgeNow: splurgeNowA,
      safeToSplurgeIfWait: statusA == "green" ? true : false,
      statusNow: statusA,
    },
    {
      safeToSplurgeNow: splurgeNowB,
      safeToSplurgeIfWait: statusB == "green" ? true : false,
      statusNow: statusB,
    },
  ];
}

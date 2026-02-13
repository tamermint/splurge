import {
  CalculationError,
  DateMappingError,
  ValidationError,
} from "@/lib/errors";
import { Bill, PaySchedule } from "../types/forecast";

interface BillsInWindowResult {
  bills: Bill[];
  totalAmount: number;
}

export function nextPayday(payDate: Date, frequency: string): Date {
  //get the next payday
  if (isNaN(payDate.getTime())) {
    throw new DateMappingError("Invalid payDate!");
  }
  if (!frequency || typeof frequency !== "string") {
    throw new ValidationError("Invalid frequency!");
  }
  let resultDate: Date = structuredClone(payDate);
  if (frequency == "weekly") {
    resultDate.setDate(resultDate.getDate() + 7);
  } else if (frequency == "fortnightly") {
    resultDate.setDate(resultDate.getDate() + 14);
  } else if (frequency == "monthly") {
    resultDate.setMonth(resultDate.getMonth() + 1);
  }
  return resultDate;
}

export function nextPayDayAfter(
  fromDate: Date,
  paySchedule: PaySchedule,
): Date {
  if (isNaN(fromDate.getTime())) {
    throw new DateMappingError("Invalid starting date");
  }
  if (!paySchedule) {
    throw new ValidationError("Payschedule is invalid");
  }
  let payDate: Date = structuredClone(paySchedule.payDate);
  const frequency: string = paySchedule.frequency;
  while (payDate <= fromDate) {
    payDate = nextPayday(payDate, frequency);
  }

  return payDate;
}

export function billsInWindow(
  bills: Bill[],
  windowStart: Date,
  windowEnd: Date,
): BillsInWindowResult {
  let totalBillAmount: number = 0;
  let billOccurence: Bill[] = [];
  if (!bills || bills.length == 0) {
    throw new CalculationError("Bills are either invalid or not available");
  }
  if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
    throw new DateMappingError("Invalid window start or end dates");
  }
  bills.forEach((bill: any, index: number) => {
    const dueDate = new Date(bill.dueDate);
    if (!bill.dueDate) {
      throw new DateMappingError(
        `Bill at index ${index} has missing or invalid due date`,
      );
    }
    if (dueDate >= windowStart && dueDate < windowEnd) {
      totalBillAmount += bill.amount;
      billOccurence.push(bill);
    }
  });

  return {
    bills: billOccurence,
    totalAmount: totalBillAmount,
  };
}

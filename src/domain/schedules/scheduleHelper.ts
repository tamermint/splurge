import { Bill, PaySchedule } from "../types/forecast";

interface BillsInWindowResult {
  bills: Bill[];
  totalAmount: number;
}

export function nextPayday(payDate: Date, frequency: string): Date {
  //get the next payday
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
  for (const bill of bills) {
    const dueDate = new Date(bill.dueDate);
    if (dueDate >= windowStart && dueDate < windowEnd) {
      totalBillAmount += bill.amount;
      billOccurence.push(bill);
    }
  }
  return {
    bills: billOccurence,
    totalAmount: totalBillAmount,
  };
}

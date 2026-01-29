import { Bill, PaySchedule } from "../types/forecast";

export function nextPayday(paySchedule: PaySchedule) {
  //get the compute windows A and B
  const payDate = new Date(paySchedule.payDate);
  const frequency: string = paySchedule.frequency;
  if (frequency == "weekly") {
    payDate.setDate(payDate.getDate() + 7);
  } else if (frequency == "fortnightly") {
    payDate.setDate(payDate.getDate() + 14);
  } else if (frequency == "monthly") {
    payDate.setMonth(payDate.getMonth() + 1);
  }
  return payDate;
}

export function billsInWindow(
  bills: Bill[],
  windowStart: Date,
  paySchedule: PaySchedule,
): any {
  const windowEnd = nextPayday(paySchedule);
  let totalBillAmount: number = 0;
  let billOccurence: Bill[] = [];
  for (const bill of bills) {
    if (bill.dueDate >= windowStart && bill.dueDate <= windowEnd) {
      totalBillAmount += bill.amount;
      billOccurence.push(bill);
    }
  }
  return {
    bills: billOccurence,
    totalAmount: totalBillAmount,
  };
}

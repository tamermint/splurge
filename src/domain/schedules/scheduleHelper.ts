export function nextPayday(paySchedule: PaySchedule) {
  //get the compute windows A and B
  const nextDateOfPay = new Date();
  const frequency: string = paySchedule.frequency;
  if (frequency == "weekly") {
    nextDateOfPay.setDate(paySchedule.nextPayDate.getDate() + 7);
  } else if (frequency == "fortnightly") {
    nextDateOfPay.setDate(paySchedule.nextPayDate.getDate() + 14);
  } else {
    nextDateOfPay.setDate(paySchedule.nextPayDate.getDate());
  }
  return nextDateOfPay;
}

export function billsInWindow(
  bills: Bill[],
  windowStart: Date,
  windowEnd: Date,
  paySchedule: PaySchedule,
): any {
  windowStart = new Date();
  windowEnd = nextPayday(paySchedule);
  let billAmount: number = 0;
  for (const bill of bills) {
    if (bill.scheduleRule >= windowStart && bill.scheduleRule <= windowEnd) {
      billAmount += bill.amount;
    }
  }
  return billAmount;
}

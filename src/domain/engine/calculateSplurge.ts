export function getSplurgeAmount(
  payAmount: number,
  totalWindowAmount: number,
): number {
  const splurgeAmount: number =
    Math.round((payAmount - totalWindowAmount) * 100) / 100;
  return splurgeAmount;
}

export function getSplurgeStatus(splurgeAmount: number): string {
  if (typeof splurgeAmount !== "number" || isNaN(splurgeAmount)) {
    return "Not a number!";
  }
  let splurgeStatus: string;
  if (splurgeAmount >= 100) {
    splurgeStatus = "green";
  } else if (splurgeAmount >= 50) {
    splurgeStatus = "amber";
  } else {
    splurgeStatus = "red";
  }
  return splurgeStatus;
}

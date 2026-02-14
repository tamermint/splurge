import { ValidationError } from "@/lib/errors";

export function getSplurgeAmount(
  payAmount: number,
  totalWindowAmount: number,
): number {
  if (isNaN(payAmount) || isNaN(totalWindowAmount)) {
    throw new ValidationError("Invalid pay amount or total bill amount");
  }
  const splurgeAmount: number =
    Math.round((payAmount - totalWindowAmount) * 100) / 100;
  return splurgeAmount;
}

export function getSplurgeStatus(splurgeAmount: number): string {
  if (typeof splurgeAmount !== "number" || isNaN(splurgeAmount)) {
    throw new ValidationError("Invalid splurge amount");
  }
  let splurgeStatus: string;
  const SPLRUGE_THRESHOLD_GREEN: number = 100;
  const SPLRUGE_THRESHOLD_AMBER: number = 50;

  if (splurgeAmount >= SPLRUGE_THRESHOLD_GREEN) {
    splurgeStatus = "green";
  } else if (splurgeAmount >= SPLRUGE_THRESHOLD_AMBER) {
    splurgeStatus = "amber";
  } else if (splurgeAmount >= 0) {
    splurgeStatus = "frugal";
  } else {
    splurgeStatus = "insolvent";
  }
  return splurgeStatus;
}

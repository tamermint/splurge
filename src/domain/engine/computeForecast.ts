import { nextPayday, billsInWindow } from "domain/schedules/scheduleHelper";
import { Baseline, Bill, ForecastOutput } from "@/domain/types/forecast"; // Adjust the import path as needed

interface ForecastInput {
  // Define your input structure here
  payAmount: number;
  payFrequency: string; // e.g., "weekly", "biweekly"
  bills: Bill[];
  baselines: Baseline[];
  commitments: number;
  buffer: number;
}

export async function computeForecast(
  input: ForecastInput,
): Promise<ForecastOutput | undefined> {
  //Determine compute windows
  // get current date
  const now: Date = new Date();
  // get next pay day
  //compute window A = nextpayDate - today's date
  // get frequency
  // get next pay day
  // compute window B = nextPayDate + frequency
  //get pay amount
  //get bills and total bill amounts
  //get bill date
  //get bill rule
  //add all bills
  //get all baselines
  //get amount
  //add all amounts
  //Get buffer
  //splurgeNow = pay amount - commitment - all bills - all baselines - buffer
  //if splurgeNow > 100, status = green, 100 < splurge now < 50, status = amber else status = red
  //breakdown
  //return ForecastOutput
  return;
}

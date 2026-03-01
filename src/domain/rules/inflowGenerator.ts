import { DateMappingError, ValidationError } from "@/lib/errors";
import { Inflow, PaySchedule } from "../types/forecast";
import { nextUTCIntervalDate } from "../schedules/scheduleHelper";

export function inflowGenerator(
  paySchedule: PaySchedule,
  fromDate: Date,
  toDate: Date,
): Inflow[] {
  const allInflowOccurences: Inflow[] = [];
  const frequency: string = paySchedule.frequency;
  const inflowsTemplate: Inflow[] = paySchedule.inflows;

  //Check for Date format errors in input
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new DateMappingError("Invalid window start or end dates");
  }

  //Check if the payschedule is a valid object or if it has 0 inflows
  if (!inflowsTemplate || inflowsTemplate.length == 0) {
    throw new ValidationError(
      "Payschedule found must contain atleast one valid inflow",
    );
  }

  //Check if the frequency is valid
  if (!frequency || typeof frequency != "string") {
    throw new ValidationError("invalid frequency!");
  }

  for (const inflow of inflowsTemplate) {
    let pointerDate: Date = new Date(inflow.date);
    while (pointerDate < toDate) {
      if (pointerDate >= fromDate) {
        const futureInflow: Inflow = {
          ...inflow,
          date: new Date(pointerDate),
        };
        allInflowOccurences.push(futureInflow);
      }
      pointerDate = nextUTCIntervalDate(pointerDate, frequency);
    }
  }
  const sortedInflowOccurences: Inflow[] = allInflowOccurences.sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  return sortedInflowOccurences;
}

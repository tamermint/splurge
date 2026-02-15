import { ValidationError, DateMappingError } from "@/lib/errors";
import { Bill, FutureBill } from "../types/forecast";

//Accept params: bill: Bill, startDate, endDate
//get anchorDate from dueDate
//check scheduleType
//from startDate till endDate
//generate all bills

export function recurrenceGenerator(
  bill: Bill,
  fromDate: Date,
  toDate: Date,
): FutureBill[] {
  const pointerDate: Date = new Date(bill.dueDate);
  const scheduleType: string = bill.scheduleType;
  let futureBills: FutureBill[] = [];
  if (!pointerDate) {
    throw new ValidationError("Bill does not have a due date!");
  }
  if (!scheduleType || scheduleType == "") {
    throw new ValidationError("Bill schedule is missing or invalid");
  }
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new DateMappingError("Invalid window start or end dates");
  }

  while (pointerDate <= toDate) {
    if (scheduleType == "fortnightly") {
      pointerDate.setDate(pointerDate.getDate() + 14);
    }
    if (scheduleType == "monthly") {
      pointerDate.setMonth(pointerDate.getMonth() + 1);
    }
    if (scheduleType == "yearly") {
      pointerDate.setFullYear(pointerDate.getFullYear() + 1);
    }

    if (pointerDate >= fromDate && pointerDate <= toDate) {
      const futureBill: FutureBill = {
        ...bill,
        dueDate: new Date(pointerDate),
      };
      futureBills.push(futureBill);
    }
  }
  return futureBills;
}

import { ForecastInput, PaySchedule } from "@/domain/types/forecast";

export function transformIntoDTO(input: any): ForecastInput {
  //get the input object --> done via the request
  //get into each property and transform into date
  let transformedInput = structuredClone(input);

  let paySchedule: PaySchedule = transformedInput.paySchedule;

  const payDate: Date = new Date(paySchedule.payDate);
  transformedInput.paySchedule.payDate = payDate;

  transformedInput.bills.forEach((bill: any) => {
    bill.dueDate = new Date(bill.dueDate);
  });

  return transformedInput;
}

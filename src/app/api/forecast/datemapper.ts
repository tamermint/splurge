import { ForecastInput, PaySchedule } from "@/domain/types/forecast";
import { DateMappingError } from "@/lib/errors";

export function transformIntoDTO(input: ForecastInput): ForecastInput {
  try {
    //get the input object --> done via the request
    //get into each property and transform into date
    let transformedInput = structuredClone(input);

    let paySchedule: PaySchedule = transformedInput.paySchedule;

    // Validate and transform payDate
    if (!paySchedule.payDate) {
      throw new DateMappingError("Pay date is missing or invalid");
    }
    const payDate: Date = new Date(paySchedule.payDate);
    if (isNaN(payDate.getTime())) {
      throw new DateMappingError(
        `Invalid pay date format: ${paySchedule.payDate}`
      );
    }

    transformedInput.paySchedule.payDate = payDate;

    // Validate and transform bill due dates
    transformedInput.bills.forEach((bill: any, index: number) => {
      if (!bill.dueDate) {
        throw new DateMappingError(
          `Bill at index ${index} has missing or invalid due date`
        );
      }
      const dueDate = new Date(bill.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new DateMappingError(
          `Invalid due date format for bill at index ${index}: ${bill.dueDate}`
        );
      }
      bill.dueDate = dueDate;
    });

    return transformedInput;
  } catch (error) {
    if (error instanceof DateMappingError) {
      throw error;
    }
    throw new DateMappingError(
      `Failed to transform input data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

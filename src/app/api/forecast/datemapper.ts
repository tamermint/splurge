import { ForecastInput, ForecastInputSchema } from "@/domain/types/forecast";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export function transformIntoDTO(input: unknown): ForecastInput {
  //get the input object --> done via the request
  //get into each property and transform into date
  const validationResult = ForecastInputSchema.safeParse(input);
  if (!validationResult.success) {
    const formattedErrors = z.prettifyError(validationResult.error);
    throw new ValidationError(`Validation failed: ${formattedErrors}`);
  }

  const transformedInput: ForecastInput = validationResult.data;

  return transformedInput;
}

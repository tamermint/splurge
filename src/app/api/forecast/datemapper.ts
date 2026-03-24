import { ForecastInput, ForecastInputSchema } from "@/domain/types/forecast";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

/**
 * @module app/api/forecast/transformIntoDTO
 * @description
 * The Date Mapper serves as the "Ingestion Gatekeeper" for the Splurge API. It is
 * responsible for the critical transformation of raw, untrusted Request payloads
 * into strictly-validated ForecastInput DTOs.
 * * ### Architectural Principles:
 * 1. **Runtime Type Enforcement:** Leverages Zod's `safeParse` to guarantee that
 * incoming data strictly adheres to the `ForecastInputSchema` before it ever
 * reaches the core engine.
 * 2. **Automatic Temporal Coercion:** A key responsibility is the "Hydration" of
 * stringified ISO dates into real JavaScript `Date` objects. This eliminates
 * "Type Bleeding" where strings are accidentally passed into date-math functions.
 * 3. **Error Prettification:** Implements `z.prettifyError` (or `treeifyError`)
 * to transform cryptic Zod validation logs into human-readable feedback,
 * essential for developer and user debugging.
 * * ### Data Flow:
 *
 * * @param {unknown} input - The raw JSON body extracted from an incoming POST request.
 * @returns {ForecastInput} A sanitized, fully-hydrated DTO ready for engine consumption.
 * * @throws {ValidationError} If the payload fails schema validation. The error
 * includes a detailed tree of failed constraints.
 */

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

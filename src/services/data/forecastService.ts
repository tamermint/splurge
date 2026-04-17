//Find the user
//Convert user input into engine input for computeforecast
//Return the Forecast output
import { computeForecast } from "@/domain/engine/computeForecast";
import { ForecastInput, ForecastOverrides } from "@/domain/types/forecast";
import { Prisma } from "@/generated/prisma/client";
import { IncompleteUser, InvalidUser } from "@/lib/errors";
import prisma from "@/lib/prisma";

const userFinancialGraph = {
  paySchedule: {
    include: { inflows: true },
  },
  bills: true,
  commitments: true,
  baselines: true,
  expenses: true,
} satisfies Prisma.UserInclude;pl

//If user has sufficient data, now map the user details to the forecastInput

async function getForecastInputOfUser(
  userId: string,
): Promise<ForecastInput | null> {
  const cleanInput: ForecastInput | null = buildDomainInput(forecastInputUser);

  return null;
}

/*export const ForecastInputSchema = z.object({
  paySchedule: PayScheduleSchema,
  bills: z.array(BillSchema),
  commitments: z.array(CommitmentSchema),
  baselines: z.array(BaselineSchema),
  expenses: z.optional(z.array(oneOffExpenseSchema)),
  buffer: z.number().default(50),
  startingBalance: z.number().optional().default(0),
  splurgeGoal: SplurgeGoalSchema.optional(),
}); */

function buildDomainInput(input: any): ForecastInput | null {
  // TODO: Map the user object to ForecastInput
  const domainInput: ForecastInput = {
    paySchedule: input.paySchedule,
    bills: input.bills,
    commitments: input.commitments,
    baselines: input.baselines,
    expenses: input.expenses,
    buffer: input.buffer,
    startingBalance: input.startingBalance,
  };
  return domainInput;
}

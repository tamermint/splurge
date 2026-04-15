//Find the user
//Convert user input into engine input for computeforecast
//Return the Forecast output
import { computeForecast } from "@/domain/engine/computeForecast";
import { ForecastInput, ForecastOverrides } from "@/domain/types/forecast";
import { IncompleteUser, InvalidUser } from "@/lib/errors";
import prisma from "@/lib/prisma";

async function getForecastInputOfUser(
  userId: string,
): Promise<ForecastInput | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const userWithPaySchedule = await prisma.user.findUnique({
    where: {
      id: userId,
      paySchedule: {
        isNot: null,
      },
    },
  });
  const forecastInputUser = await prisma.user.findUnique({
    where: {
      id: userId,
      paySchedule: {
        isNot: null,
      },
      inflows: {
        some: {},
      },
      bills: {
        some: {},
      },
      commitments: {
        some: {},
      },
    },
  });
  if (!user) {
    throw new InvalidUser("User not found!");
  }
  if (!userWithPaySchedule) {
    throw new IncompleteUser("User doesn't have a payschedule");
  }
  if (!forecastInputUser) {
    throw new IncompleteUser(
      "Not sufficient information for forecast engine and AI insight",
    );
  }
  //If user has sufficient data, now map the user details to the forecastInput
  const cleanInput: ForecastInput | null = buildDomainInput(forecastInputUser);

  return cleanInput;
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

//Find the user
//Convert user input into engine input for computeforecast
//Return the Forecast output
import {
  ForecastInput,
  ForecastOverrides,
  Bill,
  Commitment,
  Baseline,
  oneOffExpense,
  PaySchedule,
  ForecastInputSchema,
} from "@/domain/types/forecast";
import { Prisma } from "@/generated/prisma/client";
import { IncompleteUser, InvalidUser, ValidationError } from "@/lib/errors";
import prisma from "@/lib/prisma";

const userFinancialGraph = {
  paySchedule: {
    include: { inflows: true },
  },
  bills: true,
  commitments: true,
  baselines: true,
  expenses: true,
} satisfies Prisma.UserInclude;

export type UserWithFinancials = Prisma.UserGetPayload<{
  include: typeof userFinancialGraph;
}>;

//If user has sufficient data, now map the user details to the forecastInput

export async function getForecastInputOfUser(
  userId: string,
  overrides?: ForecastOverrides,
): Promise<ForecastInput | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userFinancialGraph,
  });

  if (!user) {
    throw new InvalidUser("User not found!");
  }
  if (!user.paySchedule || user.paySchedule.inflows.length == 0) {
    throw new IncompleteUser("User has not added a pay schedule");
  }

  return buildDomainInput(user, overrides);
}

//this function basically takes in two arrays and merges them while retaining typesafety
//First, enforce a generic constraint that arrays should have an id of type string
//then either add or replace items based on id
function mergeById<T extends { id: string }>(
  dbItems: T[],
  overrideItems?: T[],
): T[] {
  if (!overrideItems || overrideItems.length == 0) return dbItems;

  const overrideMap = new Map(overrideItems.map((item) => [item.id, item]));

  //replace existing db items with overrides
  const merged = dbItems.map((item) =>
    overrideMap.has(item.id) ? overrideMap.get(item.id)! : item,
  );

  //append new items not in db
  const dbIds = new Set(dbItems.map((item) => item.id));
  const newItems = overrideItems.filter((item) => !dbIds.has(item.id));

  return [...merged, ...newItems];
}

function buildDomainInput(
  dbUser: UserWithFinancials,
  overrides?: ForecastOverrides,
): ForecastInput {
  //Build the domain input
  //get other values such as buffer
  const dbBuffer: number = dbUser.buffer;
  const dbPaySchedule: PaySchedule = dbUser.paySchedule as PaySchedule;
  const dbStartingBalance: number = dbUser.startingBalance as number;
  //map the bills
  const mappedDbBills: Bill[] = dbUser.bills.map((b) => ({
    id: b.id,
    amount: b.amount,
    name: b.name,
    dueDate: b.dueDate,
    scheduleType: b.scheduleType as
      | "weekly"
      | "fortnightly"
      | "monthly"
      | "yearly",
    payRail: b.payRail,
    payType: b.payType as "auto-debit" | "manual",
    deferredUntil: b.deferredUntil ?? undefined,
  }));
  //map commitments
  const mappedDbCommitments: Commitment[] = dbUser.commitments.map((c) => ({
    id: c.id,
    commitmentType: c.commitmentType,
    commitmentAmount: c.commitmentAmount,
    constraint: c.constraint,
    priority: c.priority,
  }));
  //map baselines
  const mappedDbBaselines: Baseline[] = dbUser.baselines.map((bs) => ({
    id: bs.id,
    name: bs.name,
    amount: bs.amount,
  }));
  //map expenses
  const mappedDbExpenses: oneOffExpense[] = dbUser.expenses.map((exp) => ({
    id: exp.id,
    name: exp.name,
    amount: exp.amount,
    date: exp.date,
  }));

  //now need to merge overrides
  const startingBalance: number =
    overrides?.startingBalance ?? dbStartingBalance;
  const buffer: number = overrides?.buffer ?? dbBuffer;

  const bills: Bill[] = mergeById(mappedDbBills, overrides?.bills);
  const commitments: Commitment[] = mergeById(
    mappedDbCommitments,
    overrides?.commitments,
  );
  const expenses: oneOffExpense[] = mergeById(
    mappedDbExpenses,
    overrides?.expenses,
  );
  const baselines: Baseline[] = mergeById(
    mappedDbBaselines,
    overrides?.baselines,
  );
  const paySchedule = overrides?.paySchedule ?? {
    id: dbPaySchedule.id,
    frequency: dbPaySchedule.frequency as "weekly" | "fortnightly" | "monthly",
    inflows: mergeById(
      dbUser.paySchedule!.inflows,
      overrides?.paySchedule?.inflows,
    ),
  };

  const rawPayload = {
    paySchedule: paySchedule,
    bills: bills,
    commitments: commitments,
    baselines: baselines,
    expenses: expenses,
    buffer: buffer,
    startingBalance: startingBalance,
  };

  return ForecastInputSchema.parse(rawPayload);
}

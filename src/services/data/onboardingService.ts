import { Frequency, ScheduleType } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import z from "zod";

const OnboardingPayloadSchema = z.object({
  startingBalance: z.number(),
  buffer: z.number(),
  paySchedule: z.object({
    id: z.uuidv4(), // Client-minted ID
    frequency: z.enum(Frequency),
    inflows: z.array(
      z.object({
        id: z.uuidv4(),
        amount: z.number(),
        date: z.coerce.date(),
        label: z.string(),
      }),
    ),
  }),
  bills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number(),
      dueDate: z.coerce.date(),
      scheduleType: z.enum(ScheduleType),
      payRail: z.string(),
      payType: z.literal(["auto-debit", "manual"]),
    }),
  ),
  commitments: z.array(
    z.object({
      id: z.string(),
      commitmentType: z.string(),
      commitmentAmount: z.number(),
      constraint: z.literal(["hard", "soft"]),
      priority: z.number(),
    }),
  ),
  baselines: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number(),
    }),
  ),
  expenses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number(),
      date: z.coerce.date(),
    }),
  ),
});
export type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;

export async function intializeUserWithFiancials(
  userId: string,
  data: OnboardingPayload,
) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      startingBalance: data.startingBalance,
      buffer: data.buffer,

      paySchedule: {
        create: {
          id: data.paySchedule.id,
          frequency: data.paySchedule.frequency,
          inflows: {
            create: data.paySchedule.inflows.map((inflow) => ({
              id: inflow.id,
              amount: inflow.amount,
              date: inflow.date,
              label: inflow.label,
            })),
          },
        },
      },
      bills: {
        create: data.bills.map((bill) => ({
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.dueDate,
          scheduleType: bill.scheduleType,
          payType: bill.payType as "auto_debit" | "manual",
          payRail: bill.payRail,
        })),
      },
      commitments: {
        create: data.commitments.map((commitment) => ({
          id: commitment.id,
          commitmentType: commitment.commitmentType,
          commitmentAmount: commitment.commitmentAmount,
          priority: commitment.priority,
          constraint: commitment.constraint as "hard" | "soft",
        })),
      },
      baselines: {
        create: data.baselines.map((baseline) => ({
          id: baseline.id,
          amount: baseline.amount,
          name: baseline.name,
        })),
      },
      expenses: {
        create: data.expenses.map((expense) => ({
          id: expense.id,
          name: expense.name,
          amount: expense.amount,
          date: expense.date,
        })),
      },
    },
  });
  return updatedUser;
}

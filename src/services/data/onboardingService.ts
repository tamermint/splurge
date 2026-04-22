import { OnboardingPayload } from "@/domain/types/forecast";
import prisma from "@/lib/prisma";

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
      plan: "FREE",
    },
  });
  return updatedUser;
}

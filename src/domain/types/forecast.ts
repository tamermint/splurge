import { z } from "zod";

/**
 * Timelive event represents a change in the state of the user's account
 */
export const TimelineEventSchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  type: z.literal(["inflow", "bill", "commitment", "baseline", "expense"]),
  label: z.string(),
  amount: z.number(), //signed: -ve for outflows and +ve for inflows
  paymentConstraints: z.literal(["hard", "soft"]),
  priority: z.optional(z.number()),
  runningBalance: z.number(),
  liquidityStatus: z.literal(["stable", "warning", "critical"]),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const reliefActionSchema = z.object({
  targetEventId: z.string(),
  label: z.string(),
  amountUnlocked: z.number(),
  remainingCommitment: z.number(),
});
export type ReliefAction = z.infer<typeof reliefActionSchema>;

export const SavingsReliefSchema = z.object({
  actions: z.array(reliefActionSchema),
  totalReliefAmount: z.number(),
  predictedBalance: z.number(),
  isFullyResolved: z.boolean(),
});

export type SavingsRelief = z.infer<typeof SavingsReliefSchema>;

export const Inflow = z.object({
  amount: z.number(),
  date: z.coerce.date(),
  label: z.string(),
});
export type Inflow = z.infer<typeof Inflow>;

export const PayScheduleSchema = z.object({
  frequency: z.literal(["weekly", "fortnightly", "monthly"]),
  inflows: z.array(Inflow),
});
export type PaySchedule = z.infer<typeof PayScheduleSchema>;

export const BillSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.coerce.date(),
  scheduleType: z.literal(["weekly", "fortnightly", "monthly", "yearly"]),
  payRail: z.string(),
  payType: z.literal(["auto-debit", "manual"]),
});
export type Bill = z.infer<typeof BillSchema>;

export const FutureBillSchema = BillSchema.omit({ id: true });
export type FutureBill = z.infer<typeof FutureBillSchema>;

export const CommitmentSchema = z.object({
  commitmentType: z.string(),
  commitmentAmount: z.number(),
  constraint: z.literal(["hard", "soft"]),
  priority: z.number(),
});
export type Commitment = z.infer<typeof CommitmentSchema>;

export const BaselineSchema = z.object({
  name: z.string(),
  amount: z.number(),
});
export type Baseline = z.infer<typeof BaselineSchema>;

export const oneOffExpenseSchema = z.object({
  name: z.string(),
  amount: z.number(),
  date: z.coerce.date(),
});
export type oneOffExpense = z.infer<typeof oneOffExpenseSchema>;

export const splurgeStatusSchema = z.enum([
  "green",
  "amber",
  "frugal",
  "critical",
]);
export type splurgeStatus = z.infer<typeof splurgeStatusSchema>;

export const ForecastInputSchema = z.object({
  paySchedule: PayScheduleSchema,
  bills: z.array(BillSchema),
  commitments: z.array(CommitmentSchema),
  baselines: z.array(BaselineSchema),
  expenses: z.optional(z.array(oneOffExpenseSchema)),
  buffer: z.number().default(50),
});
export type ForecastInput = z.infer<typeof ForecastInputSchema>;

export const BreakdownSchema = z.object({
  income: z.number(),
  commitments: z.array(CommitmentSchema),
  baselines: z.array(BaselineSchema),
  buffer: z.number(),
  totalBillAmount: z.number(),
  allBills: z.array(z.union([BillSchema, FutureBillSchema])),
  timeline: z.array(TimelineEventSchema), //The timeline here gives the AI coach enough grounded context to infer and advice.
  carryOver: z.number().default(0),
});
export type Breakdown = z.infer<typeof BreakdownSchema>;

export const ForecastOutputSchema = z.object({
  now: z.object({
    safeToSplurge: z.number(),
    status: z.string(),
    breakdown: BreakdownSchema,
  }),
  ifWait: z.object({
    safeToSplurge: z.number(),
    status: z.string(),
    breakdown: BreakdownSchema,
  }),
  suggestedRelief: z.optional(SavingsReliefSchema).nullable(),
});
export type ForecastOutput = z.infer<typeof ForecastOutputSchema>;

export const BillsInWindowResultSchema = z.object({
  bills: z.array(z.union([BillSchema, FutureBillSchema])),
  totalAmount: z.number(),
});
export type BillsInWindowResult = z.infer<typeof BillsInWindowResultSchema>;

export const InflowsInWindowResultSchema = z.object({
  inflows: z.array(Inflow),
  totalAmount: z.number(),
});
export type InflowsInWindowResult = z.infer<typeof InflowsInWindowResultSchema>;

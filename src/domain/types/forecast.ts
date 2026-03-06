import { z } from "zod";

/**
 * Timelive event represents a change in the state of the user's account
 */
export const TimelineEventSchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  type: z.enum(["inflow", "bill", "commitment", "baseline", "expense"]),
  label: z.string(),
  amount: z.number(), //signed: -ve for outflows and +ve for inflows
  paymentConstraints: z.enum(["hard", "soft"]),
  runningBalance: z.number(),
  liquidityStatus: z.enum(["stable", "warning", "critical"]),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const SavingsReliefSchema = z.object({
  targetEventId: z.string(),
  targetLabel: z.string(),
  reliefAmount: z.number(),
  remainingCommitment: z.number(),
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
  frequency: z.union([
    z.literal("weekly"),
    z.literal("fortnightly"),
    z.literal("monthly"),
  ]),
  inflows: z.array(Inflow),
});
export type PaySchedule = z.infer<typeof PayScheduleSchema>;

export const BillSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.coerce.date(),
  scheduleType: z.union([
    z.literal("weekly"),
    z.literal("fortnightly"),
    z.literal("monthly"),
    z.literal("yearly"),
  ]),
  payRail: z.string(),
  payType: z.union([z.literal("auto-debit"), z.literal("manual")]),
});
export type Bill = z.infer<typeof BillSchema>;

export const FutureBillSchema = BillSchema.omit({ id: true });
export type FutureBill = z.infer<typeof FutureBillSchema>;

export const CommitmentSchema = z.object({
  commitmentType: z.string(),
  commitmentAmount: z.number(),
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
  suggestedRelief: z.optional(SavingsReliefSchema),
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

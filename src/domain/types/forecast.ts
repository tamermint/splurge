import { z } from "zod";

export const PayScheduleSchema = z.object({
  frequency: z.string(),
  payDate: z.date(),
  totalAmount: z.number(),
  optionalSplit: z.boolean(),
});
export type PaySchedule = z.infer<typeof PayScheduleSchema>;

export const BillSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.date(),
  scheduleType: z.string(),
  payRail: z.string(),
});
export type Bill = z.infer<typeof BillSchema>;

export const CommitmentSchema = z.object({
  savingsAmount: z.number(),
});
export type Commitment = z.infer<typeof CommitmentSchema>;

export const BaselineSchema = z.object({
  name: z.string(),
  amount: z.number(),
});
export type Baseline = z.infer<typeof BaselineSchema>;

export const ForecastInputSchema = z.object({
  paySchedule: PayScheduleSchema,
  bills: z.array(BillSchema),
  commitments: z.array(CommitmentSchema),
  baselines: z.array(BaselineSchema),
  buffer: z.number().default(50),
});
export type ForecastInput = z.infer<typeof ForecastInputSchema>;

export const BreakdownSchema = z.object({
  income: z.number(),
  commitments: z.array(CommitmentSchema),
  baselines: z.array(BaselineSchema),
  buffer: z.number(),
  totalBillAmount: z.number(),
  allBills: z.array(BillSchema),
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
});
export type ForecastOutput = z.infer<typeof ForecastOutputSchema>;

export const BillsInWindowResultSchema = z.object({
  bills: z.array(BillSchema),
  totalAmount: z.number(),
});
export type BillsInWindowResult = z.infer<typeof BillsInWindowResultSchema>;

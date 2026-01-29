export type PaySchedule = {
  frequency: string;
  payDate: Date;
  totalAmount: number;
  optionalSplit: boolean;
};

export type Bill = {
  id: number;
  name: string;
  amount: number;
  dueDate: Date;
  scheduleType: string;
  payRail: string;
};

export type Commitment = {
  savingsAmount: number;
};

export type Baseline = {
  name: string;
  amount: number;
};

export type ForecastInput = {
  paySchedule: PaySchedule;
  bills: Bill[];
  commitments: Commitment[];
  baselines: Baseline[];
  buffer: number;
};

export type ForecastOutput = {
  safeToSplurgeNow: number;
  safeToSplurgeIfWait: boolean;
  statusNow: string;
};

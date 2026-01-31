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

export type Breakdown = {
  income: number;
  commitments: Commitment[];
  baselines: Baseline[];
  buffer: number;
  totalBillAmount: number;
  allBills: Bill[];
};

export type ForecastOutput = {
  now: Object;
  ifWait: Object;
};

export type BillsInWindowResult = {
  bills: Bill[];
  totalAmount: number;
};

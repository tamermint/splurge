type PaySchedule = {
  frequency: string;
  nextPayDate: Date;
  totalAmount: number;
  optionalSplit: boolean;
};

type Bill = {
  name: string;
  amount: number;
  scheduleType: string;
  scheduleRule: Date;
  payRail: string;
};

type Commitment = {
  savingsAmount: number;
};

type Baseline = {
  name: string;
  amount: number;
};

type ForecastInput = {
  paySchedule: PaySchedule;
  bill: Bill;
  commitment: Commitment;
  baseline: Baseline;
};

type ForecastOutput = {
  safeToSplurgeNow: number;
  safeToSplurgeIfWait: boolean;
  statusNow: string;
};

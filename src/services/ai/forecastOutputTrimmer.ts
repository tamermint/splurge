import {
  Breakdown,
  ForecastOutput,
  SimpleBreakdown,
  SimpleTimeline,
  TimelineEvent,
  TrimmedForecastOutput,
} from "@/domain/types/forecast";

export function trimForecastOutputForAI(
  forecast: ForecastOutput,
): TrimmedForecastOutput {
  const simplifyTimeline = (timeline: TimelineEvent[]): SimpleTimeline[] =>
    timeline.map((timelineEvent) => ({
      date: timelineEvent.timestamp.toISOString(),
      label: timelineEvent.label,
      type: timelineEvent.type,
      amount: timelineEvent.amount,
      balance: timelineEvent.runningBalance,
      status: timelineEvent.liquidityStatus,
    }));

  const createSimpleBreakdown = (
    breakdown: Breakdown,
    simpleTimeline: SimpleTimeline[],
  ): SimpleBreakdown => ({
    income: breakdown.income,
    commitments: breakdown.commitments,
    baselines: breakdown.baselines,
    buffer: breakdown.buffer,
    totalBillAmount: breakdown.totalBillAmount,
    allBills: breakdown.allBills,
    carryOver: breakdown.carryOver,
    timeline: simpleTimeline,
  });

  const simpleBreakdownNowTimeline: SimpleTimeline[] = simplifyTimeline(
    forecast.now.breakdown.timeline,
  );
  const simpleBreakdownNow: SimpleBreakdown = createSimpleBreakdown(
    forecast.now.breakdown,
    simpleBreakdownNowTimeline,
  );

  const simpleBreakdownIfWaitTimeline: SimpleTimeline[] = simplifyTimeline(
    forecast.ifWait.breakdown.timeline,
  );
  const simpleBreakdownIfWait: SimpleBreakdown = createSimpleBreakdown(
    forecast.ifWait.breakdown,
    simpleBreakdownIfWaitTimeline,
  );

  const trimmedForecastOutput: TrimmedForecastOutput = {
    now: {
      safeToSplurge: forecast.now.safeToSplurge,
      status: forecast.now.status,
      breakdown: simpleBreakdownNow,
    },
    ifWait: {
      safeToSplurge: forecast.ifWait.safeToSplurge,
      status: forecast.ifWait.status,
      breakdown: simpleBreakdownIfWait,
    },
    suggestedRelief: forecast.suggestedRelief,
    deferralPlan: forecast.deferralPlan,
    patiencePayoff: forecast.patiencePayoff,
    structuralDeficit: forecast.structuralDeficit,
  };

  return trimmedForecastOutput;
}

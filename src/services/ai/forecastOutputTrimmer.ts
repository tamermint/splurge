import {
  Breakdown,
  ForecastOutput,
  SimpleBreakdown,
  SimpleTimeline,
  TimelineEvent,
  TrimmedForecastOutput,
} from "@/domain/types/forecast";
/**
 * @module services/ai/forecastOutputTrimmer
 * @description
 * The Forecast Output Trimmer is the "Nervous System" of the Splurge AI pipeline.
 * It serves as a specialized Data Transformation Layer that distills high-fidelity
 * engine results into a "Signal-Dense" format optimized for LLM inference.
 * * ### Architectural Role:
 * 1. **Token Economy:** Standard `TimelineEvent` objects carry engine-specific
 * metadata (hashes, internal flags, etc.) that increase token consumption without
 * adding reasoning value. This module strips "Noise" to maximize the AI's available
 * context window.
 * 2. **Temporal Consistency:** Normalizes internal JavaScript `Date` objects into
 * standard ISO strings. This ensures the AI receives a deterministic, chronologically
 * unambiguous sequence for its analysis.
 * 3. **Strategic Preservation:** While the timeline is simplified, critical
 * strategic anchors—such as `structuralDeficit`, `patiencePayoff`, and
 * `suggestedRelief`—are preserved in their raw form to maintain mathematical integrity.
 * * @param {ForecastOutput} forecast - The raw, unrefined output from the Splurge deterministic engine.
 * @returns {TrimmedForecastOutput} A context-optimized payload tailored for the Splurge Strategic Analyst.
 */

export function trimForecastOutputForAI(
  forecast: ForecastOutput,
): TrimmedForecastOutput {
  /**
   * @private
   * @description Simplifies high-fidelity events into a token-efficient format.
   * Maps 'liquidityStatus' to a flat 'status' field to reduce nested object overhead.
   */
  const simplifyTimeline = (timeline: TimelineEvent[]): SimpleTimeline[] =>
    timeline.map((timelineEvent) => ({
      date: timelineEvent.timestamp.toISOString(),
      label: timelineEvent.label,
      type: timelineEvent.type,
      amount: timelineEvent.amount,
      balance: timelineEvent.runningBalance,
      status: timelineEvent.liquidityStatus,
    }));

  /**
   * @private
   * @description Aggregates simplified timeline data into a reconstructed breakdown.
   */
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

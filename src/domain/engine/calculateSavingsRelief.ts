import { time } from "console";
import { TimelineEvent } from "../types/forecast";
import { SavingsRelief } from "../types/forecast";
//iterate through the timeline
//find the point where the running balance becomes negative or is minimum
//check if it is greater than or equal to buffer, if yes, return null
//if no, then gather all events that led up to this minevent and have the type = commitment
//pick the most largest commitment
//reliefAMount = abs(minEvent.runningBalance) + buffer
//if reliefAMount > targetCommitment.amount, reliefAMount = targetCommitment.amount

export function calculateSavingsRelief(
  timelineEvents: TimelineEvent[],
  buffer: number,
): SavingsRelief | {} {
  const minEvent: TimelineEvent = timelineEvents.reduce((min, e) =>
    e.runningBalance < min.runningBalance ? e : min,
  );
  if (minEvent.runningBalance >= buffer) {
    return {};
  }
  const reliefGap: number = Math.abs(minEvent.runningBalance) + buffer;

  const allCommitmentEventsTillMinEvent: TimelineEvent[] =
    timelineEvents.filter(
      (i) => i.type === "commitment" && i.timestamp <= minEvent.timestamp,
    );

  const highestCommitment: TimelineEvent =
    allCommitmentEventsTillMinEvent.reduce((high, e) =>
      high.amount > e.amount ? high : e,
    );

  /*
    export const SavingsReliefSchema = z.object({
      targetEventId: z.string(),
      targetLabel: z.string(),
      reliefAmount: z.number(),
      remainingCommitment: z.number(),
      predictedBalance: z.number(),
      isFullyResolved: z.boolean(),
    });
     */
  return {};
}

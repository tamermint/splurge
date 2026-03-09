import { ValidationError } from "@/lib/errors";
import { TimelineEvent } from "../types/forecast";
import { SavingsRelief, ReliefAction } from "../types/forecast";

export function calculateSavingsRelief(
  timelineEvents: TimelineEvent[],
  buffer: number,
): SavingsRelief | null {
  if (!timelineEvents || timelineEvents.length == 0) {
    throw new ValidationError("There must be atleast one timeline event");
  }

  //first, we find the event with the lowest running balance in the entire timeline
  const minEvent: TimelineEvent = timelineEvents.reduce((min, e) =>
    e.runningBalance < min.runningBalance ? e : min,
  );
  //if the lowest running balance is equal to or greater than buffer, return an empty object
  if (minEvent.runningBalance >= buffer) return null;

  //this is how much is needed to recover from the min event
  //so, if running balance in minEvent is -500, we need 550 to recover
  const reliefGap: number = Math.abs(minEvent.runningBalance) + buffer;

  //get all commitments till the global min event
  const allSoftCommitmentEventsTillMinEvent: TimelineEvent[] =
    timelineEvents.filter(
      (i) =>
        i.type === "commitment" &&
        i.paymentConstraints === "soft" &&
        i.timestamp <= minEvent.timestamp,
    );
  if (allSoftCommitmentEventsTillMinEvent.length == 0) return null;

  //sort all the soft commitments
  const sortedSoftCommitments: TimelineEvent[] =
    allSoftCommitmentEventsTillMinEvent.sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );

  const actions: ReliefAction[] = [];
  let remainingGap: number = reliefGap;

  for (const commitment of sortedSoftCommitments) {
    if (remainingGap <= 0) break;

    const available: number = Math.abs(commitment.amount);
    const take: number = Math.min(available, remainingGap);

    actions.push({
      targetEventId: commitment.id,
      label: commitment.label,
      amountUnlocked: take,
      remainingCommitment: available - take,
    });

    remainingGap -= take;
  }
  const totalReliefAmount: number = actions.reduce(
    (sum, action) => sum + action.amountUnlocked,
    0,
  );
  const predictedBalance: number =
    Math.round((minEvent.runningBalance + totalReliefAmount) * 100) / 100;

  const isFullyResolved: boolean = totalReliefAmount >= reliefGap;

  const savingsRelief: SavingsRelief = {
    actions: actions,
    totalReliefAmount: totalReliefAmount,
    predictedBalance: predictedBalance,
    isFullyResolved: isFullyResolved,
  };

  return savingsRelief;
}

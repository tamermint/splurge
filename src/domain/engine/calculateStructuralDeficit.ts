import {
  TimelineEvent,
  DeferralPlan,
  SavingsRelief,
  StructuralDeficit,
} from "../types/forecast";
import { ValidationError } from "@/lib/errors";

export function calculateStructuralDeficit(
  timeline: TimelineEvent[],
  relief: SavingsRelief | null,
  deferrals: DeferralPlan | null,
  buffer: number,
): StructuralDeficit | null {
  if (!timeline || timeline.length === 0) {
    throw new ValidationError("There must be atleast one timeline event");
  }

  //calculate the deepest ditch
  //first, we find the event with the lowest running balance in the entire timeline and check if the running balance is below buffer
  const minEvent: TimelineEvent = timeline.reduce((min, e) =>
    e.runningBalance < min.runningBalance ? e : min,
  );
  if (minEvent.runningBalance >= buffer) return null;

  //If eveything is resolved, there is no structural deficit
  const isResolved = relief?.isFullyResolved || deferrals?.isNowResolved;
  if (isResolved) return null;

  //calculate the remaining shortfall
  const baseShortfall: number = relief
    ? relief.predictedBalance
    : minEvent.runningBalance;
  let remainingShortfall: number = Math.max(0, buffer - baseShortfall);

  //the total amount managed to be deferred
  if (deferrals?.actions) {
    const totalDeferred: number = deferrals.actions.reduce(
      (sum, a) => sum + a.amount,
      0,
    );
    remainingShortfall -= totalDeferred;
  }

  //calculate the first time below buffer
  const onsetEvent: TimelineEvent | undefined = timeline.find(
    (e) => e.runningBalance < buffer,
  );
  const criticalDate: Date = onsetEvent
    ? onsetEvent.timestamp
    : minEvent.timestamp;

  const resolutionEvent: TimelineEvent | undefined = timeline.find(
    (e) => e.timestamp > minEvent.timestamp && e.runningBalance >= buffer,
  );

  const resolutionDate: Date | null = resolutionEvent
    ? resolutionEvent.timestamp
    : null;

  //terminal check, does it still stay negative
  const isTerminal: boolean = resolutionDate === null;

  //count the number of days under buffer
  const bufferInCents: number = Math.round(buffer * 100);
  const daysUnderBuffer: number = timeline.filter(
    (e) => Math.round(e.runningBalance * 100) < bufferInCents,
  ).length;

  const structuralDeficit: StructuralDeficit = {
    shortfall: Math.max(0, Math.round(remainingShortfall * 100) / 100),
    criticalDate: criticalDate,
    resolutionDate: resolutionDate,
    daysUnderBuffer: daysUnderBuffer,
    isTerminal: isTerminal,
  };

  return structuralDeficit;
}

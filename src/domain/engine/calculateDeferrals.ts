import {
  SuggestedDeferralAction,
  DeferralPlan,
  SavingsRelief,
  TimelineEvent,
} from "../types/forecast";
import { ValidationError } from "@/lib/errors";

export function calculateDeferrals(
  timelineEvents: TimelineEvent[],
  relief: SavingsRelief | null,
  buffer: number,
): DeferralPlan | null {
  if (!timelineEvents || timelineEvents.length == 0) {
    throw new ValidationError("There must be atleast one timeline event");
  }

  //check if there are no relief objects or if its fully resolved
  if (!relief || relief.isFullyResolved == true) return null;

  //remaining gap needs to be after the amount in relief
  let remainingGap: number = Math.abs(relief.predictedBalance) + buffer;

  //filter and sort the timeline based on manual bills
  const manualBills: TimelineEvent[] = timelineEvents
    .filter(
      (e) =>
        e.type === "bill" &&
        e.paymentConstraints === "soft" &&
        e.timestamp <= relief.minBalanceDate,
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const suggestedDeferrals: SuggestedDeferralAction[] = [];

  //create a map of headrooms
  const localHeadroomMap = new Map(
    timelineEvents.map((e) => [e.id, e.headroom]),
  );

  //for each bill, get the safe landing event and then ensure that the headroom is consumed
  for (const bill of manualBills) {
    if (remainingGap <= 0) break;

    const billAmount: number = Math.abs(bill.amount);

    const safeLandingEvent: TimelineEvent | undefined = timelineEvents.find(
      (e) => {
        const currentAvailable: number = localHeadroomMap.get(e.id) || 0;
        return e.timestamp > bill.timestamp && currentAvailable >= billAmount;
      },
    );

    if (safeLandingEvent) {
      suggestedDeferrals.push({
        id: bill.id,
        label: bill.label,
        amount: Math.abs(bill.amount),
        date: safeLandingEvent.timestamp,
      });

      //consume the headroom
      const landingIndex: number = timelineEvents.indexOf(safeLandingEvent);
      for (let i = landingIndex; i < timelineEvents.length; i++) {
        const id = timelineEvents[i].id;
        const current = localHeadroomMap.get(id) || 0;
        localHeadroomMap.set(id, Math.max(0, current - billAmount));
      }
      remainingGap -= Math.abs(bill.amount);
    }
  }

  const isNowResolved: boolean = remainingGap <= 0;

  const suggestedDeferralPlan: DeferralPlan = {
    actions: suggestedDeferrals,
    isNowResolved: isNowResolved,
  };

  return suggestedDeferralPlan;
}

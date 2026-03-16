import {
  SuggestedDeferralAction,
  DeferralPlan,
  SavingsRelief,
  TimelineEvent,
} from "../types/forecast";

export function calculateDeferrals(
  timelineEvents: TimelineEvent[],
  relief: SavingsRelief | null,
  buffer: number,
): DeferralPlan | null {
  //check if there are no relief objects or if its fully resolved
  if (!relief || relief.isFullyResolved == true) return null;

  //remaining gap needs to be after the amount in relief
  let remainingGap: number = Math.abs(relief.predictedBalance) + buffer;

  //filter and sort the timeline based on manual bills
  const manualBills: TimelineEvent[] = timelineEvents
    .filter((e) => e.type === "bill" && e.paymentConstraints === "soft")
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const suggestedDeferrals: SuggestedDeferralAction[] = [];

  for (const bill of manualBills) {
    if (remainingGap <= 0) break;

    suggestedDeferrals.push({
      id: bill.id,
      label: bill.label,
      amount: Math.abs(bill.amount),
      date: bill.timestamp,
    });

    remainingGap -= Math.abs(bill.amount);
  }

  const isNowResolved: boolean = remainingGap <= 0;

  const suggestedDeferralPlan: DeferralPlan = {
    actions: suggestedDeferrals,
    isNowResolved: isNowResolved,
  };

  return suggestedDeferralPlan;
}

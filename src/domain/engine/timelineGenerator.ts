import {
  Baseline,
  Bill,
  Commitment,
  FutureBill,
  Inflow,
  oneOffExpense,
  TimelineEvent,
} from "../types/forecast";
import { createHash } from "crypto";

export function timelineGenerator(
  windowInflows: Inflow[],
  windowBills: (Bill | FutureBill)[],
  commitments: Commitment[],
  baselines: Baseline[],
  expenses: oneOffExpense[],
  buffer: number,
  startingBalance: number,
): TimelineEvent[] {
  const timelineEvents: TimelineEvent[] = [];

  //First get the inflows and then immediately attach the baselines and commitment for the "Savings First" principle
  windowInflows.forEach((inflow) => {
    timelineEvents.push({
      id: createHash("sha256")
        .update(
          `${inflow.date}-${inflow.amount}-${inflow.label.toLowerCase().replace(/\s+/g, "")}`,
        )
        .digest("hex"),
      timestamp: inflow.date,
      type: "inflow",
      label: inflow.label,
      amount: inflow.amount,
      paymentConstraints: "hard",
      runningBalance: 0,
      liquidityStatus: "stable",
    });

    commitments.forEach((commitment) => {
      timelineEvents.push({
        id: createHash("sha256")
          .update(
            `${commitment.commitmentType.toLowerCase().replace(/\s+/g, "")}-${inflow.date}-${inflow.amount}`,
          )
          .digest("hex"),
        timestamp: inflow.date,
        type: "commitment",
        label: commitment.commitmentType,
        amount: -commitment.commitmentAmount,
        paymentConstraints: "soft",
        runningBalance: 0,
        liquidityStatus: "stable",
      });
    });

    baselines.forEach((baseline) => {
      timelineEvents.push({
        id: createHash("sha256")
          .update(
            `${baseline.name.toLowerCase().replace(/\s+/g, "")}-${inflow.date}-${inflow.amount}`,
          )
          .digest("hex"),
        timestamp: inflow.date,
        type: "baseline",
        label: baseline.name,
        amount: -baseline.amount,
        paymentConstraints: "soft",
        runningBalance: 0,
        liquidityStatus: "stable",
      });
    });
  });

  //Map the one off expenses
  expenses.forEach((expense) => {
    timelineEvents.push({
      id: createHash("sha256")
        .update(
          `${expense.date}-${expense.amount}-${expense.name.toLowerCase().replace(/\s+/g, "")}`,
        )
        .digest("hex"),
      timestamp: expense.date,
      type: "expense",
      label: expense.name,
      amount: -expense.amount,
      paymentConstraints: "soft",
      runningBalance: 0,
      liquidityStatus: "stable",
    });
  });

  //Map the bills
  windowBills.forEach((bill) => {
    timelineEvents.push({
      id: createHash("sha256")
        .update(
          `${bill.dueDate}-${bill.amount}-${bill.name.toLowerCase().replace(/\s+/g, "")}`,
        )
        .digest("hex"),
      timestamp: bill.dueDate,
      type: "bill",
      label: bill.name,
      amount: -bill.amount,
      paymentConstraints: bill.payType == "auto-debit" ? "hard" : "soft",
      runningBalance: 0,
      liquidityStatus: "stable",
    });
  });

  //Chronologically sort the timeline events
  timelineEvents.sort((a, b) => {
    const timeDiff = a.timestamp.getTime() - b.timestamp.getTime();
    //Inflow --> Commitment --> Baseline --> Bill
    if (timeDiff !== 0) return timeDiff;
    //else
    return b.amount - a.amount;
  });

  //Calulate running balance and liquidity
  let currentBalance: number = startingBalance;
  timelineEvents.forEach((timelineEvent) => {
    currentBalance += timelineEvent.amount;
    timelineEvent.runningBalance = Math.round(currentBalance * 100) / 100;

    if (timelineEvent.runningBalance <= 0) {
      timelineEvent.liquidityStatus = "critical";
    } else if (timelineEvent.runningBalance < buffer) {
      timelineEvent.liquidityStatus = "warning";
    } else {
      timelineEvent.liquidityStatus = "stable";
    }
  });

  return timelineEvents;
}

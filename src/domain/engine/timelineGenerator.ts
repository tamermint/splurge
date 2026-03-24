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

/**
 * @module domain/engine/timelineGenerator
 * @description
 * The Timeline Generator is the heartbeat of the Splurge Engine. It transforms discrete financial
 * entities (Inflows, Bills, Commitments) into a high-fidelity, chronologically-ordered stream
 * of stateful events.
 * * ### Architectural Principles:
 * 1. **Savings First (Pay Yourself First):** Commitments and Baselines are programmatically anchored
 * to Inflow timestamps to ensure liquidity is reserved before any discretionary spending or bills.
 * 2. **Deterministic Hashing:** Every event ID is generated via SHA-256 using its content properties.
 * This ensures that identical simulation runs yield identical IDs, enabling stable UI keys and
 * idempotent state updates.
 * 3. **Intra-Day Liquidity Sequencing:** Implements a strict sorting hierarchy (Inflow > Commitment > Baseline > Bill)
 * to prevent "False Dips" where a bill appears to bounce because it was processed before the
 * day's paycheck.
 * * @param {Inflow[]} windowInflows - Validated array of income events within the forecast window.
 * @param {(Bill | FutureBill)[]} windowBills - Known and projected liabilities.
 * @param {Commitment[]} commitments - Savings goals and recurring financial obligations.
 * @param {Baseline[]} baselines - Daily/Weekly living expense anchors (e.g., groceries).
 * @param {oneOffExpense[]} expenses - Ad-hoc, non-recurring outflows.
 * @param {number} buffer - The user-defined safety margin; the threshold between 'Stable' and 'Warning' status.
 * @param {number} startingBalance - The literal cash-on-hand at T=0.
 * * @returns {TimelineEvent[]} A fully computed array of events including running balances, liquidity statuses, and headroom.
 */

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
      headroom: 0,
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
        paymentConstraints: commitment.constraint,
        priority: commitment.priority,
        runningBalance: 0,
        liquidityStatus: "stable",
        headroom: 0,
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
        headroom: 0,
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
      headroom: 0,
    });
  });

  //Map the bills
  windowBills.forEach((bill) => {
    const effectiveDate: Date = bill.deferredUntil || bill.dueDate;
    timelineEvents.push({
      id: createHash("sha256")
        .update(
          `${bill.dueDate}-${bill.amount}-${bill.name.toLowerCase().replace(/\s+/g, "")}`,
        )
        .digest("hex"),
      timestamp: effectiveDate,
      type: "bill",
      label: bill.name,
      amount: -bill.amount,
      paymentConstraints: bill.payType == "auto-debit" ? "hard" : "soft",
      runningBalance: 0,
      liquidityStatus: "stable",
      headroom: 0,
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

    timelineEvent.headroom = Math.max(
      0,
      Math.round((timelineEvent.runningBalance - buffer) * 100) / 100,
    );

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

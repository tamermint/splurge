import { timelineGenerator } from "@/domain/engine/timelineGenerator";
import {
  Baseline,
  Bill,
  Commitment,
  Inflow,
  oneOffExpense,
  TimelineEvent,
} from "@/domain/types/forecast";
import { createHash } from "crypto";

describe("Test timeline generator", () => {
  it("should accurately generate the timeline of events", () => {
    const inflows: Inflow[] = [
      {
        amount: 3000.54,
        date: new Date("2026-02-18"),
        label: "Salary",
      },
      {
        amount: 690.45,
        date: new Date("2026-02-19"),
        label: "Packaged Salary",
      },
    ];
    const bills: Bill[] = [
      {
        id: 256,
        name: "Health Insurance",
        amount: 162.76,
        dueDate: new Date("2026-02-28"),
        scheduleType: "monthly",
        payRail: "AMEX",
        payType: "auto-debit",
      },
      {
        id: 854,
        name: "My Fitness Passport",
        amount: 34.78,
        dueDate: new Date("2026-02-27"),
        scheduleType: "fortnightly",
        payRail: "Bank",
        payType: "auto-debit",
      },
    ];
    const commitments: Commitment[] = [
      {
        commitmentType: "loan",
        commitmentAmount: 600,
        constraint: "hard",
        priority: 1,
      },
      {
        commitmentType: "house support",
        commitmentAmount: 300,
        constraint: "soft",
        priority: 1,
      },
    ];
    const baselines: Baseline[] = [
      {
        name: "Savings",
        amount: 500,
      },
      {
        name: "Health",
        amount: 300,
      },
    ];
    const expenses: oneOffExpense[] = [
      {
        name: "Car repair",
        amount: 1500,
        date: new Date("2026-02-25"),
      },
    ];
    const buffer: number = 55;
    const startingBalance: number = 0;
    const actualResult: TimelineEvent[] = timelineGenerator(
      inflows,
      bills,
      commitments,
      baselines,
      expenses,
      buffer,
      startingBalance,
    );
    const expectedResult: TimelineEvent[] = [
      {
        id: createHash("sha256")
          .update(`${new Date("2026-02-18")}-${3000.54}-${"salary"}`)
          .digest("hex"),
        timestamp: new Date("2026-02-18"),
        type: "inflow",
        label: "Salary",
        amount: 3000.54,
        paymentConstraints: "hard",
        runningBalance: 3000.54,
        liquidityStatus: "stable",
        headroom: 2945.54,
      },
      {
        id: createHash("sha256")
          .update(`${"housesupport"}-${new Date("2026-02-18")}-${3000.54}`)
          .digest("hex"),
        timestamp: new Date("2026-02-18"),
        type: "commitment",
        label: "house support",
        amount: -300,
        paymentConstraints: "soft",
        priority: 1,
        runningBalance: 2700.54,
        liquidityStatus: "stable",
        headroom: 2645.54,
      },
      {
        id: createHash("sha256")
          .update(`${"health"}-${new Date("2026-02-18")}-${3000.54}`)
          .digest("hex"),
        timestamp: new Date("2026-02-18"),
        type: "baseline",
        label: "Health",
        amount: -300,
        paymentConstraints: "soft",
        runningBalance: 2400.54,
        liquidityStatus: "stable",
        headroom: 2345.54,
      },
      {
        id: createHash("sha256")
          .update(`${"savings"}-${new Date("2026-02-18")}-${3000.54}`)
          .digest("hex"),
        timestamp: new Date("2026-02-18"),
        type: "baseline",
        label: "Savings",
        amount: -500,
        paymentConstraints: "soft",
        runningBalance: 1900.54,
        liquidityStatus: "stable",
        headroom: 1845.54,
      },
      {
        id: createHash("sha256")
          .update(`${"loan"}-${new Date("2026-02-18")}-${3000.54}`)
          .digest("hex"),
        timestamp: new Date("2026-02-18"),
        type: "commitment",
        label: "loan",
        amount: -600,
        paymentConstraints: "hard",
        priority: 1,
        runningBalance: 1300.54,
        liquidityStatus: "stable",
        headroom: 1245.54,
      },
      {
        id: createHash("sha256")
          .update(`${new Date("2026-02-19")}-${690.45}-${"packagedsalary"}`)
          .digest("hex"),
        timestamp: new Date("2026-02-19"),
        type: "inflow",
        label: "Packaged Salary",
        amount: 690.45,
        paymentConstraints: "hard",
        runningBalance: 1990.99,
        liquidityStatus: "stable",
        headroom: 1935.99,
      },
      {
        id: createHash("sha256")
          .update(`${"housesupport"}-${new Date("2026-02-19")}-${690.45}`)
          .digest("hex"),
        timestamp: new Date("2026-02-19"),
        type: "commitment",
        label: "house support",
        amount: -300,
        paymentConstraints: "soft",
        priority: 1,
        runningBalance: 1690.99,
        liquidityStatus: "stable",
        headroom: 1635.99,
      },
      {
        id: createHash("sha256")
          .update(`${"health"}-${new Date("2026-02-19")}-${690.45}`)
          .digest("hex"),
        timestamp: new Date("2026-02-19"),
        type: "baseline",
        label: "Health",
        amount: -300,
        paymentConstraints: "soft",
        runningBalance: 1390.99,
        liquidityStatus: "stable",
        headroom: 1335.99,
      },
      {
        id: createHash("sha256")
          .update(`${"savings"}-${new Date("2026-02-19")}-${690.45}`)
          .digest("hex"),
        timestamp: new Date("2026-02-19"),
        type: "baseline",
        label: "Savings",
        amount: -500,
        paymentConstraints: "soft",
        runningBalance: 890.99,
        liquidityStatus: "stable",
        headroom: 835.99,
      },
      {
        id: createHash("sha256")
          .update(`${"loan"}-${new Date("2026-02-19")}-${690.45}`)
          .digest("hex"),
        timestamp: new Date("2026-02-19"),
        type: "commitment",
        label: "loan",
        amount: -600,
        paymentConstraints: "hard",
        priority: 1,
        runningBalance: 290.99,
        liquidityStatus: "stable",
        headroom: 235.99,
      },
      {
        id: createHash("sha256")
          .update(`${new Date("2026-02-25")}-${1500}-${"carrepair"}`)
          .digest("hex"),
        timestamp: new Date("2026-02-25"),
        type: "expense",
        label: "Car repair",
        amount: -1500,
        paymentConstraints: "soft",
        runningBalance: -1209.01,
        liquidityStatus: "critical",
        headroom: 0,
      },
      {
        id: createHash("sha256")
          .update(`${new Date("2026-02-27")}-${34.78}-${"myfitnesspassport"}`)
          .digest("hex"),
        timestamp: new Date("2026-02-27"),
        type: "bill",
        label: "My Fitness Passport",
        amount: -34.78,
        paymentConstraints: "hard",
        runningBalance: -1243.79,
        liquidityStatus: "critical",
        headroom: 0,
      },
      {
        id: createHash("sha256")
          .update(`${new Date("2026-02-28")}-${162.76}-${"healthinsurance"}`)
          .digest("hex"),
        timestamp: new Date("2026-02-28"),
        type: "bill",
        label: "Health Insurance",
        amount: -162.76,
        paymentConstraints: "hard",
        runningBalance: -1406.55,
        liquidityStatus: "critical",
        headroom: 0,
      },
    ];
    expect(actualResult).toEqual(expectedResult);
  });
});

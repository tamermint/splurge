import { Baseline, Commitment } from "@/domain/types/forecast";
import { transformIntoDTO } from "@/app/api/forecast/datemapper";
import "next/jest.js";

describe("testDateMapper", () => {
  it("should correctly transform the dates in the input", () => {
    const forecastInput = {
      paySchedule: {
        payDate: "04-Feb-2026",
        frequency: "fortnightly",
        totalAmount: 3704.32,
        optionalSplit: false,
      },
      bills: [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: "02-Feb-2026",
          scheduleType: "monthly",
          payRail: "AMEX",
        },
        {
          id: 2,
          name: "Electricity",
          amount: 120,
          dueDate: "10-Feb-2026",
          scheduleType: "monthly",
          payRail: "BANK",
        },
        {
          id: 3,
          name: "Phone",
          amount: 40,
          dueDate: "16-Feb-2026",
          scheduleType: "monthly",
          payRail: "BANK",
        },
      ],
      commitments: [{ savingsAmount: 1100 }],
      baselines: [
        { name: "groceries", amount: 300 },
        { name: "transport", amount: 70 },
      ],
      buffer: 50,
    };
    const transformedInput = transformIntoDTO(forecastInput);
    const payScheduleV2 = {
      payDate: new Date("04-Feb-2026"),
      frequency: "fortnightly",
      totalAmount: 3704.32,
      optionalSplit: false,
    };
    const billsV2 = [
      {
        id: 1,
        name: "Internet",
        amount: 55,
        dueDate: new Date("02-Feb-2026"),
        scheduleType: "monthly",
        payRail: "AMEX",
      },
      {
        id: 2,
        name: "Electricity",
        amount: 120,
        dueDate: new Date("10-Feb-2026"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
      {
        id: 3,
        name: "Phone",
        amount: 40,
        dueDate: new Date("16-Feb-2026"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
    ];
    const commitmentsV2: Commitment[] = [{ savingsAmount: 1100 }];
    const baselinesV2: Baseline[] = [
      { name: "groceries", amount: 300 },
      { name: "transport", amount: 70 },
    ];
    const bufferV2: number = 50;
    const expectedTransformedInput = {
      paySchedule: payScheduleV2,
      bills: billsV2,
      commitments: commitmentsV2,
      baselines: baselinesV2,
      buffer: bufferV2,
    };
    expect(typeof forecastInput.paySchedule.payDate).toBe("string");
    expect(transformedInput).toEqual(expectedTransformedInput);
  });
});

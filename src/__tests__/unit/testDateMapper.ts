import { Baseline, Commitment } from "@/domain/types/forecast";
import { transformIntoDTO } from "@/app/api/forecast/datemapper";

describe("testDateMapper", () => {
  it("should correctly transform the dates in the input", () => {
    const forecastInput = {
      paySchedule: {
        payDate: "2026-02-04",
        frequency: "fortnightly",
        totalAmount: 3704.32,
        optionalSplit: false,
      },
      bills: [
        {
          id: 1,
          name: "Internet",
          amount: 55,
          dueDate: "2026-02-02",
          scheduleType: "monthly",
          payRail: "AMEX",
        },
        {
          id: 2,
          name: "Electricity",
          amount: 120,
          dueDate: "2026-02-10",
          scheduleType: "monthly",
          payRail: "BANK",
        },
        {
          id: 3,
          name: "Phone",
          amount: 40,
          dueDate: "2026-02-16",
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
    const transformedInput = transformIntoDTO(forecastInput as unknown);
    const payScheduleV2 = {
      payDate: new Date("2026-02-04"),
      frequency: "fortnightly",
      totalAmount: 3704.32,
      optionalSplit: false,
    };
    const billsV2 = [
      {
        id: 1,
        name: "Internet",
        amount: 55,
        dueDate: new Date("2026-02-02"),
        scheduleType: "monthly",
        payRail: "AMEX",
      },
      {
        id: 2,
        name: "Electricity",
        amount: 120,
        dueDate: new Date("2026-02-10"),
        scheduleType: "monthly",
        payRail: "BANK",
      },
      {
        id: 3,
        name: "Phone",
        amount: 40,
        dueDate: new Date("2026-02-16"),
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
    expect(transformedInput.paySchedule.payDate).toBeInstanceOf(Date);
    expect(transformedInput.paySchedule.payDate.toISOString()).toContain(
      "2026-02-04",
    );
    expect(transformedInput.bills[0].dueDate).toBeInstanceOf(Date);
    expect(transformedInput).toEqual(expectedTransformedInput);
  });
});

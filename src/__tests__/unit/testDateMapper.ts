import { Baseline, Commitment } from "@/domain/types/forecast";
import { transformIntoDTO } from "@/app/api/forecast/DTOMapper";

describe("testDateMapper", () => {
  it("should correctly transform the dates in the input", () => {
    const forecastInput = {
      paySchedule: {
        id: "1",
        frequency: "fortnightly",
        inflows: [
          {
            id: "1",
            amount: 3704.32,
            date: "2026-02-04",
            label: "Salary",
          },
        ],
      },
      bills: [
        {
          id: "1",
          name: "Internet",
          amount: 55,
          dueDate: "2026-02-02",
          scheduleType: "monthly",
          payRail: "AMEX",
          payType: "auto-debit",
        },
        {
          id: "2",
          name: "Electricity",
          amount: 120,
          dueDate: "2026-02-10",
          scheduleType: "monthly",
          payRail: "BANK",
          payType: "auto-debit",
        },
        {
          id: "3",
          name: "Phone",
          amount: 40,
          dueDate: "2026-02-16",
          scheduleType: "monthly",
          payRail: "BANK",
          payType: "auto-debit",
        },
      ],
      commitments: [
        {
          id: "1",
          commitmentType: "savings",
          commitmentAmount: 1100,
          constraint: "soft",
          priority: 1,
        },
      ],
      baselines: [
        { id: "1", name: "groceries", amount: 300 },
        { id: "2", name: "transport", amount: 70 },
      ],
      buffer: 50,
    };
    const transformedInput = transformIntoDTO(forecastInput as unknown);
    const payScheduleV2 = {
      id: "1",
      frequency: "fortnightly",
      inflows: [
        {
          id: "1",
          amount: 3704.32,
          date: new Date("2026-02-04"),
          label: "Salary",
        },
      ],
    };
    const billsV2 = [
      {
        id: "1",
        name: "Internet",
        amount: 55,
        dueDate: new Date("2026-02-02"),
        scheduleType: "monthly",
        payRail: "AMEX",
        payType: "auto-debit",
      },
      {
        id: "2",
        name: "Electricity",
        amount: 120,
        dueDate: new Date("2026-02-10"),
        scheduleType: "monthly",
        payRail: "BANK",
        payType: "auto-debit",
      },
      {
        id: "3",
        name: "Phone",
        amount: 40,
        dueDate: new Date("2026-02-16"),
        scheduleType: "monthly",
        payRail: "BANK",
        payType: "auto-debit",
      },
    ];
    const commitmentsV2: Commitment[] = [
      {
        id: "1",
        commitmentType: "savings",
        commitmentAmount: 1100,
        constraint: "soft",
        priority: 1,
      },
    ];
    const baselinesV2: Baseline[] = [
      { id: "1", name: "groceries", amount: 300 },
      { id: "2", name: "transport", amount: 70 },
    ];
    const bufferV2: number = 50;
    const expectedTransformedInput = {
      paySchedule: payScheduleV2,
      bills: billsV2,
      commitments: commitmentsV2,
      baselines: baselinesV2,
      buffer: bufferV2,
      startingBalance: 0,
    };
    expect(transformedInput).toEqual(expectedTransformedInput);
    expect(transformedInput.paySchedule.inflows).toBeDefined();
    expect(transformedInput.paySchedule.inflows[0].date).toBeInstanceOf(Date);
    expect(
      transformedInput.paySchedule.inflows[0].date.toISOString(),
    ).toContain("2026-02-04");
    expect(transformedInput.bills[0].dueDate).toBeInstanceOf(Date);
  });
});

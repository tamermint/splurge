import {
  getSplurgeAmount,
  getSplurgeStatus,
} from "@/domain/engine/calculateSplurge";
import "next/jest.js";

describe("splurgeCalculation", () => {
  it("should correctly calculate splurge amount", () => {
    const payAmount: number = 3052.74;
    const totalWindowAmount: number = 2154.75;
    const expectedOutput: number =
      Math.round((payAmount - totalWindowAmount) * 100) / 100;
    const actualOutput = getSplurgeAmount(payAmount, totalWindowAmount);
    expect(expectedOutput).toBe(actualOutput);
  });
  it("should handle negative splurge amount", () => {
    const payAmount: number = 3052.74;
    const totalWindowAmount: number = 4000.45;
    const expectedOutput: number =
      Math.round((payAmount - totalWindowAmount) * 100) / 100;
    const actualOutput = getSplurgeAmount(payAmount, totalWindowAmount);
    expect(expectedOutput).toBe(actualOutput);
  });
  it("should handle negative three places decimal", () => {
    const payAmount: number = 3052.746;
    const totalWindowAmount: number = 4000.455;
    const expectedOutput: number =
      Math.round((payAmount - totalWindowAmount) * 100) / 100;
    const actualOutput = getSplurgeAmount(payAmount, totalWindowAmount);
    expect(expectedOutput).toBe(actualOutput);
  });
  it("should correctly return the splurge status as insolvent", () => {
    const payAmount: number = 3052.746;
    const totalWindowAmount: number = 4000.455;
    const splurgeAmount: number = getSplurgeAmount(
      payAmount,
      totalWindowAmount,
    );
    const actualSplurgeStatus: string = getSplurgeStatus(splurgeAmount);
    const expectedSplurgeStatus: string = "insolvent";
    expect(actualSplurgeStatus).toBe(expectedSplurgeStatus);
  });
  it("should correctly return the splurge status as green", () => {
    const payAmount: number = 4000.455;
    const totalWindowAmount: number = 3092.79;
    const splurgeAmount: number = getSplurgeAmount(
      payAmount,
      totalWindowAmount,
    );
    const actualSplurgeStatus: string = getSplurgeStatus(splurgeAmount);
    const expectedSplurgeStatus: string = "green";
    expect(actualSplurgeStatus).toBe(expectedSplurgeStatus);
  });
  it("should correctly return the splurge status as amber", () => {
    const payAmount: number = 4000.455;
    const totalWindowAmount: number = 3942.746;
    const splurgeAmount: number = getSplurgeAmount(
      payAmount,
      totalWindowAmount,
    );
    const actualSplurgeStatus: string = getSplurgeStatus(splurgeAmount);
    const expectedSplurgeStatus: string = "amber";
    expect(actualSplurgeStatus).toBe(expectedSplurgeStatus);
  });
});

import { ValidationError } from "@/lib/errors";

/**
 * Splurge Calculation Engine
 *
 * This module provides pure, deterministic functions for calculating safe-to-splurge
 * amounts and determining financial health status based on discretionary income.
 *
 * Core Concepts:
 * - **Splurge Amount**: Discretionary income remaining after all obligations
 * - **Financial Status**: Color-coded health indicator based on splurge thresholds
 *
 * The calculations use fixed-point arithmetic (cents) internally to avoid
 * floating-point precision errors common in financial calculations.
 *
 * @module domain/engine/calculateSplurge
 */

/**
 * Calculates the safe-to-splurge amount: discretionary income available after obligations.
 *
 * Formula:
 * ```
 * Splurge Amount = Pay Amount - Total Window Amount
 * ```
 *
 * Where:
 * - **Pay Amount**: Gross income for the pay cycle
 * - **Total Window Amount**: Sum of all obligations (bills, commitments, baselines, buffer)
 *
 * Implementation Details:
 * - Converts to cents (multiply by 100) before arithmetic to avoid floating-point errors
 * - Uses `Math.round()` to handle precision
 * - Can return negative values (indicates insolvency)
 *
 * @param payAmount - Gross income for the pay cycle (USD, can include decimals)
 * @param totalWindowAmount - Sum of all financial obligations in the window (USD)
 *
 * @returns Splurge amount in USD as decimal (can be negative if insolvent)
 *
 * @throws ValidationError if either parameter is NaN or not a valid number
 *
 * @example
 * // Positive splurge (healthy)
 * getSplurgeAmount(3000, 2500) // Returns 500
 *
 * @example
 * // Negative splurge (insolvent)
 * getSplurgeAmount(3000, 3500) // Returns -500
 *
 * @example
 * // Handles precision correctly
 * getSplurgeAmount(3052.74, 2154.75) // Returns 897.99 (not 897.9900000001)
 */
export function getSplurgeAmount(
  payAmount: number,
  totalWindowAmount: number,
): number {
  // Validate inputs before processing
  if (isNaN(payAmount) || isNaN(totalWindowAmount)) {
    throw new ValidationError("Invalid pay amount or total bill amount");
  }

  // Convert to cents to avoid floating-point precision errors
  // Example: $3052.74 becomes 305274 cents
  const cleanPayAmount: number = Math.round(payAmount * 100);
  const cleanWindowAmount: number = Math.round(totalWindowAmount * 100);

  // Calculate splurge in cents, then convert back to dollars
  const splurgeAmountCents: number = (cleanPayAmount - cleanWindowAmount) / 100;
  return splurgeAmountCents;
}

/**
 * Determines financial health status based on splurge amount.
 *
 * Status mapping reflects the user's ability to make discretionary spending decisions:
 *
 * | Status | Range | Meaning |
 * |--------|-------|---------|
 * | **green** | ≥ $100 | Healthy discretionary budget; user can comfortably splurge |
 * | **amber** | $50–$99 | Limited discretionary budget; suggest cautious spending |
 * | **frugal** | $0–$49 | Minimal discretionary budget; encourage deferring spending |
 * | **insolvent** | < $0 | Insufficient income; obligations exceed pay amount |
 *
 * Status Thresholds:
 * - Green threshold: $100 (minimum comfortable splurge)
 * - Amber threshold: $50 (warning zone)
 * - Frugal threshold: $0 (break-even)
 * - Insolvent: Any negative amount
 *
 * @param splurgeAmount - Calculated safe-to-splurge amount in USD (can be negative)
 *
 * @returns One of: "green" | "amber" | "frugal" | "insolvent"
 *
 * @throws ValidationError if splurgeAmount is not a valid number or is NaN
 *
 * @example
 * getSplurgeStatus(500)   // Returns "green"   (plenty to spend)
 * getSplurgeStatus(75)    // Returns "amber"   (some to spend, be careful)
 * getSplurgeStatus(25)    // Returns "frugal"  (not much to spend)
 * getSplurgeStatus(-100)  // Returns "insolvent" (spending power exceeded)
 */
export function getSplurgeStatus(splurgeAmount: number): string {
  // Validate input before processing
  if (typeof splurgeAmount !== "number" || isNaN(splurgeAmount)) {
    throw new ValidationError("Invalid splurge amount");
  }

  // Define thresholds for financial health status
  // These represent boundaries between spending confidence levels
  const SPLRUGE_THRESHOLD_GREEN: number = 100;
  const SPLRUGE_THRESHOLD_AMBER: number = 50;

  // Determine status based on splurge amount range
  let splurgeStatus: string;

  if (splurgeAmount >= SPLRUGE_THRESHOLD_GREEN) {
    // ✅ GREEN: Healthy discretionary budget
    // User has sufficient padding for safe spending
    splurgeStatus = "green";
  } else if (splurgeAmount >= SPLRUGE_THRESHOLD_AMBER) {
    // ⚠️ AMBER: Limited discretionary budget
    // User should be cautious but can still spend some
    splurgeStatus = "amber";
  } else if (splurgeAmount >= 0) {
    // 📊 FRUGAL: Minimal discretionary budget
    // User has very limited spending room
    splurgeStatus = "frugal";
  } else {
    // ❌ INSOLVENT: Obligations exceed income
    // User cannot afford current commitments
    splurgeStatus = "insolvent";
  }

  return splurgeStatus;
}

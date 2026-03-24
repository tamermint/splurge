#!/bin/bash
# Updated: March 24, 2026
# Scenario: Split-Pay Temporal Insolvency (The "Gap Day" Crash)
# Logic: Outflows on Wed/Fri exceed the staggered inflows, requiring Tier 1 relief.

echo "=== SPLURGE ENGINE: SPLIT-PAY TEMPORAL INSOLVENCY TEST (APRIL 2026) ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        { "amount": 2500, "date": "2026-04-08", "label": "Primary Salary (Wed)" },
        { "amount": 600, "date": "2026-04-09", "label": "Packaged Pay (Thu)" }
      ]
    },
    "bills": [
      { "id": 1, "name": "Rent", "amount": 1500, "dueDate": "2026-04-10", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit" }
    ],
    "expenses": [
      { "name": "Surprise Car Repair", "amount": 1200, "date": "2026-04-08" }
    ],
    "commitments": [
      { "commitmentType": "House Deposit", "commitmentAmount": 800, "constraint": "soft", "priority": 1 },
      { "commitmentType": "Travel Fund", "commitmentAmount": 500, "constraint": "soft", "priority": 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' | jq '.data | {
    status_A: .now.status,
    splurge_A: .now.safeToSplurge,
    status_B: .ifWait.status,
    patiencePayoff: .patiencePayoff,
    relief: .suggestedRelief,
    deferrals: .deferralPlan,
    deficit: .structuralDeficit
  }'
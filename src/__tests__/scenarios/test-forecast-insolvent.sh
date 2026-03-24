#!/bin/bash
# Updated: March 24, 2026 for Recovery Waterfall Validation
# Scenario: The "Savings Paradox" — Hard-locked savings vs. basic survival.

echo "=== SPLURGE ENGINE: INSOLVENT (SAVINGS PARADOX) TEST ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        {
          "amount": 3500.00,
          "date": "2026-04-01",
          "label": "Primary Salary"
        }
      ]
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 60, "dueDate": "2026-04-02", "scheduleType": "monthly", "payRail": "AMEX", "payType": "manual"},
      {"id": 2, "name": "Phone", "amount": 40, "dueDate": "2026-04-05", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"},
      {"id": 3, "name": "Gym", "amount": 50, "dueDate": "2026-04-10", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"}
    ],
    "expenses": [],
    "commitments": [
      {
        "commitmentType": "Aggressive Savings Lock",
        "commitmentAmount": 3450,
        "constraint": "hard",
        "priority": 1
      }
    ],
    "baselines": [
      {"name": "groceries", "amount": 300},
      {"name": "transport", "amount": 70}
    ],
    "buffer": 100
  }' | jq '.data | {
    status_A: .now.status,
    splurge_A: .now.safeToSplurge,
    status_B: .ifWait.status,
    patiencePayoff: .patiencePayoff,
    relief: .suggestedRelief,
    deferrals: .deferralPlan,
    deficit: .structuralDeficit
  }'
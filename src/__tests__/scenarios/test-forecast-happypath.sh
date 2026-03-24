#!/bin/bash
# Updated: March 24, 2026 for Triple-Tier Recovery Architecture
# Scenario: Healthy user, discretionary surplus, no maneuvers required.

echo "=== SPLURGE ENGINE: HAPPY PATH INTEGRATION TEST (APRIL 2026) ==="

# We set a future payday of April 1st to anchor the forecast window
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        {
          "amount": 4200.00,
          "date": "2026-04-01",
          "label": "April Salary Anchor"
        }
      ]
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 80, "dueDate": "2026-04-02", "scheduleType": "monthly", "payRail": "AMEX", "payType": "manual"},
      {"id": 2, "name": "Electricity", "amount": 150, "dueDate": "2026-04-10", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"},
      {"id": 3, "name": "Rent", "amount": 1800, "dueDate": "2026-04-01", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"}
    ],
    "expenses": [],
    "commitments": [
      {
        "commitmentType": "House Deposit",
        "commitmentAmount": 500,
        "constraint": "soft",
        "priority": 1
      }
    ],
    "baselines": [
      {"name": "groceries", "amount": 400},
      {"name": "transport", "amount": 100}
    ],
    "buffer": 500
  }' | jq '.data | {
    status_A: .now.status,
    splurge_A: .now.safeToSplurge,
    status_B: .ifWait.status,
    patiencePayoff: .patiencePayoff,
    relief: .suggestedRelief,
    deferrals: .deferralPlan,
    deficit: .structuralDeficit
  }'
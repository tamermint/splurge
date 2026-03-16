#!/bin/bash
# Scenario: Structural Deficit with Multiple Tiers of Recovery
# 1. Salary on the 20th.
# 2. Huge "Manual" Repair on the 21st (Exceeds Salary + Savings).
# 3. Smaller "Auto-Debit" on the 22nd (Cannot be deferred).
# 4. Two Savings Locks (Soft).

echo "=== FINAL BOSS: TRIPLE-TIER RECOVERY TEST ==="

curl -s -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        { "amount": 2500, "date": "2026-03-20", "label": "Primary Salary" }
      ]
    },
    "bills": [
      { "id": 1, "name": "Surprise Repair", "amount": 3000, "dueDate": "2026-03-21", "scheduleType": "monthly", "payRail": "BANK", "payType": "manual" },
      { "id": 2, "name": "Internet Bill", "amount": 100, "dueDate": "2026-03-22", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit" }
    ],
    "commitments": [
      { "commitmentType": "Holiday Fund", "commitmentAmount": 400, "constraint": "soft", "priority": 10 },
      { "commitmentType": "House Deposit", "commitmentAmount": 200, "constraint": "soft", "priority": 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' | jq '.data' > temp_forecast.json

echo "=== REQUESTING STRATEGIC BRIEFING ==="

curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d @temp_forecast.json | jq '.'

rm temp_forecast.json
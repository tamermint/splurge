#!/bin/bash
# Scenario: The "Gap Day" Failure
# Total income covers bills, but timing of the first pay is insufficient for the first bill.

echo "=== SPLURGE ENGINE: SPLIT-PAY TEMPORAL INSOLVENCY ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        { "amount": 2500, "date": "2026-02-11", "label": "Primary Salary" },
        { "amount": 600, "date": "2026-02-12", "label": "Packaged Pay" }
      ]
    },
    "bills": [
      { "id": 1, "name": "Surprise Repair", "amount": 1600, "dueDate": "2026-02-11", "scheduleType": "monthly", "payRail": "BANK", "payType": "manual" }
    ],
    "commitments": [
      { "commitmentType": "Savings Lock", "commitmentAmount": 800 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' | jq '.'
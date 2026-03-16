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
      { "id": 1, "name": "Rent", "amount": 1500, "dueDate": "2026-02-13", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit" }
    ],
    "expenses": [
      { "name": "Surprise Repair", "amount": 1200, "date": "2026-02-11" }
    ],
    "commitments": [
      { "commitmentType": "Savings Lock", "commitmentAmount": 800, "constraint": "soft", "priority": 1 },
      { "commitmentType": "Savings Lock", "commitmentAmount": 500, "constraint": "soft", "priority": 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' | jq '.'
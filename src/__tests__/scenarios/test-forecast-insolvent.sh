#!/bin/bash
# Updated: Feb 26, 2026 for Event-Driven State Machine
# Scenario: Aggressive savings causing temporal insolvency.

echo "=== SPLURGE ENGINE: INSOLVENT (SAVINGS PARADOX) TEST ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        {
          "amount": 3500.32,
          "date": "2026-02-04",
          "label": "Primary Salary"
        }
      ]
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 55, "dueDate": "2026-02-02", "scheduleType": "monthly", "payRail": "AMEX", "payType": "manual"},
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"},
      {"id": 4, "name": "Gym", "amount": 50, "dueDate": "2026-01-25", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"}
    ],
    "commitments": [
      {
        "commitmentType": "Aggressive Savings Lock",
        "commitmentAmount": 3500
      }
    ],
    "baselines": [
      {"name": "groceries", "amount": 300},
      {"name": "transport", "amount": 70}
    ],
    "buffer": 50
  }' | jq '.'
#!/bin/bash
# Updated: Feb 26, 2026 for Event-Driven State Machine
# Scenario: Standard user, healthy liquidity, all bills sequenced.

echo "=== SPLURGE ENGINE: HAPPY PATH INTEGRATION TEST ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        {
          "amount": 3704.32,
          "date": "2026-02-04",
          "label": "Primary Salary"
        }
      ]
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 55, "dueDate": "2026-02-02", "scheduleType": "monthly", "payRail": "AMEX", "payType": "manual"},
      {"id": 2, "name": "Electricity", "amount": 120, "dueDate": "2026-02-10", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"},
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"},
      {"id": 4, "name": "Rent", "amount": 1500, "dueDate": "2026-01-20", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit"}
    ],
    "commitments": [
      {
        "commitmentType": "Long-term Savings",
        "commitmentAmount": 1100
        "constraint": "soft"
        "priority": 1
      }
    ],
    "baselines": [
      {"name": "groceries", "amount": 300},
      {"name": "transport", "amount": 70}
    ],
    "buffer": 50
  }' | jq '.'
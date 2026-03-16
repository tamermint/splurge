#!/bin/bash
# Scenario: Salary Packaging Happy Path
# Primary pay arrives Wed, Packaged pay arrives Thu, Bill hits Fri.

echo "=== SPLURGE ENGINE: SPLIT-PAY HAPPY PATH ==="

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
    "expenses": [],
    "commitments": [
      { "commitmentType": "Savings Goal", "commitmentAmount": 800, "constraint": "soft", "priority": 1 },
      { "commitmentType": "Savings Goal", "commitmentAmount": 800, "constraint": "soft", "priority": 1 },
      { "commitmentType": "Loan", "commitmentAmount": 600, "constraint": "soft", "priority": 2 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' | jq '.'
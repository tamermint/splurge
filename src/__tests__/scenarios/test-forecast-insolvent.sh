#!/bin/bash
echo "=== DYNAMIC RECURRENCE INSOLVENT TEST ==="

curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "payDate": "2026-02-04",
      "frequency": "fortnightly",
      "totalAmount": 3500.32,
      "optionalSplit": false
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 55, "dueDate": "2026-02-02", "scheduleType": "monthly", "payRail": "AMEX"},
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK"},
      {"id": 4, "name": "Gym", "amount": 50, "dueDate": "2026-01-25", "scheduleType": "monthly", "payRail": "BANK"}
    ],
    "commitments": [{"savingsAmount": 3500}],
    "baselines": [{"name": "groceries", "amount": 300}, {"name": "transport", "amount": 70}],
    "buffer": 50
  }' | jq '.'
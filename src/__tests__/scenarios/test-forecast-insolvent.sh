#!/bin/bash
# Updated: Feb 15, 2026

echo "=== UPDATED INSOLVENT TEST (COMPOUNDING DEBT) ==="

# Added Bill 4: Gym - $50 (Feb 25) -> Falls in Window B
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
      {"id": 2, "name": "Electricity", "amount": 120, "dueDate": "2026-02-10", "scheduleType": "monthly", "payRail": "BANK"},
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK"},
      {"id": 4, "name": "Gym", "amount": 50, "dueDate": "2026-02-25", "scheduleType": "monthly", "payRail": "BANK"}
    ],
    "commitments": [{"savingsAmount": 3500}],
    "baselines": [{"name": "groceries", "amount": 300}, {"name": "transport", "amount": 70}],
    "buffer": 50
  }' | jq '.'

echo "Expected Math for Window B:"
echo "(Income 3500.32 - Fixed 3920 - Gym 50) + CarryOver (-459.68) = -\$929.36"
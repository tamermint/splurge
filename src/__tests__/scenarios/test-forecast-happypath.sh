#!/bin/bash
# Updated: Feb 17, 2026 for Dynamic Recurrence
# Window A (Now): Feb 11 - Feb 18 | Window B (Next): Feb 18 - Mar 4

echo "=== DYNAMIC RECURRENCE HAPPY PATH ==="

# We only provide the original bill definitions (Anchor Rules).
# The engine now handles projecting instances into Window B.
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "payDate": "2026-02-04",
      "frequency": "fortnightly",
      "totalAmount": 3704.32,
      "optionalSplit": false
    },
    "bills": [
      {"id": 1, "name": "Internet", "amount": 55, "dueDate": "2026-02-02", "scheduleType": "monthly", "payRail": "AMEX"},
      {"id": 2, "name": "Electricity", "amount": 120, "dueDate": "2026-02-10", "scheduleType": "monthly", "payRail": "BANK"},
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK"},
      {"id": 4, "name": "Rent", "amount": 1500, "dueDate": "2026-01-20", "scheduleType": "monthly", "payRail": "BANK"}
    ],
    "commitments": [{"savingsAmount": 1100}],
    "baselines": [{"name": "groceries", "amount": 300}, {"name": "transport", "amount": 70}],
    "buffer": 50
  }' | jq '.'
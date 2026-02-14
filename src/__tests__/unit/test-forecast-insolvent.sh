#!/bin/bash

# Insolvent Scenario Test (Corrected for Feb 11 Today Date)
# Today: Feb 11, 2026
# Window A: Feb 11 - Feb 18 (Next Payday)
# Window B: Feb 18 - Mar 4 (Following Payday)

echo "=== INSOLVENT SCENARIO TEST ==="
echo ""
echo "Test Scenario (Today: Feb 11):"
echo "- Pay Amount: \$3500.32"
echo "- Commitments (Savings): \$3500.00"
echo "- Baselines + Buffer: \$420.00 (\$370 + \$50)"
echo ""
echo "Bills Logic:"
echo "- Bill 1 (\$55, Feb 2): Past - Ignored"
echo "- Bill 2 (\$120, Feb 10): Past - Ignored"
echo "- Bill 3 (\$40, Feb 16): Window A (Upcoming)"
echo ""
echo "Expected Math:"
echo "- Window A: 3500.32 - (3500 + 420 + 40) = -\$459.68"
echo "- Window B: (3500.32 - 3500 - 420 - 0) + (-459.68) = -\$879.36"
echo ""
echo "=== SENDING REQUEST ==="
echo ""

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
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK"}
    ],
    "commitments": [{"savingsAmount": 3500}],
    "baselines": [{"name": "groceries", "amount": 300}, {"name": "transport", "amount": 70}],
    "buffer": 50
  }' | jq '.'
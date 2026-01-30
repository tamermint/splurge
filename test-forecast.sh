#!/bin/bash

# Comprehensive Forecast Test
# Today: Jan 30, 2026
# Window A: Jan 30 - Feb 4 (before payday)
# Window B: Feb 4 - Feb 18 (after payday until next payday)

echo "=== COMPREHENSIVE FORECAST TEST ==="
echo ""
echo "Test Scenario:"
echo "- Today: Jan 30, 2026"
echo "- Pay Date: Feb 4, 2026"
echo "- Pay Frequency: Fortnightly"
echo "- Pay Amount: \$3704.32"
echo ""
echo "Fixed Obligations:"
echo "- Commitments: \$1100"
echo "- Baselines: \$370 (groceries \$300 + transport \$70)"
echo "- Buffer: \$50"
echo "- Total: \$1520"
echo ""
echo "Bills:"
echo "- Bill 1 (Internet): \$55 due Feb 2 (in Window A)"
echo "- Bill 2 (Electricity): \$120 due Feb 10 (in Window B)"
echo "- Bill 3 (Phone): \$40 due Feb 16 (in Window B)"
echo ""
echo "Expected Results:"
echo "- Window A: \$3704.32 - \$1520 - \$55 = \$2129.32"
echo "- Window B: \$3704.32 - \$1520 - \$120 - \$40 = \$2024.32"
echo ""
echo "=== SENDING REQUEST ==="
echo ""

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
      {"id": 3, "name": "Phone", "amount": 40, "dueDate": "2026-02-16", "scheduleType": "monthly", "payRail": "BANK"}
    ],
    "commitments": [{"savingsAmount": 1100}],
    "baselines": [{"name": "groceries", "amount": 300}, {"name": "transport", "amount": 70}],
    "buffer": 50
  }' | jq '.'

echo ""
echo "=== RESPONSE BREAKDOWN ==="
echo "Window A (Now - Jan 30 to Feb 4):"
echo "  - Should show: safeToSplurgeNow: 2129.32, status: green"
echo ""
echo "Window B (After Pay - Feb 4 to Feb 18):"
echo "  - Should show: safeToSplurgeNow: 2024.32, status: green"
echo ""

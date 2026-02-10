#!/bin/bash

# Comprehensive Forecast Test
# Today: Feb 11, 2026 (current system date used by API)
# Window A: Feb 11 - Feb 18 (before next payday)
# Window B: Feb 18 - Mar 4 (after payday until next payday)

echo "=== COMPREHENSIVE FORECAST TEST ==="
echo ""
echo "Test Scenario:"
echo "- Today: Feb 11, 2026 (Current System Date)"
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
echo "- Bill 1 (Internet): \$55 due Feb 2 (before today, not in window)"
echo "- Bill 2 (Electricity): \$120 due Feb 10 (before today, not in window)"
echo "- Bill 3 (Phone): \$40 due Feb 16 (in Window A: Feb 11 - Feb 18)"
echo ""
echo "Expected Results:"
echo "- Window A (Now): \$3704.32 - \$1520 - \$40 = \$2144.32"
echo "- Window B (If Wait): (\$3704.32 - \$1520 - \$0) + \$2144.32 = \$4328.64"
echo "  (unsplurged amount from Window A carries to Window B)"
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
echo "  - Should show: safeToSplurge: 2144.32, status: green"
echo ""
echo "Window B (If Wait - Feb 4 to Feb 18):"
echo "  - Should show: safeToSplurge: 4328.64, status: green"
echo "  - (This includes the \$2144.32 that could have been spent in Window A)"
echo ""

#!/bin/bash

# Comprehensive Forecast Test
# Today: Feb 11, 2026 (Assumed system date)
# Window A (Current Cycle): Feb 11 - Feb 18 (Next Payday)
# Window B (Next Cycle): Feb 18 - Mar 4 (Following Payday)

echo "=== COMPREHENSIVE FORECAST TEST ==="
echo ""
echo "Test Scenario:"
echo "- Today: Feb 11, 2026"
echo "- Last Pay Date: Feb 4, 2026"
echo "- Pay Frequency: Fortnightly (Next is Feb 18)"
echo "- Pay Amount: \$3704.32"
echo ""
echo "Fixed Obligations:"
echo "- Commitments: \$1100"
echo "- Baselines: \$370 (groceries \$300 + transport \$70)"
echo "- Buffer: \$50"
echo "- Total Fixed: \$1520"
echo ""
echo "Bills Logic:"
echo "- Bill 1 (Internet): \$55 (Feb 2) -> Skipped (Before Today)"
echo "- Bill 2 (Electricity): \$120 (Feb 10) -> Skipped (Before Today)"
echo "- Bill 3 (Phone): \$40 (Feb 16) -> Window A (Feb 11 - Feb 18)"
echo ""
echo "Expected Math:"
echo "- Window A: 3704.32 - (1520 + 40) = \$2144.32"
echo "- Window B: (3704.32 - 1520) + 2144.32 = \$4328.64"
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
echo "=== RESPONSE VALIDATION ==="
echo "Success State:"
echo "  - Should show: .success: true"
echo ""
echo "Window A (data.now):"
echo "  - safeToSplurge: 2144.32"
echo "  - status: \"green\""
echo "  - carryOver: 0"
echo ""
echo "Window B (data.ifWait):"
echo "  - safeToSplurge: 4328.64"
echo "  - status: \"green\""
echo "  - carryOver: 2144.32"
echo ""
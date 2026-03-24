#!/bin/bash
# Updated: March 24, 2026
# Scenario: Insolvent but Fixable (The "Gap Day" Logic)
# 1. Salary ($2500) on April 1st.
# 2. Surprise Repair ($2600) on April 3rd — Manual/Soft.
# 3. Emergency Fund Savings ($500) — Soft.
# Result: $600 Shortfall (including buffer).

echo "=== STEP 1: GENERATING RECOVERY DATA (APRIL 2026) ==="

# Get the forecast result and save to a temp file
# This includes the Tier 1 (Relief), Tier 2 (Deferral), and Tier 3 (Deficit) logic
curl -s -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        { "amount": 2500, "date": "2026-04-01", "label": "Primary Salary" }
      ]
    },
    "bills": [
      { "id": 1, "name": "Surprise Repair", "amount": 2600, "dueDate": "2026-04-03", "scheduleType": "monthly", "payRail": "BANK", "payType": "manual" }
    ],
    "commitments": [
      { "commitmentType": "Emergency fund", "commitmentAmount": 500, "constraint": "soft", "priority": 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "expenses": [],
    "buffer": 50
  }' > temp_forecast.json

echo "=== STEP 2: REQUESTING AI STRATEGIC ANALYSIS ==="

# Send the raw engine output to the insights endpoint
# The AI must now interpret the recovery tiers we provided
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d @temp_forecast.json | jq '.insights'

# Cleanup
rm temp_forecast.json
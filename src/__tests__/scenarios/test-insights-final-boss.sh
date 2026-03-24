#!/bin/bash
# Updated: March 24, 2026
# Scenario: Total Liquidity Collapse (The "Final Boss")

echo "=== FINAL BOSS: TRIPLE-TIER RECOVERY TEST (APRIL 2026) ==="

# Step 1: Generate the raw forecast
# We save the WHOLE response (which includes the .data wrapper)
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
      { "id": 1, "name": "Critical Car Repair", "amount": 3000, "dueDate": "2026-04-02", "scheduleType": "monthly", "payRail": "BANK", "payType": "manual" },
      { "id": 2, "name": "Internet Bill", "amount": 100, "dueDate": "2026-04-03", "scheduleType": "monthly", "payRail": "BANK", "payType": "auto-debit" }
    ],
    "commitments": [
      { "commitmentType": "Holiday Fund", "commitmentAmount": 400, "constraint": "soft", "priority": 10 },
      { "commitmentType": "House Deposit", "commitmentAmount": 200, "constraint": "soft", "priority": 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "buffer": 50
  }' > temp_forecast.json

echo "=== REQUESTING STRATEGIC BRIEFING FROM AI ANALYST ==="

# Step 2: Send the raw data to the insights endpoint.
# The route handler will extract .data and run the trimmer internally.
# We then use jq '.insights' to match the key in your route handler.
curl -s -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d @temp_forecast.json | jq '.insights'

# Clean up
rm temp_forecast.json
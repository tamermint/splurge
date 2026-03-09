#!/bin/bash
# Scenario: Testing AI interpretation of the "Gap Day"
echo "=== STEP 1: GENERATING FORECAST DATA ==="

# Get the forecast result and save to a temp file
curl -s -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "paySchedule": {
      "frequency": "fortnightly",
      "inflows": [
        { "amount": 2500, "date": "2026-03-11", "label": "Primary Salary" },
        { "amount": 600, "date": "2026-03-12", "label": "Packaged Pay" }
      ]
    },
    "bills": [
      { "id": 1, "name": "Surprise Repair", "amount": 1600, "dueDate": "2026-03-11", "scheduleType": "monthly", "payRail": "BANK", "payType": "manual" }
    ],
    "commitments": [
      { "commitmentType": "Savings Lock", "commitmentAmount": 800, constraint: "soft", priority: 1 }
    ],
    "baselines": [
      { "name": "Living Expenses", "amount": 200 }
    ],
    "expenses": [],
    "buffer": 50
  }' > temp_forecast.json

echo "=== STEP 2: REQUESTING AI STRATEGIC ANALYSIS ==="

# Send that specific forecast output to the insights endpoint
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d @temp_forecast.json | jq '.'

# Cleanup
rm temp_forecast.json
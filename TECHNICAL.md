# 💸 Safe-to-Splurge Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Domain Logic](#core-domain-logic)
4. [API Reference](#api-reference)
5. [Type System](#type-system)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Development Guide](#development-guide)
9. [Deployment](#deployment)

---

## Project Overview

**Safe-to-Splurge** is a web-based financial planning application designed to empower users with intentional spending. Rather than restrictive budgeting, it calculates how much users can safely spend per pay cycle while maintaining financial commitments.

### Core Features

- **Pay Schedule Flexibility**: Supports weekly, fortnightly, and monthly pay cycles with split-pay capability
- **Bill Management**: Track fixed bills, payday-relative expenses, and recurring charges
- **Protected Commitments**: Lock fixed savings goals and sinking funds
- **Dual Forecast Views**:
  - **Safe-to-Splurge Now**: Available for immediate spending before next pay
  - **Safe-to-Splurge If You Wait**: Available after settling upcoming bills
- **Financial Status Indicators**: Color-coded status (green/amber/frugal/insolvent) for quick health assessment
- **AI Insights Layer**: Optional explainability and personalized recommendations (non-computational)

### Tech Stack

| Component       | Technology   | Version |
| --------------- | ------------ | ------- |
| Framework       | Next.js      | 16.1.3  |
| Runtime         | React        | 19.2.3  |
| Language        | TypeScript   | ^5      |
| Validation      | Zod          | ^4.3.6  |
| Testing         | Jest         | ^30.2.0 |
| Styling         | Tailwind CSS | ^4      |
| Package Manager | pnpm         | -       |

---

## Architecture

### Design Principles

1. **Pure Domain Logic**: Business rules live in `src/domain/` without dependencies on frameworks, databases, or network calls
2. **Deterministic Computation**: All calculations are idempotent and testable with fixed inputs
3. **Separation of Concerns**: Clear boundaries between domain, API handlers, and external services
4. **Type Safety**: Comprehensive Zod schema validation at API boundaries

### Directory Structure

```
src/
├── app/                          # 🌐 Next.js App Router
│   ├── api/
│   │   ├── forecast/             # Forecast computation endpoint
│   │   │   ├── route.ts          # POST handler
│   │   │   └── datemapper.ts     # Input transformation & validation
│   │   ├── insights/             # AI insights endpoint (optional)
│   │   └── splurge/              # Splurge calculation endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── domain/                       # 🧠 Pure business logic layer
│   ├── engine/                   # Core computation engines
│   │   ├── calculateSplurge.ts   # Splurge amount & status calculation
│   │   └── computeForecast.ts    # Multi-window forecast logic
│   │
│   ├── schedules/                # 📅 Temporal logic
│   │   └── scheduleHelper.ts     # Pay cycle & bill window helpers
│   │
│   ├── rules/                    # 🔄 Business rule generators
│   │   └── recurrenceGenerator.ts # Bill recurrence generation
│   │
│   └── types/                    # 📋 Domain contracts
│       └── forecast.ts           # Zod schemas & TypeScript types
│
├── services/                     # 🔗 External service adapters
│   └── ai/                       # AI provider integration (optional)
│
├── lib/                          # 🛠️ Utilities
│   └── errors.ts                 # Custom error classes
│
└── __tests__/                    # 🧪 Test fixtures
    ├── unit/                     # Unit tests
    └── scenarios/                # End-to-end scenario tests
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Request                          │
│                   (POST /api/forecast)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  datemapper.ts             │
        │  - Parse JSON request      │
        │  - Validate with Zod       │
        │  - Transform to DTO        │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  computeForecast()         │
        │  - Window A: today → pay   │
        │  - Window B: pay → next    │
        │  - Calculate splurge amounts
        │  - Determine statuses      │
        │  - Build breakdowns        │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐        ┌──────────────┐
   │ billsInWindow│        │ getYSplurge │
   │ scheduleHelper│        │ Amount()    │
   └─────┬────────​┘        └──────┬───────┘
        │                        │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │    ForecastOutput (JSON)   │
        │  - now.splurge             │
        │  - ifWait.splurge          │
        │  - Detailed breakdowns     │
        └────────────────────────────┘
```

---

## Core Domain Logic

### 1. Forecast Engine (`src/domain/engine/computeForecast.ts`)

**Purpose**: Calculate safe-to-splurge amounts across two forecast windows.

#### Conceptual Windows

- **Window A (Now)**: Current date → Next pay date
- **Window B (If Wait)**: Next pay date → Following pay date

#### Algorithm

For each window:

1. Calculate bills due in the window using `billsInWindow()`
2. Sum all baselines (e.g., groceries, transport)
3. Sum all commitment amounts (e.g., savings)
4. Add expense buffer (default: $50)
5. Compute splurge = Income - (Bills + Baselines + Commitments + Buffer)
6. Determine status based on splurge amount thresholds

#### Key Function Signature

```typescript
export async function computeForecast(
  input: ForecastInput,
  today: Date,
): Promise<ForecastOutput>;
```

**Input Validation**: Uses `ForecastInputSchema` (Zod) for runtime type safety

**Returns**: Dual forecast with detailed breakdowns

### 2. Splurge Calculation (`src/domain/engine/calculateSplurge.ts`)

**Purpose**: Pure calculation of available splurge amount and financial health status.

#### `getSplurgeAmount(payAmount: number, totalWindowAmount: number): number`

Calculates discretionary spending available after all obligations.

**Implementation Details**:

- Converts to cents internally to avoid floating-point precision errors
- Formula: `(payAmount - totalWindowAmount) / 100`
- Handles negative amounts (insolvency scenarios)

**Example**:

```typescript
getSplurgeAmount(3000, 2500); // Returns 500
getSplurgeAmount(3000, 3500); // Returns -500 (insolvent)
```

#### `getSplurgeStatus(splurgeAmount: number): string`

Maps splurge amount to financial health status.

**Status Thresholds**:

| Status        | Condition            | Description                         |
| ------------- | -------------------- | ----------------------------------- |
| **green**     | splurge ≥ $100       | Healthy discretionary budget        |
| **amber**     | $50 ≤ splurge < $100 | Limited discretionary spending      |
| **frugal**    | $0 ≤ splurge < $50   | Minimal discretionary budget        |
| **insolvent** | splurge < $0         | Income insufficient for obligations |

### 3. Schedule Helpers (`src/domain/schedules/scheduleHelper.ts`)

**Purpose**: Handle date arithmetic and bill window calculations.

#### `nextPayday(payDate: Date, frequency: string): Date`

Advances pay date by one frequency period.

**Supported Frequencies**:

- `"weekly"`: Add 7 days
- `"fortnightly"`: Add 14 days
- `"monthly"`: Add 1 month (calendar-aware)

#### `nextPayDayAfter(fromDate: Date, paySchedule: PaySchedule): Date`

Returns the next pay date from a given date.

**Logic**: Iteratively calls `nextPayday()` until result > fromDate

#### `billsInWindow(bills: Bill[], windowStart: Date, windowEnd: Date): BillsInWindowResult`

Filters bills that fall within a time window.

**Condition**: `windowStart ≤ bill.dueDate < windowEnd`

**Returns**:

```typescript
{
  bills: Bill[],
  totalAmount: number
}
```

### 4. Recurrence Generator (`src/domain/rules/recurrenceGenerator.ts`)

**Purpose**: Generate future bill occurrences based on schedules.

#### `recurrenceGenerator(bill: Bill, fromDate: Date, toDate: Date): FutureBill[]`

Expands a single bill definition into multiple occurrences.

**Supported Schedule Types**:

- `"fortnightly"`: Every 14 days
- `"monthly"`: Monthly (calendar-aware)
- `"yearly"`: Annual recurrence

**Example**:

```typescript
const bill: Bill = {
  id: 1,
  name: "Rent",
  amount: 1200,
  dueDate: new Date("2025-01-01"),
  scheduleType: "monthly",
  payRail: "account",
};

const occurrences = recurrenceGenerator(
  bill,
  new Date("2025-01-01"),
  new Date("2025-12-31"),
); // Returns 12 bills
```

---

## API Reference

### POST /api/forecast

Computes safe-to-splurge forecast with dual window analysis.

#### Request Body

```json
{
  "paySchedule": {
    "frequency": "fortnightly",
    "payDate": "2025-02-14",
    "totalAmount": 3000,
    "optionalSplit": false
  },
  "bills": [
    {
      "id": 1,
      "name": "Rent",
      "amount": 1200,
      "dueDate": "2025-02-15",
      "scheduleType": "monthly",
      "payRail": "account"
    }
  ],
  "commitments": [
    {
      "savingsAmount": 500
    }
  ],
  "baselines": [
    {
      "name": "Groceries",
      "amount": 200
    },
    {
      "name": "Transport",
      "amount": 100
    }
  ],
  "buffer": 50
}
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "now": {
      "safeToSplurge": 950,
      "status": "green",
      "breakdown": {
        "income": 3000,
        "commitments": [{"savingsAmount": 500}],
        "baselines": [
          {"name": "Groceries", "amount": 200},
          {"name": "Transport", "amount": 100}
        ],
        "buffer": 50,
        "totalBillAmount": 1200,
        "allBills": [...],
        "carryOver": 0
      }
    },
    "ifWait": {
      "safeToSplurge": 1950,
      "status": "green",
      "breakdown": {...}
    }
  }
}
```

#### Response (Validation Error)

**Status**: 400 Bad Request

```json
{
  "success": false,
  "type": "validation_error",
  "error": "Validation failed: {\"paySchedule\":[\"Expected object, received null\"]}"
}
```

#### Response (System Error)

**Status**: 500 Internal Server Error

```json
{
  "success": false,
  "type": "system_error",
  "error": "An unexpected error occurred"
}
```

#### Query Parameters

None. All configuration passed in request body.

#### Error Handling

| Error Type         | HTTP Status | Cause                          |
| ------------------ | ----------- | ------------------------------ |
| `ValidationError`  | 400         | Schema validation failure      |
| `DateMappingError` | 400         | Invalid date inputs            |
| `CalculationError` | 400         | Bill calculation logic failure |
| Other `Error`      | 500         | Unexpected system failure      |

---

## Type System

### Core Types

#### PaySchedule

```typescript
type PaySchedule = {
  frequency: "weekly" | "fortnightly" | "monthly";
  payDate: Date; // Next upcoming pay date
  totalAmount: number; // Gross income per pay cycle
  optionalSplit: boolean; // Split-pay flag (future)
};
```

**Validation Schema**:

```typescript
const PayScheduleSchema = z.object({
  frequency: z.string(),
  payDate: z.coerce.date(),
  totalAmount: z.number(),
  optionalSplit: z.boolean(),
});
```

#### Bill

```typescript
type Bill = {
  id: number; // Unique identifier
  name: string; // Human-readable name
  amount: number; // Amount due
  dueDate: Date; // When due
  scheduleType: string; // "monthly" | "fortnightly" | "yearly"
  payRail: string; // Payment method/account
};
```

#### Commitment

```typescript
type Commitment = {
  savingsAmount: number; // Fixed savings per cycle
};
```

#### Baseline

```typescript
type Baseline = {
  name: string; // Category (e.g., "Groceries")
  amount: number; // Amount per cycle
};
```

#### ForecastInput

```typescript
type ForecastInput = {
  paySchedule: PaySchedule;
  bills: Bill[];
  commitments: Commitment[];
  baselines: Baseline[];
  buffer: number; // Safety margin (default: 50)
};
```

#### ForecastOutput

```typescript
type ForecastOutput = {
  now: {
    safeToSplurge: number; // Available right now
    status: "green" | "amber" | "frugal" | "insolvent";
    breakdown: Breakdown; // Detailed component breakdown
  };
  ifWait: {
    safeToSplurge: number; // Available after next pay day
    status: "green" | "amber" | "frugal" | "insolvent";
    breakdown: Breakdown;
  };
};
```

#### Breakdown

```typescript
type Breakdown = {
  income: number; // Pay amount
  commitments: Commitment[]; // Savings commitments
  baselines: Baseline[]; // Essential expenses
  buffer: number; // Safety buffer
  totalBillAmount: number; // Sum of bills in window
  allBills: Bill[]; // Bills included
  carryOver: number; // Unspent balance (default: 0)
};
```

### Validation with Zod

All types have corresponding Zod schemas (e.g., `PayScheduleSchema`, `ForecastInputSchema`).

**Benefits**:

- Runtime type validation at API boundaries
- Automatic serialization/deserialization
- Clear error messages for invalid inputs
- TypeScript type inference from schemas

---

## Error Handling

### Custom Error Classes

Located in `src/lib/errors.ts`:

```typescript
export class ValidationError extends Error       // Input validation failures
export class ForecastError extends Error         // Forecast computation failures
export class DateMappingError extends Error      // Date arithmetic errors
export class CalculationError extends Error      // Calculation logic errors
export class ScheduleError extends Error         // Schedule processing errors
```

### Error Boundaries

**API Routes** (`src/app/api/forecast/route.ts`):

```typescript
try {
  // Business logic
} catch (error: unknown) {
  if (error instanceof ValidationError) {
    return Response.json({...}, { status: 400 })
  } else if (error instanceof Error) {
    return Response.json({...}, { status: 500 })
  }
}
```

### Best Practices

1. **Throw Early**: Validate inputs before expensive operations
2. **Specific Errors**: Use custom error classes for domain-specific issues
3. **Error Context**: Include meaningful messages for debugging
4. **Defensive Coding**: Check NaN and null values explicitly

**Example**:

```typescript
if (isNaN(payDate.getTime())) {
  throw new DateMappingError("Invalid payDate!");
}
```

---

## Testing

### Test Structure

```
src/__tests__/
├── unit/                              # Unit test suites
│   ├── testCalculateSplurge.ts        # Splurge calculation tests
│   ├── testComputeForecast.ts         # Forecast engine tests
│   ├── testDateMapper.ts              # Input validation tests
│   ├── testHelpers.ts                 # Schedule helper tests
│   └── testRecurrenceGenerator.ts     # Recurrence generation tests
│
└── scenarios/                         # End-to-end scenario tests
    ├── test-forecast-happypath.sh     # Happy path scenario
    └── test-forecast-insolvent.sh     # Insolvency scenario
```

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test testCalculateSplurge.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Test Example

From `src/__tests__/unit/testCalculateSplurge.ts`:

```typescript
describe("splurgeCalculation", () => {
  it("should correctly calculate splurge amount", () => {
    const payAmount = 3052.74;
    const totalWindowAmount = 2154.75;
    const expectedOutput =
      Math.round((payAmount - totalWindowAmount) * 100) / 100;

    const actualOutput = getSplurgeAmount(payAmount, totalWindowAmount);

    expect(expectedOutput).toBe(actualOutput);
  });

  it("should handle negative splurge amount", () => {
    const payAmount = 3052.74;
    const totalWindowAmount = 4000.45;

    const actualOutput = getSplurgeAmount(payAmount, totalWindowAmount);

    expect(actualOutput).toBeLessThan(0);
  });
});
```

### Scenario Testing

Bash scripts test end-to-end flows:

- **Happy Path** (`test-forecast-happypath.sh`): User with healthy finances
- **Insolvent** (`test-forecast-insolvent.sh`): User with insufficient income

```bash
# Run happy path scenario
bash src/__tests__/scenarios/test-forecast-happypath.sh
```

### Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on inputs and outputs
2. **Use Descriptive Names**: Test names should explain the scenario
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Test Boundaries**: Include edge cases (negative numbers, zero, max values)
5. **Avoid Mocking Domain Logic**: Pure functions don't need mocks

---

## Development Guide

### Project Setup

```bash
# Clone repository
git clone <repo-url>
cd splurge

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
```

### Development Server

```bash
pnpm run dev
```

Runs on [http://localhost:3000](http://localhost:3000) with hot-reload.

### Code Organization Rules

1. **Keep `src/domain/` Pure**
   - No imports from `app/`, `services/`, or external APIs
   - No side effects or network calls
   - Only export testable, deterministic functions

2. **API Handlers are Thin**
   - Receive input → Validate → Call domain → Return response
   - Minimal business logic in `src/app/api/`

3. **Type Everything**
   - All function parameters and returns must be typed
   - Use Zod schemas at API boundaries

4. **Import Paths**
   - Use `@/` alias for imports: `@/domain/types/forecast`
   - Never use relative paths like `../../../`

### Adding a New Feature

#### Example: Add "investmentGoal" to Commitments

1. **Update Type Definition** (`src/domain/types/forecast.ts`):

```typescript
export const CommitmentSchema = z.object({
  savingsAmount: z.number(),
  investmentGoal: z.string().optional(),
});
```

2. **Update Forecast Logic** (`src/domain/engine/computeForecast.ts`):

```typescript
// Update how commitments are processed
```

3. **Add Tests** (`src/__tests__/unit/testComputeForecast.ts`):

```typescript
it("should include investmentGoal in breakdown", () => {
  // Test your scenario
});
```

4. **Update API Handler** (`src/app/api/forecast/route.ts`):

```typescript
// No changes needed; schema validation handles it
```

### Linting & Formatting

```bash
# Run ESLint
pnpm run lint

# Fix issues automatically
pnpm run lint --fix
```

---

## Deployment

### Build

```bash
pnpm run build
```

Generates optimized production bundle in `.next/` directory.

### Start Production Server

```bash
pnpm run start
```

Runs on [http://localhost:3000](http://localhost:3000) (production mode).

### Environment Variables

Create `.env.local` with:

```env
# Database (if using Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/splurge

# AI Service (optional)
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Recommended Hosting Platforms

- **Vercel**: Native Next.js support, automatic deployments
- **Railway**: PostgreSQL + Next.js in one place
- **Render**: Simple deployment with free tier
- **AWS/GCP**: For enterprise-scale applications

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] All tests passing
- [ ] Build succeeds (`pnpm run build`)
- [ ] No console errors in production
- [ ] Security headers configured (if self-hosting)
- [ ] CORS policies set appropriately

### Database Setup (with Prisma)

```bash
# Generate Prisma schema
pnpm run prisma generate

# Run migrations
pnpm run prisma migrate deploy

# Seed initial data (if needed)
pnpm run prisma db seed
```

---

## Performance Considerations

### Computation Complexity

- **Splurge Calculation**: O(1) - constant time
- **Bill Window Filtering**: O(n) - linear in number of bills
- **Recurrence Generation**: O(m) - linear in number of occurrences

For typical use cases (< 100 bills), computation is negligible (< 10ms).

### Optimization Opportunities

1. **Caching**: Cache paySchedule → next pay date mappings
2. **Memoization**: Memoize `nextPayDayAfter()` for repeated calls
3. **Pagination**: Limit bills to recent/future only (not historical)

---

## Contributing

### Code Standards

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for types
- **Comments**: Document "why", not "what" (code should be self-explanatory)
- **Tests**: New features require tests

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push and create PR
git push origin feature/your-feature
```

---

## Troubleshooting

### Common Issues

| Issue                           | Solution                                            |
| ------------------------------- | --------------------------------------------------- |
| TypeScript errors after changes | Run `pnpm install` and restart editor               |
| Tests failing                   | Check `testComputeForecast.ts` for example patterns |
| Date calculations off by one    | Verify timezone handling; dates are UTC             |
| Validation errors at API        | Check Zod schema in `forecast.ts`                   |

### Debug Mode

Set `DEBUG=splurge:*` environment variable for verbose logging.

---

## Future Enhancements

1. **Persistence**: Add PostgreSQL + Prisma for user data
2. **Auth**: Implement user authentication (NextAuth.js)
3. **Mobile App**: React Native version for iOS/Android
4. **AI Integration**: Detailed insights from LLM
5. **Advanced Schedules**: Bi-weekly shifts, irregular pay
6. **Notifications**: SMS/Email reminders for upcoming bills
7. **Multi-currency**: Support currencies beyond USD

---

## Quick Reference

### Key Imports

```typescript
// Computation
import { computeForecast } from "@/domain/engine/computeForecast";
import {
  getSplurgeAmount,
  getSplurgeStatus,
} from "@/domain/engine/calculateSplurge";

// Helpers
import { nextPayDay, billsInWindow } from "@/domain/schedules/scheduleHelper";
import { recurrenceGenerator } from "@/domain/rules/recurrenceGenerator";

// Types
import { ForecastInput, ForecastOutput } from "@/domain/types/forecast";

// Errors
import { ValidationError, DateMappingError } from "@/lib/errors";
```

### Common Commands

```bash
pnpm run dev        # Start dev server
pnpm test          # Run tests
pnpm run build     # Build for production
pnpm run start     # Run production server
pnpm run lint      # Run linter
```

### File Locations

- **Domain Logic**: `src/domain/`
- **API Routes**: `src/app/api/`
- **UI Components**: `src/app/`
- **Tests**: `src/__tests__/`
- **Shared Utilities**: `src/lib/`
- **Type Definitions**: `src/domain/types/forecast.ts`

---

## Support & Resources

- **Documentation**: See `README.md` for product overview
- **Issues**: Check GitHub issues for known problems
- **Contact**: Reach out to the maintainers for questions

---

**Last Updated**: February 17, 2026  
**Version**: 0.1.0

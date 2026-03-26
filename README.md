# 💸 Safe-to-Splurge (Web PoC)

A web-only proof-of-concept that calculates a user's **safe-to-splurge** amount per pay cycle based on:

- 📅 Pay schedule (weekly / fortnightly / monthly; split pay supported)
- 🧾 Fixed bills (fixed date, payday-relative, date windows)
- 🏦 Fixed savings commitment (protected savings)
- 🛒 Essentials baselines (groceries + transport)
- 💰 Optional sinking funds (e.g., quarterly utilities)

The PoC also includes an **AI insights layer** for explainability and personalized suggestions.

> ⚠️ **Important:** AI never computes the number; it only explains and recommends.

---

## 💡 Product Concept

Most budgeting apps either shame spending or overwhelm users with categories.

This app is built around a positive loop:

1. 👤 Get a quick "sense" of the user's situation (manual onboarding)
2. 🔒 Lock a fixed savings amount per pay cycle
3. 🧮 Compute **Safe-to-Splurge Now** and **Safe-to-Splurge If You Wait**
4. 📈 Show payoff if the user skips or delays
5. ✅ Encourage intentional splurging with guardrails
6. 🤖 Use AI for explanations and personalization (not arithmetic)

---

## 🛠️ Tech Stack

| Technology         | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| ⚡ **Next.js**     | App Router                                               |
| 📘 **TypeScript**  | Type safety                                              |
| 📦 **pnpm**        | Package manager                                          |
| 🐘 **Postgres**    | Persistence (recommended)                                |
| 🔷 **Prisma**      | ORM/migrations (recommended)                             |
| 🤖 **AI Provider** | Insights integration (optional, behind service boundary) |

---

## 🏗️ Architecture (Repo Structure)

The codebase is intentionally split so the core logic stays testable and deterministic.

```
src/
├── app/                # 🌐 Next.js routes + pages
│   ├── api/            # 🔌 API route handlers (thin)
│   └── db/             # 🗄️ Prisma schema + migrations (optional)
├── domain/             # 🧠 Pure business logic (no DB, no network)
│   ├── engine/         # ⚙️ Forecast + safe-to-splurge computation
│   ├── models/         # 📋 Domain types (input/output contracts)
│   └── schedule/       # 📅 Pay schedule + bill schedule rule generators
├── services/           # 🔗 AI insights, adapters, notifications (optional)
└── tests/              # 🧪 Scenario tests (fixtures)
```

> 📌 **Rule:** `src/domain` must remain pure functions.
>
> 💬 **Reason:** Correctness + scenario testing + easy refactors.

---

## 🚀 Run Dev Server

```bash
pnpm run dev
```

🌍 Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Core Concepts

### 1. 📅 Pay Cycle

- A pay cycle is the unit of planning: weekly / fortnightly / monthly (irregular can be added later)
- May include split pay events (e.g., Wed + Thu deposits)

### 2. 🔐 Protected Commitments

Money reserved before any discretionary spend:

- 🎯 Fixed savings goal per cycle
- ➡️ Mandatory transfers
- 🪣 Sinking funds (quarterly utilities, annual fees, etc.)

### 3. 🧾 Obligations (Bills)

Scheduled outflows inside the forecast window:

| Type                 | Example             |
| -------------------- | ------------------- |
| 📆 Fixed day monthly | 18th of each month  |
| 💵 Payday-relative   | Friday after payday |
| 🪟 Date window       | 16th OR 21st        |
| 🔄 Quarterly         | Every 3 months      |

### 4. 🛒 Essentials Baseline

Baseline spending per cycle:

- 🥦 Groceries
- 🚌 Transport

_(Other essentials can be added later.)_

### 5. 🎉 Safe-to-Splurge

Computed for two windows:

| Window             | Description                     |
| ------------------ | ------------------------------- |
| ⏰ **Now**         | Current moment to next payday   |
| ⏳ **If You Wait** | Next payday to following payday |

-- Test: checking key

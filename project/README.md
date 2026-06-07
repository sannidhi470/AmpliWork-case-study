# Circuit Labs — Finance Dashboard

A full-stack dashboard that unifies transactions from three banks (Chase, Bank
of America, American Express) into one normalized, multi-currency view, with
login, role-based access control, a transactions tab, a stats tab, and a custom
"Watchlist" tab.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**,
**Tailwind CSS**, and **SWR**.

## Getting started

### Prerequisites

- **Node.js 20+** (Next.js 16 requires Node 18.18 or newer)
- **npm** (ships with Node)

### Install & run

```bash
# 1. Clone the repository
git clone https://github.com/sannidhi470/AmpliWork-case-study.git
cd AmpliWork-case-study/project

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at **http://localhost:3000**.

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Architecture notes

### High-level architecture

Data flows through clear layers, each with one job:

```
JSON data files
   ↓  load + read (server only)
Server layer            src/lib/server/*      (fs access, password handling)
   ↓  call pure logic
Domain logic            src/lib/*             (normalize, filters, currency, stats, review)
   ↓  expose over HTTP
API routes              src/app/api/*         (REST endpoints)
   ↓  fetch with SWR
Client hooks            src/hooks/*           (useTransactions, useStats, useReview …)
   ↓  render
UI components / pages   src/app, src/components
```

- **Server-only code** (`lib/server/`) is the only place that touches the
  filesystem and the raw `user.json` (with passwords). It never reaches the
  browser bundle.
- **Domain logic** (`lib/`) is pure and framework-agnostic — easy to reason
  about and reuse on both server and client.
- **API routes** are thin: parse input, call domain logic, return JSON.
- **Client** never does heavy work — it fetches small, ready-made payloads via
  SWR and renders them.

### Project structure

Annotated so each spec requirement maps to a file.

```
project/
├── data/                                  # provided JSON (not modified)
│   ├── transactions/{chase,boa,amex}.json # raw bank data (3 different shapes)
│   ├── users/user.json                    # users, roles, passwords, tabAccessMatrix
│   └── rates.json                         # static currency rates
└── src/
    ├── app/
    │   ├── layout.tsx                      # root layout
    │   ├── page.tsx                        # redirects to /login or /dashboard
    │   ├── login/page.tsx                  # login form → POST /api/auth/login
    │   │
    │   ├── dashboard/
    │   │   ├── layout.tsx                  # auth guard (redirects if not logged in) + sidebar
    │   │   ├── page.tsx                    # redirects to the user's first allowed tab
    │   │   ├── transactions/page.tsx       # Transactions tab
    │   │   ├── stats/page.tsx              # Stats tab
    │   │   └── custom/page.tsx             # Watchlist tab (bonus)
    │   │
    │   └── api/
    │       ├── auth/login/route.ts         # POST login; validates creds, strips password
    │       ├── banks/chase/transactions/route.ts   # GET raw Chase (as-is)
    │       ├── banks/boa/transactions/route.ts      # GET raw BoA (as-is)
    │       ├── banks/amex/transactions/route.ts     # GET raw Amex (as-is)
    │       ├── transactions/route.ts       # GET normalized list + filters (bank, authorizedBy, amount, fromDate)
    │       ├── transactions/[id]/route.ts  # GET one normalized txn incl. raw source
    │       ├── users/route.ts              # GET password-free users (for filter dropdown)
    │       ├── stats/route.ts              # GET aggregated stats summary (USD)
    │       └── review/route.ts             # GET Watchlist queue (materiality)
    │
    ├── components/
    │   ├── TabGuard.tsx                    # per-tab RBAC gate
    │   ├── AccessDenied.tsx                # shown when a role can't access a tab
    │   ├── DashboardSidebar.tsx            # nav (only shows accessible tabs) + logout
    │   ├── transactions/
    │   │   ├── TransactionsTable.tsx       # table, 30-row cap, loading/empty states
    │   │   ├── TransactionsFilterBar.tsx   # bank / authorizedBy / currency / fromDate + CSV button
    │   │   ├── TransactionModal.tsx        # detail modal (summary + raw bank fields)
    │   │   └── AuthorizedByCell.tsx        # name + hover tooltip (initials, email, role)
    │   ├── stats/
    │   │   ├── KpiCard.tsx                 # KPI cards (cash in / cash out)
    │   │   ├── StatPanel.tsx               # shared panel wrapper
    │   │   ├── MoneyFlowChart.tsx          # money in vs out by month (chart 1)
    │   │   ├── CategorySpendChart.tsx      # spend by category (chart 2)
    │   │   ├── BankBalanceChart.tsx        # bank balance over time (chart 3)
    │   │   └── TopVendorsTable.tsx         # vendor breakdown table
    │   ├── review/
    │   │   ├── ReviewQueueTable.tsx        # Watchlist worklist (tiers + drill-in)
    │   │   └── FlagChips.tsx               # context flag chips
    │   └── ui/PillSelect.tsx               # reusable dropdown
    │
    ├── hooks/                              # SWR data hooks (client fetching)
    │   ├── useAuth.ts                      # current user from localStorage + logout
    │   ├── useTransactions.ts              # GET /api/transactions (filters → SWR key)
    │   ├── useUsers.ts                     # GET /api/users
    │   ├── useStarred.ts                   # starred rows (localStorage)
    │   ├── useStats.ts                     # GET /api/stats
    │   └── useReview.ts                    # GET /api/review
    │
    └── lib/
        ├── types.ts                        # all shared domain types (no `any`)
        ├── rbac.ts                         # tabAccessMatrix + canAccessTab / getAccessibleTabs
        ├── auth.ts                         # localStorage helpers (get/set/clear user)
        ├── normalize.ts                    # merge 3 banks → one model; resolve authorizedBy
        ├── filters.ts                      # apply transaction filters (pure)
        ├── currency.ts                     # convert / convertToUSD / format (rates.json)
        ├── stats.ts                        # stats aggregation (pure)
        ├── review.ts                       # Watchlist materiality + flags (pure)
        ├── chart.ts                        # axis math + month labels (pure)
        ├── csv.ts                          # CSV build + download
        ├── bankMeta.ts                     # bank labels / masked account formatting
        ├── format.ts, flatten.ts, fetcher.ts, starred.ts   # small utilities
        └── server/                         # SERVER-ONLY (fs access + passwords)
            ├── users.ts                    # read user.json, authenticate, strip password
            ├── banks.ts                    # read the 3 raw bank files
            ├── transactions.ts             # load + normalize all banks
            ├── stats.ts                    # build stats summary
            └── review.ts                   # build Watchlist queue
```

Normalization, access control, currency, and aggregation logic all live in
their own files in `lib/` — never inside UI components.

### TypeScript design decisions

- **No `any`.** Strict typing throughout; `tsc --noEmit` passes clean.
- **Raw bank shapes are fully typed** (`ChaseFile`, `BoaFile`, `AmexFile`) so
  the passthrough routes and normalizer are type-safe. Irrelevant nested blocks
  are typed `unknown`, not `any`.
- **One source of truth** for domain types in `lib/types.ts`.
- **Union types** for closed sets (`Role`, `TabId`, `BankId`, `ReviewFlag`,
  `MaterialityTier`) instead of loose strings.
- **Type guards** (`isBankId`, `parseAuthUser`) validate untyped input at the
  boundaries (query params, `localStorage`).
- **Server-only types** (`UserRecord`, which includes the password) are kept out
  of any client import path.

### Performance considerations

- **Heavy aggregation runs on the server.** The Stats and Watchlist endpoints
  compute summaries server-side and return small payloads — the browser never
  downloads all ~1,800 transactions to do math.
- **SWR caching** keys on the request URL, with `keepPreviousData` so changing a
  filter updates the table without a full reload or a loading flash.
- **Currency switching is client-side display only** — it never triggers a
  refetch.
- **Bounded rendering** — the transactions table caps at 30 rows and the
  Watchlist returns the top 100 by value, keeping the DOM light.

### Assumptions

- **Mock auth.** Passwords are compared as plaintext against `user.json` and the
  session is just `localStorage` (per the spec). No hashing / JWT / server
  session — fine for the exercise, not production.
- **Static rates.** Currency conversion uses `data/rates.json` only (no live
  rates API).
- **`authorizedBy` resolves by name.** Bank records carry a person's name, which
  is matched (case-insensitive, trimmed) to a user in `user.json`.
- **"Spend" = debits.** Vendor/category rankings and the Watchlist consider
  money going out; credits are inflows only.
- **Running balance is derived.** The three banks expose balances
  inconsistently, so the bank-balance chart uses the cumulative net of
  normalized transactions per bank (in USD).

### Tradeoffs

- **RBAC is enforced client-side** (via `localStorage`, as the spec describes).
  This is right for the exercise but not secure for production — a real app
  would gate the APIs with server-side sessions/middleware.
- **No chart library.** Charts are hand-built with CSS/SVG — zero dependency
  weight and full control over the look, at the cost of advanced charting
  features.
- **Capped tables instead of pagination.** The spec caps the transactions table
  at 30 rows, so I show the most relevant rows rather than building pagination.
- **Watchlist is per-transaction, not per-vendor.** Recurring payments repeat as
  separate rows; this keeps it a true drill-in worklist (vendor aggregation
  already lives in the Stats tab).

## Data normalization

Each bank names the same things differently. `lib/normalize.ts` maps all three
into one `NormalizedTransaction`:

| Normalized field | Chase | BoA | Amex |
| --- | --- | --- | --- |
| `id` | `transactionId` | `id` | `chargeId` |
| `date` | `transactionDate` | `transactionDate` | `transactionDate` |
| `description` | `description` | `description` | `memo` (or merchant name) |
| `amount` | `amount` | `amount` | `amountInCents` / 100 |
| `currency` | `currency` | `currencyCode` | `billingCurrency` |
| `type` | `transactionType` | `debitCreditMemo` | `type` (charge→debit, payment→credit) |
| `category` | `categoryName` | `spendingCategory` | `merchant.category` |
| `vendor` | `merchantName` | `payee` | `merchant.name` |
| `authorizedBy` | `initiatedBy.name` | `originator.name` | `employee.name` |
| `source` | raw object | raw object | raw object |

- **Amounts** are stored as a positive magnitude; direction lives in `type`.
- **`authorizedBy`** is resolved by matching the name (case-insensitive) to a
  user in `user.json`; it's `null` if no user matches.
- **`source`** keeps the original raw object so the detail modal can show every
  extra bank-specific field.
- The merged list is always **sorted earliest date first**.

## Multi-currency

- Every transaction **keeps its original currency and amount**.
- `rates.json` is expressed as "USD per 1 unit of currency", so conversion is
  `amountTo = amountFrom × rate[from] / rate[to]` (`lib/currency.ts`).
- **Transactions tab:** rows show the original currency by default; the "Show
  Currency In" dropdown converts amounts **for display only** (no refetch).

## Custom tab (Watchlist) 

### Why this tab

Finance can't review 1,800 payments one by one. The Watchlist is a
**review-priority queue**: it ranks outgoing payments so finance knows *which
ones to look at first*. The idea comes from how auditors actually work. They focus
on the **biggest, most material payments** (that's where the risk and the money
are) and surface anything that looks worth a second glance. It's restricted to **admin and finance_lead**
only.

### Features

- **2 KPI cards**
  - **Total Spend (USD)** — total money out across all banks, and how many
    payments it covers.
  - **Critical (Tier A)** — how many payments make up the first 50% of all
    spend (i.e. the vital few to review first).
- **Review queue table** — every payment ranked by USD value, showing its
  **priority tier (A–D)**, amount, % of total spend, date, who authorized it,
  bank, and **"why look" context chips**.
- **Context chips** flag things worth a second glance: foreign currency,
  weekend, possible duplicate, non-finance approver, unresolved approver.
- **Filters** (tier / bank / flag) update instantly, and **clicking a row**
  opens the full transaction detail modal.
- **Export CSV** of the current (filtered) queue.

### How priority is calculated (`lib/review.ts`)

Priority uses **ABC analysis** (the 80/20 rule), based on *materiality* — how
much each payment contributes to total spend:

1. Convert every debit to **USD** and sort largest first.
2. Walk down the list tracking the **cumulative share of total spend**.
3. Assign a tier by where the payment falls:

   | Tier | Cumulative spend | Meaning |
   | --- | --- | --- |
   | **A** | first 0–50% | the largest, review first |
   | **B** | 50–80% | still significant |
   | **C** | 80–95% | mid-sized |
   | **D** | 95–100% | the long tail |

Payments of the **same amount always get the same tier**. Tiers are *relative*
to this company's spend (so a $500k payment can be Tier B if even larger
payments already fill Tier A — the absolute amount is always shown).

The **context chips are separate** and do **not** change the tier — they're a
light risk layer, e.g. *possible duplicate* = same vendor + same USD amount +
same day appears more than once.

### Easily customizable

The logic is intentionally simple and rule-based, so it can be tuned to a
company's own policies without touching the UI. All of it lives in
`lib/review.ts`:

- **Tier boundaries** (50% / 80% / 95%) can be adjusted, or replaced with an
  **absolute rule** (e.g. "any payment ≥ $100k is Critical") to match real
  approval thresholds.
- **Context flags** can be added, removed, or re-tuned (e.g. change what counts
  as a duplicate, or flag specific categories/vendors).

### Impact

A reviewer can cover most of the company's spend by checking only the top few
rows (a handful of Tier A/B payments account for the large majority of the
money), instead of scanning every transaction. It turns 1,800 rows into a short,
prioritized worklist with a clear reason on each line.

## AI tool usage

I used the **Claude Opus 4.8** model (via Cursor) as a coding assistant. My
workflow and where the human judgment came in:

- **Planning was mine.** I analyzed the case-study spec myself, took notes, and
  then directed the model feature by feature, explicitly instructing it to stay
  compliant with the technical notes (TypeScript without `any`, App Router,
  Tailwind, SWR, logic separated from UI).
- **Design context.** I connected the **Figma MCP server** so the model could
  read the design and match the layouts.
- **Incremental development.** I worked in small increments and reviewed each
  implementation before moving on, so I could course-correct as we went.
- **Product decisions were mine.** Choosing which 2 KPI cards and which charts
  to build was my call — I picked ones that relate to each other and give more
  insight together. The **Watchlist** custom tab was my idea: since the tab had
  to reuse the existing transactions/users data and this is sensitive financial
  data, I focused on a security/auditing angle, and designed a queue that helps
  auditors review the most important transactions first, cutting review time and
  complexity. The model assisted with the implementation, but the concept and
  reasoning were mine.
- **Model performance.** Opus generally implemented features correctly, but it
  occasionally deviated from the design or added unnecessary fallback handling where
  I stepped in to review and correct those cases.



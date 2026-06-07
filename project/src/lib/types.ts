/**
 * Shared domain types for the Circuit Labs dashboard.
 *
 * Kept framework-agnostic so they can be imported by API routes (server)
 * and React components (client) alike.
 */

export type Role = "admin" | "finance_lead" | "analyst" | "viewer";

export type TabId = "transactions" | "stats" | "custom";

export type BankId = "chase" | "boa" | "amex";

/* ------------------------------------------------------------------ *
 * Raw bank shapes — one per bank, intentionally inconsistent.
 * These model the on-disk JSON so the passthrough routes and the
 * normalizer stay fully typed (no `any`). Unknown/irrelevant nested
 * blocks are typed as `unknown` rather than `any`.
 * ------------------------------------------------------------------ */

interface BankPerson {
  name: string;
  department: string;
}

export interface ChaseTransaction {
  transactionId: string;
  postingDate: string;
  transactionDate: string;
  description: string;
  amount: number;
  transactionType: "DEBIT" | "CREDIT";
  categoryCode: string;
  categoryName: string;
  merchantName: string;
  initiatedBy: BankPerson;
  pending: boolean;
  currency: string;
  originalAmount: number;
}

export interface ChaseFile {
  status: string;
  requestId: string;
  account: {
    accountId: string;
    accountType: string;
    maskedAccountNumber: string;
    displayName: string;
    currency: string;
    currentBalance: number;
    availableBalance: number;
    asOfDate: string;
  };
  transactions: ChaseTransaction[];
  pagination?: unknown;
}

export interface BoaTransaction {
  id: string;
  transactionDate: string;
  postedDate: string;
  payee: string;
  description: string;
  amount: number;
  debitCreditMemo: "DEBIT" | "CREDIT";
  transactionType: string;
  spendingCategory: string;
  originator: BankPerson;
  currencyCode: string;
  originalAmount: number;
  runningBalance: number;
  status: string;
}

export interface BoaFile {
  responseStatus: {
    code: number;
    message: string;
    timestamp: string;
    traceId: string;
  };
  accountSummary: {
    accountNumber: string;
    routingNumber: string;
    productType: string;
    productName: string;
    currencyCode: string;
    ledgerBalance: number;
    availableBalance: number;
    balanceAsOf: string;
  };
  transactionList: BoaTransaction[];
}

export interface AmexCharge {
  chargeId: string;
  transactionDate: string;
  postDate: string;
  merchant: {
    name: string;
    category: string;
    categoryCode: string;
    city: string;
    state: string;
    country: string;
  };
  amountInCents: number;
  amountDisplay: string;
  type: "charge" | "payment";
  status: string;
  rewardEligible: boolean;
  memo: string;
  employee: BankPerson;
  billingCurrency: string;
  originalAmountInCents: number;
}

export interface AmexFile {
  cardMember: {
    accountToken: string;
    cardType: string;
    last5: string;
    memberSince: string;
    currency: string;
    cardholderName: string;
    companyName: string;
  };
  statementPeriod: {
    start: string;
    end: string;
    closingBalance: number;
    minimumPaymentDue: number;
    paymentDueDate: string;
  };
  data: {
    charges: AmexCharge[];
  };
}

/**
 * Full user record exactly as stored in `data/users/user.json`.
 * SERVER-ONLY: contains the password and must never be sent to the client
 * or imported into any client bundle.
 */
export interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  title: string;
  role: Role;
  allowedTabs: TabId[];
  department: string;
  active: boolean;
  createdAt: string;
}

/** A user record with the password stripped — safe to return from an API. */
export type PublicUser = Omit<UserRecord, "password">;

/**
 * The minimal shape we persist to localStorage after login.
 * Per the spec: id, name, role, allowedTabs — never the password.
 */
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  allowedTabs: TabId[];
}

/** Shape of `data/users/user.json`. */
export interface UsersFile {
  company: string;
  authNote: string;
  tabAccessMatrix: Record<TabId, Role[]>;
  users: UserRecord[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: PublicUser;
}

export interface ApiError {
  error: string;
}

/* ------------------------------------------------------------------ *
 * Currency
 * ------------------------------------------------------------------ */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD";

/** Shape of `data/rates.json`. Rates are "USD per 1 unit of currency". */
export interface RatesFile {
  note: string;
  base: CurrencyCode;
  asOf: string;
  rates: Record<string, number>;
}

/* ------------------------------------------------------------------ *
 * Normalized transaction model
 * ------------------------------------------------------------------ */

export type TransactionType = "debit" | "credit";

/**
 * A user resolved from `user.json` and embedded on a transaction.
 * Password-free; carries just what the UI (and the Authorized By tooltip)
 * needs, plus `id` so the API can filter by `authorizedBy`.
 */
export interface ResolvedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
}

/** The raw per-transaction object from whichever bank it came from. */
export type RawTransaction = ChaseTransaction | BoaTransaction | AmexCharge;

/** One transaction in the unified shape returned by /api/transactions. */
export interface NormalizedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive magnitude, in the original `currency`
  currency: string; // original currency code, preserved as-is
  type: TransactionType;
  category: string;
  vendor: string;
  bank: BankId;
  /** Display label for the source account, e.g. "BoA ****7892". */
  bankAccount: string;
  /**
   * Resolved user (by name match), or null if the name isn't in user.json.
   * The raw bank name remains available on `source` if ever needed.
   */
  authorizedBy: ResolvedUser | null;
  /** Original raw object from the source bank (powers the detail modal). */
  source: RawTransaction;
}

/** Optional filters accepted by GET /api/transactions. */
export interface TransactionFilters {
  bank?: BankId;
  authorizedBy?: string; // user id
  amount?: number; // minimum amount (in each row's original currency)
  fromDate?: string; // YYYY-MM-DD, inclusive
}

/* ------------------------------------------------------------------ *
 * Stats (aggregated summary returned by GET /api/stats)
 *
 * All monetary values are normalized to USD on the server using
 * rates.json, so the client never has to do currency math.
 * ------------------------------------------------------------------ */

/** Total debit ("spend") for one vendor, in USD. */
export interface VendorSpend {
  vendor: string;
  total: number; // USD
  count: number; // number of debit transactions
  lastDate: string; // most recent transaction date (YYYY-MM-DD)
}

/** Total debit ("spend") for one category, in USD. */
export interface CategorySpend {
  category: string;
  total: number; // USD
}

/** Money in vs money out for a single calendar month, in USD. */
export interface MonthlyFlow {
  month: string; // "YYYY-MM"
  cashIn: number; // USD, sum of credits
  cashOut: number; // USD, sum of debits
}

/** A single point on a bank's running-balance line, in USD. */
export interface BalancePoint {
  month: string; // "YYYY-MM"
  balance: number; // USD, cumulative net (credits - debits) through this month
}

/** Aggregated company-wide stats. Everything is pre-converted to USD. */
export interface StatsSummary {
  currency: "USD";
  totalCashIn: number; // sum of all credit transactions
  totalCashOut: number; // sum of all debit transactions
  netCashFlow: number; // cashIn - cashOut
  transactionCount: number;
  vendorCount: number; // unique vendors across all transactions
  topVendors: VendorSpend[]; // ranked by total spend, desc
  byCategory: CategorySpend[]; // ranked by total spend, desc
  byMonth: MonthlyFlow[]; // chronological, earliest first
  /**
   * Running balance per bank across the full statement period (chronological).
   * Derived as the cumulative net of normalized transactions in USD, since the
   * three banks expose balances inconsistently (see README).
   */
  balanceByBank: Record<BankId, BalancePoint[]>;
}

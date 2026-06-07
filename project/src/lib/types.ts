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

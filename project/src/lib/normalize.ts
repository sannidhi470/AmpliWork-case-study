/**
 * Normalization: merge the three intentionally-different bank formats into one
 * consistent `NormalizedTransaction` model.
 *
 * This is pure logic (no filesystem / no fetch) so it is easy to reason about
 * and test. The server layer loads the raw files + users and calls in here.
 *
 * Field-mapping matrix (raw -> normalized):
 *   id           chase.transactionId | boa.id | amex.chargeId
 *   date         *.transactionDate
 *   description  chase.description | boa.description | amex.memo (fallback merchant.name)
 *   amount       |chase.amount| | boa.amount | |amex.amountInCents|/100   (always positive)
 *   currency     chase.currency | boa.currencyCode | amex.billingCurrency
 *   type         chase.transactionType | boa.debitCreditMemo | amex.type(charge=debit,payment=credit)
 *   category     chase.categoryName | boa.spendingCategory | amex.merchant.category
 *   vendor       chase.merchantName | boa.payee | amex.merchant.name
 *   authorizedBy chase.initiatedBy.name | boa.originator.name | amex.employee.name -> user.json
 */

import { formatBankAccount } from "./bankMeta";
import type {
  AmexFile,
  BoaFile,
  ChaseFile,
  NormalizedTransaction,
  ResolvedUser,
  UserRecord,
} from "./types";

/** Resolves a raw bank name string to a user from user.json (or null). */
export type UserResolver = (name: string) => ResolvedUser | null;

function toResolvedUser(user: UserRecord): ResolvedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    department: user.department,
  };
}

/**
 * Build a name -> user resolver. Matching is case-insensitive and trims
 * whitespace so minor formatting differences in bank data still resolve.
 */
export function buildUserResolver(users: UserRecord[]): UserResolver {
  const byName = new Map<string, ResolvedUser>();
  for (const user of users) {
    byName.set(user.name.trim().toLowerCase(), toResolvedUser(user));
  }
  return (name: string) => byName.get(name.trim().toLowerCase()) ?? null;
}

export function normalizeChase(
  file: ChaseFile,
  resolve: UserResolver,
): NormalizedTransaction[] {
  const bankAccount = formatBankAccount(
    "chase",
    file.account.maskedAccountNumber,
  );
  return file.transactions.map((tx) => ({
    id: tx.transactionId,
    date: tx.transactionDate,
    description: tx.description,
    amount: Math.abs(tx.amount),
    currency: tx.currency,
    type: tx.transactionType === "CREDIT" ? "credit" : "debit",
    category: tx.categoryName,
    vendor: tx.merchantName,
    bank: "chase",
    bankAccount,
    authorizedBy: resolve(tx.initiatedBy.name),
    source: tx,
  }));
}

export function normalizeBoa(
  file: BoaFile,
  resolve: UserResolver,
): NormalizedTransaction[] {
  const bankAccount = formatBankAccount(
    "boa",
    file.accountSummary.accountNumber,
  );
  return file.transactionList.map((tx) => ({
    id: tx.id,
    date: tx.transactionDate,
    description: tx.description,
    amount: Math.abs(tx.amount),
    currency: tx.currencyCode,
    type: tx.debitCreditMemo === "CREDIT" ? "credit" : "debit",
    category: tx.spendingCategory,
    vendor: tx.payee,
    bank: "boa",
    bankAccount,
    authorizedBy: resolve(tx.originator.name),
    source: tx,
  }));
}

export function normalizeAmex(
  file: AmexFile,
  resolve: UserResolver,
): NormalizedTransaction[] {
  const bankAccount = formatBankAccount("amex", file.cardMember.last5);
  return file.data.charges.map((tx) => ({
    id: tx.chargeId,
    date: tx.transactionDate,
    description: tx.memo || tx.merchant.name,
    amount: Math.abs(tx.amountInCents) / 100,
    currency: tx.billingCurrency,
    type: tx.type === "payment" ? "credit" : "debit",
    category: tx.merchant.category,
    vendor: tx.merchant.name,
    bank: "amex",
    bankAccount,
    authorizedBy: resolve(tx.employee.name),
    source: tx,
  }));
}

/** Stable sort, earliest date first (ties broken by id for determinism). */
function byDateAsc(
  a: NormalizedTransaction,
  b: NormalizedTransaction,
): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Merge all three banks into one normalized, date-sorted list. */
export function normalizeAll(
  chase: ChaseFile,
  boa: BoaFile,
  amex: AmexFile,
  users: UserRecord[],
): NormalizedTransaction[] {
  const resolve = buildUserResolver(users);
  return [
    ...normalizeChase(chase, resolve),
    ...normalizeBoa(boa, resolve),
    ...normalizeAmex(amex, resolve),
  ].sort(byDateAsc);
}

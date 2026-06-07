/**
 * Pure filtering for normalized transactions. Used by GET /api/transactions
 * (server) and reusable on the client if needed.
 */

import type { NormalizedTransaction, TransactionFilters } from "./types";

export function applyTransactionFilters(
  transactions: NormalizedTransaction[],
  filters: TransactionFilters,
): NormalizedTransaction[] {
  return transactions.filter((tx) => {
    if (filters.bank && tx.bank !== filters.bank) return false;
    if (filters.authorizedBy && tx.authorizedBy?.id !== filters.authorizedBy) {
      return false;
    }
    if (filters.amount != null && tx.amount < filters.amount) return false;
    if (filters.fromDate && tx.date < filters.fromDate) return false;
    return true;
  });
}

/**
 * CSV export for the transactions table. Pure string-building (no DOM) plus a
 * tiny browser-only download trigger. Columns mirror the on-screen table.
 *
 * Amounts respect the active "Show Currency In" selection so the export matches
 * what the user sees. The amount is written as `<CODE> <number>` (no thousands
 * separators) to stay unambiguous and spreadsheet-friendly.
 */

import { resolveDisplayAmount } from "./currency";
import type { DisplayCurrency } from "./currency";
import { formatDate } from "./format";
import type { NormalizedTransaction } from "./types";

const COLUMNS = [
  "Transaction",
  "Amount",
  "Date",
  "Category",
  "Bank Account",
  "Authorized By",
  "Vendor",
] as const;

/** Quote a CSV field, escaping embedded quotes per RFC 4180. */
function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(
  transactions: NormalizedTransaction[],
  display: DisplayCurrency,
): string {
  const rows = transactions.map((tx) => {
    const { amount, currency } = resolveDisplayAmount(tx, display);
    const authorizedBy = tx.authorizedBy?.name ?? "Unknown";
    return [
      tx.description,
      `${currency} ${amount.toFixed(2)}`,
      formatDate(tx.date),
      tx.category,
      tx.bankAccount,
      authorizedBy,
      tx.vendor,
    ].map(csvCell);
  });

  return [COLUMNS.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

/** Trigger a client-side download of the given CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

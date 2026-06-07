/**
 * Client-safe bank display metadata (no secrets, no fs) so both the
 * normalizer (server) and the UI can share one source of truth.
 */

import type { BankId } from "./types";

export const BANK_LABELS: Record<BankId, string> = {
  chase: "Chase",
  boa: "BoA",
  amex: "Amex",
};

export const BANK_OPTIONS: ReadonlyArray<{ value: BankId; label: string }> = [
  { value: "chase", label: "Chase" },
  { value: "boa", label: "BoA" },
  { value: "amex", label: "Amex" },
];

/** Build a "Bank ****1234" label from a bank id and a raw masked string. */
export function formatBankAccount(bank: BankId, rawMask: string): string {
  const tail = rawMask.replace(/\D/g, "").slice(-4);
  return tail ? `${BANK_LABELS[bank]} ****${tail}` : BANK_LABELS[bank];
}

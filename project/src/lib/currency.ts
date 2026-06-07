/**
 * Currency conversion + formatting, backed by the static `data/rates.json`.
 *
 * Rates are expressed as "USD per 1 unit of currency" (base = USD):
 *   USD: 1.00, EUR: 1.08, GBP: 1.27, CAD: 0.74
 * So 1 EUR = 1.08 USD, 1 CAD = 0.74 USD.
 *
 * To convert between any two currencies:
 *   amountInTo = amountInFrom * rate[from] / rate[to]
 *
 * The JSON is imported directly (it contains no secrets), so this module works
 * on both the server and the client — the Transactions tab uses it for the
 * "Show Currency In" feature without an extra network round-trip.
 */

import ratesData from "../../data/rates.json";
import type { CurrencyCode, RatesFile } from "./types";

const ratesFile = ratesData as RatesFile;

export const BASE_CURRENCY: CurrencyCode = ratesFile.base;
export const RATES: Record<string, number> = ratesFile.rates;
export const SUPPORTED_CURRENCIES = Object.keys(RATES) as CurrencyCode[];

export function isSupportedCurrency(code: string): code is CurrencyCode {
  return code in RATES;
}

/**
 * Convert `amount` from one currency to another using the static rates.
 * If either currency is unknown, the amount is returned unchanged (defensive).
 */
export function convert(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const fromRate = RATES[from];
  const toRate = RATES[to];
  if (fromRate == null || toRate == null) return amount;
  return (amount * fromRate) / toRate;
}

export function convertToUSD(amount: number, from: string): number {
  return convert(amount, from, "USD");
}

/**
 * A user's "Show Currency In" selection: keep originals, or convert everything
 * to one target currency.
 */
export type DisplayCurrency = "original" | CurrencyCode;

/** Resolve the amount + currency to actually display for a transaction. */
export function resolveDisplayAmount(
  tx: { amount: number; currency: string },
  display: DisplayCurrency,
): { amount: number; currency: string } {
  if (display === "original") {
    return { amount: tx.amount, currency: tx.currency };
  }
  return { amount: convert(tx.amount, tx.currency, display), currency: display };
}

/** Format an amount as a currency string, e.g. 12480 USD -> "$12,480.00". */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown/unsupported ISO code: fall back to a plain prefixed number.
    return `${currency} ${amount.toFixed(2)}`;
  }
}

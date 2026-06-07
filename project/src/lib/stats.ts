/**
 * Stats aggregation — pure logic (no fs / no fetch), so it's easy to test and
 * reuse. The server layer loads + normalizes transactions and calls in here.
 *
 * Currency approach: transactions arrive in mixed currencies (USD/EUR/GBP/CAD).
 * We convert EVERY amount to USD via `convertToUSD` (backed by rates.json)
 * BEFORE doing any arithmetic, so all sums, rankings, and charts are in a
 * single, comparable currency. This matches the spec's requirement to convert
 * to one currency before any math (explained further in the README).
 *
 * "Spend" (vendor + category breakdowns) is defined as debit transactions
 * (money out). Credits (money in) are excluded from spend rankings but still
 * counted in cash-in / monthly inflow figures.
 */

import { convertToUSD } from "./currency";
import type {
  BalancePoint,
  BankId,
  CategorySpend,
  MonthlyFlow,
  NormalizedTransaction,
  StatsSummary,
  VendorSpend,
} from "./types";

interface VendorAcc {
  total: number;
  count: number;
  lastDate: string;
}

const BANKS: readonly BankId[] = ["chase", "boa", "amex"];

export function computeStats(
  transactions: NormalizedTransaction[],
): StatsSummary {
  let totalCashIn = 0;
  let totalCashOut = 0;

  const vendorMap = new Map<string, VendorAcc>();
  const categoryMap = new Map<string, number>();
  const monthMap = new Map<string, { cashIn: number; cashOut: number }>();
  const allVendors = new Set<string>();
  const allMonths = new Set<string>();

  // Per-bank net cash flow per month (USD), used to build running balances.
  const bankMonthNet: Record<BankId, Map<string, number>> = {
    chase: new Map(),
    boa: new Map(),
    amex: new Map(),
  };

  for (const tx of transactions) {
    const usd = convertToUSD(tx.amount, tx.currency);
    const month = tx.date.slice(0, 7); // "YYYY-MM"

    allVendors.add(tx.vendor);
    allMonths.add(month);

    const flow = monthMap.get(month) ?? { cashIn: 0, cashOut: 0 };
    const signed = tx.type === "credit" ? usd : -usd;
    const bankNet = bankMonthNet[tx.bank];
    bankNet.set(month, (bankNet.get(month) ?? 0) + signed);

    if (tx.type === "credit") {
      totalCashIn += usd;
      flow.cashIn += usd;
    } else {
      totalCashOut += usd;
      flow.cashOut += usd;

      categoryMap.set(tx.category, (categoryMap.get(tx.category) ?? 0) + usd);

      const vendor = vendorMap.get(tx.vendor) ?? {
        total: 0,
        count: 0,
        lastDate: "",
      };
      vendor.total += usd;
      vendor.count += 1;
      if (tx.date > vendor.lastDate) vendor.lastDate = tx.date;
      vendorMap.set(tx.vendor, vendor);
    }

    monthMap.set(month, flow);
  }

  const topVendors: VendorSpend[] = Array.from(vendorMap.entries())
    .map(([vendor, acc]) => ({
      vendor,
      total: acc.total,
      count: acc.count,
      lastDate: acc.lastDate,
    }))
    .sort((a, b) => b.total - a.total);

  const byCategory: CategorySpend[] = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const byMonth: MonthlyFlow[] = Array.from(monthMap.entries())
    .map(([month, flow]) => ({
      month,
      cashIn: flow.cashIn,
      cashOut: flow.cashOut,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));

  // Build a continuous running balance per bank over the full month range,
  // carrying the balance forward through months with no activity.
  const sortedMonths = Array.from(allMonths).sort();
  const balanceByBank = {} as Record<BankId, BalancePoint[]>;
  for (const bank of BANKS) {
    let running = 0;
    balanceByBank[bank] = sortedMonths.map((month) => {
      running += bankMonthNet[bank].get(month) ?? 0;
      return { month, balance: running };
    });
  }

  return {
    currency: "USD",
    totalCashIn,
    totalCashOut,
    netCashFlow: totalCashIn - totalCashOut,
    transactionCount: transactions.length,
    vendorCount: allVendors.size,
    topVendors,
    byCategory,
    byMonth,
    balanceByBank,
  };
}

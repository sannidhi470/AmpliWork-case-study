/**
 * Review Priority — pure logic (no fs / no fetch).
 *
 * Goal: help finance decide WHICH transactions to open first. We rank outgoing
 * payments (debits) by USD value (materiality) and bucket them into ABC tiers
 * by cumulative share of total spend, so a reviewer can see that a handful of
 * payments account for most of the money. Secondary "context" flags (weekend,
 * foreign currency, possible duplicate, non-finance approver, unresolved
 * approver) add a light risk layer without driving the ranking.
 *
 * This is intentionally transparent and rule-based (not a fraud oracle): the
 * dataset is clean, so the value here is prioritization, not anomaly hunting.
 */

import { convertToUSD } from "./currency";
import type {
  MaterialityTier,
  NormalizedTransaction,
  ReviewFlag,
  ReviewItem,
  ReviewQueue,
  ReviewSummary,
} from "./types";

const FINANCE_ROLES = new Set(["admin", "finance_lead"]);

/** Human-readable labels for context flags (shared by the UI and CSV export). */
export const FLAG_LABELS: Record<ReviewFlag, string> = {
  foreign_currency: "Foreign currency",
  weekend: "Weekend",
  possible_duplicate: "Possible duplicate",
  non_finance_approver: "Non-finance approver",
  unresolved_approver: "Unresolved approver",
};

/** Short labels + descriptions for materiality tiers. */
export const TIER_LABELS: Record<MaterialityTier, string> = {
  A: "Critical",
  B: "High",
  C: "Medium",
  D: "Low",
};

/** Tier boundaries by cumulative share of spend (see MaterialityTier docs). */
function tierForCumulativeShare(cumulative: number): MaterialityTier {
  if (cumulative <= 0.5) return "A";
  if (cumulative <= 0.8) return "B";
  if (cumulative <= 0.95) return "C";
  return "D";
}

function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6; // Sun or Sat
}

function emptyFlagCounts(): Record<ReviewFlag, number> {
  return {
    foreign_currency: 0,
    weekend: 0,
    possible_duplicate: 0,
    non_finance_approver: 0,
    unresolved_approver: 0,
  };
}

/**
 * Build the materiality-ranked review queue.
 * @param limit max number of items returned (the summary still covers all).
 */
export function buildReviewQueue(
  transactions: NormalizedTransaction[],
  limit = 100,
): ReviewQueue {
  const debits = transactions.filter((tx) => tx.type === "debit");

  // Pre-compute USD amounts once.
  const withUsd = debits.map((tx) => ({
    tx,
    usd: convertToUSD(tx.amount, tx.currency),
  }));

  const totalSpend = withUsd.reduce((sum, d) => sum + d.usd, 0);

  // Duplicate detection: identical vendor + USD amount + day occurring >1 time.
  const dupCounts = new Map<string, number>();
  const dupKey = (tx: NormalizedTransaction, usd: number) =>
    `${tx.vendor.trim().toLowerCase()}|${Math.round(usd)}|${tx.date}`;
  for (const { tx, usd } of withUsd) {
    const key = dupKey(tx, usd);
    dupCounts.set(key, (dupCounts.get(key) ?? 0) + 1);
  }

  function flagsFor(tx: NormalizedTransaction, usd: number): ReviewFlag[] {
    const flags: ReviewFlag[] = [];
    if (tx.currency !== "USD") flags.push("foreign_currency");
    if (isWeekend(tx.date)) flags.push("weekend");
    if ((dupCounts.get(dupKey(tx, usd)) ?? 0) > 1) {
      flags.push("possible_duplicate");
    }
    if (tx.authorizedBy === null) {
      flags.push("unresolved_approver");
    } else if (!FINANCE_ROLES.has(tx.authorizedBy.role)) {
      flags.push("non_finance_approver");
    }
    return flags;
  }

  // Sort by USD value, descending (materiality).
  withUsd.sort((a, b) => b.usd - a.usd);

  const flagCounts = emptyFlagCounts();

  // First pass: per-item share + cumulative share (tier filled in below).
  const allItems: ReviewItem[] = [];
  let runningSpend = 0;
  for (const { tx, usd } of withUsd) {
    runningSpend += usd;
    const flags = flagsFor(tx, usd);
    for (const f of flags) flagCounts[f] += 1;

    allItems.push({
      transaction: tx,
      amountUsd: usd,
      shareOfSpend: totalSpend > 0 ? usd / totalSpend : 0,
      cumulativeShare: totalSpend > 0 ? runningSpend / totalSpend : 0,
      tier: "D",
      flags,
    });
  }

  // Assign tiers PER DISTINCT AMOUNT so equal-value payments never split across
  // tiers. A group's tier is decided by the cumulative share at the END of the
  // group (i.e. "do all payments of this size or larger fit within the band?").
  const tierCounts: Record<MaterialityTier, number> = { A: 0, B: 0, C: 0, D: 0 };
  const cents = (n: number) => Math.round(n * 100);
  for (let i = 0; i < allItems.length; ) {
    let j = i;
    while (
      j < allItems.length &&
      cents(allItems[j].amountUsd) === cents(allItems[i].amountUsd)
    ) {
      j += 1;
    }
    const groupTier = tierForCumulativeShare(allItems[j - 1].cumulativeShare);
    for (let k = i; k < j; k += 1) {
      allItems[k].tier = groupTier;
      tierCounts[groupTier] += 1;
    }
    i = j;
  }

  // Concentration headline: top min(20, n) payments' share of spend.
  const topN = Math.min(20, allItems.length);
  const topShare =
    topN > 0 ? allItems[topN - 1].cumulativeShare : 0;

  const summary: ReviewSummary = {
    currency: "USD",
    totalSpend,
    debitCount: debits.length,
    topConcentration: { count: topN, share: topShare },
    tierCounts,
    flagCounts,
  };

  return { summary, items: allItems.slice(0, limit) };
}

/**
 * SERVER-ONLY: load + normalize all transactions, then compute the USD-based
 * stats summary. Aggregation runs here (not on the client) so the browser only
 * ever receives a small summary payload, never the full transaction list.
 */

import { computeStats } from "@/lib/stats";
import type { StatsSummary } from "@/lib/types";
import { getNormalizedTransactions } from "./transactions";

export async function getStatsSummary(): Promise<StatsSummary> {
  const transactions = await getNormalizedTransactions();
  return computeStats(transactions);
}

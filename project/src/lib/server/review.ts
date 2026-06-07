/**
 * SERVER-ONLY: load + normalize all transactions, then build the materiality
 * review queue. Aggregation runs here so the client receives only the top-N
 * queue plus summary, not the full transaction list.
 */

import { buildReviewQueue } from "@/lib/review";
import type { ReviewQueue } from "@/lib/types";
import { getNormalizedTransactions } from "./transactions";

export async function getReviewQueue(limit = 100): Promise<ReviewQueue> {
  const transactions = await getNormalizedTransactions();
  return buildReviewQueue(transactions, limit);
}

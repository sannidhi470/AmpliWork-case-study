import { NextResponse } from "next/server";

import { getReviewQueue } from "@/lib/server/review";
import type { ApiError, ReviewQueue } from "@/lib/types";

/**
 * GET /api/review
 * Materiality-ranked review queue (debits ranked by USD value, ABC tiers,
 * context flags) plus a spend-concentration summary. Powers the Review
 * Priority (Custom) tab.
 */
export async function GET(): Promise<NextResponse<ReviewQueue | ApiError>> {
  const queue = await getReviewQueue();
  return NextResponse.json(queue);
}

import { NextResponse } from "next/server";

import { getStatsSummary } from "@/lib/server/stats";
import type { ApiError, StatsSummary } from "@/lib/types";

/**
 * GET /api/stats
 * Company-wide spending summary across all banks and all time, with every
 * amount pre-converted to USD. Powers the Stats tab (KPIs, charts, vendor table).
 */
export async function GET(): Promise<NextResponse<StatsSummary | ApiError>> {
  const summary = await getStatsSummary();
  return NextResponse.json(summary);
}

import { NextResponse } from "next/server";

import { loadChase } from "@/lib/server/banks";

/** GET /api/banks/chase/transactions — returns the raw Chase JSON as-is. */
export async function GET() {
  const data = await loadChase();
  return NextResponse.json(data);
}

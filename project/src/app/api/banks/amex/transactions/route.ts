import { NextResponse } from "next/server";

import { loadAmex } from "@/lib/server/banks";

/** GET /api/banks/amex/transactions — returns the raw Amex JSON as-is. */
export async function GET() {
  const data = await loadAmex();
  return NextResponse.json(data);
}

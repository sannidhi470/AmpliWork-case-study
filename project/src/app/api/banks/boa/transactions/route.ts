import { NextResponse } from "next/server";

import { loadBoa } from "@/lib/server/banks";

/** GET /api/banks/boa/transactions — returns the raw BoA JSON as-is. */
export async function GET() {
  const data = await loadBoa();
  return NextResponse.json(data);
}

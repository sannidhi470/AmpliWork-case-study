import { NextResponse } from "next/server";

import { getTransactionById } from "@/lib/server/transactions";
import type { ApiError, NormalizedTransaction } from "@/lib/types";

/**
 * GET /api/transactions/[id]
 * Returns a single normalized transaction including its raw `source` object.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<NormalizedTransaction | ApiError>> {
  const { id } = await params;
  const transaction = await getTransactionById(id);

  if (!transaction) {
    return NextResponse.json(
      { error: `Transaction '${id}' not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json(transaction);
}

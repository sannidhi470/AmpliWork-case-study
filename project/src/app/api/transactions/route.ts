import { NextResponse } from "next/server";

import { applyTransactionFilters } from "@/lib/filters";
import { getNormalizedTransactions } from "@/lib/server/transactions";
import type {
  ApiError,
  BankId,
  NormalizedTransaction,
  TransactionFilters,
} from "@/lib/types";

const VALID_BANKS: readonly BankId[] = ["chase", "boa", "amex"];

function isBankId(value: string): value is BankId {
  return (VALID_BANKS as readonly string[]).includes(value);
}

/**
 * GET /api/transactions
 * Returns the normalized, merged, date-sorted (earliest first) list.
 * Optional filters: bank, authorizedBy (user id), amount (>=), fromDate (>=).
 */
export async function GET(
  request: Request,
): Promise<NextResponse<NormalizedTransaction[] | ApiError>> {
  const { searchParams } = new URL(request.url);
  const filters: TransactionFilters = {};

  const bank = searchParams.get("bank");
  if (bank) {
    if (!isBankId(bank)) {
      return NextResponse.json(
        { error: `Unknown bank '${bank}'. Expected chase, boa, or amex.` },
        { status: 400 },
      );
    }
    filters.bank = bank;
  }

  const authorizedBy = searchParams.get("authorizedBy");
  if (authorizedBy) filters.authorizedBy = authorizedBy;

  const amount = searchParams.get("amount");
  if (amount !== null && amount !== "") {
    const parsed = Number(amount);
    if (Number.isNaN(parsed)) {
      return NextResponse.json(
        { error: `Invalid amount '${amount}'.` },
        { status: 400 },
      );
    }
    filters.amount = parsed;
  }

  const fromDate = searchParams.get("fromDate");
  if (fromDate) filters.fromDate = fromDate;

  const all = await getNormalizedTransactions();
  const filtered = applyTransactionFilters(all, filters);
  return NextResponse.json(filtered);
}

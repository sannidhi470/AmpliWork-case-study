"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { BankId, NormalizedTransaction } from "@/lib/types";

/**
 * Server-side filters that map to /api/transactions query params.
 * (Currency selection is a client-only display concern and is NOT sent here,
 * so switching currency never triggers a refetch.)
 */
export interface TransactionQuery {
  bank?: BankId | "all";
  authorizedBy?: string | "all";
  fromDate?: string;
}

function buildUrl(query: TransactionQuery): string {
  const params = new URLSearchParams();
  if (query.bank && query.bank !== "all") params.set("bank", query.bank);
  if (query.authorizedBy && query.authorizedBy !== "all") {
    params.set("authorizedBy", query.authorizedBy);
  }
  if (query.fromDate) params.set("fromDate", query.fromDate);
  const qs = params.toString();
  return qs ? `/api/transactions?${qs}` : "/api/transactions";
}

/**
 * Fetches the normalized transactions for the given filters via SWR.
 * The SWR key is the URL, so any filter change refetches automatically
 * (no full page reload).
 */
export function useTransactions(query: TransactionQuery) {
  const { data, error, isLoading } = useSWR<NormalizedTransaction[]>(
    buildUrl(query),
    fetcher,
    { keepPreviousData: true },
  );

  return {
    transactions: data ?? [],
    isLoading,
    error: error as Error | undefined,
  };
}

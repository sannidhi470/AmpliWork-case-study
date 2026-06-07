"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { StatsSummary } from "@/lib/types";

/** Fetches the aggregated, USD-normalized stats summary via SWR. */
export function useStats() {
  const { data, error, isLoading } = useSWR<StatsSummary>(
    "/api/stats",
    fetcher,
  );

  return {
    stats: data,
    isLoading,
    error: error as Error | undefined,
  };
}

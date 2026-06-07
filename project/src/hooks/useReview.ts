"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { ReviewQueue } from "@/lib/types";

/** Fetches the materiality review queue via SWR. */
export function useReview() {
  const { data, error, isLoading } = useSWR<ReviewQueue>(
    "/api/review",
    fetcher,
  );

  return {
    queue: data,
    isLoading,
    error: error as Error | undefined,
  };
}

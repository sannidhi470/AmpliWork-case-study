"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { PublicUser } from "@/lib/types";

/** Fetches the user roster (password-free) for filter dropdowns / lookups. */
export function useUsers() {
  const { data, error, isLoading } = useSWR<PublicUser[]>(
    "/api/users",
    fetcher,
  );
  return { users: data ?? [], isLoading, error: error as Error | undefined };
}

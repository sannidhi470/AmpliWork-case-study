"use client";

import { useCallback, useEffect, useState } from "react";

import { getStarredIds, toggleStarred } from "@/lib/starred";

/** Reactive access to the set of starred transaction ids. */
export function useStarred() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIds(new Set(getStarredIds()));
  }, []);

  const toggle = useCallback((id: string) => {
    setIds(new Set(toggleStarred(id)));
  }, []);

  const isStarred = useCallback((id: string) => ids.has(id), [ids]);

  return { isStarred, toggle, count: ids.size };
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { clearStoredUser, getStoredUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface UseAuthResult {
  user: AuthUser | null;
  status: AuthStatus;
  logout: () => void;
}

/**
 * Reads the logged-in user from localStorage on mount.
 *
 * `status` starts as "loading" so guards can avoid rendering protected content
 * (or flashing a redirect) before we know whether a user exists. localStorage
 * is only available in the browser, hence the effect.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setStatus(stored ? "authenticated" : "unauthenticated");
  }, []);

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return { user, status, logout };
}

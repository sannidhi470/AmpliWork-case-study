/**
 * Client-side auth helpers backed by localStorage.
 *
 * We persist ONLY the fields the spec calls for (id, name, role, allowedTabs)
 * and never the password. All reads are SSR-safe (return null on the server).
 */

import type { AuthUser, PublicUser } from "./types";

const STORAGE_KEY = "circuitlabs.auth.user";

/** Narrow an unknown parsed value to an AuthUser, or null if malformed. */
function parseAuthUser(value: unknown): AuthUser | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.role === "string" &&
    Array.isArray(v.allowedTabs)
  ) {
    return {
      id: v.id,
      name: v.name,
      role: v.role as AuthUser["role"],
      allowedTabs: v.allowedTabs as AuthUser["allowedTabs"],
    };
  }
  return null;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseAuthUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Store the minimal auth payload, stripping anything extra (e.g. password). */
export function setStoredUser(user: PublicUser | AuthUser): void {
  if (typeof window === "undefined") return;
  const minimal: AuthUser = {
    id: user.id,
    name: user.name,
    role: user.role,
    allowedTabs: user.allowedTabs,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

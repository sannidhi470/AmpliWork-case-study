/**
 * Role-based access control.
 *
 * The access rules live in `data/users/user.json` under `tabAccessMatrix`.
 * We mirror them here as a typed constant so the client can gate navigation
 * WITHOUT importing user.json (which contains passwords) into the browser
 * bundle. The server still validates against the real file on login.
 *
 * A tab is accessible only when BOTH conditions hold:
 *   1. the user's role is permitted for that tab (tabAccessMatrix), and
 *   2. the tab is present in the user's own `allowedTabs` list.
 * This matches the spec, which says to use both `role` and `allowedTabs`.
 */

import type { AuthUser, Role, TabId } from "./types";

export const TAB_ACCESS_MATRIX: Record<TabId, Role[]> = {
  transactions: ["admin", "finance_lead", "viewer"],
  stats: ["admin", "finance_lead", "analyst"],
  custom: ["admin", "finance_lead"],
};

/** Display order for navigation. */
export const ALL_TABS: readonly TabId[] = ["transactions", "stats", "custom"];

export interface TabMeta {
  id: TabId;
  label: string;
  href: string;
}

export const TAB_META: Record<TabId, TabMeta> = {
  transactions: {
    id: "transactions",
    label: "Transactions",
    href: "/dashboard/transactions",
  },
  stats: { id: "stats", label: "Stats", href: "/dashboard/stats" },
  custom: { id: "custom", label: "Custom", href: "/dashboard/custom" },
};

export function canAccessTab(
  user: AuthUser | null | undefined,
  tab: TabId,
): boolean {
  if (!user) return false;
  const roleAllowed = TAB_ACCESS_MATRIX[tab]?.includes(user.role) ?? false;
  const userAllowed = user.allowedTabs?.includes(tab) ?? false;
  return roleAllowed && userAllowed;
}

/** Tabs this user can reach, in display order. */
export function getAccessibleTabs(user: AuthUser | null | undefined): TabId[] {
  return ALL_TABS.filter((tab) => canAccessTab(user, tab));
}

/** The landing tab to send a user to after login (their first allowed tab). */
export function getDefaultTab(user: AuthUser | null | undefined): TabId | null {
  return getAccessibleTabs(user)[0] ?? null;
}

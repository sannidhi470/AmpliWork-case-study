"use client";

import { useAuth } from "@/hooks/useAuth";
import { canAccessTab } from "@/lib/rbac";
import type { TabId } from "@/lib/types";
import { AccessDenied } from "./AccessDenied";

interface TabGuardProps {
  tab: TabId;
  children: React.ReactNode;
}

/**
 * Wraps a tab's content and enforces RBAC for that specific tab.
 * The dashboard layout already guarantees a logged-in user exists; this guard
 * adds the per-tab role check on top.
 */
export function TabGuard({ tab, children }: TabGuardProps) {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!canAccessTab(user, tab)) {
    return <AccessDenied user={user} />;
  }

  return <>{children}</>;
}

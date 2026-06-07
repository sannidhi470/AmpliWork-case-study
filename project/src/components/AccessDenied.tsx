"use client";

import Link from "next/link";

import { getDefaultTab } from "@/lib/rbac";
import type { AuthUser } from "@/lib/types";

interface AccessDeniedProps {
  user: AuthUser | null;
}

export function AccessDenied({ user }: AccessDeniedProps) {
  const fallbackTab = getDefaultTab(user);

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-2xl">
        🔒
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-wide text-slate-100">
          Access denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-slate-400">
          Your role ({user?.role ?? "unknown"}) doesn&apos;t have permission to
          view this tab.
        </p>
      </div>
      {fallbackTab ? (
        <Link
          href={`/dashboard/${fallbackTab}`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Go to my dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Back to login
        </Link>
      )}
    </div>
  );
}

"use client";

import type { ResolvedUser } from "@/lib/types";

interface AuthorizedByCellProps {
  user: ResolvedUser | null;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Renders the authorizer's name; on hover shows a tooltip with their
 * initials avatar, email, and role (sourced from user.json via the API).
 */
export function AuthorizedByCell({ user }: AuthorizedByCellProps) {
  if (!user) {
    return <span className="text-slate-500">Unknown</span>;
  }

  return (
    <span className="group relative inline-flex cursor-default">
      <span className="border-b border-dotted border-slate-600 text-slate-200">
        {user.name}
      </span>

      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
        <span className="flex w-60 items-center gap-3 rounded-lg border border-white/10 bg-[#111924] p-3 shadow-xl">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {initialsOf(user.name)}
          </span>
          <span className="flex min-w-0 flex-col text-left">
            <span className="truncate text-sm font-medium text-slate-100">
              {user.name}
            </span>
            <span className="truncate text-xs text-slate-400">
              {user.email}
            </span>
            <span className="mt-1 w-fit rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
              {user.role}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}

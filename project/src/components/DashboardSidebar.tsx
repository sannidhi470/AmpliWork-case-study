"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getAccessibleTabs, TAB_META } from "@/lib/rbac";
import type { AuthUser } from "@/lib/types";

interface DashboardSidebarProps {
  user: AuthUser;
  onLogout: () => void;
}

export function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = getAccessibleTabs(user);

  function handleLogout() {
    onLogout();
    router.replace("/login");
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex w-20 flex-col items-center justify-between border-r border-white/5 bg-[#0a1018] py-6">
      <div className="flex flex-col items-center gap-8">
        <div className="text-blue-500">
          <LogoIcon />
        </div>

        <nav className="flex flex-col items-center gap-6">
          {tabs.map((tab) => {
            const meta = TAB_META[tab];
            const active = pathname?.startsWith(meta.href);
            return (
              <Link
                key={tab}
                href={meta.href}
                title={meta.label}
                className={`flex flex-col items-center gap-1 text-[10px] tracking-wide transition ${
                  active
                    ? "text-blue-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <TabIcon tab={tab} />
                <span>{meta.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="text-slate-500 transition hover:text-red-400"
        >
          <LogoutIcon />
        </button>
        <div
          title={`${user.name} · ${user.role}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/80 text-xs font-semibold text-white"
        >
          {initials}
        </div>
      </div>
    </aside>
  );
}

function LogoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 22 20H2L12 3z" />
    </svg>
  );
}

function TabIcon({ tab }: { tab: string }) {
  if (tab === "stats") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    );
  }
  if (tab === "custom") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

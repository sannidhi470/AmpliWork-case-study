"use client";

import { useEffect, useRef, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    onLogout();
    router.replace("/login");
  }

  // Close the settings popover on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-full w-20 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#0a1018] py-6">
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
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            title="Settings"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`transition ${
              menuOpen ? "text-blue-300" : "text-blue-400 hover:text-blue-300"
            }`}
          >
            <SettingsIcon />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute bottom-0 left-12 z-30 w-52 rounded-lg border border-white/10 bg-[#111924] p-2 shadow-xl"
            >
              <div className="border-b border-white/10 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-100">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-slate-500">
                  {user.role.replace("_", " ")}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-red-400"
              >
                <LogoutIcon />
                Log out
              </button>
            </div>
          )}
        </div>

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

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

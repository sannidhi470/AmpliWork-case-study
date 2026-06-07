"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getDefaultTab } from "@/lib/rbac";

/**
 * /dashboard has no content of its own — it forwards the user to the first
 * tab their role can access (or back to /login if somehow there is none).
 */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const tab = getDefaultTab(user);
    router.replace(tab ? `/dashboard/${tab}` : "/login");
  }, [user, status, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
      Loading…
    </div>
  );
}

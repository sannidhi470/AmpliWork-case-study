"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getStoredUser } from "@/lib/auth";
import { getDefaultTab } from "@/lib/rbac";

/** Entry point: route to the dashboard if logged in, otherwise to /login. */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      const tab = getDefaultTab(user);
      router.replace(tab ? `/dashboard/${tab}` : "/login");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-sm text-slate-500">
      Loading…
    </div>
  );
}

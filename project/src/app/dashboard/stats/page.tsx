"use client";

import { TabGuard } from "@/components/TabGuard";

export default function StatsPage() {
  return (
    <TabGuard tab="stats">
      <header className="mb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">STATS</h1>
      </header>
      <div className="rounded-lg border border-white/5 bg-[#0c131c] p-10 text-center text-sm text-slate-500">
        Stats &amp; charts coming soon.
      </div>
    </TabGuard>
  );
}

"use client";

import { TabGuard } from "@/components/TabGuard";
import { BankBalanceChart } from "@/components/stats/BankBalanceChart";
import { CategorySpendChart } from "@/components/stats/CategorySpendChart";
import { KpiCard } from "@/components/stats/KpiCard";
import { MoneyFlowChart } from "@/components/stats/MoneyFlowChart";
import { TopVendorsTable } from "@/components/stats/TopVendorsTable";
import { useStats } from "@/hooks/useStats";
import { formatUsdCompact } from "@/lib/format";

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-white/10 bg-[#0d1622] p-10 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

function StatsContent() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) return <StateBox>Loading stats…</StateBox>;

  if (error) {
    return (
      <StateBox>
        <span className="text-red-300">
          Couldn&apos;t load stats: {error.message}
        </span>
      </StateBox>
    );
  }

  if (!stats || stats.transactionCount === 0) {
    return <StateBox>No transactions available to summarize yet.</StateBox>;
  }

  const net = stats.netCashFlow;
  const netLabel = `${net >= 0 ? "+" : "-"}${formatUsdCompact(Math.abs(net))}`;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <KpiCard
        label="Total Cash In"
        value={formatUsdCompact(stats.totalCashIn)}
        sub={`Across ${stats.transactionCount.toLocaleString()} transactions`}
        tone="in"
      />
      <KpiCard
        label="Total Cash Out"
        value={formatUsdCompact(stats.totalCashOut)}
        sub={`Net cash flow ${netLabel}`}
        tone="out"
      />

      <BankBalanceChart balanceByBank={stats.balanceByBank} />
      <MoneyFlowChart data={stats.byMonth} />

      <TopVendorsTable vendors={stats.topVendors} />
      <CategorySpendChart data={stats.byCategory} />
    </div>
  );
}

export default function StatsPage() {
  return (
    <TabGuard tab="stats">
      <div className="mb-4 flex justify-end text-[11px] uppercase tracking-wider text-slate-500">
        All banks · all time · shown in USD
      </div>
      <h1 className="mb-5 text-3xl font-light tracking-wide text-white">
        STATS
      </h1>
      <StatsContent />
    </TabGuard>
  );
}

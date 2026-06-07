"use client";

import { useMemo, useState } from "react";

import { TabGuard } from "@/components/TabGuard";
import { KpiCard } from "@/components/stats/KpiCard";
import { ReviewQueueTable } from "@/components/review/ReviewQueueTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { PillSelect } from "@/components/ui/PillSelect";
import { useReview } from "@/hooks/useReview";
import { BANK_OPTIONS } from "@/lib/bankMeta";
import { downloadCsv, reviewQueueToCsv } from "@/lib/csv";
import { formatUsdCompact } from "@/lib/format";
import { FLAG_LABELS, TIER_LABELS } from "@/lib/review";
import type { BankId, MaterialityTier, ReviewFlag, ReviewItem } from "@/lib/types";

const TIER_OPTIONS = [
  { value: "all", label: "All tiers" },
  { value: "A", label: `A · ${TIER_LABELS.A}` },
  { value: "B", label: `B · ${TIER_LABELS.B}` },
  { value: "C", label: `C · ${TIER_LABELS.C}` },
  { value: "D", label: `D · ${TIER_LABELS.D}` },
];

const FLAG_OPTIONS = [
  { value: "all", label: "All flags" },
  ...(Object.keys(FLAG_LABELS) as ReviewFlag[]).map((f) => ({
    value: f,
    label: FLAG_LABELS[f],
  })),
];

const BANK_FILTER_OPTIONS = [{ value: "all", label: "All banks" }, ...BANK_OPTIONS];

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-white/10 bg-[#0d1622] p-10 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

function ReviewContent() {
  const { queue, isLoading, error } = useReview();
  const [tier, setTier] = useState<"all" | MaterialityTier>("all");
  const [bank, setBank] = useState<"all" | BankId>("all");
  const [flag, setFlag] = useState<"all" | ReviewFlag>("all");
  const [selected, setSelected] = useState<ReviewItem | null>(null);

  const items = queue?.items ?? [];

  const filtered = useMemo(
    () =>
      items.filter(
        (it) =>
          (tier === "all" || it.tier === tier) &&
          (bank === "all" || it.transaction.bank === bank) &&
          (flag === "all" || it.flags.includes(flag)),
      ),
    [items, tier, bank, flag],
  );

  if (isLoading) return <StateBox>Loading review queue…</StateBox>;
  if (error) {
    return (
      <StateBox>
        <span className="text-red-300">
          Couldn&apos;t load review queue: {error.message}
        </span>
      </StateBox>
    );
  }
  if (!queue || queue.summary.debitCount === 0) {
    return <StateBox>No outgoing payments to review yet.</StateBox>;
  }

  const { summary } = queue;

  const handleExport = () => {
    downloadCsv("review-priority.csv", reviewQueueToCsv(filtered));
  };

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <KpiCard
          label="Total Spend (USD)"
          value={formatUsdCompact(summary.totalSpend)}
          sub={`Across ${summary.debitCount.toLocaleString()} outgoing payments`}
        />
        <KpiCard
          label="Critical (Tier A)"
          value={summary.tierCounts.A.toLocaleString()}
          sub="largest payments making up the first 50% of spend"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PillSelect
            value={tier}
            options={TIER_OPTIONS}
            onChange={(v) => setTier(v as "all" | MaterialityTier)}
            ariaLabel="Filter by tier"
          />
          <PillSelect
            value={bank}
            options={BANK_FILTER_OPTIONS}
            onChange={(v) => setBank(v as "all" | BankId)}
            ariaLabel="Filter by bank"
          />
          <PillSelect
            value={flag}
            options={FLAG_OPTIONS}
            onChange={(v) => setFlag(v as "all" | ReviewFlag)}
            ariaLabel="Filter by flag"
          />
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="rounded-md border border-white/10 bg-[#101826] px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <ReviewQueueTable
        items={filtered}
        totalCount={items.length}
        onSelect={setSelected}
      />

      <TransactionModal
        transaction={selected?.transaction ?? null}
        displayCurrency="USD"
        onClose={() => setSelected(null)}
      />
    </>
  );
}

export default function CustomPage() {
  return (
    <TabGuard tab="custom">
      <ReviewContent />
    </TabGuard>
  );
}

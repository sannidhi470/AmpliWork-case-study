"use client";

import { BANK_LABELS } from "@/lib/bankMeta";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { TIER_LABELS } from "@/lib/review";
import type { MaterialityTier, ReviewItem } from "@/lib/types";
import { FlagChips } from "./FlagChips";

const TIER_STYLE: Record<MaterialityTier, string> = {
  A: "border-rose-500/50 bg-rose-500/15 text-rose-300",
  B: "border-amber-500/50 bg-amber-500/15 text-amber-300",
  C: "border-sky-500/50 bg-sky-500/15 text-sky-300",
  D: "border-slate-600/50 bg-slate-600/15 text-slate-400",
};

interface ReviewQueueTableProps {
  items: ReviewItem[];
  totalCount: number;
  onSelect: (item: ReviewItem) => void;
}

export function ReviewQueueTable({
  items,
  totalCount,
  onSelect,
}: ReviewQueueTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-xl border border-white/10 bg-[#0d1622] p-10 text-center text-sm text-slate-400">
        No transactions match the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1622]">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#0d1622]">
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <Th className="w-16">Priority</Th>
              <Th>Transaction</Th>
              <Th className="text-right">Amount (USD)</Th>
              <Th className="text-right">% Spend</Th>
              <Th>Date</Th>
              <Th>Authorized By</Th>
              <Th>Bank</Th>
              <Th>Why look</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const { transaction: tx } = item;
              return (
                <tr
                  key={tx.id}
                  onClick={() => onSelect(item)}
                  className="cursor-pointer border-t border-dashed border-white/10 transition hover:bg-white/[0.03]"
                >
                  <Td>
                    <span
                      title={`Materiality tier ${item.tier} — ${TIER_LABELS[item.tier]}`}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${TIER_STYLE[item.tier]}`}
                    >
                      {item.tier}
                    </span>
                  </Td>
                  <Td className="max-w-[16rem] truncate text-slate-200">
                    {tx.description}
                    <span className="block truncate text-[11px] text-slate-500">
                      {tx.vendor} · {tx.category}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-right font-medium tabular-nums text-slate-100">
                    {formatCurrency(item.amountUsd, "USD")}
                  </Td>
                  <Td className="whitespace-nowrap text-right tabular-nums text-slate-400">
                    {(item.shareOfSpend * 100).toFixed(1)}%
                  </Td>
                  <Td className="whitespace-nowrap text-slate-400">
                    {formatDate(tx.date)}
                  </Td>
                  <Td className="whitespace-nowrap text-slate-300">
                    {tx.authorizedBy?.name ?? (
                      <span className="text-slate-500">Unknown</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-slate-400">
                    {BANK_LABELS[tx.bank]}
                  </Td>
                  <Td>
                    <FlagChips flags={item.flags} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-dashed border-white/10 px-4 py-3 text-xs text-slate-500">
        Showing {items.length} of top {totalCount} payments by value (debits
        only). Click a row for full detail.
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

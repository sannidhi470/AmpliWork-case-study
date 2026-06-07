"use client";

import { useMemo, useState } from "react";

import { PillSelect } from "@/components/ui/PillSelect";
import { BANK_OPTIONS } from "@/lib/bankMeta";
import { monthAxisLabel, niceScale } from "@/lib/chart";
import { formatCurrency } from "@/lib/currency";
import { formatUsdCompact } from "@/lib/format";
import type { BalancePoint, BankId } from "@/lib/types";
import { StatPanel } from "./StatPanel";

interface BankBalanceChartProps {
  balanceByBank: Record<BankId, BalancePoint[]>;
}

/**
 * Bank account balance over time — an SVG line chart of the running balance
 * for the selected bank across the full statement period. A bank dropdown
 * switches the series; the y-axis is a fitted, rounded amount scale. USD.
 *
 * The polyline lives in a 0..100 viewBox stretched to fill the panel
 * (`preserveAspectRatio="none"` + non-scaling stroke); dots are positioned as
 * HTML overlays so they stay circular regardless of aspect ratio.
 */
export function BankBalanceChart({ balanceByBank }: BankBalanceChartProps) {
  const [bank, setBank] = useState<BankId>("chase");
  const series = balanceByBank[bank] ?? [];

  const scale = useMemo(() => {
    if (series.length === 0) return niceScale(0, 1);
    const values = series.map((p) => p.balance);
    return niceScale(Math.min(...values), Math.max(...values));
  }, [series]);

  const span = scale.max - scale.min || 1;
  const n = series.length;

  const points = series.map((p, i) => {
    const x = n <= 1 ? 50 : (i / (n - 1)) * 100;
    const y = (1 - (p.balance - scale.min) / span) * 100;
    return { x, y, point: p };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <StatPanel
      title="Bank Account Balance"
      action={
        <PillSelect
          value={bank}
          options={BANK_OPTIONS}
          onChange={(v) => setBank(v as BankId)}
          ariaLabel="Select bank"
        />
      }
    >
      {series.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No balance history for this bank.
        </p>
      ) : (
        <div className="flex gap-3">
          <div className="flex h-56 w-12 flex-col justify-between text-right text-[10px] tabular-nums text-slate-500">
            {scale.ticksDesc.map((t, i) => (
              <span key={i}>{formatUsdCompact(t)}</span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative h-56">
              <div className="absolute inset-0 flex flex-col justify-between">
                {scale.ticksDesc.map((_, i) => (
                  <div key={i} className="border-t border-white/5" />
                ))}
              </div>

              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {points.map((p) => (
                <div
                  key={p.point.month}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-[#60a5fa] bg-[#0d1622] transition group-hover:bg-[#60a5fa]" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#111924] px-3 py-2 text-[11px] shadow-xl group-hover:block">
                    <div className="font-medium text-slate-200">
                      {monthAxisLabel(p.point.month)} {p.point.month.slice(0, 4)}
                    </div>
                    <div className="text-blue-300">
                      {formatCurrency(p.point.balance, "USD")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex">
              {series.map((p) => (
                <span
                  key={p.month}
                  className="flex-1 text-center text-[10px] uppercase tracking-wide text-slate-500"
                >
                  {monthAxisLabel(p.month)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </StatPanel>
  );
}

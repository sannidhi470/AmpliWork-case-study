"use client";

import { useMemo, useState } from "react";

import { PillSelect } from "@/components/ui/PillSelect";
import { MONTH_ABBR, niceMax } from "@/lib/chart";
import { formatCurrency } from "@/lib/currency";
import { formatUsdCompact } from "@/lib/format";
import type { MonthlyFlow } from "@/lib/types";
import { StatPanel } from "./StatPanel";

const TICK_COUNT = 4; // -> 5 gridlines / labels (0..max)

/**
 * Money in vs money out, one year at a time — a stacked CSS bar chart
 * (no chart library). A year dropdown switches the view; the y-axis shows a
 * rounded amount scale with gridlines, like the Figma. All values USD.
 */
export function MoneyFlowChart({ data }: { data: MonthlyFlow[] }) {
  const years = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) set.add(d.month.slice(0, 4));
    return Array.from(set).sort();
  }, [data]);

  const [year, setYear] = useState<string>(() => years[years.length - 1] ?? "");

  // Build a fixed Jan–Dec series for the selected year (missing months = 0).
  const months = useMemo<MonthlyFlow[]>(() => {
    const byMonth = new Map(data.map((d) => [d.month, d]));
    return MONTH_ABBR.map((_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      const found = byMonth.get(key);
      return {
        month: key,
        cashIn: found?.cashIn ?? 0,
        cashOut: found?.cashOut ?? 0,
      };
    });
  }, [data, year]);

  const axisMax = useMemo(() => {
    const peak = Math.max(
      0,
      ...months.map((m) => Math.max(m.cashIn, m.cashOut)),
    );
    return niceMax(peak);
  }, [months]);

  // Tick values from top (axisMax) down to 0.
  const ticks = Array.from(
    { length: TICK_COUNT + 1 },
    (_, i) => (axisMax / TICK_COUNT) * (TICK_COUNT - i),
  );

  const yearOptions = years.map((y) => ({ value: y, label: y }));

  return (
    <StatPanel
      title="Money In vs Money Out"
      action={
        <div className="flex items-center gap-3">
          <Legend />
          {yearOptions.length > 0 && (
            <PillSelect
              value={year}
              options={yearOptions}
              onChange={setYear}
              ariaLabel="Select year"
            />
          )}
        </div>
      }
    >
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No monthly activity to chart.
        </p>
      ) : (
        <div className="flex gap-3">
          <div className="flex h-56 w-12 flex-col justify-between py-0 text-right text-[10px] tabular-nums text-slate-500">
            {ticks.map((t, i) => (
              <span key={i}>{formatUsdCompact(t)}</span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative h-56">
              <div className="absolute inset-0 flex flex-col justify-between">
                {ticks.map((_, i) => (
                  <div key={i} className="border-t border-white/5" />
                ))}
              </div>

              <div className="relative flex h-full items-stretch gap-2">
                {months.map((d) => {
                  const inPct = (d.cashIn / axisMax) * 100;
                  const outPct = (d.cashOut / axisMax) * 100;
                  const hasData = d.cashIn > 0 || d.cashOut > 0;
                  return (
                    <div
                      key={d.month}
                      className="group relative flex flex-1 flex-col justify-end"
                    >
                      <div
                        className="mx-auto w-full max-w-[2.75rem] rounded-t-sm bg-rose-500/80 transition-all"
                        style={{ height: `${outPct}%` }}
                      />
                      <div
                        className="mx-auto w-full max-w-[2.75rem] bg-emerald-500/80 transition-all"
                        style={{ height: `${inPct}%` }}
                      />

                      {hasData && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#111924] px-3 py-2 text-[11px] shadow-xl group-hover:block">
                          <div className="mb-1 font-medium text-slate-200">
                            {MONTH_ABBR[Number(d.month.slice(5)) - 1]} {year}
                          </div>
                          <div className="text-emerald-400">
                            In: {formatCurrency(d.cashIn, "USD")}
                          </div>
                          <div className="text-rose-400">
                            Out: {formatCurrency(d.cashOut, "USD")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              {months.map((d, i) => (
                <span
                  key={d.month}
                  className="flex-1 text-center text-[10px] uppercase tracking-wide text-slate-500"
                >
                  {MONTH_ABBR[i]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </StatPanel>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[11px] text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> In
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-rose-500" /> Out
      </span>
    </div>
  );
}

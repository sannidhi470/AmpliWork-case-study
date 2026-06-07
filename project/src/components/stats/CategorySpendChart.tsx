import { formatCurrency } from "@/lib/currency";
import type { CategorySpend } from "@/lib/types";
import { StatPanel } from "./StatPanel";

const MAX_ROWS = 8;

/**
 * Spend by category — horizontal CSS progress bars (no chart library),
 * mirroring the Figma "Where does your money go?" panel. All values USD.
 */
export function CategorySpendChart({ data }: { data: CategorySpend[] }) {
  const rows = data.slice(0, MAX_ROWS);
  const max = Math.max(1, ...rows.map((d) => d.total));

  return (
    <StatPanel title="Where Does Your Money Go?">
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No spending to break down.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((d) => (
            <li key={d.category}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="truncate pr-3 text-slate-300">
                  {d.category}
                </span>
                <span className="shrink-0 tabular-nums text-slate-400">
                  {formatCurrency(d.total, "USD")}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  style={{ width: `${(d.total / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </StatPanel>
  );
}

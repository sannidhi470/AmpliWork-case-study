import { formatCurrency } from "@/lib/currency";
import type { VendorSpend } from "@/lib/types";
import { StatPanel } from "./StatPanel";

/**
 * Required vendor breakdown: all vendors ranked by total spend (USD).
 * Scrolls within the panel so the full ranking is available without
 * stretching the page.
 */
export function TopVendorsTable({ vendors }: { vendors: VendorSpend[] }) {
  return (
    <StatPanel
      title="Top Paid Vendors"
      action={
        <span className="text-[11px] text-slate-500">
          {vendors.length} vendors
        </span>
      }
    >
      {vendors.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No vendor spend to rank.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-[#0d1622]">
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-2 py-2 font-medium">#</th>
                <th className="px-2 py-2 font-medium">Vendor</th>
                <th className="px-2 py-2 text-right font-medium">Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr
                  key={v.vendor}
                  className="border-t border-dashed border-white/10"
                >
                  <td className="px-2 py-2.5 tabular-nums text-slate-500">
                    {i + 1}
                  </td>
                  <td className="px-2 py-2.5 text-slate-200">
                    {v.vendor}
                    <span className="ml-2 text-[11px] text-slate-500">
                      {v.count} txn{v.count === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums text-slate-100">
                    {formatCurrency(v.total, "USD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StatPanel>
  );
}

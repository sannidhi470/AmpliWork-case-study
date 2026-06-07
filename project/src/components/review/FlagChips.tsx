import { FLAG_LABELS } from "@/lib/review";
import type { ReviewFlag } from "@/lib/types";

const FLAG_STYLE: Record<ReviewFlag, string> = {
  unresolved_approver: "border-red-500/40 bg-red-500/10 text-red-300",
  non_finance_approver: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  possible_duplicate: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  foreign_currency: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  weekend: "border-slate-500/40 bg-slate-500/10 text-slate-300",
};

export function FlagChips({ flags }: { flags: ReviewFlag[] }) {
  if (flags.length === 0) {
    return <span className="text-xs text-slate-600">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${FLAG_STYLE[flag]}`}
        >
          {FLAG_LABELS[flag]}
        </span>
      ))}
    </div>
  );
}

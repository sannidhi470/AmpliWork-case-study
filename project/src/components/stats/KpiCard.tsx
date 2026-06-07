type KpiTone = "in" | "out" | "neutral";

interface KpiCardProps {
  label: string;
  value: string; // pre-formatted (e.g. "$1.4M")
  sub?: string;
  tone?: KpiTone;
}

const TONE_CLASS: Record<KpiTone, string> = {
  in: "text-emerald-400",
  out: "text-rose-400",
  neutral: "text-slate-100",
};

/** Big headline-number card matching the Figma "1M TOTAL BALANCE" style. */
export function KpiCard({ label, value, sub, tone = "neutral" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1622] px-6 py-6">
      <div className="flex items-center gap-4">
        <span
          className={`text-5xl font-light leading-none tabular-nums ${TONE_CLASS[tone]}`}
        >
          {value}
        </span>
        <span className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      {sub && <p className="mt-3 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

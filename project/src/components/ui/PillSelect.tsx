"use client";

export interface SelectOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  value: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
  ariaLabel: string;
}

/**
 * A dark, rounded "pill" dropdown matching the Figma filter row. The default
 * option's label doubles as the pill's title (e.g. "AUTH. BY") so the control
 * reads as a filter name until a value is chosen.
 */
export function PillSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: PillSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-white/10 bg-[#101826] py-2 pl-4 pr-9 text-xs font-medium uppercase tracking-wide text-slate-200 outline-none transition hover:border-white/20 focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#101826]">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

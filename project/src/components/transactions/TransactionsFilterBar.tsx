"use client";

import { PillSelect } from "@/components/ui/PillSelect";
import type { SelectOption } from "@/components/ui/PillSelect";
import { BANK_OPTIONS } from "@/lib/bankMeta";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { DisplayCurrency } from "@/lib/currency";
import type { BankId, PublicUser } from "@/lib/types";

export interface TransactionFilterState {
  bank: BankId | "all";
  authorizedBy: string | "all";
  currency: DisplayCurrency;
  fromDate: string;
}

interface TransactionsFilterBarProps {
  filters: TransactionFilterState;
  users: PublicUser[];
  onChange: (next: Partial<TransactionFilterState>) => void;
  onExportCsv: () => void;
  canExport: boolean;
}

export function TransactionsFilterBar({
  filters,
  users,
  onChange,
  onExportCsv,
  canExport,
}: TransactionsFilterBarProps) {
  // The first option's label doubles as the pill title (Figma style).
  const userOptions: SelectOption[] = [
    { value: "all", label: "Auth. By" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const currencyOptions: SelectOption[] = [
    { value: "original", label: "Show Currency In" },
    ...SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: `All ${c}` })),
  ];

  const bankOptions: SelectOption[] = [
    { value: "all", label: "Bank Acc." },
    ...BANK_OPTIONS.map((b) => ({ value: b.value, label: b.label })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <PillSelect
        ariaLabel="Filter by who authorized"
        value={filters.authorizedBy}
        options={userOptions}
        onChange={(v) => onChange({ authorizedBy: v })}
      />
      <PillSelect
        ariaLabel="Show currency in"
        value={filters.currency}
        options={currencyOptions}
        onChange={(v) => onChange({ currency: v as DisplayCurrency })}
      />
      <PillSelect
        ariaLabel="Filter by bank account"
        value={filters.bank}
        options={bankOptions}
        onChange={(v) => onChange({ bank: v as BankId | "all" })}
      />

      <button
        type="button"
        onClick={onExportCsv}
        disabled={!canExport}
        className="flex items-center gap-2 rounded-md border border-white/10 bg-[#101826] px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon />
        CSV
      </button>

      <div className="relative flex items-center rounded-md border border-white/10 bg-[#101826] pl-3 text-slate-200">
        <CalendarIcon />
        <input
          type="date"
          aria-label="From date"
          value={filters.fromDate}
          onChange={(e) => onChange({ fromDate: e.target.value })}
          className="bg-transparent px-2 py-2 text-xs uppercase tracking-wide text-slate-200 outline-none [color-scheme:dark]"
        />
        {filters.fromDate && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => onChange({ fromDate: "" })}
            className="pr-3 text-slate-500 transition hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

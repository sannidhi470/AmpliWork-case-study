"use client";

import { useEffect } from "react";

import { resolveDisplayAmount, formatCurrency } from "@/lib/currency";
import type { DisplayCurrency } from "@/lib/currency";
import { BANK_LABELS } from "@/lib/bankMeta";
import { flattenObject } from "@/lib/flatten";
import { formatDate, humanizeKey } from "@/lib/format";
import type { NormalizedTransaction } from "@/lib/types";

interface TransactionModalProps {
  transaction: NormalizedTransaction | null;
  displayCurrency: DisplayCurrency;
  onClose: () => void;
}

export function TransactionModal({
  transaction,
  displayCurrency,
  onClose,
}: TransactionModalProps) {
  // Close on Escape.
  useEffect(() => {
    if (!transaction) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const tx = transaction;
  const { amount, currency } = resolveDisplayAmount(tx, displayCurrency);
  const rawFields = flattenObject(tx.source);

  const summary: Array<{ label: string; value: string }> = [
    { label: "Amount", value: `${currency} ${formatCurrency(amount, currency)}` },
    {
      label: "Original",
      value: `${tx.currency} ${formatCurrency(tx.amount, tx.currency)}`,
    },
    { label: "Date", value: formatDate(tx.date) },
    { label: "Type", value: tx.type === "credit" ? "Credit (in)" : "Debit (out)" },
    { label: "Category", value: tx.category },
    { label: "Vendor", value: tx.vendor },
    { label: "Bank Account", value: tx.bankAccount },
    { label: "Bank", value: BANK_LABELS[tx.bank] },
    {
      label: "Authorized By",
      value: tx.authorizedBy
        ? `${tx.authorizedBy.name} · ${tx.authorizedBy.role}`
        : "Unknown",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#0e1620] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              {tx.description}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{tx.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-5">
          {summary.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <p className="text-sm text-slate-200">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-5">
          <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">
            Raw bank data ({tx.bank})
          </p>
          <dl className="space-y-1.5">
            {rawFields.map((field) => (
              <div
                key={field.key}
                className="flex justify-between gap-4 text-xs"
              >
                <dt className="text-slate-500">{humanizeKey(field.key)}</dt>
                <dd className="max-w-[60%] truncate text-right text-slate-300">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

"use client";

import { resolveDisplayAmount, formatCurrency } from "@/lib/currency";
import type { DisplayCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import type { NormalizedTransaction } from "@/lib/types";
import { AuthorizedByCell } from "./AuthorizedByCell";

const MAX_ROWS = 30;

interface TransactionsTableProps {
  transactions: NormalizedTransaction[];
  displayCurrency: DisplayCurrency;
  isLoading: boolean;
  error?: Error;
  onSelect: (tx: NormalizedTransaction) => void;
  isStarred: (id: string) => boolean;
  onToggleStar: (id: string) => void;
  emptyMessage?: string;
}

export function TransactionsTable({
  transactions,
  displayCurrency,
  isLoading,
  error,
  onSelect,
  isStarred,
  onToggleStar,
  emptyMessage,
}: TransactionsTableProps) {
  if (isLoading) {
    return <StateBox>Loading transactions…</StateBox>;
  }

  if (error) {
    return (
      <StateBox>
        <span className="text-red-300">
          Couldn&apos;t load transactions: {error.message}
        </span>
      </StateBox>
    );
  }

  if (transactions.length === 0) {
    return (
      <StateBox>
        {emptyMessage ?? "No transactions match your filters. Try widening them."}
      </StateBox>
    );
  }

  const rows = transactions.slice(0, MAX_ROWS);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1622]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <Th className="w-10" />
            <Th>Transaction</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Category</Th>
            <Th>Bank Acc.</Th>
            <Th>Authorized By</Th>
            <Th>Vendor</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => {
            const { amount, currency } = resolveDisplayAmount(
              tx,
              displayCurrency,
            );
            const starred = isStarred(tx.id);
            return (
              <tr
                key={tx.id}
                onClick={() => onSelect(tx)}
                className="cursor-pointer border-t border-dashed border-white/10 transition hover:bg-white/[0.03]"
              >
                <Td>
                  <button
                    type="button"
                    aria-label={starred ? "Unstar" : "Star"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(tx.id);
                    }}
                    className={
                      starred
                        ? "text-blue-500"
                        : "text-slate-600 transition hover:text-slate-400"
                    }
                  >
                    <StarIcon filled={starred} />
                  </button>
                </Td>
                <Td className="max-w-[15rem] truncate text-slate-200">
                  {tx.description}
                </Td>
                <Td className="whitespace-nowrap tabular-nums">
                  <span
                    className={
                      tx.type === "credit" ? "text-emerald-400" : "text-slate-100"
                    }
                  >
                    {currency} {formatCurrency(amount, currency)}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-slate-400">
                  {formatDate(tx.date)}
                </Td>
                <Td className="text-slate-300">{tx.category}</Td>
                <Td className="whitespace-nowrap text-slate-400">
                  {tx.bankAccount}
                </Td>
                <Td>
                  <AuthorizedByCell user={tx.authorizedBy} />
                </Td>
                <Td className="text-slate-300">{tx.vendor}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-dashed border-white/10 px-4 py-3 text-xs text-slate-500">
        <span>
          Showing {rows.length} of {transactions.length} matching transactions
        </span>
        {transactions.length > MAX_ROWS && (
          <span>Refine filters to narrow results (table caps at {MAX_ROWS}).</span>
        )}
      </div>
    </div>
  );
}

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-white/10 bg-[#0d1622] p-10 text-center text-sm text-slate-400">
      {children}
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95z" />
    </svg>
  );
}

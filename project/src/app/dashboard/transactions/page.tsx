"use client";

import { useMemo, useState } from "react";

import { TabGuard } from "@/components/TabGuard";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionsFilterBar } from "@/components/transactions/TransactionsFilterBar";
import type { TransactionFilterState } from "@/components/transactions/TransactionsFilterBar";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { useStarred } from "@/hooks/useStarred";
import { useTransactions } from "@/hooks/useTransactions";
import { useUsers } from "@/hooks/useUsers";
import { downloadCsv, transactionsToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import type { NormalizedTransaction } from "@/lib/types";

type ViewMode = "all" | "starred";

const INITIAL_FILTERS: TransactionFilterState = {
  bank: "all",
  authorizedBy: "all",
  currency: "original",
  fromDate: "",
};

function TransactionsContent() {
  const [filters, setFilters] = useState<TransactionFilterState>(INITIAL_FILTERS);
  const [view, setView] = useState<ViewMode>("all");
  const [selected, setSelected] = useState<NormalizedTransaction | null>(null);

  const { users } = useUsers();
  const { isStarred, toggle, count: starredCount } = useStarred();
  const { transactions, isLoading, error } = useTransactions({
    bank: filters.bank,
    authorizedBy: filters.authorizedBy,
    fromDate: filters.fromDate,
  });

  const handleChange = (next: Partial<TransactionFilterState>) =>
    setFilters((prev) => ({ ...prev, ...next }));

  // What the table + CSV operate on (server filters + the ALL/STARRED view).
  const viewTransactions = useMemo(
    () =>
      view === "starred"
        ? transactions.filter((tx) => isStarred(tx.id))
        : transactions,
    [view, transactions, isStarred],
  );

  const lastUpdated = useMemo(() => {
    if (transactions.length === 0) return null;
    // transactions are sorted earliest-first, so the last one is most recent.
    return transactions[transactions.length - 1].date;
  }, [transactions]);

  const csvFilename = useMemo(() => {
    const parts = ["transactions"];
    if (view === "starred") parts.push("starred");
    if (filters.bank !== "all") parts.push(filters.bank);
    if (filters.authorizedBy !== "all") parts.push(filters.authorizedBy);
    if (filters.fromDate) parts.push(`from-${filters.fromDate}`);
    return `${parts.join("_")}.csv`;
  }, [filters, view]);

  const handleExport = () => {
    const csv = transactionsToCsv(viewTransactions, filters.currency);
    downloadCsv(csvFilename, csv);
  };

  return (
    <>
      <div className="mb-4 flex justify-end text-[11px] uppercase tracking-wider text-slate-500">
        {lastUpdated
          ? `Last updated: ${formatDate(lastUpdated)}`
          : "\u00a0"}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light tracking-wide text-white">
          TRANSACTIONS
        </h1>
        <TransactionsFilterBar
          filters={filters}
          users={users}
          onChange={handleChange}
          onExportCsv={handleExport}
          canExport={!isLoading && viewTransactions.length > 0}
        />
      </div>

      <div className="mb-4 flex items-center gap-6 border-b border-white/10 text-sm">
        <TabButton
          active={view === "all"}
          label="All"
          onClick={() => setView("all")}
        />
        <TabButton
          active={view === "starred"}
          label={`Starred (${starredCount})`}
          onClick={() => setView("starred")}
        />
      </div>

      <TransactionsTable
        transactions={viewTransactions}
        displayCurrency={filters.currency}
        isLoading={isLoading}
        error={error}
        onSelect={setSelected}
        isStarred={isStarred}
        onToggleStar={toggle}
        emptyMessage={
          view === "starred"
            ? "No starred transactions yet. Tap the star on any row to save it here."
            : undefined
        }
      />

      <TransactionModal
        transaction={selected}
        displayCurrency={filters.currency}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 pb-2 font-medium uppercase tracking-wide transition ${
        active
          ? "border-blue-500 text-white"
          : "border-transparent text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function TransactionsPage() {
  return (
    <TabGuard tab="transactions">
      <TransactionsContent />
    </TabGuard>
  );
}

/** Presentation helpers (pure, framework-agnostic). */

/** "2024-09-12" -> "Sep 12, 2024". Falls back to the raw string if unparseable. */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Compact USD formatting for big KPI numbers, e.g. 1_420_000 -> "$1.4M".
 * Used by the Stats KPI cards to mirror the Figma's "1M" style.
 */
export function formatUsdCompact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** "2024-09" -> "SEP '24". Falls back to the raw string if unparseable. */
export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1, 1);
  if (Number.isNaN(date.getTime())) return yearMonth;
  const mon = date.toLocaleDateString("en-US", { month: "short" });
  return `${mon.toUpperCase()} '${String(year).slice(-2)}`;
}

/** Title-case a snake/camel field key for display, e.g. "originalAmount" -> "Original Amount". */
export function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

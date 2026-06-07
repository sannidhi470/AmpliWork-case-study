/**
 * Starred (favourite) transactions, persisted in localStorage.
 *
 * The Figma shows a star column + an ALL / STARRED tab on the Transactions
 * page, so we support marking rows as starred. SSR-safe (no-ops on server).
 */

const STORAGE_KEY = "circuitlabs.starred.tx";

export function getStarredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function save(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Toggle one id and return the updated id list. */
export function toggleStarred(id: string): string[] {
  const current = getStarredIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  save(next);
  return next;
}

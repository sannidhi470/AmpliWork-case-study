/**
 * SERVER-ONLY orchestration: load the three raw bank files plus users, then
 * hand them to the (pure) normalizer. Returns the merged, date-sorted list.
 */

import { normalizeAll } from "@/lib/normalize";
import type { NormalizedTransaction } from "@/lib/types";
import { loadAmex, loadBoa, loadChase } from "./banks";
import { getUserRecords } from "./users";

export async function getNormalizedTransactions(): Promise<
  NormalizedTransaction[]
> {
  const [chase, boa, amex, users] = await Promise.all([
    loadChase(),
    loadBoa(),
    loadAmex(),
    getUserRecords(),
  ]);
  return normalizeAll(chase, boa, amex, users);
}

export async function getTransactionById(
  id: string,
): Promise<NormalizedTransaction | null> {
  const all = await getNormalizedTransactions();
  return all.find((tx) => tx.id === id) ?? null;
}

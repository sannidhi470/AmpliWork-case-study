/**
 * SERVER-ONLY data access for the three banks.
 *
 * Reads the raw bank JSON files from `data/transactions/` at request time.
 * Each loader returns the file typed to its own raw shape — the bank formats
 * are intentionally different, and we keep them that way here. Normalization
 * into a single model happens elsewhere (`lib/normalize.ts`).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { AmexFile, BoaFile, ChaseFile } from "@/lib/types";

const TX_DIR = path.join(process.cwd(), "data", "transactions");

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await fs.readFile(path.join(TX_DIR, fileName), "utf-8");
  return JSON.parse(raw) as T;
}

export function loadChase(): Promise<ChaseFile> {
  return readJson<ChaseFile>("chase.json");
}

export function loadBoa(): Promise<BoaFile> {
  return readJson<BoaFile>("boa.json");
}

export function loadAmex(): Promise<AmexFile> {
  return readJson<AmexFile>("amex.json");
}

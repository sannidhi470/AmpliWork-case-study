/**
 * SERVER-ONLY data access for users.
 *
 * Reads `data/users/user.json` from disk at request time. This file lives
 * outside `src/` and contains passwords, so it must never be imported into a
 * client component — keeping it behind `fs` reads guarantees that.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { PublicUser, Role, UserRecord, UsersFile } from "@/lib/types";

const USERS_PATH = path.join(process.cwd(), "data", "users", "user.json");

export async function loadUsersFile(): Promise<UsersFile> {
  const raw = await fs.readFile(USERS_PATH, "utf-8");
  return JSON.parse(raw) as UsersFile;
}

export async function getUserRecords(): Promise<UserRecord[]> {
  const file = await loadUsersFile();
  return file.users;
}

/** Strip the password from a user record before it leaves the server. */
export function toPublicUser(user: UserRecord): PublicUser {
  // Explicit destructure so a password can never accidentally pass through.
  const { password: _password, ...publicUser } = user;
  void _password;
  return publicUser;
}

/**
 * Validate credentials. Returns the public (password-free) user on success,
 * or null on any mismatch. Email match is case-insensitive.
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const users = await getUserRecords();
  const match = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );
  if (!match || match.password !== password) return null;
  if (!match.active) return null;
  return toPublicUser(match);
}

export async function getTabAccessMatrix(): Promise<Record<string, Role[]>> {
  const file = await loadUsersFile();
  return file.tabAccessMatrix;
}

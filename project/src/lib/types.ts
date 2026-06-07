/**
 * Shared domain types for the Circuit Labs dashboard.
 *
 * Kept framework-agnostic so they can be imported by API routes (server)
 * and React components (client) alike.
 */

export type Role = "admin" | "finance_lead" | "analyst" | "viewer";

export type TabId = "transactions" | "stats" | "custom";

/**
 * Full user record exactly as stored in `data/users/user.json`.
 * SERVER-ONLY: contains the password and must never be sent to the client
 * or imported into any client bundle.
 */
export interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  title: string;
  role: Role;
  allowedTabs: TabId[];
  department: string;
  active: boolean;
  createdAt: string;
}

/** A user record with the password stripped — safe to return from an API. */
export type PublicUser = Omit<UserRecord, "password">;

/**
 * The minimal shape we persist to localStorage after login.
 * Per the spec: id, name, role, allowedTabs — never the password.
 */
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  allowedTabs: TabId[];
}

/** Shape of `data/users/user.json`. */
export interface UsersFile {
  company: string;
  authNote: string;
  tabAccessMatrix: Record<TabId, Role[]>;
  users: UserRecord[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: PublicUser;
}

export interface ApiError {
  error: string;
}

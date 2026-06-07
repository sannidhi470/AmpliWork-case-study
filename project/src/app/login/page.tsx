"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredUser, setStoredUser } from "@/lib/auth";
import { getDefaultTab } from "@/lib/rbac";
import type { ApiError, LoginResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, skip the login screen.
  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      const tab = getDefaultTab(existing);
      router.replace(tab ? `/dashboard/${tab}` : "/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      const { user } = (await res.json()) as LoginResponse;
      setStoredUser(user);
      const tab = getDefaultTab(user);
      router.replace(tab ? `/dashboard/${tab}` : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0b0e14] via-[#06080d] to-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-10 text-center text-4xl font-light tracking-[0.18em] text-white">
          WELCOME BACK!
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            icon={<UserIcon />}
            type="email"
            placeholder="EMAIL"
            autoComplete="username"
            value={email}
            onChange={setEmail}
          />
          <Field
            icon={<LockIcon />}
            type="password"
            placeholder="PASSWORD"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-md bg-white py-3 text-sm font-semibold tracking-wide text-blue-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "SIGNING IN…" : "LOGIN"}
          </button>

          <button
            type="button"
            className="text-center text-sm text-slate-300 transition hover:text-white"
            onClick={() =>
              setError("Password recovery isn't part of this exercise.")
            }
          >
            Forgot password?
          </button>
        </form>
      </div>
    </main>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({
  icon,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-slate-600/70 bg-white/5 px-3 py-3 focus-within:border-slate-300">
      <span className="text-slate-400">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm tracking-wide text-white placeholder:text-slate-400 focus:outline-none"
      />
    </label>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p
        role="status"
        className="rounded border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
      >
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded border border-[var(--hairline)] bg-white p-6"
    >
      <div>
        <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      {error ? <p className="text-sm text-[var(--primary)]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
      >
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

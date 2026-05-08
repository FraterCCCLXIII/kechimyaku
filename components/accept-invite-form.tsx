"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Props = {
  token: string;
};

export function AcceptInviteForm({ token }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
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
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { username: string | null; email: string | null };
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      // Auto sign-in.
      const signInResult = await signIn("credentials", {
        identifier: payload.user?.email ?? username,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        // Activated but sign-in failed; redirect to login page.
        router.push("/login");
        return;
      }
      router.push("/settings/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded border border-[var(--hairline)] bg-white p-6"
    >
      <div>
        <label htmlFor="invite-username" className="mb-1 block text-sm font-medium">
          Username
        </label>
        <input
          id="invite-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          minLength={2}
          required
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="invite-password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="invite-confirm" className="mb-1 block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="invite-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      {error ? <p className="text-sm text-[var(--primary)]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

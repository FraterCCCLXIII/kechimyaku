"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Endpoint always returns 200 to avoid disclosing account existence.
      await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setDone(true);
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
        If that account exists, a reset link is on its way.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded border border-[var(--hairline)] bg-white p-6"
    >
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

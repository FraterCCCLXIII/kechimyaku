"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded border border-[var(--hairline)] bg-[var(--canvas)] p-6"
    >
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
          Email or username
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username email"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border border-[var(--hairline)] px-3 py-2"
          required
        />
      </div>
      {error ? <p className="text-sm text-[var(--primary)]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-[var(--muted)]">
        <Link href="/forgot-password" className="!text-[var(--muted)] hover:!text-[var(--body)]">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

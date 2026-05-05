"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type AuthButtonsProps = {
  isAuthenticated: boolean;
};

export function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="rounded border border-[var(--hairline)] px-3 py-1 text-sm text-[var(--ink)] hover:bg-[var(--surface-card)]"
      >
        Login
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded border border-[var(--hairline)] px-3 py-1 text-sm text-[var(--ink)] hover:bg-[var(--surface-card)]"
    >
      Logout
    </button>
  );
}

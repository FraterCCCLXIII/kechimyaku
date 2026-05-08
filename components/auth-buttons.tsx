"use client";

import Link from "next/link";
import { HeaderNavLink } from "@/components/header-nav-link";
import { UserMenu } from "@/components/user-menu";

type AuthButtonsProps = {
  isAuthenticated: boolean;
  username?: string | null;
};

export function AuthButtons({ isAuthenticated, username }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <HeaderNavLink href="/contribute">Contribute</HeaderNavLink>
      {isAuthenticated ? (
        <UserMenu username={username} />
      ) : (
        <Link
          href="/login"
          className="rounded border border-[var(--hairline)] px-3 py-1 text-[var(--ink)] hover:bg-[var(--surface-card)]"
        >
          Login
        </Link>
      )}
    </div>
  );
}

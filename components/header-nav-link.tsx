"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type HeaderNavLinkProps = {
  href: string;
  children: ReactNode;
  /**
   * When true (default for non-root paths), the link is also considered active
   * when the current pathname is a child of `href` (e.g. `/index/123`).
   * The root path (`/`) always uses exact matching.
   */
  matchSubpaths?: boolean;
  className?: string;
};

export function HeaderNavLink({
  href,
  children,
  matchSubpaths = true,
  className,
}: HeaderNavLinkProps) {
  const pathname = usePathname();
  const isRoot = href === "/";
  const isActive = isRoot
    ? pathname === "/"
    : pathname === href ||
      (matchSubpaths && pathname.startsWith(`${href}/`));

  const base =
    "relative !text-[var(--muted)] hover:!text-[var(--body)] transition-colors";
  const active =
    "!text-[var(--primary)] hover:!text-[var(--primary)] " +
    "after:pointer-events-none after:absolute after:left-1/2 after:-bottom-2 " +
    "after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full " +
    "after:bg-[var(--primary)] after:content-['']";

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[base, isActive ? active : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Link>
  );
}

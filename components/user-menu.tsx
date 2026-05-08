"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";

type UserMenuProps = {
  username?: string | null;
};

export function UserMenu({ username }: UserMenuProps) {
  const label = username?.trim() || "Account";
  const initial = label.charAt(0).toUpperCase();

  return (
    <Dropdown
      trigger={({ triggerProps, open }) => (
        <button
          {...triggerProps}
          className="flex items-center gap-2 rounded border border-[var(--hairline)] bg-white px-2 py-1 text-sm !text-[var(--ink)] hover:bg-[var(--surface-card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-card)] text-xs font-semibold text-[var(--ink)]"
          >
            {initial}
          </span>
          <span className="max-w-[10rem] truncate">{label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`text-[var(--muted)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    >
      <Link
        href="/settings"
        role="menuitem"
        className="block w-full px-3 py-2 text-left text-sm !text-[var(--body)] hover:bg-[var(--surface-card)] hover:!text-[var(--ink)]"
      >
        Settings
      </Link>
      <DropdownDivider />
      <DropdownItem onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </DropdownItem>
    </Dropdown>
  );
}

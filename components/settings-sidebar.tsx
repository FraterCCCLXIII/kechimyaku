"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SettingsNavItem = {
  href: string;
  label: string;
  description?: string;
};

type SettingsSidebarProps = {
  items: SettingsNavItem[];
};

export function SettingsSidebar({ items }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="w-full md:w-56 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const stateClasses = isActive
            ? "border-l-2 border-[var(--primary)] bg-[var(--surface-card)] !text-[var(--ink)]"
            : "border-l-2 border-transparent !text-[var(--body)] hover:bg-[var(--surface-card)] hover:!text-[var(--ink)]";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block whitespace-nowrap px-3 py-2 text-sm transition-colors ${stateClasses}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

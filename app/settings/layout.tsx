import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth-guard";
import { hasAtLeast } from "@/lib/roles";
import {
  SettingsSidebar,
  type SettingsNavItem,
} from "@/components/settings-sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getActor();
  if (!actor) {
    redirect("/login?callbackUrl=/settings");
  }

  const items: SettingsNavItem[] = [
    { href: "/settings/account", label: "Account" },
  ];
  if (hasAtLeast(actor.role, "admin")) {
    items.push({ href: "/settings/users", label: "Users" });
    items.push({ href: "/settings/smtp", label: "SMTP" });
    items.push({ href: "/settings/database", label: "Database" });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-[Georgia,'Times_New_Roman',serif] text-2xl text-[var(--ink)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your account and workspace configuration.
        </p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <SettingsSidebar items={items} />
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}

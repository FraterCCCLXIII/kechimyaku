import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth-guard";
import { AccountForm } from "@/components/account-form";

export const dynamic = "force-dynamic";

export default async function SettingsAccountPage() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/settings/account");

  const me = await db.user.findUnique({
    where: { id: actor.id },
    select: { username: true, email: true, role: true },
  });
  if (!me) redirect("/login");

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Account</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Update your email address and password.
        </p>
      </header>
      <AccountForm
        initialEmail={me.email}
        username={me.username}
        role={me.role}
      />
    </div>
  );
}

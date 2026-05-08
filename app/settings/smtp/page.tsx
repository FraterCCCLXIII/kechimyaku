import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth-guard";
import { canManageSettings } from "@/lib/permissions";
import { getSmtpSettingsForView } from "@/lib/settings";
import { SmtpForm, type SmtpView } from "@/components/smtp-form";

export const dynamic = "force-dynamic";

export default async function SettingsSmtpPage() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/settings/smtp");
  if (!canManageSettings(actor)) redirect("/settings/account");

  const view = await getSmtpSettingsForView();
  const initial: SmtpView | null = view
    ? {
        host: view.host,
        port: view.port,
        secure: view.secure,
        username: view.username,
        fromAddress: view.fromAddress,
        fromName: view.fromName,
        baseUrl: view.baseUrl,
        hasPassword: view.hasPassword,
      }
    : null;

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">SMTP</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configure outgoing email used for invitations and password resets. The
          password is encrypted at rest using a key derived from{" "}
          <code className="rounded bg-[var(--surface-card)] px-1">NEXTAUTH_SECRET</code>.
        </p>
      </header>
      <SmtpForm initial={initial} />
    </div>
  );
}

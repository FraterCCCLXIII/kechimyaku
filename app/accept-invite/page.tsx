import { db } from "@/lib/db";
import { hashToken, isExpired } from "@/lib/tokens";
import { AcceptInviteForm } from "@/components/accept-invite-form";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) {
    return <Message title="Missing invitation token" />;
  }
  const invitation = await db.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, email: true, role: true, expiresAt: true, acceptedAt: true, revokedAt: true },
  });
  if (!invitation) {
    return <Message title="Invalid invitation" body="This link is no longer valid." />;
  }
  if (invitation.acceptedAt) {
    return (
      <Message
        title="Already accepted"
        body="This invitation has already been used. Try logging in instead."
      />
    );
  }
  if (invitation.revokedAt) {
    return (
      <Message
        title="Invitation revoked"
        body="An admin has revoked this invitation. Ask them to send a new one."
      />
    );
  }
  if (isExpired(invitation.expiresAt)) {
    return (
      <Message
        title="Invitation expired"
        body="Ask an admin to send a fresh invite."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <h1 className="font-[Georgia,'Times_New_Roman',serif] text-2xl text-[var(--ink)]">
          Activate your account
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Joining as <strong>{invitation.role}</strong> with email{" "}
          <strong>{invitation.email}</strong>.
        </p>
      </header>
      <AcceptInviteForm token={token} />
    </div>
  );
}

function Message({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 text-center">
      <h1 className="font-[Georgia,'Times_New_Roman',serif] text-2xl text-[var(--ink)]">
        {title}
      </h1>
      {body ? <p className="mt-2 text-sm text-[var(--muted)]">{body}</p> : null}
    </div>
  );
}

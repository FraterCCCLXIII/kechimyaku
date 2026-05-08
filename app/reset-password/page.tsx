import { db } from "@/lib/db";
import { hashToken, isExpired } from "@/lib/tokens";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) return <Message title="Missing token" />;
  const reset = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, usedAt: true, expiresAt: true },
  });
  if (!reset || reset.usedAt) {
    return <Message title="Invalid or used link" body="Request a new reset link." />;
  }
  if (isExpired(reset.expiresAt)) {
    return <Message title="Link expired" body="Request a new reset link." />;
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <h1 className="font-[Georgia,'Times_New_Roman',serif] text-2xl text-[var(--ink)]">
          Set a new password
        </h1>
      </header>
      <ResetPasswordForm token={token} />
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

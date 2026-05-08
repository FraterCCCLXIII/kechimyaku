import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestPasswordResetSchema } from "@/lib/validation/users";
import { expiresIn, generateToken, hashToken } from "@/lib/tokens";
import { resolveBaseUrl, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

/**
 * Public endpoint. Always returns 200 to avoid disclosing which addresses
 * have an account; only sends an email when a user actually exists.
 */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }
  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: true });
  }
  const token = generateToken();
  const tokenHash = hashToken(token);

  await db.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: expiresIn(2),
    },
  });

  const baseUrl = await resolveBaseUrl(request);
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: "Reset your Kechimyaku password",
    text:
      `We received a request to reset your password.\n\n` +
      `If this was you, set a new password here (link expires in 2 hours):\n${resetUrl}\n\n` +
      `If not, you can ignore this email.`,
    html:
      `<p>We received a request to reset your password.</p>` +
      `<p><a href="${resetUrl}">Set a new password</a> (link expires in 2 hours).</p>` +
      `<p>If you didn't ask for this, you can ignore this email.</p>`,
  });

  return NextResponse.json({ ok: true });
}

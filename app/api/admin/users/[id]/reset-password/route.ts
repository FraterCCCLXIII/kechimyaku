import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { canResetUserPassword } from "@/lib/permissions";
import { isRole, type Role } from "@/lib/roles";
import { expiresIn, generateToken, hashToken } from "@/lib/tokens";
import { resolveBaseUrl, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  const { id } = await context.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }
  const target = await db.user.findUnique({
    where: { id: idNum },
    select: { id: true, email: true, role: true, username: true },
  });
  if (!target || !isRole(target.role)) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  const targetRole: Role = target.role;
  if (!canResetUserPassword(actor, { id: target.id, role: targetRole })) {
    return NextResponse.json(
      { error: "You don't have permission to reset that user's password." },
      { status: 403 },
    );
  }

  const token = generateToken();
  const tokenHash = hashToken(token);

  // Invalidate any prior unused tokens for this user.
  await db.passwordResetToken.deleteMany({
    where: { userId: target.id, usedAt: null },
  });

  await db.passwordResetToken.create({
    data: {
      userId: target.id,
      tokenHash,
      expiresAt: expiresIn(2), // 2-hour window
    },
  });

  const baseUrl = await resolveBaseUrl(request);
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  let emailResult = null;
  if (target.email) {
    emailResult = await sendMail({
      to: target.email,
      subject: "Password reset for Kechimyaku",
      text:
        `An administrator has requested a password reset for your account.\n\n` +
        `Set a new password here (link expires in 2 hours):\n${resetUrl}\n`,
      html:
        `<p>An administrator has requested a password reset for your account.</p>` +
        `<p><a href="${resetUrl}">Set a new password</a> (link expires in 2 hours).</p>`,
    });
  }

  return NextResponse.json({
    ok: true,
    resetUrl,
    targetHasEmail: Boolean(target.email),
    email: emailResult,
  });
}

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation/users";
import { hashToken, isExpired } from "@/lib/tokens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const tokenHash = hashToken(parsed.data.token);
  const reset = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true } } },
  });
  if (!reset || reset.usedAt || !reset.user) {
    return NextResponse.json(
      { error: "This reset link is no longer valid." },
      { status: 400 },
    );
  }
  if (isExpired(reset.expiresAt)) {
    return NextResponse.json(
      { error: "This reset link has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({
      where: { id: reset.user.id },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate any other unused reset tokens for this user.
    db.passwordResetToken.deleteMany({
      where: {
        userId: reset.user.id,
        usedAt: null,
        NOT: { id: reset.id },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

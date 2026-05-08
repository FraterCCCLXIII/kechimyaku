import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { changeOwnPasswordSchema } from "@/lib/validation/users";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const actor = await requireRole("member");
  if (actor instanceof NextResponse) return actor;

  const payload = await request.json().catch(() => null);
  const parsed = changeOwnPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const me = await db.user.findUnique({
    where: { id: actor.id },
    select: { id: true, passwordHash: true },
  });
  if (!me) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (!me.passwordHash) {
    return NextResponse.json(
      { error: "Use a password reset link to set your initial password." },
      { status: 400 },
    );
  }
  const matches = await compare(parsed.data.currentPassword, me.passwordHash);
  if (!matches) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }

  const passwordHash = await hash(parsed.data.newPassword, 12);
  await db.user.update({ where: { id: me.id }, data: { passwordHash } });

  // Invalidate any pending reset tokens on a successful password change.
  await db.passwordResetToken.deleteMany({
    where: { userId: me.id, usedAt: null },
  });
  return NextResponse.json({ ok: true });
}

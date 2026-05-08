import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { changeOwnEmailSchema } from "@/lib/validation/users";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const actor = await requireRole("member");
  if (actor instanceof NextResponse) return actor;

  const payload = await request.json().catch(() => null);
  const parsed = changeOwnEmailSchema.safeParse(payload);
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
      { error: "Set a password before changing your email." },
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

  const email = parsed.data.email.toLowerCase();
  const conflict = await db.user.findFirst({
    where: { email, NOT: { id: me.id } },
    select: { id: true },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Another account already uses that email." },
      { status: 409 },
    );
  }

  await db.user.update({ where: { id: me.id }, data: { email } });
  return NextResponse.json({ ok: true, email });
}

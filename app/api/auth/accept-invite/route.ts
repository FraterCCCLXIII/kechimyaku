import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { acceptInviteSchema } from "@/lib/validation/users";
import { hashToken, isExpired } from "@/lib/tokens";
import { isRole } from "@/lib/roles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const tokenHash = hashToken(parsed.data.token);
  const invitation = await db.invitation.findUnique({
    where: { tokenHash },
  });
  if (!invitation || invitation.acceptedAt || invitation.revokedAt) {
    return NextResponse.json(
      { error: "This invitation is no longer valid." },
      { status: 400 },
    );
  }
  if (isExpired(invitation.expiresAt)) {
    return NextResponse.json(
      { error: "This invitation has expired." },
      { status: 400 },
    );
  }
  const role = isRole(invitation.role) ? invitation.role : "member";

  // Email collisions: another user may have signed up since the invite.
  const emailConflict = await db.user.findUnique({
    where: { email: invitation.email },
  });
  if (emailConflict) {
    await db.invitation.update({
      where: { id: invitation.id },
      data: { revokedAt: new Date() },
    });
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }
  const usernameConflict = await db.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (usernameConflict) {
    return NextResponse.json(
      { error: "That username is already taken." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: invitation.email,
        username: parsed.data.username,
        passwordHash,
        role,
      },
      select: { id: true, email: true, username: true, role: true },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    return created;
  });

  return NextResponse.json({ ok: true, user });
}

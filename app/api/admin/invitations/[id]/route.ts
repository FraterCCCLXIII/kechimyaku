import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { canInvite } from "@/lib/permissions";
import { isRole, type Role } from "@/lib/roles";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  const { id } = await context.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: "Invalid invitation id." }, { status: 400 });
  }
  const invitation = await db.invitation.findUnique({
    where: { id: idNum },
    select: { id: true, role: true, acceptedAt: true, revokedAt: true },
  });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }
  if (invitation.acceptedAt || invitation.revokedAt) {
    return NextResponse.json({ ok: true, alreadyClosed: true });
  }
  // Permission: same as inviting at this role.
  const role: Role = isRole(invitation.role) ? invitation.role : "member";
  if (!canInvite(actor, role)) {
    return NextResponse.json(
      { error: "You don't have permission to revoke this invitation." },
      { status: 403 },
    );
  }
  await db.invitation.update({
    where: { id: invitation.id },
    data: { revokedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

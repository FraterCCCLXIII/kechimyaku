import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import {
  canChangeRole,
  canDelete,
  canTransferOwnership,
} from "@/lib/permissions";
import { isRole, type Role } from "@/lib/roles";
import { changeRoleSchema } from "@/lib/validation/users";

export const runtime = "nodejs";

async function loadTarget(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id)) return null;
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true, username: true },
  });
  if (!user || !isRole(user.role)) return null;
  return { ...user, role: user.role as Role };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  const { id } = await context.params;
  const target = await loadTarget(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = changeRoleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const nextRole = parsed.data.role;
  if (!canChangeRole(actor, target, nextRole)) {
    return NextResponse.json(
      { error: "You don't have permission to make that role change." },
      { status: 403 },
    );
  }

  // Transfer ownership: promote `target` to owner, demote previous owner to admin.
  if (nextRole === "owner") {
    if (!canTransferOwnership(actor, target)) {
      return NextResponse.json(
        { error: "Only the current Owner can transfer ownership." },
        { status: 403 },
      );
    }
    await db.$transaction([
      db.user.updateMany({ where: { role: "owner" }, data: { role: "admin" } }),
      db.user.update({ where: { id: target.id }, data: { role: "owner" } }),
    ]);
    return NextResponse.json({ ok: true, transferredOwnership: true });
  }

  if (target.role === nextRole) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  await db.user.update({ where: { id: target.id }, data: { role: nextRole } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  const { id } = await context.params;
  const target = await loadTarget(id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (!canDelete(actor, target)) {
    return NextResponse.json(
      {
        error:
          target.role === "owner"
            ? "Transfer ownership before deleting the Owner."
            : "You don't have permission to delete that user.",
      },
      { status: 403 },
    );
  }
  await db.user.delete({ where: { id: target.id } });
  return NextResponse.json({ ok: true });
}

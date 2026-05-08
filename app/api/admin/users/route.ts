import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { canInvite, canViewUsers } from "@/lib/permissions";
import { isRole, type Role } from "@/lib/roles";
import { inviteUserSchema } from "@/lib/validation/users";
import {
  expiresIn,
  generateToken,
  hashToken,
} from "@/lib/tokens";
import { resolveBaseUrl, sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;
  if (!canViewUsers(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, invitations] = await Promise.all([
    db.user.findMany({
      orderBy: [{ role: "asc" }, { id: "asc" }],
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    }),
    db.invitation.findMany({
      where: { acceptedAt: null, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
        invitedBy: { select: { id: true, username: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      hasPassword: Boolean(u.passwordHash),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
    invitations: invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
      invitedBy: i.invitedBy
        ? {
            id: i.invitedBy.id,
            label: i.invitedBy.username ?? i.invitedBy.email ?? `#${i.invitedBy.id}`,
          }
        : null,
    })),
  });
}

export async function POST(request: Request) {
  const actor = await requireRole("admin");
  if (actor instanceof NextResponse) return actor;

  const payload = await request.json().catch(() => null);
  const parsed = inviteUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const role: Role = parsed.data.role;
  if (!isRole(role) || !canInvite(actor, role)) {
    return NextResponse.json(
      { error: "You don't have permission to invite a user with that role." },
      { status: 403 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with that email already exists." },
      { status: 409 },
    );
  }

  // Revoke any pending invites for the same email to keep things tidy.
  await db.invitation.updateMany({
    where: { email, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = expiresIn(72); // 3-day window

  const invitation = await db.invitation.create({
    data: {
      email,
      role,
      tokenHash,
      expiresAt,
      invitedById: actor.id,
    },
    select: { id: true, email: true, role: true, expiresAt: true },
  });

  const baseUrl = await resolveBaseUrl(request);
  const acceptUrl = `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}`;

  const inviterLabel = actor.username ?? actor.email ?? "a workspace admin";
  const send = await sendMail({
    to: email,
    subject: "You've been invited to Kechimyaku",
    text:
      `${inviterLabel} has invited you to join Kechimyaku as ${role}.\n\n` +
      `Accept the invitation here (link expires in 72 hours):\n${acceptUrl}\n`,
    html:
      `<p>${escapeHtml(inviterLabel)} has invited you to join Kechimyaku as <strong>${role}</strong>.</p>` +
      `<p><a href="${acceptUrl}">Accept the invitation</a> (link expires in 72 hours).</p>`,
  });

  return NextResponse.json(
    {
      invitation,
      acceptUrl,
      email: send,
    },
    { status: 201 },
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

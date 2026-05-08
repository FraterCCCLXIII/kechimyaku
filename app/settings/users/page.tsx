import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth-guard";
import { canViewUsers } from "@/lib/permissions";
import { isRole, type Role } from "@/lib/roles";
import {
  UsersManager,
  type InvitationRow,
  type UserRow,
} from "@/components/users-manager";

export const dynamic = "force-dynamic";

export default async function SettingsUsersPage() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/settings/users");
  if (!canViewUsers(actor)) {
    redirect("/settings/account");
  }

  const [usersRaw, invitationsRaw] = await Promise.all([
    db.user.findMany({
      orderBy: [{ role: "asc" }, { id: "asc" }],
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        passwordHash: true,
        createdAt: true,
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

  const users: UserRow[] = usersRaw.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: (isRole(u.role) ? u.role : "member") as Role,
    hasPassword: Boolean(u.passwordHash),
    createdAt: u.createdAt.toISOString(),
  }));

  const invitations: InvitationRow[] = invitationsRaw.map((i) => ({
    id: i.id,
    email: i.email,
    role: (isRole(i.role) ? i.role : "member") as Role,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
    invitedBy: i.invitedBy
      ? {
          id: i.invitedBy.id,
          label: i.invitedBy.username ?? i.invitedBy.email ?? `#${i.invitedBy.id}`,
        }
      : null,
  }));

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Users</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Invite, manage roles, and reset passwords. {actor.role === "owner"
            ? "As Owner, you can manage Admins and transfer ownership."
            : "As Admin, you can manage Members."}
        </p>
      </header>
      <UsersManager
        actor={{ id: actor.id, role: actor.role }}
        initialUsers={users}
        initialInvitations={invitations}
      />
    </div>
  );
}

import { getServerSession, type Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasAtLeast, isRole, type Role } from "@/lib/roles";

export type Actor = {
  id: number;
  role: Role;
  username: string | null;
  email: string | null;
};

function actorFromSession(session: Session | null): Actor | null {
  if (!session?.user?.id) return null;
  const idNum = Number(session.user.id);
  if (!Number.isFinite(idNum)) return null;
  const role = session.user.role && isRole(session.user.role) ? session.user.role : "member";
  return {
    id: idNum,
    role,
    username: session.user.name ?? null,
    email: session.user.email ?? null,
  };
}

export async function getActor(): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  return actorFromSession(session);
}

/**
 * For API routes — returns either the authenticated `Actor` or a NextResponse
 * to short-circuit with 401/403. Caller pattern:
 *
 *   const result = await requireRole("admin");
 *   if (result instanceof NextResponse) return result;
 *   const actor = result;
 */
export async function requireRole(
  minimum: Role = "member",
): Promise<Actor | NextResponse> {
  const actor = await getActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAtLeast(actor.role, minimum)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return actor;
}

/** Backwards-compatible helper used by older routes. Kept as a thin alias. */
export async function requireAdminApi() {
  const result = await requireRole("admin");
  if (result instanceof NextResponse) return result;
  return null;
}

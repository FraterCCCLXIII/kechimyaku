import { type Role, hasAtLeast, outranks } from "@/lib/roles";

/**
 * Centralised permission helpers. UI _and_ API call into these so the rules
 * stay in one place. Each helper returns `true` if the action is allowed.
 *
 * Vocabulary:
 *  - `actor` is the user attempting the action.
 *  - `target` is the user being acted upon (where applicable).
 *
 * Rules (single-Owner workspace):
 *  - Owner can do anything to anyone, including transferring ownership.
 *  - Owner can never be deleted directly — ownership must be transferred first.
 *  - Admin can manage Members only (invite/delete/reset/promote a Member to
 *    Admin is not allowed; only Owner can change Admin rank).
 *  - Members have no admin permissions; they can manage their own account.
 */

export type ActorContext = {
  id: number;
  role: Role;
};

export type TargetUser = {
  id: number;
  role: Role;
};

/** Permission to view the user list (Settings → Users). */
export function canViewUsers(actor: ActorContext): boolean {
  return hasAtLeast(actor.role, "admin");
}

/** Permission to invite a user with the given role. */
export function canInvite(actor: ActorContext, asRole: Role): boolean {
  if (asRole === "owner") return false; // ownership is only transferred
  if (!hasAtLeast(actor.role, "admin")) return false;
  // Admin can only invite Members; Owner can invite Members or Admins.
  return actor.role === "owner" || asRole === "member";
}

/** Permission to delete a user. */
export function canDelete(actor: ActorContext, target: TargetUser): boolean {
  if (actor.id === target.id) return false; // never self-delete
  if (target.role === "owner") return false; // must transfer first
  if (!hasAtLeast(actor.role, "admin")) return false;
  // Owner can delete anyone except themselves; Admin only Members.
  if (actor.role === "owner") return true;
  return target.role === "member";
}

/** Permission to change `target`'s role to `nextRole`. */
export function canChangeRole(
  actor: ActorContext,
  target: TargetUser,
  nextRole: Role,
): boolean {
  if (actor.id === target.id) return false; // never change own role
  if (!hasAtLeast(actor.role, "admin")) return false;

  // Promoting to Owner is "transfer ownership" — only the current Owner.
  if (nextRole === "owner") {
    return actor.role === "owner";
  }

  // Demoting an Owner is effectively the same as transfer; require Owner.
  // (In practice we only allow demotion via transfer flow, but cover here.)
  if (target.role === "owner") {
    return actor.role === "owner";
  }

  // Touching an Admin's role requires Owner.
  if (target.role === "admin" || nextRole === "admin") {
    return actor.role === "owner";
  }

  // Member ↔ Member is a no-op; Member ↔ Admin is handled above.
  return true;
}

/** Permission to reset another user's password. */
export function canResetUserPassword(
  actor: ActorContext,
  target: TargetUser,
): boolean {
  if (actor.id === target.id) return false; // self-service flow exists
  if (!hasAtLeast(actor.role, "admin")) return false;
  if (actor.role === "owner") return true;
  // Admins can only reset Members.
  return target.role === "member";
}

/** Permission to read or modify SMTP / app settings. */
export function canManageSettings(actor: ActorContext): boolean {
  return hasAtLeast(actor.role, "admin");
}

/** Permission to transfer ownership to a specific user. */
export function canTransferOwnership(
  actor: ActorContext,
  target: TargetUser,
): boolean {
  return (
    actor.role === "owner" &&
    actor.id !== target.id &&
    target.role !== "owner"
  );
}

/** True if `actor` can act on `target` at all (sanity check helper). */
export function canActOn(actor: ActorContext, target: TargetUser): boolean {
  if (actor.role === "owner") return true;
  if (actor.role === "admin") return target.role === "member";
  return false;
}

export { outranks };

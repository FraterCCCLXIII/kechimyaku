/**
 * Role model for the application.
 *
 * Single-Owner workspace: there is at most one Owner at a time. Promoting
 * another user to Owner ("transfer ownership") demotes the previous Owner
 * to Admin. Owners can manage everyone; Admins can only manage Members.
 */
export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Compare role rank. Returns positive if `a` outranks `b`, 0 if equal, negative otherwise. */
export function compareRoles(a: Role, b: Role): number {
  return RANK[a] - RANK[b];
}

/** True if `role` outranks (is strictly higher than) `other`. */
export function outranks(role: Role, other: Role): boolean {
  return RANK[role] > RANK[other];
}

/** True if `role` is at least `minimum`. */
export function hasAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
  }
}

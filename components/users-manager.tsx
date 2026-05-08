"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canChangeRole,
  canDelete,
  canInvite,
  canResetUserPassword,
  canTransferOwnership,
} from "@/lib/permissions";
import { ROLES, roleLabel, type Role } from "@/lib/roles";

export type UserRow = {
  id: number;
  username: string | null;
  email: string | null;
  role: Role;
  hasPassword: boolean;
  createdAt: string;
};

export type InvitationRow = {
  id: number;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
  invitedBy: { id: number; label: string } | null;
};

type Props = {
  actor: { id: number; role: Role };
  initialUsers: UserRow[];
  initialInvitations: InvitationRow[];
};

type Banner =
  | { kind: "success"; message: string; link?: string }
  | { kind: "error"; message: string }
  | null;

export function UsersManager({ actor, initialUsers, initialInvitations }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as {
      users: UserRow[];
      invitations: InvitationRow[];
    };
    setUsers(data.users);
    setInvitations(data.invitations);
    router.refresh();
  }, [router]);

  const showError = (message: string) => setBanner({ kind: "error", message });
  const showSuccess = (message: string, link?: string) =>
    setBanner({ kind: "success", message, link });

  const onInvite = async (email: string, role: Role) => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        acceptUrl?: string;
        email?: { delivered: boolean; reason?: string };
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      const sent = payload.email?.delivered;
      const message = sent
        ? `Invitation sent to ${email}.`
        : `Invitation created for ${email}. SMTP isn't configured — share the link manually:`;
      showSuccess(message, sent ? undefined : payload.acceptUrl);
      await refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Invite failed.");
    } finally {
      setBusy(false);
    }
  };

  const onChangeRole = async (target: UserRow, nextRole: Role) => {
    if (target.role === nextRole) return;
    if (
      nextRole === "owner" &&
      !window.confirm(
        `Transfer ownership to ${displayName(target)}? You will be demoted to Admin.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        transferredOwnership?: boolean;
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      showSuccess(
        payload.transferredOwnership
          ? `Ownership transferred to ${displayName(target)}.`
          : `Role updated for ${displayName(target)}.`,
      );
      await refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Role change failed.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (target: UserRow) => {
    if (!window.confirm(`Delete user ${displayName(target)}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${target.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      showSuccess(`Deleted ${displayName(target)}.`);
      await refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  const onResetPassword = async (target: UserRow) => {
    if (
      !window.confirm(
        `Generate a password reset link for ${displayName(target)}?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/users/${target.id}/reset-password`,
        { method: "POST" },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        resetUrl?: string;
        targetHasEmail?: boolean;
        email?: { delivered: boolean };
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      const sent = payload.email?.delivered;
      const message = sent
        ? `Reset link emailed to ${target.email}.`
        : `Reset link generated. ${
            payload.targetHasEmail
              ? "SMTP isn't configured — share the link manually:"
              : "User has no email — share the link manually:"
          }`;
      showSuccess(message, sent ? undefined : payload.resetUrl);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRevokeInvite = async (id: number) => {
    if (!window.confirm("Revoke this invitation?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/invitations/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
      showSuccess("Invitation revoked.");
      await refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Revoke failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {banner ? (
        <div
          role={banner.kind === "error" ? "alert" : "status"}
          className={`rounded border px-3 py-2 text-sm ${
            banner.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div>{banner.message}</div>
          {banner.kind === "success" && banner.link ? (
            <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs text-[var(--ink)]">
              {banner.link}
            </code>
          ) : null}
        </div>
      ) : null}

      <InviteForm actor={actor} disabled={busy} onSubmit={onInvite} />

      <section className="rounded-md border border-[var(--hairline)] bg-white">
        <header className="border-b border-[var(--hairline)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Users</h3>
        </header>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-[var(--hairline)] align-middle"
              >
                <td className="px-4 py-2 text-[var(--ink)]">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {u.username ?? <em className="text-[var(--muted)]">(invited, not yet activated)</em>}
                    </span>
                    {actor.id === u.id ? (
                      <span className="text-xs text-[var(--muted)]">You</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-2 text-[var(--body)]">
                  {u.email ?? <span className="text-[var(--muted)]">—</span>}
                </td>
                <td className="px-4 py-2">
                  <RoleSelect
                    actor={actor}
                    target={u}
                    disabled={busy}
                    onChange={(next) => onChangeRole(u, next)}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    {canResetUserPassword(actor, u) ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onResetPassword(u)}
                        className={btnSecondary}
                      >
                        Reset password
                      </button>
                    ) : null}
                    {canDelete(actor, u) ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete(u)}
                        className={btnDanger}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {invitations.length > 0 ? (
        <section className="rounded-md border border-[var(--hairline)] bg-white">
          <header className="border-b border-[var(--hairline)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              Pending invitations
            </h3>
          </header>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Invited by</th>
                <th className="px-4 py-2">Expires</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((i) => (
                <tr key={i.id} className="border-t border-[var(--hairline)]">
                  <td className="px-4 py-2 text-[var(--ink)]">{i.email}</td>
                  <td className="px-4 py-2 capitalize">{i.role}</td>
                  <td className="px-4 py-2 text-[var(--body)]">
                    {i.invitedBy?.label ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-[var(--body)]">
                    {new Date(i.expiresAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onRevokeInvite(i.id)}
                        className={btnDanger}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}

function displayName(u: UserRow): string {
  return u.username ?? u.email ?? `#${u.id}`;
}

const btnSecondary =
  "rounded border border-[var(--hairline)] bg-white px-2 py-1 text-xs !text-[var(--ink)] hover:bg-[var(--surface-card)] disabled:cursor-not-allowed disabled:opacity-60";
const btnDanger =
  "rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function RoleSelect({
  actor,
  target,
  disabled,
  onChange,
}: {
  actor: { id: number; role: Role };
  target: UserRow;
  disabled: boolean;
  onChange: (role: Role) => void;
}) {
  // Build the set of legal next-roles.
  const options = ROLES.filter((r) => {
    if (r === target.role) return true;
    if (r === "owner") return canTransferOwnership(actor, target);
    return canChangeRole(actor, target, r);
  });

  if (options.length === 1 && options[0] === target.role) {
    return (
      <span className="capitalize text-[var(--body)]">
        {roleLabel(target.role)}
      </span>
    );
  }

  return (
    <select
      value={target.role}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Role)}
      className="rounded border border-[var(--hairline)] bg-white px-2 py-1 text-sm text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {options.map((r) => (
        <option key={r} value={r}>
          {roleLabel(r)}
        </option>
      ))}
    </select>
  );
}

function InviteForm({
  actor,
  disabled,
  onSubmit,
}: {
  actor: { id: number; role: Role };
  disabled: boolean;
  onSubmit: (email: string, role: Role) => void;
}) {
  const [email, setEmail] = useState("");
  const inviteRoles: Role[] = (["admin", "member"] as const).filter((r) =>
    canInvite(actor, r),
  );
  const [role, setRole] = useState<Role>(inviteRoles[0] ?? "member");

  if (inviteRoles.length === 0) return null;

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-md border border-[var(--hairline)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        onSubmit(email.trim().toLowerCase(), role);
        setEmail("");
      }}
    >
      <div className="flex-1 min-w-[16rem]">
        <label
          htmlFor="invite-email"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]"
        >
          Invite email
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={disabled}
          placeholder="person@example.com"
          className="w-full rounded border border-[var(--hairline)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--primary)] focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="invite-role"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]"
        >
          Role
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={disabled}
          className="rounded border border-[var(--hairline)] bg-white px-2 py-2 text-sm text-[var(--ink)]"
        >
          {inviteRoles.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-[var(--primary)] px-3 py-2 text-sm text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
      >
        Send invite
      </button>
    </form>
  );
}

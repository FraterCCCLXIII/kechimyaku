"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type AccountFormProps = {
  initialEmail: string | null;
  username: string | null;
  role: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function AccountForm({ initialEmail, username, role }: AccountFormProps) {
  const router = useRouter();
  const { update } = useSession();

  const [email, setEmail] = useState(initialEmail ?? "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>({ kind: "idle" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<Status>({ kind: "idle" });

  const onSaveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: emailCurrentPassword,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }
      setEmailStatus({ kind: "success", message: "Email updated." });
      setEmailCurrentPassword("");
      await update();
      router.refresh();
    } catch (error) {
      setEmailStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Update failed.",
      });
    }
  };

  const onSavePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ kind: "error", message: "New passwords don't match." });
      return;
    }
    setPwStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }
      setPwStatus({ kind: "success", message: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPwStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Update failed.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Section
        title="Profile"
        description="Your username and role. Username changes aren't supported yet."
      >
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <dt className="text-[var(--muted)]">Username</dt>
          <dd className="col-span-2 font-mono text-[var(--ink)]">
            {username ?? <span className="text-[var(--muted)]">—</span>}
          </dd>
          <dt className="text-[var(--muted)]">Role</dt>
          <dd className="col-span-2 capitalize text-[var(--ink)]">{role}</dd>
        </dl>
      </Section>

      <Section
        title="Email"
        description="Used for sign-in and password recovery."
      >
        <form className="space-y-3" onSubmit={onSaveEmail}>
          <Field label="New email" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Current password" htmlFor="email-current-password">
            <input
              id="email-current-password"
              type="password"
              autoComplete="current-password"
              required
              value={emailCurrentPassword}
              onChange={(e) => setEmailCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <FormFooter
            status={emailStatus}
            label={emailStatus.kind === "saving" ? "Saving…" : "Update email"}
          />
        </form>
      </Section>

      <Section
        title="Password"
        description="Change your sign-in password."
      >
        <form className="space-y-3" onSubmit={onSavePassword}>
          <Field label="Current password" htmlFor="current-password">
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="New password" htmlFor="new-password">
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password">
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <FormFooter
            status={pwStatus}
            label={pwStatus.kind === "saving" ? "Saving…" : "Update password"}
          />
        </form>
      </Section>
    </div>
  );
}

const inputClass =
  "w-full rounded border border-[var(--hairline)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--primary)] focus:outline-none";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-[var(--hairline)] bg-white p-5">
      <header className="mb-4">
        <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-[var(--body)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function FormFooter({ status, label }: { status: Status; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={status.kind === "saving"}
        className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--primary-active)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>
      {status.kind === "success" ? (
        <p role="status" className="text-sm text-emerald-700">
          {status.message}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p role="alert" className="text-sm text-[var(--primary)]">
          {status.message}
        </p>
      ) : null}
    </div>
  );
}

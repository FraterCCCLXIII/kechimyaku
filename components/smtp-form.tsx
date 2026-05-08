"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SmtpView = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromAddress: string;
  fromName?: string;
  baseUrl?: string;
  hasPassword: boolean;
};

type Props = {
  initial: SmtpView | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "testing" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function SmtpForm({ initial }: Props) {
  const router = useRouter();
  const [host, setHost] = useState(initial?.host ?? "");
  const [port, setPort] = useState(initial?.port ?? 587);
  const [secure, setSecure] = useState(initial?.secure ?? false);
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [fromAddress, setFromAddress] = useState(initial?.fromAddress ?? "");
  const [fromName, setFromName] = useState(initial?.fromName ?? "");
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl ?? "");
  const [testTo, setTestTo] = useState("");
  const [hasPassword, setHasPassword] = useState(initial?.hasPassword ?? false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/admin/settings/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port),
          secure,
          username: username.trim(),
          // Only send password when the user actually typed one; the server
          // preserves the existing value when this field is omitted.
          ...(password ? { password } : {}),
          fromAddress: fromAddress.trim(),
          fromName: fromName.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: unknown;
        smtp?: SmtpView;
      };
      if (!response.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : `HTTP ${response.status}`,
        );
      }
      setPassword("");
      if (payload.smtp) setHasPassword(payload.smtp.hasPassword);
      setStatus({ kind: "success", message: "SMTP settings saved." });
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Save failed.",
      });
    }
  };

  const onTest = async () => {
    if (!testTo.trim()) {
      setStatus({ kind: "error", message: "Enter a recipient for the test." });
      return;
    }
    setStatus({ kind: "testing" });
    try {
      const response = await fetch("/api/admin/settings/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: unknown;
        ok?: boolean;
        messageId?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : `HTTP ${response.status}`,
        );
      }
      setStatus({
        kind: "success",
        message: `Test email sent (id ${payload.messageId ?? "—"}).`,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Test failed.",
      });
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSave}>
      <Section
        title="Server"
        description="Outgoing SMTP server used for invitations and password resets."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field className="md:col-span-2" label="Host" htmlFor="host">
            <input
              id="host"
              type="text"
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className={inputClass}
              placeholder="smtp.example.com"
            />
          </Field>
          <Field label="Port" htmlFor="port">
            <input
              id="port"
              type="number"
              min={1}
              max={65535}
              required
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || 0)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            id="secure"
            type="checkbox"
            checked={secure}
            onChange={(e) => setSecure(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <label htmlFor="secure" className="text-sm text-[var(--body)]">
            Use TLS (port 465). Leave unchecked for STARTTLS on 587.
          </label>
        </div>
      </Section>

      <Section
        title="Authentication"
        description="SMTP username/password (stored encrypted at rest)."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Username" htmlFor="smtp-username">
            <input
              id="smtp-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="smtp-password"
            hint={
              hasPassword
                ? "Leave blank to keep the saved password."
                : "Provider's SMTP password or app token."
            }
          >
            <input
              id="smtp-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder={hasPassword ? "••••••••" : ""}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Sender"
        description="The From address shown in outgoing emails."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="From address" htmlFor="from-address">
            <input
              id="from-address"
              type="email"
              required
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className={inputClass}
              placeholder="no-reply@example.com"
            />
          </Field>
          <Field label="From name" htmlFor="from-name">
            <input
              id="from-name"
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className={inputClass}
              placeholder="Kechimyaku"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Public URL"
        description="Used to build links in emails (e.g. invite/reset URLs)."
      >
        <Field label="Base URL" htmlFor="base-url">
          <input
            id="base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className={inputClass}
            placeholder="https://kechimyaku.example.com"
          />
        </Field>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === "saving" || status.kind === "testing"}
          className="rounded bg-[var(--primary)] px-3 py-2 text-sm text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
        >
          {status.kind === "saving" ? "Saving…" : "Save SMTP settings"}
        </button>
        <span className="ml-2 text-[var(--hairline)]">·</span>
        <input
          type="email"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          placeholder="test recipient@example.com"
          className="rounded border border-[var(--hairline)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
        />
        <button
          type="button"
          onClick={onTest}
          disabled={status.kind === "saving" || status.kind === "testing"}
          className="rounded border border-[var(--hairline)] bg-white px-3 py-2 text-sm !text-[var(--ink)] hover:bg-[var(--surface-card)] disabled:opacity-60"
        >
          {status.kind === "testing" ? "Sending…" : "Send test email"}
        </button>
      </div>

      {status.kind === "success" ? (
        <p role="status" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {status.message}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {status.message}
        </p>
      ) : null}
    </form>
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
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-[var(--body)]">
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

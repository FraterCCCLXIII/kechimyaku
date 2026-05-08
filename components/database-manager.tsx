"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; filename: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type DatabaseManagerProps = {
  filename: string;
  sizeLabel: string;
};

export function DatabaseManager({ filename, sizeLabel }: DatabaseManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      `Replace the current database with "${file.name}"?\n\n` +
        "A timestamped backup of the current database will be saved alongside it.",
    );
    if (!confirmed) return;

    setStatus({ kind: "uploading", filename: file.name });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/settings/database", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        backup?: string;
      };
      if (!response.ok) {
        throw new Error(
          payload.error ?? `Upload failed (HTTP ${response.status}).`,
        );
      }
      setStatus({
        kind: "success",
        message: payload.backup
          ? `Database replaced. Previous version backed up as ${payload.backup}.`
          : "Database replaced successfully.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unknown upload error.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-[var(--hairline)] bg-white p-5">
        <header className="mb-4">
          <h3 className="text-base font-semibold text-[var(--ink)]">
            Current database
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <span className="font-mono text-[var(--body)]">{filename}</span>
            <span className="mx-2 text-[var(--hairline)]">·</span>
            <span>{sizeLabel}</span>
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/settings/database"
            className="inline-flex items-center gap-2 rounded border border-[var(--hairline)] bg-white px-3 py-1.5 text-sm !text-[var(--ink)] hover:bg-[var(--surface-card)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download database
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status.kind === "uploading"}
            className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--primary-active)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {status.kind === "uploading" ? "Uploading…" : "Upload database"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3,application/x-sqlite3,application/octet-stream"
            className="sr-only"
            onChange={onUpload}
          />
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          Uploading replaces the live database. The previous file is saved as
          <span className="font-mono"> {filename}.backup-YYYYMMDD-HHMMSS</span>.
        </p>

        {status.kind === "uploading" ? (
          <p className="mt-4 text-sm text-[var(--body)]">
            Uploading{" "}
            <span className="font-mono">{status.filename}</span>…
          </p>
        ) : null}
        {status.kind === "success" ? (
          <p
            role="status"
            className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          >
            {status.message}
          </p>
        ) : null}
        {status.kind === "error" ? (
          <p
            role="alert"
            className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          >
            {status.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}

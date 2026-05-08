import path from "node:path";
import { promises as fs } from "node:fs";

/**
 * Resolves the on-disk path of the SQLite database backing this app.
 * Uses `DATABASE_URL` (e.g. `file:./data/dev.db`) and resolves it relative to
 * `process.cwd()` so it matches Prisma's own resolution.
 */
export function resolveDatabaseFilePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/dev.db";
  const raw = url.startsWith("file:") ? url.slice(5) : url;
  if (path.isAbsolute(raw)) {
    return raw;
  }
  const normalized = raw.replace(/^\.?\//, "");
  if (normalized.startsWith("data/")) {
    return path.join(process.cwd(), "data", normalized.slice("data/".length));
  }
  // Keep relative paths scoped under /data to avoid broad filesystem tracing.
  return path.join(process.cwd(), "data", path.basename(normalized));
}

/** Returns size in bytes of the database file, or `null` if it doesn't exist. */
export async function getDatabaseFileSize(): Promise<number | null> {
  try {
    const stat = await fs.stat(resolveDatabaseFilePath());
    return stat.size;
  } catch {
    return null;
  }
}

/**
 * Returns the directory used to store .backup-* snapshots for the database.
 * Backups live next to the DB file.
 */
export function getDatabaseBackupDir(): string {
  return path.dirname(resolveDatabaseFilePath());
}

/** Format bytes as a human-readable string (e.g. "1.3 MB"). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIdx]}`;
}

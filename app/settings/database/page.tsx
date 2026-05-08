import path from "node:path";
import { DatabaseManager } from "@/components/database-manager";
import {
  formatBytes,
  getDatabaseFileSize,
  resolveDatabaseFilePath,
} from "@/lib/db-file";

export const dynamic = "force-dynamic";

export default async function SettingsDatabasePage() {
  const filePath = resolveDatabaseFilePath();
  const filename = path.basename(filePath);
  const size = await getDatabaseFileSize();
  const sizeLabel = size === null ? "missing" : formatBytes(size);

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Database</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Download the live SQLite database for backup, or upload a replacement
          file to restore from one.
        </p>
      </header>
      <DatabaseManager filename={filename} sizeLabel={sizeLabel} />
    </div>
  );
}

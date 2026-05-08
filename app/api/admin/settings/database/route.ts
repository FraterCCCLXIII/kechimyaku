import path from "node:path";
import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth-guard";
import { resolveDatabaseFilePath } from "@/lib/db-file";

// SQLite file magic header: "SQLite format 3\0"
const SQLITE_MAGIC = Buffer.from([
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74,
  0x20, 0x33, 0x00,
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const filePath = resolveDatabaseFilePath();
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json(
      { error: "Database file not found." },
      { status: 404 },
    );
  }

  const filename = path.basename(filePath);
  const stamp = formatStamp(new Date());
  const downloadName = filename.replace(/(\.[^.]+)?$/, `-${stamp}$1`);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a `file` field." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "No file uploaded." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (
    buffer.length < SQLITE_MAGIC.length ||
    !buffer.subarray(0, SQLITE_MAGIC.length).equals(SQLITE_MAGIC)
  ) {
    return NextResponse.json(
      {
        error:
          "File does not appear to be a valid SQLite database (magic header mismatch).",
      },
      { status: 400 },
    );
  }

  const filePath = resolveDatabaseFilePath();
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const stamp = formatStamp(new Date());
  const backupName = `${filename}.backup-${stamp}`;
  const backupPath = path.join(dir, backupName);

  try {
    // Release the better-sqlite3 file handle before swapping the file.
    await db.$disconnect();

    // Snapshot current DB before overwriting.
    try {
      await fs.copyFile(filePath, backupPath);
    } catch (error) {
      // If the live DB doesn't exist yet, that's fine; otherwise rethrow.
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
    }

    // Write the new database atomically (write to temp, then rename).
    const tmpPath = path.join(dir, `${filename}.upload-${stamp}.tmp`);
    await fs.writeFile(tmpPath, buffer);
    await fs.rename(tmpPath, filePath);

    // Best-effort cleanup of stale -journal / -wal / -shm sidecar files
    // left from the prior database (they belong to the old content).
    await Promise.allSettled([
      fs.unlink(`${filePath}-journal`),
      fs.unlink(`${filePath}-wal`),
      fs.unlink(`${filePath}-shm`),
    ]);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to replace database: ${error.message}`
            : "Failed to replace database.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    backup: backupName,
    size: buffer.length,
  });
}

function formatStamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

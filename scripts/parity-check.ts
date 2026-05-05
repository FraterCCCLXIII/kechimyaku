import "dotenv/config";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

const candidateLegacyPaths = [
  process.env.LEGACY_DATABASE_PATH,
  "/Users/paulbloch/Documents/github/Kechimyaku/kechimyaku/db/database.db",
  "/Users/paulbloch/Documents/github/Kechimyaku/database.db",
].filter(Boolean) as string[];

function resolveLegacyPath() {
  const match = candidateLegacyPaths.find((path) => existsSync(path));
  if (!match) {
    throw new Error(
      "Could not find legacy SQLite database. Set LEGACY_DATABASE_PATH to continue.",
    );
  }
  return match;
}

function legacyCount(dbPath: string, tableName: string) {
  const output = execFileSync("sqlite3", [dbPath, `SELECT COUNT(*) FROM ${tableName};`], {
    encoding: "utf8",
  }).trim();
  return Number.parseInt(output, 10);
}

function legacyValidRelationshipCount(dbPath: string) {
  const sql = `
    SELECT COUNT(*)
    FROM relationships r
    INNER JOIN masters parent ON parent.id = r.parent_master_id
    INNER JOIN masters child ON child.id = r.child_master_id;
  `;
  const output = execFileSync("sqlite3", [dbPath, sql], {
    encoding: "utf8",
  }).trim();
  return Number.parseInt(output, 10);
}

async function run() {
  const legacyPath = resolveLegacyPath();

  const legacyRaw = {
    masters: legacyCount(legacyPath, "masters"),
    relationshipTypes: legacyCount(legacyPath, "relationship_types"),
    relationships: legacyCount(legacyPath, "relationships"),
  };
  const legacyValid = {
    masters: legacyRaw.masters,
    relationshipTypes: legacyRaw.relationshipTypes,
    relationships: legacyValidRelationshipCount(legacyPath),
  };

  const current = {
    masters: await prisma.master.count(),
    relationshipTypes: await prisma.relationshipType.count(),
    relationships: await prisma.relationship.count(),
  };

  const matches =
    legacyValid.masters === current.masters &&
    legacyValid.relationshipTypes === current.relationshipTypes &&
    legacyValid.relationships === current.relationships;

  console.log(
    JSON.stringify(
      {
        legacyRaw,
        legacyValid,
        current,
        matches,
      },
      null,
      2,
    ),
  );

  if (!matches) {
    process.exitCode = 1;
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

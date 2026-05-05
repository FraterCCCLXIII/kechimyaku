import "dotenv/config";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type LegacyMaster = {
  id: number;
  name: string | null;
  name_native: string | null;
  overview: string | null;
  year_born: number | null;
  year_died: number | null;
  gender: string | null;
  location: string | null;
  is_root: number | null;
};

type LegacyRelationshipType = {
  id: number;
  name: string | null;
};

type LegacyRelationship = {
  parent_master_id: number;
  child_master_id: number;
  relationship_type_id: number | null;
};

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

function queryLegacy<T>(dbPath: string, sql: string): T[] {
  const output = execFileSync("sqlite3", ["-json", dbPath, sql], {
    encoding: "utf8",
  }).trim();

  if (!output) {
    return [];
  }
  return JSON.parse(output) as T[];
}

async function run() {
  const legacyPath = resolveLegacyPath();
  console.log(`Using legacy database: ${legacyPath}`);

  const masters = queryLegacy<LegacyMaster>(
    legacyPath,
    "SELECT id, name, name_native, overview, year_born, year_died, gender, location, is_root FROM masters ORDER BY id;",
  );
  const relationshipTypes = queryLegacy<LegacyRelationshipType>(
    legacyPath,
    "SELECT id, name FROM relationship_types ORDER BY id;",
  );
  const relationships = queryLegacy<LegacyRelationship>(
    legacyPath,
    "SELECT parent_master_id, child_master_id, relationship_type_id FROM relationships ORDER BY parent_master_id, child_master_id;",
  );
  const masterIds = new Set(masters.map((master) => master.id));
  const relationshipTypeIds = new Set(relationshipTypes.map((type) => type.id));
  let skippedRelationships = 0;

  await prisma.$transaction(async (tx) => {
    await tx.relationship.deleteMany();
    await tx.wikiEntry.deleteMany();
    await tx.relationshipType.deleteMany();
    await tx.master.deleteMany();

    for (const type of relationshipTypes) {
      await tx.relationshipType.create({
        data: {
          id: type.id,
          name: type.name,
        },
      });
    }

    for (const master of masters) {
      await tx.master.create({
        data: {
          id: master.id,
          name: master.name,
          nameNative: master.name_native,
          overview: master.overview,
          yearBorn: master.year_born,
          yearDied: master.year_died,
          gender: master.gender,
          location: master.location,
          isRoot: master.is_root === 1,
        },
      });
    }

    for (const relationship of relationships) {
      if (
        !masterIds.has(relationship.parent_master_id) ||
        !masterIds.has(relationship.child_master_id)
      ) {
        skippedRelationships += 1;
        continue;
      }

      const relationshipTypeId =
        relationship.relationship_type_id &&
        relationshipTypeIds.has(relationship.relationship_type_id)
          ? relationship.relationship_type_id
          : null;

      await tx.relationship.create({
        data: {
          parentMasterId: relationship.parent_master_id,
          childMasterId: relationship.child_master_id,
          relationshipTypeId,
        },
      });
    }
  });

  const [newMasterCount, newRelationshipTypeCount, newRelationshipCount] =
    await Promise.all([
      prisma.master.count(),
      prisma.relationshipType.count(),
      prisma.relationship.count(),
    ]);

  console.log("Import complete.");
  console.log(
    JSON.stringify(
      {
        source: {
          masters: masters.length,
          relationshipTypes: relationshipTypes.length,
          relationships: relationships.length,
        },
        imported: {
          masters: newMasterCount,
          relationshipTypes: newRelationshipTypeCount,
          relationships: newRelationshipCount,
        },
        skippedRelationships,
      },
      null,
      2,
    ),
  );
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

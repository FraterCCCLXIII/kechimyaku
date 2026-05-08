import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./data/dev.db",
  }),
});

async function run() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await hash(password, 12);

  // Seed the workspace Owner. If an Owner already exists with a different
  // username, the script becomes a no-op for the role to avoid hijacking it;
  // it still resets the password for `username`.
  const existingOwner = await prisma.user.findFirst({ where: { role: "owner" } });
  await prisma.user.upsert({
    where: { username },
    create: {
      username,
      passwordHash,
      role: existingOwner ? "admin" : "owner",
    },
    update: {
      passwordHash,
      role: existingOwner && existingOwner.username !== username ? "admin" : "owner",
    },
  });

  console.log(
    `Seeded user ${username} (${existingOwner && existingOwner.username !== username ? "admin" : "owner"}).`,
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

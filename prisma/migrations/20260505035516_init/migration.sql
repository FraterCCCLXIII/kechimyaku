-- CreateTable
CREATE TABLE "masters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "name_native" TEXT,
    "overview" TEXT,
    "year_born" INTEGER,
    "year_died" INTEGER,
    "gender" TEXT,
    "location" TEXT,
    "is_root" BOOLEAN
);

-- CreateTable
CREATE TABLE "relationship_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parent_master_id" INTEGER NOT NULL,
    "child_master_id" INTEGER NOT NULL,
    "relationship_type_id" INTEGER,
    CONSTRAINT "relationships_parent_master_id_fkey" FOREIGN KEY ("parent_master_id") REFERENCES "masters" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "relationships_child_master_id_fkey" FOREIGN KEY ("child_master_id") REFERENCES "masters" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "relationships_relationship_type_id_fkey" FOREIGN KEY ("relationship_type_id") REFERENCES "relationship_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wiki_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "masterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wiki_entries_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "masters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "masters_name_idx" ON "masters"("name");

-- CreateIndex
CREATE INDEX "masters_is_root_idx" ON "masters"("is_root");

-- CreateIndex
CREATE INDEX "relationships_parent_master_id_idx" ON "relationships"("parent_master_id");

-- CreateIndex
CREATE INDEX "relationships_child_master_id_idx" ON "relationships"("child_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "relationships_parent_master_id_child_master_id_relationship_type_id_key" ON "relationships"("parent_master_id", "child_master_id", "relationship_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_entries_masterId_key" ON "wiki_entries"("masterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

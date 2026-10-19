/*
path :           lib/prisma.ts
tag :            ["prisma", "db", "server-only", "singleton"]
projectId:       new-genesis
type:            config
generic:         true

role:            Singleton Prisma 7 avec adaptateur SQLite (better-sqlite3).
                 Évite de recréer un client à chaque rechargement en dev en
                 mémorisant l'instance sur globalThis. L'URL SQLite vient de
                 DATABASE_URL (validée par @/lib/env). Importable UNIQUEMENT
                 côté serveur.

flow:            createClient() → new PrismaBetterSqlite3({ url: env.DATABASE_URL })
                 → new PrismaClient({ adapter }) → export prisma
                 (globalForPrisma.prisma ?? createClient()).

ecosystem:       Lib = [
                   "@/lib/env.ts",
                   "@/lib/prisma.ts",
                   "@/lib/utils.ts",
                 ]

relatedFiles:    ["@/lib/env.ts",
                  "@/lib/auth/auth.ts"]

imports:         ["server-only",
                  "@prisma/adapter-better-sqlite3",
                  "@/lib/generated/prisma/client",
                  "@/lib/env"]

exports:         ["prisma", "default"]

useBy:           ["@/lib/auth/auth.ts",
                  "@/app/core/lib/scrum/storage.ts"]

userStories:     ["*en tant que développeur je veux un client Prisma unique partagé"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
/*
path :           scripts/seed-users.ts
tag :            ["script", "seed", "users", "auth", "demo", "idempotent"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Script CLI pnpm seed:users. Peuple 3 utilisateurs
                 fictifs STABLES (ids déterministes utilisés dans les
                 fixtures blog.seed.json) pour que les FK (authorId,
                 ownerId, members[].userId, notifications[].actorId)
                 soient satisfaites. Crée les 3 Users + leurs comptes
                 Better Auth (password hashé) + leurs Profils. Idempotent
                 (upsert). Aucun effet sur les User existants.

                 Utilisateurs :
                   - 00000000-0000-4000-8000-000000000001
                     admin@genesis.local / Admin Genesis / role admin
                   - 00000000-0000-4000-8000-000000000002
                     auteur@genesis.local / Auteur Genesis
                   - 00000000-0000-4000-8000-000000000003
                     lecteur@genesis.local / Lecteur Genesis

                 Mot de passe par défaut : "demo-password-123"
                 (changeable via SEED_USER_PASSWORD).

flow:            main() → parse args (--reset) → pour chaque user :
                 prisma.user.upsert (update: { name, email }) →
                 prisma.account.upsert (providerId "credential",
                 password hashé via better-auth/crypto.hashPassword) →
                 prisma.profile.upsert (name = displayName).
                 --reset : deleteMany sur Profile, Account, Session,
                 User des 3 ids seulement (ne touche pas aux autres
                 comptes).

ecosystem:       Scripts = [
                   "data/fixtures/blog.seed.json",
                   "scripts/backup.ts",
                   "scripts/export-prisma.ts",
                   "scripts/seed.ts",
                   "scripts/seed-users.ts",
                 ]

relatedFiles:    ["@/lib/prisma.ts",
                  "prisma/schema.prisma"]

imports:         ["@/lib/prisma", "better-auth/crypto"]

exports:         []

useBy:           []

userStories:     ["us1100014"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

interface SeedUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly displayName: string;
}

const SEED_USERS: readonly SeedUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "admin@genesis.local",
    name: "Admin Genesis",
    displayName: "Admin",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "auteur@genesis.local",
    name: "Auteur Genesis",
    displayName: "Auteur",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "lecteur@genesis.local",
    name: "Lecteur Genesis",
    displayName: "Lecteur",
  },
];

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD ?? "demo-password-123";

async function wipeSeedUsers(): Promise<void> {
  const ids = SEED_USERS.map((u) => u.id);
  await prisma.profile.deleteMany({ where: { userId: { in: ids } } });
  await prisma.account.deleteMany({ where: { userId: { in: ids } } });
  await prisma.session.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

async function main(): Promise<void> {
  const reset = process.argv.includes("--reset");
  if (reset) await wipeSeedUsers();

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
      },
    });

    /* Compte Better Auth (credential) */
    await prisma.account.upsert({
      where: { id: `seed-account-${u.id}` },
      update: { password: hashedPassword },
      create: {
        id: `seed-account-${u.id}`,
        userId: u.id,
        accountId: u.email,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    /* Profil */
    await prisma.profile.upsert({
      where: { userId: u.id },
      update: { name: u.displayName },
      create: {
        userId: u.id,
        name: u.displayName,
        displayOrder: SEED_USERS.findIndex((x) => x.id === u.id),
      },
    });
  }

  console.log(
    `✔ Seed users : ${SEED_USERS.length} utilisateurs prêts (mot de passe : ${DEFAULT_PASSWORD}).`,
  );
  console.log("   • admin@genesis.local");
  console.log("   • auteur@genesis.local");
  console.log("   • lecteur@genesis.local");
}

main()
  .catch((error) => {
    console.error("[seed-users] Échec :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
/*
path :           app/blog/lib/admin.ts
tag :            ["blog", "admin", "bootstrap", "roles", "server-only"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Gestion des administrateurs du module Blog.
                 isAdmin() vérifie que l'utilisateur courant est dans
                 meta.adminIds. bootstrapFirstAdmin() promeut
                 automatiquement le premier utilisateur connecté si
                 aucun admin n'existe (ou l'utilisateur dont l'email est
                 dans ADMIN_EMAIL), de manière idempotente.
                 promoteToAdmin(targetUserId) permet à un admin existant
                 de promouvoir un autre utilisateur.
                 listAdminIds() / listAdminEmails() alimentent l'écran
                 /blog/admin/setup. Importable UNIQUEMENT côté serveur.

flow:            isAdmin() → getBlogUserId() → readBlog().meta.adminIds
                 .includes(userId).
                 bootstrapFirstAdmin() → readBlog() → si adminIds vide →
                 getBlogSession() → vérifie ADMIN_EMAIL si défini →
                 mutateBlog() ajoute userId → { promoted: true }.
                 promoteToAdmin(targetId) → isAdmin() → mutateBlog()
                 ajoute targetId si absent → void.
                 listAdminIds() → readBlog().meta.adminIds.
                 listAdminEmails() → fetch Prisma User par ids.

ecosystem:       BlogCore = [
                   "@/app/blog/lib/admin.ts",
                   "@/app/blog/lib/ecosystem.ts",
                   "@/app/blog/lib/media.ts",
                   "@/app/blog/lib/session.ts",
                   "@/app/blog/lib/storage.ts",
                   "@/app/blog/lib/tree.ts",
                   "@/app/blog/lib/types.ts",
                   "@/app/blog/lib/utils/reading-time.ts",
                   "@/app/blog/lib/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/session.ts",
                  "@/app/blog/lib/storage.ts",
                  "@/app/blog/lib/types.ts",
                  "@/lib/prisma.ts"]
imports:         ["server-only",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/storage",
                  "@/app/blog/lib/types",
                  "@/lib/prisma"]
exports:         ["isAdmin", "bootstrapFirstAdmin", "promoteToAdmin",
                  "listAdminIds", "listAdminUsers", "BootstrapResult",
                  "AdminUserSummary"]
useBy:           ["@/app/blog/admin/setup/page.tsx",
                  "@/app/blog/lib/actions/taxonomy.ts",
                  "@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/actions/group.ts"]

userStories:     ["us1100012"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { prisma } from "@/lib/prisma";

import {
  getBlogSession,
  getBlogUserId,
} from "@/app/blog/lib/session";
import { mutateBlog, readBlog } from "@/app/blog/lib/storage";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface BootstrapResult {
  readonly promoted: boolean;
  readonly userId?: string;
  readonly reason?: string;
}

export interface AdminUserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly isAdmin: boolean;
}

/* ------------------------------------------------------------------ */
/*  Vérification                                                      */
/* ------------------------------------------------------------------ */

export async function isAdmin(): Promise<boolean> {
  const userId = await getBlogUserId();
  if (!userId) return false;
  const doc = await readBlog();
  return doc.meta.adminIds.includes(userId);
}

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                         */
/* ------------------------------------------------------------------ */

/**
 * Promeut le premier utilisateur connecté au rôle admin si aucun admin
 * n'existe encore. Supporte la variable ADMIN_EMAIL (liste séparée par
 * des virgules) : si elle est définie, seuls les emails listés peuvent
 * être promus par bootstrap. Idempotent : ne fait rien si un admin
 * existe déjà.
 */
export async function bootstrapFirstAdmin(): Promise<BootstrapResult> {
  const doc = await readBlog();
  if (doc.meta.adminIds.length > 0) {
    return { promoted: false, reason: "Un administrateur existe déjà." };
  }

  const session = await getBlogSession();
  if (!session?.user) {
    return { promoted: false, reason: "Aucune session active." };
  }

  const envEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const email = (session.user.email ?? "").toLowerCase();
  if (envEmails.length > 0 && !envEmails.includes(email)) {
    return {
      promoted: false,
      reason: "ADMIN_EMAIL est défini et ne contient pas votre email.",
    };
  }

  const userId = session.user.id;
  await mutateBlog((current) => ({
    ...current,
    meta: {
      ...current.meta,
      adminIds: [...current.meta.adminIds, userId],
    },
  }));

  return { promoted: true, userId };
}

/* ------------------------------------------------------------------ */
/*  Promotion                                                         */
/* ------------------------------------------------------------------ */

export async function promoteToAdmin(targetUserId: string): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("[blog/admin] Rôle administrateur requis.");
  }
  const doc = await readBlog();
  if (doc.meta.adminIds.includes(targetUserId)) return;
  await mutateBlog((current) => ({
    ...current,
    meta: {
      ...current.meta,
      adminIds: [...current.meta.adminIds, targetUserId],
    },
  }));
}

/* ------------------------------------------------------------------ */
/*  Lecture                                                           */
/* ------------------------------------------------------------------ */

export async function listAdminIds(): Promise<readonly string[]> {
  const doc = await readBlog();
  return doc.meta.adminIds;
}

export async function listAdminUsers(): Promise<readonly AdminUserSummary[]> {
  const doc = await readBlog();
  const adminIds = doc.meta.adminIds;
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: adminIds.includes(user.id),
  }));
}
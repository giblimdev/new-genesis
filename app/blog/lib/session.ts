/*
path :           app/blog/lib/session.ts
tag :            ["blog", "session", "server-only", "wrapper"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Wrapper serveur autour de getSession (déjà mémoïsé par
                 React.cache dans @/lib/auth/session). Point d'entrée
                 unique pour lire l'utilisateur courant depuis les
                 services et Server Actions du module Blog. Expose trois
                 helpers : getBlogSession() (session brute),
                 getBlogUserId() (id ou null), requireBlogSession() (id
                 ou throw). Importable UNIQUEMENT côté serveur.

flow:            getBlogSession() → getSession() (déjà mémoïsé) → Session
                 | null.
                 getBlogUserId() → getBlogSession()?.user.id ?? null.
                 requireBlogSession() → getBlogSession() → throw si null →
                 Session garanti non-null.

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

relatedFiles:    ["@/lib/auth/session.ts", "@/lib/auth/auth.ts"]
imports:         ["server-only", "@/lib/auth/session", "@/lib/auth/auth"]
exports:         ["getBlogSession", "getBlogUserId", "requireBlogSession",
                  "BlogSession"]
useBy:           ["@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/comment.ts",
                  "@/app/blog/lib/services/discussion.ts",
                  "@/app/blog/lib/services/favorite.ts",
                  "@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/services/like.ts",
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/actions/comment.ts",
                  "@/app/blog/lib/actions/discussion.ts",
                  "@/app/blog/lib/actions/favorite.ts",
                  "@/app/blog/lib/actions/group.ts",
                  "@/app/blog/lib/actions/like.ts",
                  "@/app/blog/lib/actions/notification.ts",
                  "@/app/blog/lib/actions/taxonomy.ts"]

userStories:     ["us1100010"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { getSession } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/auth";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type BlogSession = Session;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export async function getBlogSession(): Promise<BlogSession | null> {
  return getSession();
}

export async function getBlogUserId(): Promise<string | null> {
  const session = await getBlogSession();
  return session?.user?.id ?? null;
}

export async function requireBlogSession(): Promise<BlogSession> {
  const session = await getBlogSession();
  if (!session?.user) {
    throw new Error("[blog/session] Authentification requise.");
  }
  return session;
}
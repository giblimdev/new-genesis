/*
path :           app/blog/lib/media.ts
tag :            ["blog", "media", "manifest", "validate", "server-only"]
projectId:       new-genesis
type :           helper
generic:         true

role:            Helpers SERVEUR-ONLY pour les médias. Ré-exporte
                 resolveMediaUrl depuis @/app/blog/lib/media-url (pur,
                 client-safe) et expose getMediaManifest (lecture FS de
                 /public/blog/) + validateMediaPath (anti path traversal
                 + fs.existsSync). Importable UNIQUEMENT côté serveur.

flow:            resolveMediaUrl → ré-export depuis media-url.ts.
                 getMediaManifest() → readdirSync(public/blog) → filtre
                 entrées cachées → tri alphabétique.
                 validateMediaPath(path) → rejet si vide, absolu ou
                 contient ".." → fs.existsSync → { ok } | { ok, error }.

ecosystem:       BlogCore = [
                   "@/app/blog/lib/admin.ts",
                   "@/app/blog/lib/media-url.ts",
                   "@/app/blog/lib/media.ts",
                   "@/app/blog/lib/session.ts",
                   "@/app/blog/lib/storage.ts",
                   "@/app/blog/lib/tree.ts",
                   "@/app/blog/lib/types.ts",
                   "@/app/blog/lib/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/media-url.ts"]

imports:         ["server-only", "node:fs", "node:path",
                  "@/app/blog/lib/media-url"]

exports:         ["resolveMediaUrl", "getMediaManifest",
                  "validateMediaPath", "MediaValidationResult"]

useBy:           ["@/app/blog/admin/articles/new/page.tsx",
                  "@/app/blog/admin/articles/[id]/edit/page.tsx"]

userStories:     ["us1100013", "us1100007"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { resolveMediaUrl } from "@/app/blog/lib/media-url";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface MediaValidationResult {
  readonly ok: boolean;
  readonly error?: string;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                        */
/* ------------------------------------------------------------------ */

const PUBLIC_BLOG_DIR = join(process.cwd(), "public", "blog");

/* ------------------------------------------------------------------ */
/*  Ré-exports                                                        */
/* ------------------------------------------------------------------ */

export { resolveMediaUrl };

/* ------------------------------------------------------------------ */
/*  Manifeste (autocomplétion)                                        */
/* ------------------------------------------------------------------ */

export function getMediaManifest(): readonly string[] {
  if (!existsSync(PUBLIC_BLOG_DIR)) return [];
  try {
    return readdirSync(PUBLIC_BLOG_DIR)
      .filter((entry) => !entry.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "fr"));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */

export function validateMediaPath(
  relativePath: string,
): MediaValidationResult {
  if (!relativePath || relativePath.trim().length === 0) {
    return { ok: false, error: "Chemin vide." };
  }
  if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
    return { ok: false, error: "Chemin absolu interdit." };
  }
  if (relativePath.includes("..")) {
    return { ok: false, error: "Path traversal interdit." };
  }
  const full = join(PUBLIC_BLOG_DIR, relativePath);
  if (!existsSync(full)) {
    return { ok: false, error: "Fichier introuvable." };
  }
  return { ok: true };
}
/*
path :           app/blog/lib/media.ts
tag :            ["blog", "media", "resolve", "manifest", "server-only"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Résolution des médias locaux du blog. resolveMediaUrl
                 (relativePath) transforme un chemin relatif stocké dans
                 les blocs de contenu en URL publique — driver local en
                 MVP (/blog/[path]), driver distant en prod via
                 STORAGE_DRIVER + STORAGE_BASE_URL, sans changer le code
                 appelant. getMediaManifest lit /public/blog/ et renvoie
                 la liste triée des fichiers disponibles pour
                 l'autocomplétion du formulaire d'article.
                 validateMediaPath rejette les chemins dangereux (path
                 traversal, chemin absolu) et vérifie l'existence côté
                 serveur (fs.existsSync). Importable UNIQUEMENT côté
                 serveur.

flow:            resolveMediaUrl(path) → driver local : "/blog/" + path
                 nettoyé → driver distant : STORAGE_BASE_URL + "/" + path.
                 getMediaManifest() → readdirSync(public/blog) → filtre les
                 entrées cachées → tri alphabétique.
                 validateMediaPath(path) → rejet si vide, absolu ou
                 contient ".." → fs.existsSync → { ok } ou { ok, error }.

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

relatedFiles:    []
imports:         ["server-only", "node:fs", "node:path"]
exports:         ["resolveMediaUrl", "getMediaManifest",
                  "validateMediaPath", "MediaValidationResult"]
useBy:           ["@/app/blog/components/ContentBlockRenderer.tsx",
                  "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                  "@/app/app/blog/admin/articles/new/page.tsx",
                  "@/app/app/blog/admin/articles/[id]/edit/page.tsx"]

userStories:     ["us1100013", "us1100007"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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
const LOCAL_PREFIX = "/blog";

/* ------------------------------------------------------------------ */
/*  Résolution d'URL                                                  */
/* ------------------------------------------------------------------ */

/**
 * Résout un chemin relatif (stocké dans un ContentBlock) en URL publique.
 * - Driver local (défaut) : `/blog/[chemin nettoyé]`.
 * - Driver distant : `${STORAGE_BASE_URL}/[chemin nettoyé]`.
 *   Le driver est piloté par `process.env.STORAGE_DRIVER`
 *   (`"local"` par défaut, sinon `"remote"`).
 */
export function resolveMediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "local") {
    return `${LOCAL_PREFIX}/${clean}`;
  }

  const base = process.env.STORAGE_BASE_URL ?? "";
  return base ? `${base.replace(/\/+$/, "")}/${clean}` : `/${clean}`;
}

/* ------------------------------------------------------------------ */
/*  Manifeste (autocomplétion)                                        */
/* ------------------------------------------------------------------ */

/**
 * Liste triée des fichiers disponibles dans /public/blog/.
 * Filtré des entrées cachées (préfixe `.`). Retourne [] si le dossier
 * n'existe pas encore.
 */
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

/**
 * Vérifie qu'un chemin relatif de média est sûr et existant.
 * - Rejette : chemin vide, chemin absolu (`/...`), path traversal
 *   (`..`), fichier inexistant.
 * - Le test d'existence est effectué côté serveur (fs.existsSync) pour
 *   empêcher les chemins arbitraires.
 */
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
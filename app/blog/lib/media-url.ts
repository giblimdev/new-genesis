/*
path :           app/blog/lib/media-url.ts
tag :            ["blog", "media", "resolve", "url", "pure", "client-safe"]
projectId:       new-genesis
type :           helper
generic:         true

role:            Résolution PURE (sans FS, sans server-only) d'un chemin
                 relatif de média stocké dans un ContentBlock vers son URL
                 publique. Driver local (défaut) : préfixe "/blog/" +
                 chemin nettoyé. Driver distant : STORAGE_BASE_URL + "/"
                 + chemin nettoyé. Le driver est piloté par la variable
                 d'environnement PUBLIQUE NEXT_PUBLIC_STORAGE_DRIVER (lue
                 côté client) ou STORAGE_DRIVER (lue côté serveur). Ce
                 module est importable depuis Client ET Server Components
                 — il ne touche jamais au système de fichiers.

flow:            resolveMediaUrl(relativePath) →
                 nettoie les "/" de tête → lit driver =
                 NEXT_PUBLIC_STORAGE_DRIVER ?? STORAGE_DRIVER ?? "local"
                 (selon contexte) → si "local" : "/blog/" + clean →
                 sinon : STORAGE_BASE_URL (ou NEXT_PUBLIC_STORAGE_BASE_URL)
                 + "/" + clean → retourne l'URL.

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

relatedFiles:    ["@/app/blog/lib/media.ts"]

imports:         []

exports:         ["resolveMediaUrl"]

useBy:           ["@/app/blog/components/ArticleCard.tsx",
                  "@/app/blog/components/ArticleHeader.tsx",
                  "@/app/blog/components/ContentBlockRenderer.tsx",
                  "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                  "@/app/blog/lib/media.ts"]

userStories:     ["us1100013"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const LOCAL_PREFIX = "/blog";

/* ------------------------------------------------------------------ */
/*  Résolution                                                         */
/* ------------------------------------------------------------------ */

/**
 * Résout un chemin relatif (stocké dans un ContentBlock) en URL publique.
 * Aucune dépendance FS — utilisable indifféremment côté serveur et client.
 *
 * - Driver local (défaut) : `/blog/[chemin nettoyé]`.
 * - Driver distant : `${BASE_URL}/[chemin nettoyé]`.
 *
 * Les variables `NEXT_PUBLIC_*` sont préférées côté client (elles sont
 * inlinées au build). Le fallback `STORAGE_*` sert au serveur.
 */
export function resolveMediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");

  const driver =
    process.env.NEXT_PUBLIC_STORAGE_DRIVER ??
    process.env.STORAGE_DRIVER ??
    "local";

  if (driver === "local") {
    return `${LOCAL_PREFIX}/${clean}`;
  }

  const base =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL ??
    process.env.STORAGE_BASE_URL ??
    "";
  return base ? `${base.replace(/\/+$/, "")}/${clean}` : `/${clean}`;
}
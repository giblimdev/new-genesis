/*
path :           app/blog/lib/uploads/validations.ts
tag :            ["blog", "upload", "validation", "zod", "config"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Constantes et schéma Zod partagés client/serveur pour
                 l'upload d'images de couverture du blog. Source unique
                 de vérité pour les MIME autorisés, les extensions, la
                 taille max et le répertoire cible. Le client s'en sert
                 pour un feedback immédiat ; le serveur revalide
                 systématiquement (défense en profondeur).

flow:            Export de MAX_UPLOAD_BYTES, ALLOWED_IMAGE_MIME,
                 ALLOWED_IMAGE_EXTENSIONS, UPLOAD_TARGET_DIR,
                 uploadImageSchema (Zod, sur {size, type, name}) et
                 du type UploadImageInput.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/CoverImagePicker.tsx",
                   "@/app/blog/lib/uploads/actions.ts",
                   "@/app/blog/lib/uploads/storage.ts",
                   "@/app/blog/lib/uploads/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/uploads/storage.ts",
                  "@/app/blog/lib/uploads/actions.ts"]

imports:         ["zod"]

exports:         ["MAX_UPLOAD_BYTES", "ALLOWED_IMAGE_MIME",
                  "ALLOWED_IMAGE_EXTENSIONS", "UPLOAD_TARGET_DIR",
                  "uploadImageSchema", "UploadImageInput"]

useBy:           ["@/app/blog/lib/uploads/storage.ts",
                  "@/app/blog/lib/uploads/actions.ts",
                  "@/app/blog/components/admin/CoverImagePicker.tsx"]

userStories:     ["us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

/** Taille maximale d'une image de couverture : 5 Mo. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * MIME autorisés. On EXCLUT volontairement image/svg+xml : un SVG
 * peut contenir du <script>, c'est un vecteur XSS stocké.
 */
export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/** Extensions autorisées (miroir des MIME). */
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

/** Répertoire cible, relatif à public/blog/. */
export const UPLOAD_TARGET_DIR = "articles";

/* ------------------------------------------------------------------ */
/*  Schéma                                                             */
/* ------------------------------------------------------------------ */

export const uploadImageSchema = z
  .object({
    size: z
      .number()
      .int()
      .positive("Fichier vide.")
      .max(MAX_UPLOAD_BYTES, "Image trop lourde (max 5 Mo)."),
    type: z
      .string()
      .refine(
        (t): t is AllowedImageMime =>
          (ALLOWED_IMAGE_MIME as readonly string[]).includes(t),
        "Format d'image non supporté (JPEG, PNG, WebP, GIF).",
      ),
    name: z
      .string()
      .trim()
      .min(1, "Nom de fichier manquant.")
      .refine(
        (n) =>
          ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
            n.toLowerCase().endsWith(ext),
          ),
        "Extension non autorisée.",
      ),
  })
  .strict();

export type UploadImageInput = z.input<typeof uploadImageSchema>;
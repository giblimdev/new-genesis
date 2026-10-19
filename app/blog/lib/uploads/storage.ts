/*
path :           app/blog/lib/uploads/storage.ts
tag :            ["blog", "upload", "storage", "fs", "server-only", "security"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Seul fichier autorisé à toucher node:fs pour les uploads
                 blog. Écrit une image validée dans
                 public/blog/articles/<yyyy>/<slug>-<n>.<ext>, retourne
                 le chemin relatif utilisable dans <img src="/blog/...">,
                 et expose deleteCoverFile pour le rollback. Réutilise
                 la sémantique de assertUnderRoot de genesis (refus ..,
                 NUL byte, absolu) mais CONFINÉE à public/blog/ — pas de
                 deuxième porte FS non protégée. Vérifie les magic
                 numbers (JPEG/PNG/WebP/GIF) en plus du MIME déclaré.

flow:            persistCoverImage(file, slugBase) →
                   - uploadImageSchema.parse({size, type, name})
                   - readFileAsBuffer(file)
                   - sniffImageType(buffer) → ext réelle
                   - si ext ∉ ALLOWED → throw
                   - candidates = <slugBase>, <slugBase>-2, … via
                     findFreeSlug sur le FS
                   - relPath = articles/<yyyy>/<candidate>.<ext>
                   - assertUnderBlogRoot(relPath)
                   - mkdir recursive + writeFile .tmp + rename
                   - return relPath + size

                 deleteCoverFile(relPath) →
                   - assertUnderBlogRoot(relPath)
                   - unlink (ignore ENOENT)

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

relatedFiles:    ["@/app/blog/lib/uploads/validations.ts",
                  "@/utils/slug.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/blog/lib/uploads/validations",
                  "@/utils/slug"]

exports:         ["persistCoverImage", "deleteCoverFile",
                  "PUBLIC_BLOG_ROOT", "PersistedImage"]

useBy:           ["@/app/blog/lib/uploads/actions.ts"]

userStories:     ["us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import {
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";

import {
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  UPLOAD_TARGET_DIR,
  uploadImageSchema,
} from "@/app/blog/lib/uploads/validations";
import { findFreeSlug } from "@/utils/slug";

/* ------------------------------------------------------------------ */
/*  Racine                                                             */
/* ------------------------------------------------------------------ */

const ROOT = process.cwd();
export const PUBLIC_BLOG_ROOT = join(ROOT, "public", "blog");

/* ------------------------------------------------------------------ */
/*  Sniffing magic numbers                                             */
/* ------------------------------------------------------------------ */

type SniffedExt = "jpg" | "png" | "webp" | "gif";

/**
 * Détecte le type réel à partir des premiers octets. Ne fait pas
 * confiance à file.type (controlé par le client). Retourne
 * l'extension normalisée ou null si aucun magic number ne matche.
 */
function sniffImageType(buffer: Buffer): SniffedExt | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (
    buffer.length >= 6 &&
    buffer.toString("ascii", 0, 3) === "GIF" &&
    (buffer.toString("ascii", 3, 6) === "87a" ||
      buffer.toString("ascii", 3, 6) === "89a")
  ) {
    return "gif";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Garde-fou                                                          */
/* ------------------------------------------------------------------ */

/**
 * Refuse tout chemin hors de public/blog/. Réimplémentation locale de
 * la sémantique de assertUnderRoot (genesis) mais avec une racine
 * différente : public/blog/ au lieu de process.cwd().
 *
 * On ne réutilise pas assertUnderRoot directement car sa racine est
 * process.cwd() ; un upload pourrait alors écraser app/layout.tsx.
 */
function assertUnderBlogRoot(relPath: string): string {
  const abs = join(PUBLIC_BLOG_ROOT, relPath);
  const rel = relative(PUBLIC_BLOG_ROOT, abs);
  if (rel === "" || rel.startsWith("..") || rel.includes("\0")) {
    throw new Error(`Chemin d'upload invalide : "${relPath}"`);
  }
  return abs;
}

/* ------------------------------------------------------------------ */
/*  FS helpers                                                         */
/* ------------------------------------------------------------------ */

async function fileExists(absPath: string): Promise<boolean> {
  try {
    await stat(absPath);
    return true;
  } catch {
    return false;
  }
}

function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

/* ------------------------------------------------------------------ */
/*  Persistance                                                        */
/* ------------------------------------------------------------------ */

export interface PersistedImage {
  /** Chemin relatif à stocker dans coverImage (ex. "articles/2026/x.jpg"). */
  readonly relativePath: string;
  /** Taille en octets. */
  readonly size: number;
}

/**
 * Écrit une image validée dans public/blog/articles/<yyyy>/<slug>-<n>.<ext>.
 *
 * - Le slug est figé à l'upload (pas de renommage ultérieur).
 * - En cas de collision, suffixe -2, -3, … via findFreeSlug.
 * - Écriture atomique (.tmp-upload + rename).
 * - Sniffing du contenu réel (magic numbers) en plus du MIME déclaré.
 */
export async function persistCoverImage(
  file: File,
  slugBase: string,
): Promise<PersistedImage> {
  /* 1. Validation déclarative */
  uploadImageSchema.parse({
    size: file.size,
    type: file.type,
    name: file.name,
  });

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image trop lourde (max 5 Mo).");
  }

  /* 2. Lecture + vérification du contenu réel */
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sniffed = sniffImageType(buffer);
  if (!sniffed) {
    throw new Error(
      "Le fichier n'est pas une image valide (JPEG, PNG, WebP, GIF).",
    );
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(`.${sniffed}`)) {
    throw new Error("Extension non autorisée.");
  }

  /* 3. Base du slug (fallback "cover" si vide) */
  const base =
    slugBase.trim().length > 0
      ? slugBase.trim()
      : "cover";

  /* 4. Résolution d'un chemin libre */
  const year = new Date().getFullYear().toString();
  const yearDir = join(PUBLIC_BLOG_ROOT, UPLOAD_TARGET_DIR, year);

  const candidate = await findFreeSlug(base, async (slug) => {
    const abs = join(yearDir, `${slug}.${sniffed}`);
    return fileExists(abs);
  });

  const relPath = toPosix(
    join(UPLOAD_TARGET_DIR, year, `${candidate}.${sniffed}`),
  );
  const abs = assertUnderBlogRoot(relPath);

  /* 5. Écriture atomique */
  await mkdir(dirname(abs), { recursive: true });
  const tmp = `${abs}.tmp-upload`;
  await writeFile(tmp, buffer);
  await rename(tmp, abs);

  return { relativePath: relPath, size: buffer.byteLength };
}

/* ------------------------------------------------------------------ */
/*  Suppression (rollback)                                             */
/* ------------------------------------------------------------------ */

/**
 * Supprime un fichier uploadé précédemment. Ignore ENOENT (fichier
 * déjà supprimé ou jamais écrit). Ne touche jamais un fichier hors
 * de public/blog/.
 */
export async function deleteCoverFile(relPath: string): Promise<void> {
  if (relPath.trim().length === 0) return;
  const abs = assertUnderBlogRoot(relPath);
  try {
    await unlink(abs);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}
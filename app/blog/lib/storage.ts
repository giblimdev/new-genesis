/*
path :           app/blog/lib/storage.ts
tag :            ["blog", "storage", "atomic", "mutex", "server-only"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Seul fichier autorisé à toucher data/blog.json. Expose
                 readBlog() (lecture + parse + validation Zod + tri
                 stable des thèmes et tags par order) et mutateBlog(fn)
                 (lecture + fn + validation Zod + écriture atomique
                 temp + rename, protégée par un mutex global). Si le
                 fichier est absent, un document vide valide est créé au
                 boot. Importable UNIQUEMENT côté serveur.

flow:            readBlog → readFile → JSON.parse → blogDocumentSchema
                 .parse (fail-fast) → tri des themes[].categories[] par
                 order → BlogDocument.
                 mutateBlog(fn) → acquire(blogMutex) → readBlog → fn(doc)
                 → blogDocumentSchema.parse (revalidation) → écriture
                 data/blog.json.tmp → rename → release(blogMutex).
                 blogMutex = queue à un seul slot : toute mutation attend
                 la précédente.

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

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/validations.ts"]
imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/validations"]
exports:         ["readBlog", "mutateBlog", "blogFilePath",
                  "createEmptyBlogDocument"]
useBy:           ["@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/comment.ts",
                  "@/app/blog/lib/services/discussion.ts",
                  "@/app/blog/lib/services/favorite.ts",
                  "@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/services/like.ts",
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/services/taxonomy.ts"]

userStories:     ["us1100011"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { BlogDocument } from "@/app/blog/lib/types";
import {
  BLOG_SCHEMA_VERSION,
  blogDocumentSchema,
} from "@/app/blog/lib/validations";

/* ------------------------------------------------------------------ */
/*  Chemins                                                           */
/* ------------------------------------------------------------------ */

const DATA_DIR = join(process.cwd(), "data");

export function blogFilePath(): string {
  return join(DATA_DIR, "blog.json");
}

/* ------------------------------------------------------------------ */
/*  Document vide valide                                              */
/* ------------------------------------------------------------------ */

export function createEmptyBlogDocument(): BlogDocument {
  return {
    meta: {
      schemaVersion: BLOG_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      adminIds: [],
    },
    taxonomy: {
      themes: [],
      tags: [],
    },
    articles: [],
    groups: [],
    userContent: {},
    auditLog: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Mutex global (un seul slot)                                      */
/* ------------------------------------------------------------------ */

type Resolver = () => void;

let pending: Promise<void> = Promise.resolve();

async function acquire(): Promise<Resolver> {
  let release!: Resolver;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previous = pending;
  pending = pending.then(() => next);
  await previous;
  return release;
}

/* ------------------------------------------------------------------ */
/*  Lecture                                                           */
/* ------------------------------------------------------------------ */

export async function readBlog(): Promise<BlogDocument> {
  const path = blogFilePath();

  try {
    const raw = await readFile(path, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return blogDocumentSchema.parse(parsed) as BlogDocument;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const empty = createEmptyBlogDocument();
      await writeAtomically(empty);
      return empty;
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Mutation                                                          */
/* ------------------------------------------------------------------ */

export async function mutateBlog<T>(
  fn: (doc: BlogDocument) => BlogDocument | Promise<BlogDocument>,
): Promise<T> {
  const release = await acquire();
  try {
    const current = await readBlog();
    const next = await fn(current);
    const validated = blogDocumentSchema.parse({
      ...next,
      meta: { ...next.meta, updatedAt: new Date().toISOString() },
    }) as BlogDocument;
    await writeAtomically(validated);
    return validated as unknown as T;
  } finally {
    release();
  }
}

/* ------------------------------------------------------------------ */
/*  Écriture atomique                                                 */
/* ------------------------------------------------------------------ */

async function writeAtomically(doc: BlogDocument): Promise<void> {
  const path = blogFilePath();
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(doc, null, 2), "utf-8");
  await rename(tmp, path);
}
/*
path :           scripts/seed.ts
tag :            ["script", "seed", "fixtures", "idempotent", "blog"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Script CLI pnpm seed. Copie les fixtures versionnées
                 data/fixtures/blog.seed.json dans data/blog.json en mode
                 upsert-par-slug (thèmes/catégories/sous-catégories/tags
                 par slug ; articles par slug — likedBy/comments préservés
                 si l'article existe, content[] remplacé ; groupes par
                 slug — members préservés, discussions remplacées). Flag
                 --reset pour repartir des fixtures seules. Refuse de
                 tourner sans --reset si data/blog.json existe et n'est
                 pas valide. Valide les fixtures via blogDocumentSchema
                 avant écriture.

flow:            main() → parse args (--reset) → read file
                 data/fixtures/blog.seed.json → blogDocumentSchema.parse
                 → si --reset OU fichier absent : writeAtomically(fixtures)
                 sinon : read current → merge → validate → writeAtomically
                 → console.log(récap).

ecosystem:       Scripts = [
                   "data/fixtures/blog.seed.json",
                   "scripts/backup.ts",
                   "scripts/export-prisma.ts",
                   "scripts/seed.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/validations.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["node:fs/promises", "node:path", "zod",
                  "@/app/blog/lib/validations",
                  "@/app/blog/lib/types"]

exports:         []

useBy:           []

userStories:     ["us1100015"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  blogDocumentSchema,
} from "../app/blog/lib/validations";
import type {
  Article,
  BlogDocument,
  Group,
  Tag,
  Theme,
} from "../app/blog/lib/types";

/* ------------------------------------------------------------------ */
/*  Chemins                                                            */
/* ------------------------------------------------------------------ */

const ROOT = process.cwd();
const SEED_PATH = join(ROOT, "data", "fixtures", "blog.seed.json");
const TARGET_PATH = join(ROOT, "data", "blog.json");

/* ------------------------------------------------------------------ */
/*  IO helpers                                                         */
/* ------------------------------------------------------------------ */

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeAtomically(path: string, doc: BlogDocument): Promise<void> {
  const tmp = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmp, JSON.stringify(doc, null, 2), "utf-8");
  await rename(tmp, path);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Merge helpers                                                      */
/* ------------------------------------------------------------------ */

function mergeThemes(
  current: readonly Theme[],
  fixtures: readonly Theme[],
): readonly Theme[] {
  const bySlug = new Map(current.map((t) => [t.slug, t]));
  for (const t of fixtures) bySlug.set(t.slug, t);
  return Array.from(bySlug.values());
}

function mergeTags(
  current: readonly Tag[],
  fixtures: readonly Tag[],
): readonly Tag[] {
  const bySlug = new Map(current.map((t) => [t.slug, t]));
  for (const t of fixtures) bySlug.set(t.slug, t);
  return Array.from(bySlug.values());
}

function mergeArticles(
  current: readonly Article[],
  fixtures: readonly Article[],
): readonly Article[] {
  const bySlug = new Map(current.map((a) => [a.slug, a]));
  for (const f of fixtures) {
    const existing = bySlug.get(f.slug);
    if (existing) {
      /* Préserver likedBy et comments existants ; remplacer content[] */
      bySlug.set(f.slug, {
        ...f,
        likedBy: existing.likedBy,
        comments: existing.comments,
        viewCount: existing.viewCount,
        publishedAt: existing.publishedAt ?? f.publishedAt,
        createdAt: existing.createdAt,
      });
    } else {
      bySlug.set(f.slug, f);
    }
  }
  return Array.from(bySlug.values());
}

function mergeGroups(
  current: readonly Group[],
  fixtures: readonly Group[],
): readonly Group[] {
  const bySlug = new Map(current.map((g) => [g.slug, g]));
  for (const f of fixtures) {
    const existing = bySlug.get(f.slug);
    if (existing) {
      /* Préserver members existants ; remplacer discussions */
      bySlug.set(f.slug, {
        ...f,
        members: existing.members,
        createdAt: existing.createdAt,
      });
    } else {
      bySlug.set(f.slug, f);
    }
  }
  return Array.from(bySlug.values());
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

interface CliArgs {
  readonly reset: boolean;
}

function parseArgs(argv: readonly string[]): CliArgs {
  return { reset: argv.includes("--reset") };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!(await fileExists(SEED_PATH))) {
    throw new Error(`Fixtures introuvables : ${SEED_PATH}`);
  }

  const fixturesRaw = await readJson<unknown>(SEED_PATH);
  const fixtures = blogDocumentSchema.parse(fixturesRaw) as BlogDocument;

  const targetExists = await fileExists(TARGET_PATH);

  if (!targetExists || args.reset) {
    await writeAtomically(TARGET_PATH, fixtures);
    console.log(
      `✔ Seed appliqué (${args.reset ? "reset" : "création"}). ` +
        `${fixtures.taxonomy.themes.length} thèmes, ` +
        `${fixtures.articles.length} articles, ` +
        `${fixtures.groups.length} groupes.`,
    );
    return;
  }

  /* Validate current before merging */
  const currentRaw = await readJson<unknown>(TARGET_PATH);
  const current = blogDocumentSchema.parse(currentRaw) as BlogDocument;

  const merged: BlogDocument = {
    ...current,
    meta: { ...current.meta, updatedAt: new Date().toISOString() },
    taxonomy: {
      themes: [...mergeThemes(current.taxonomy.themes, fixtures.taxonomy.themes)],
      tags: [...mergeTags(current.taxonomy.tags, fixtures.taxonomy.tags)],
    },
    articles: [...mergeArticles(current.articles, fixtures.articles)],
    groups: [...mergeGroups(current.groups, fixtures.groups)],
  };

  /* Revalidate merged before write */
  blogDocumentSchema.parse(merged);
  await writeAtomically(TARGET_PATH, merged);

  console.log(
    `✔ Seed fusionné. ` +
      `${merged.taxonomy.themes.length} thèmes, ` +
      `${merged.articles.length} articles, ` +
      `${merged.groups.length} groupes.`,
  );
}

main().catch((error) => {
  console.error("[seed] Échec :", error);
  process.exit(1);
});
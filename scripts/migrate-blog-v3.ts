/*
path :           scripts/migrate-blog-v3.ts
tag :            ["script", "migration", "blog", "v2", "v3", "playlists"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Script one-shot de migration data/blog.json de la
                 schemaVersion 2 vers la 3. La v3 introduit deux changements :
                 (1) meta.schemaVersion passe de 2 à 3, (2) un tableau
                 top-level playlists[] (vide au départ) est ajouté.
                 Le script est idempotent : si le document est déjà en v3,
                 il ne fait rien. Il utilise une écriture atomique (.tmp +
                 rename) pour éviter toute corruption. À exécuter UNE FOIS
                 après le déploiement du code v3 :
                   npx tsx scripts/migrate-blog-v3.ts
                 Si le fichier est absent, le script crée un document vide
                 v3 valide (même logique que readBlog au boot).

                 Le script NE touche PAS aux autres champs (taxonomy,
                 articles, groups, userContent, auditLog) — il ne fait
                 qu'ajouter playlists et bumper la version.

flow:            readFile(data/blog.json) → si ENOENT : écrit un document
                 vide v3 et termine → sinon JSON.parse → si
                 meta.schemaVersion === 3 : log « déjà v3 » et termine →
                 si version !== 2 : erreur explicite et exit(1) →
                 sinon : construit migrated = { ...doc, playlists: [],
                 meta: { ...doc.meta, schemaVersion: 3, updatedAt: now } }
                 → écrit dans .tmp → rename atomique → log résumé.

ecosystem:       BlogMigrations = [
                   "@/scripts/migrate-blog-v3.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/storage.ts",
                  "@/app/blog/lib/validations.ts"]

imports:         ["node:fs/promises", "node:path"]

exports:         []

useBy:           []

userStories:     ["*en tant que développeur je veux migrer data/blog.json vers la v3"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/* ------------------------------------------------------------------ */
/*  Constantes                                                        */
/* ------------------------------------------------------------------ */

const TARGET_SCHEMA_VERSION = 3;
const DATA_DIR = join(process.cwd(), "data");
const FILE_PATH = join(DATA_DIR, "blog.json");
const TMP_PATH = `${FILE_PATH}.tmp`;

/* ------------------------------------------------------------------ */
/*  Document vide v3                                                  */
/* ------------------------------------------------------------------ */

function createEmptyV3(): Record<string, unknown> {
  return {
    meta: {
      schemaVersion: TARGET_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      adminIds: [],
    },
    taxonomy: {
      themes: [],
      tags: [],
    },
    playlists: [],
    articles: [],
    groups: [],
    userContent: {},
    auditLog: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Écriture atomique                                                 */
/* ------------------------------------------------------------------ */

async function writeAtomically(doc: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(FILE_PATH), { recursive: true });
  await writeFile(TMP_PATH, JSON.stringify(doc, null, 2), "utf-8");
  await rename(TMP_PATH, FILE_PATH);
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  console.log(`▸ Migration data/blog.json → schemaVersion ${TARGET_SCHEMA_VERSION}`);

  let raw: string;
  try {
    raw = await readFile(FILE_PATH, "utf-8");
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      console.log("  Fichier absent → création d'un document vide v3.");
      await writeAtomically(createEmptyV3());
      console.log("✓ Terminé.");
      return;
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `data/blog.json : JSON mal formé — ${
        error instanceof Error ? error.message : "erreur inconnue"
      }`,
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      "data/blog.json : la racine doit être un objet JSON.",
    );
  }

  const doc = parsed as Record<string, unknown>;
  const meta = doc.meta as Record<string, unknown> | undefined;
  const fromVersion =
    typeof meta?.schemaVersion === "number" ? meta.schemaVersion : undefined;

  if (fromVersion === TARGET_SCHEMA_VERSION) {
    console.log(
      `  Déjà en schemaVersion ${TARGET_SCHEMA_VERSION} → rien à faire.`,
    );
    return;
  }

  if (fromVersion !== 2) {
    throw new Error(
      `schemaVersion inattendue : ${fromVersion ?? "(absente)"}. ` +
        `Seule la migration 2 → ${TARGET_SCHEMA_VERSION} est supportée.`,
    );
  }

  const migrated: Record<string, unknown> = {
    ...doc,
    playlists: Array.isArray(doc.playlists) ? doc.playlists : [],
    meta: {
      ...(meta ?? {}),
      schemaVersion: TARGET_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    },
  };

  await writeAtomically(migrated);

  console.log(`✓ Migré : schemaVersion ${fromVersion} → ${TARGET_SCHEMA_VERSION}`);
  console.log(`  playlists : ${Array.isArray(doc.playlists) ? "préservé" : "initialisé à []"}`);
}

/* ------------------------------------------------------------------ */
/*  Entry point                                                       */
/* ------------------------------------------------------------------ */

main().catch((error: unknown) => {
  console.error(
    "✗ Migration échouée :",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
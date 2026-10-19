/*
path :           app/core/lib/scrum/storage.ts
tag :            ["scrum", "storage", "json", "fs", "server-only"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Seul fichier autorisé à toucher le système de fichiers pour le module
                 Scrum. Lit et écrit les documents JSON de chaque flux. Écriture
                 atomique (fichier temporaire + rename) pour éviter toute corruption.
                 Importable UNIQUEMENT côté serveur.

flow:            readScrumFile(flow) → résout le path → lit → parse + valide →
                 retourne. Si absent → crée vide. writeScrumFile(flow, doc) → met à
                 jour meta.updatedAt → écrit dans .tmp → rename atomique.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/validations.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations"]

exports:         ["scrumFilePath", "readScrumFile", "writeScrumFile"]

useBy:           ["@/app/core/lib/scrum/services/idee.ts",
                  "@/app/core/lib/scrum/services/feature.ts",
                  "@/app/core/lib/scrum/services/persona.ts",
                  "@/app/core/lib/scrum/services/epic.ts",
                  "@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/services/global-json.ts"]

userStories:     ["*en tant que développeur je veux lire et écrire les JSON Scrum de manière atomique"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  createEmptyScrumDocument,
  SCRUM_FLOWS,
  SCRUM_SCHEMA_VERSION,
  type ScrumDocument,
  type ScrumFlow,
} from "@/app/core/lib/scrum/types";
import { scrumDocumentSchema } from "@/app/core/lib/scrum/validations";

/* ------------------------------------------------------------------ */
/*  Chemins                                                            */
/* ------------------------------------------------------------------ */

const DATA_DIR = join(process.cwd(), "data");

export function scrumFilePath(flow: ScrumFlow): string {
  return join(DATA_DIR, `${flow}.json`);
}

/* ------------------------------------------------------------------ */
/*  Garde-fou runtime                                                  */
/* ------------------------------------------------------------------ */

function assertValidFlow(flow: string): asserts flow is ScrumFlow {
  if (!SCRUM_FLOWS.includes(flow as ScrumFlow)) {
    throw new Error(
      `[scrum/storage] Flow inconnu : "${flow}". Attendu : ${SCRUM_FLOWS.join(", ")}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function readScrumFile(flow: ScrumFlow): Promise<ScrumDocument> {
  assertValidFlow(flow);

  const path = scrumFilePath(flow);

  try {
    const raw = await readFile(path, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = scrumDocumentSchema.safeParse(parsed);

    if (!validated.success) {
      throw new Error(
        `[scrum/storage] Document invalide (${flow}) : ${validated.error.message}`,
      );
    }

    return validated.data as ScrumDocument;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const empty = createEmptyScrumDocument();
      await writeScrumFile(flow, empty);
      return empty;
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Écriture atomique                                                  */
/* ------------------------------------------------------------------ */

export async function writeScrumFile(
  flow: ScrumFlow,
  doc: ScrumDocument,
): Promise<void> {
  assertValidFlow(flow);

  const path = scrumFilePath(flow);
  const tmpPath = `${path}.tmp`;

  const finalDoc: ScrumDocument = {
    ...doc,
    meta: {
      schemaVersion: SCRUM_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    },
  };

  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmpPath, JSON.stringify(finalDoc, null, 2), "utf-8");
  await rename(tmpPath, path);
}
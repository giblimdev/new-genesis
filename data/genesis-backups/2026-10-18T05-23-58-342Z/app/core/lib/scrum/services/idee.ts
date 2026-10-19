/*
path :           app/core/lib/scrum/services/idee.ts
tag :            ["scrum", "service", "idee", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "idée" du module
                 Scrum. Chaque création assigne order = max + 1. reorderIdees
                 réassigne 0..n-1 à tous les items selon orderedIds. Les
                 updatedAt ne sont PAS bumpés lors d'un reorder (contenu
                 inchangé). Lit/écrit le document via storage. Aucune
                 dépendance UI.

flow:            listIdees → readScrumFile (déjà trié par order).
                 createIdee → order = max + 1 → push → write. updateIdee →
                 map → write. deleteIdee → filter → write. reorderIdees →
                 valide → normalise order → write.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/epic.ts",
                   "@/app/core/lib/scrum/services/feature.ts",
                   "@/app/core/lib/scrum/services/global-json.ts",
                   "@/app/core/lib/scrum/services/idee.ts",
                   "@/app/core/lib/scrum/services/persona.ts",
                   "@/app/core/lib/scrum/services/sprint.ts",
                   "@/app/core/lib/scrum/services/user-story.ts",
                   "@/app/core/lib/scrum/storage.ts",
                   "@/app/core/lib/scrum/types.ts",
                   "@/app/core/lib/scrum/validations.ts",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["node:crypto",
                  "@/app/core/lib/scrum/storage",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listIdees", "createIdee", "updateIdee", "deleteIdee",
                  "reorderIdees"]

useBy:           ["@/app/core/lib/scrum/actions/idee.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les idées Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { Idee, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  ideeInputSchema,
  reorderInputSchema,
  type IdeeInput,
} from "@/app/core/lib/scrum/validations";

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function listIdees(flow: ScrumFlow): Promise<readonly Idee[]> {
  const doc = await readScrumFile(flow);
  return doc.idea;
}

/* ------------------------------------------------------------------ */
/*  Création                                                           */
/* ------------------------------------------------------------------ */

export async function createIdee(
  flow: ScrumFlow,
  input: IdeeInput,
): Promise<Idee> {
  const valid = ideeInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.idea.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Idee = {
    id: randomUUID(),
    title: valid.title,
    problem: valid.problem,
    hypotheses: valid.hypotheses,
    context: valid.context,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, idea: [...doc.idea, entity] });
  return entity;
}

/* ------------------------------------------------------------------ */
/*  Mise à jour                                                        */
/* ------------------------------------------------------------------ */

export async function updateIdee(
  flow: ScrumFlow,
  id: string,
  input: IdeeInput,
): Promise<Idee> {
  const valid = ideeInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  let updated: Idee | null = null;

  const next: readonly Idee[] = doc.idea.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      title: valid.title,
      problem: valid.problem,
      hypotheses: valid.hypotheses,
      context: valid.context,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/idee] Idée introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, idea: next });
  return updated;
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export async function deleteIdee(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.idea.filter((item) => item.id !== id);

  if (next.length === doc.idea.length) {
    throw new Error(`[scrum/idee] Idée introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, idea: next });
}

/* ------------------------------------------------------------------ */
/*  Réordonnancement                                                   */
/* ------------------------------------------------------------------ */

export async function reorderIdees(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Idee[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.idea.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/idee] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Idee[] = doc.idea.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/idee] Idée inconnue : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, idea: next });
  return next;
}
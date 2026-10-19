/*
path :           app/core/lib/scrum/services/epic.ts
tag :            ["scrum", "service", "epic", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "epic" du module
                 Scrum. Chaque création assigne order = max + 1. reorderEpics
                 réassigne 0..n-1 à tous les items selon orderedIds.
                 updatedAt n'est pas bumpé lors d'un reorder.

flow:            listEpics → readScrumFile (déjà trié). createEpic → order =
                 max + 1 → push. updateEpic → find + replace. deleteEpic →
                 filter. reorderEpics → normalise order → write.

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

exports:         ["listEpics", "createEpic", "updateEpic", "deleteEpic",
                  "reorderEpics"]

useBy:           ["@/app/core/lib/scrum/actions/epic.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les epics Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { Epic, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  epicInputSchema,
  reorderInputSchema,
  type EpicInput,
} from "@/app/core/lib/scrum/validations";

export async function listEpics(flow: ScrumFlow): Promise<readonly Epic[]> {
  const doc = await readScrumFile(flow);
  return doc.epic;
}

export async function createEpic(
  flow: ScrumFlow,
  input: EpicInput,
): Promise<Epic> {
  const valid = epicInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.epic.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Epic = {
    id: randomUUID(),
    name: valid.name,
    goal: valid.goal,
    scope: valid.scope,
    personas: valid.personas,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, epic: [...doc.epic, entity] });
  return entity;
}

export async function updateEpic(
  flow: ScrumFlow,
  id: string,
  input: EpicInput,
): Promise<Epic> {
  const valid = epicInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.epic.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/epic] Epic introuvable : ${id}`);
  }

  const updated: Epic = {
    ...existing,
    name: valid.name,
    goal: valid.goal,
    scope: valid.scope,
    personas: valid.personas,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.epic.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, epic: next });
  return updated;
}

export async function deleteEpic(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.epic.filter((item) => item.id !== id);

  if (next.length === doc.epic.length) {
    throw new Error(`[scrum/epic] Epic introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, epic: next });
}

export async function reorderEpics(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Epic[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.epic.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/epic] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Epic[] = doc.epic.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/epic] Epic inconnu : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, epic: next });
  return next;
}
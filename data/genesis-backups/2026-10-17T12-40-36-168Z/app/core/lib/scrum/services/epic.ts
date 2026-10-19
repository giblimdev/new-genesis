/*
path :           app/core/lib/scrum/services/epic.ts
tag :            ["scrum", "service", "epic", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "epic" du module Scrum.

flow:            listEpics → readScrumFile → doc.epic. createEpic → push.
                 updateEpic → map. deleteEpic → filter.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["node:crypto",
                  "@/app/core/lib/scrum/storage",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listEpics", "createEpic", "updateEpic", "deleteEpic"]

useBy:           ["@/app/core/lib/scrum/actions/epic.ts"]

userStories:     ["*en tant que développeur je veux CRUD les epics Scrum"]

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

  const entity: Epic = {
    id: randomUUID(),
    name: valid.name,
    goal: valid.goal,
    scope: valid.scope,
    personas: valid.personas,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
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

  let updated: Epic | null = null;

  const next: readonly Epic[] = doc.epic.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      name: valid.name,
      goal: valid.goal,
      scope: valid.scope,
      personas: valid.personas,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/epic] Epic introuvable : ${id}`);
  }

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
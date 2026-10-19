/*
path :           app/core/lib/scrum/services/sprint.ts
tag :            ["scrum", "service", "sprint", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "sprint" du module Scrum.

flow:            listSprints → readScrumFile → doc.sprint. createSprint → push.
                 updateSprint → map. deleteSprint → filter.

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

exports:         ["listSprints", "createSprint", "updateSprint", "deleteSprint"]

useBy:           ["@/app/core/lib/scrum/actions/sprint.ts"]

userStories:     ["*en tant que développeur je veux CRUD les sprints Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, Sprint } from "@/app/core/lib/scrum/types";
import {
  sprintInputSchema,
  type SprintInput,
} from "@/app/core/lib/scrum/validations";

export async function listSprints(
  flow: ScrumFlow,
): Promise<readonly Sprint[]> {
  const doc = await readScrumFile(flow);
  return doc.sprint;
}

export async function createSprint(
  flow: ScrumFlow,
  input: SprintInput,
): Promise<Sprint> {
  const valid = sprintInputSchema.parse(input);
  const now = new Date().toISOString();

  const entity: Sprint = {
    id: randomUUID(),
    name: valid.name,
    goal: valid.goal,
    storyIds: valid.storyIds,
    startDate: valid.startDate,
    endDate: valid.endDate,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
  await writeScrumFile(flow, { ...doc, sprint: [...doc.sprint, entity] });

  return entity;
}

export async function updateSprint(
  flow: ScrumFlow,
  id: string,
  input: SprintInput,
): Promise<Sprint> {
  const valid = sprintInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  let updated: Sprint | null = null;

  const next: readonly Sprint[] = doc.sprint.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      name: valid.name,
      goal: valid.goal,
      storyIds: valid.storyIds,
      startDate: valid.startDate,
      endDate: valid.endDate,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, sprint: next });
  return updated;
}

export async function deleteSprint(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.sprint.filter((item) => item.id !== id);

  if (next.length === doc.sprint.length) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, sprint: next });
}
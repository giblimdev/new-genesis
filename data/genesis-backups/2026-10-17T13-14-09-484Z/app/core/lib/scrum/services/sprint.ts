/*
path :           app/core/lib/scrum/services/sprint.ts
tag :            ["scrum", "service", "sprint", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "sprint" du module
                 Scrum. Chaque création assigne order = max + 1.
                 reorderSprints réassigne 0..n-1 selon orderedIds.

flow:            listSprints → readScrumFile (trié). createSprint → push.
                 updateSprint → find + replace. deleteSprint → filter.
                 reorderSprints → normalise order → write.

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

exports:         ["listSprints", "createSprint", "updateSprint",
                  "deleteSprint", "reorderSprints"]

useBy:           ["@/app/core/lib/scrum/actions/sprint.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les sprints Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, Sprint } from "@/app/core/lib/scrum/types";
import {
  reorderInputSchema,
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

  const doc = await readScrumFile(flow);
  const maxOrder = doc.sprint.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Sprint = {
    id: randomUUID(),
    name: valid.name,
    goal: valid.goal,
    storyIds: valid.storyIds,
    startDate: valid.startDate,
    endDate: valid.endDate,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

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

  const existing = doc.sprint.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  const updated: Sprint = {
    ...existing,
    name: valid.name,
    goal: valid.goal,
    storyIds: valid.storyIds,
    startDate: valid.startDate,
    endDate: valid.endDate,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.sprint.map((item) => (item.id === id ? updated : item));
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

export async function reorderSprints(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Sprint[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.sprint.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/sprint] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Sprint[] = doc.sprint.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/sprint] Sprint inconnu : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, sprint: next });
  return next;
}
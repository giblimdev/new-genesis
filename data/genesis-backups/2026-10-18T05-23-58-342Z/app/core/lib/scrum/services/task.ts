/*
path :           app/core/lib/scrum/services/task.ts
tag :            ["scrum", "service", "task", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "task" du module
                 Scrum. Chaque création assigne order = max + 1.
                 reorderTasks réassigne 0..n-1 selon orderedIds.
                 Vérifie que storyId référence une UserStory existante.

flow:            listTasks → readScrumFile (trié). createTask → valide
                 storyId → order = max + 1 → push. updateTask → find +
                 replace. deleteTask → filter. reorderTasks → normalise
                 order → write.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/task.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/epic.ts",
                   "@/app/core/lib/scrum/services/feature.ts",
                   "@/app/core/lib/scrum/services/global-json.ts",
                   "@/app/core/lib/scrum/services/idee.ts",
                   "@/app/core/lib/scrum/services/persona.ts",
                   "@/app/core/lib/scrum/services/sprint.ts",
                   "@/app/core/lib/scrum/services/task.ts",
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

exports:         ["listTasks", "createTask", "updateTask", "deleteTask",
                  "reorderTasks"]

useBy:           ["@/app/core/lib/scrum/actions/task.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les tasks Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, Task } from "@/app/core/lib/scrum/types";
import {
  reorderInputSchema,
  taskInputSchema,
  type TaskInput,
} from "@/app/core/lib/scrum/validations";

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function listTasks(flow: ScrumFlow): Promise<readonly Task[]> {
  const doc = await readScrumFile(flow);
  return doc.task;
}

/* ------------------------------------------------------------------ */
/*  Création                                                           */
/* ------------------------------------------------------------------ */

export async function createTask(
  flow: ScrumFlow,
  input: TaskInput,
): Promise<Task> {
  const valid = taskInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);

  // Garde-fou : la storyId doit référencer une UserStory existante.
  const storyExists = doc.userStory.some((us) => us.id === valid.storyId);
  if (!storyExists) {
    throw new Error(
      `[scrum/task] UserStory introuvable : ${valid.storyId}`,
    );
  }

  const maxOrder = doc.task.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Task = {
    id: randomUUID(),
    title: valid.title,
    description: valid.description,
    status: valid.status,
    storyId: valid.storyId,
    assignee: valid.assignee,
    estimate: valid.estimate,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, task: [...doc.task, entity] });
  return entity;
}

/* ------------------------------------------------------------------ */
/*  Mise à jour                                                        */
/* ------------------------------------------------------------------ */

export async function updateTask(
  flow: ScrumFlow,
  id: string,
  input: TaskInput,
): Promise<Task> {
  const valid = taskInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.task.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/task] Task introuvable : ${id}`);
  }

  // Garde-fou si la storyId change.
  if (valid.storyId !== existing.storyId) {
    const storyExists = doc.userStory.some((us) => us.id === valid.storyId);
    if (!storyExists) {
      throw new Error(
        `[scrum/task] UserStory introuvable : ${valid.storyId}`,
      );
    }
  }

  const updated: Task = {
    ...existing,
    title: valid.title,
    description: valid.description,
    status: valid.status,
    storyId: valid.storyId,
    assignee: valid.assignee,
    estimate: valid.estimate,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.task.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, task: next });
  return updated;
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export async function deleteTask(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.task.filter((item) => item.id !== id);

  if (next.length === doc.task.length) {
    throw new Error(`[scrum/task] Task introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, task: next });
}

/* ------------------------------------------------------------------ */
/*  Réordonnancement                                                   */
/* ------------------------------------------------------------------ */

export async function reorderTasks(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Task[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.task.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/task] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Task[] = doc.task.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/task] Task inconnue : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, task: next });
  return next;
}
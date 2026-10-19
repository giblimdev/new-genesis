/*
path :           app/core/lib/scrum/services/user-story.ts
tag :            ["scrum", "service", "user-story", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "user story" du
                 module Scrum. Chaque création assigne order = max + 1.
                 reorderUserStories réassigne 0..n-1 selon orderedIds.

flow:            listUserStories → readScrumFile (trié). createUserStory →
                 push. updateUserStory → find + replace. deleteUserStory →
                 filter. reorderUserStories → normalise order → write.

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

exports:         ["listUserStories", "createUserStory", "updateUserStory",
                  "deleteUserStory", "reorderUserStories"]

useBy:           ["@/app/core/lib/scrum/actions/user-story.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les user stories Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, UserStory } from "@/app/core/lib/scrum/types";
import {
  reorderInputSchema,
  userStoryInputSchema,
  type UserStoryInput,
} from "@/app/core/lib/scrum/validations";

export async function listUserStories(
  flow: ScrumFlow,
): Promise<readonly UserStory[]> {
  const doc = await readScrumFile(flow);
  return doc.userStory;
}

export async function createUserStory(
  flow: ScrumFlow,
  input: UserStoryInput,
): Promise<UserStory> {
  const valid = userStoryInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.userStory.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: UserStory = {
    id: randomUUID(),
    title: valid.title,
    story: valid.story,
    acceptance: valid.acceptance,
    estimate: valid.estimate,
    epicId: valid.epicId,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, {
    ...doc,
    userStory: [...doc.userStory, entity],
  });

  return entity;
}

export async function updateUserStory(
  flow: ScrumFlow,
  id: string,
  input: UserStoryInput,
): Promise<UserStory> {
  const valid = userStoryInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.userStory.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/user-story] UserStory introuvable : ${id}`);
  }

  const updated: UserStory = {
    ...existing,
    title: valid.title,
    story: valid.story,
    acceptance: valid.acceptance,
    estimate: valid.estimate,
    epicId: valid.epicId,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.userStory.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, userStory: next });
  return updated;
}

export async function deleteUserStory(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.userStory.filter((item) => item.id !== id);

  if (next.length === doc.userStory.length) {
    throw new Error(`[scrum/user-story] UserStory introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, userStory: next });
}

export async function reorderUserStories(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly UserStory[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.userStory.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/user-story] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly UserStory[] = doc.userStory.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/user-story] UserStory inconnue : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, userStory: next });
  return next;
}
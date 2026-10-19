/*
path :           app/core/lib/scrum/services/user-story.ts
tag :            ["scrum", "service", "user-story", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "user story" du module Scrum.

flow:            listUserStories → readScrumFile → doc.userStory. createUserStory →
                 push. updateUserStory → map. deleteUserStory → filter.

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

exports:         ["listUserStories", "createUserStory", "updateUserStory",
                  "deleteUserStory"]

useBy:           ["@/app/core/lib/scrum/actions/user-story.ts"]

userStories:     ["*en tant que développeur je veux CRUD les user stories Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, UserStory } from "@/app/core/lib/scrum/types";
import {
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

  const entity: UserStory = {
    id: randomUUID(),
    title: valid.title,
    story: valid.story,
    acceptance: valid.acceptance,
    estimate: valid.estimate,
    epicId: valid.epicId,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
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

  let updated: UserStory | null = null;

  const next: readonly UserStory[] = doc.userStory.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      title: valid.title,
      story: valid.story,
      acceptance: valid.acceptance,
      estimate: valid.estimate,
      epicId: valid.epicId,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/user-story] UserStory introuvable : ${id}`);
  }

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
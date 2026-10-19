/*
path :           app/core/lib/scrum/actions/user-story.ts
tag :            ["scrum", "action", "user-story", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "user story" du module
                 Scrum. Expose createUserStoryAction, updateUserStoryAction,
                 deleteUserStoryAction et reorderUserStoriesAction.

flow:            FormData → parse → service → revalidatePath → ActionResult.

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

relatedFiles:    ["@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/user-story"]

exports:         ["createUserStoryAction", "updateUserStoryAction",
                  "deleteUserStoryAction", "reorderUserStoriesAction",
                  "ActionResult"]

useBy:           ["@/app/core/components/scrum/UserStoryList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les user stories via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScrumFlow, UserStory } from "@/app/core/lib/scrum/types";
import {
  createUserStory,
  deleteUserStory,
  reorderUserStories,
  updateUserStory,
} from "@/app/core/lib/scrum/services/user-story";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/user-story`);
}

function parseUserStoryForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    story: String(formData.get("story") ?? ""),
    acceptance: String(formData.get("acceptance") ?? ""),
    estimate: String(formData.get("estimate") ?? ""),
    epicId: String(formData.get("epicId") ?? ""),
  };
}

export async function createUserStoryAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<UserStory>> {
  try {
    const input = parseUserStoryForm(formData);
    const entity = await createUserStory(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function updateUserStoryAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<UserStory>> {
  try {
    const input = parseUserStoryForm(formData);
    const entity = await updateUserStory(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function deleteUserStoryAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteUserStory(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function reorderUserStoriesAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly UserStory[]>> {
  try {
    const entities = await reorderUserStories(flow, orderedIds);
    revalidate(flow);
    return { ok: true, data: entities };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
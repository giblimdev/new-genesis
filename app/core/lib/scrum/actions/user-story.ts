/*
path :           app/core/lib/scrum/actions/user-story.ts
tag :            ["scrum", "action", "user-story", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "user story" du module Scrum.
                 Délègue au service user-story et utilise _helpers.

flow:            FormData → parse → service → revalidate → ActionResult.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/_helpers.ts",
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/task.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/_crud.ts",
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

relatedFiles:    ["@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/user-story"]

exports:         ["createUserStoryAction", "updateUserStoryAction",
                  "deleteUserStoryAction", "reorderUserStoriesAction"]

useBy:           ["@/app/core/components/scrum/UserStoryList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les user stories via Server Actions"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import {
  handleActionError,
  revalidateScrumFlow,
  type ActionResult,
} from "@/app/core/lib/scrum/actions/_helpers";
import type { ScrumFlow, UserStory } from "@/app/core/lib/scrum/types";
import {
  createUserStory,
  deleteUserStory,
  reorderUserStories,
  updateUserStory,
} from "@/app/core/lib/scrum/services/user-story";

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
    const entity = await createUserStory(flow, parseUserStoryForm(formData));
    revalidateScrumFlow(flow, "user-story");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateUserStoryAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<UserStory>> {
  try {
    const entity = await updateUserStory(flow, id, parseUserStoryForm(formData));
    revalidateScrumFlow(flow, "user-story");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUserStoryAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteUserStory(flow, id);
    revalidateScrumFlow(flow, "user-story");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderUserStoriesAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly UserStory[]>> {
  try {
    const entities = await reorderUserStories(flow, orderedIds);
    revalidateScrumFlow(flow, "user-story");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}
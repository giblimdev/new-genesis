/*
path :           app/core/lib/scrum/actions/sprint.ts
tag :            ["scrum", "action", "sprint", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "sprint" du module Scrum.
                 Délègue au service sprint et utilise _helpers.
                 updateSprintMetaAction et updateSprintStoriesAction sont
                 distinctes (édition scindée du service sprint).

flow:            FormData → parse → service → revalidate → ActionResult.

ecosystem:       Scrum = [
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

relatedFiles:    ["@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/sprint"]

exports:         ["createSprintAction", "updateSprintMetaAction",
                  "updateSprintStoriesAction", "deleteSprintAction",
                  "reorderSprintsAction"]

useBy:           ["@/app/core/components/scrum/SprintList.tsx",
                  "@/app/core/components/scrum/SprintEditor.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les sprints via Server Actions"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import { revalidatePath } from "next/cache";

import {
  handleActionError,
  parseStringArray,
  revalidateScrumFlow,
  type ActionResult,
} from "@/app/core/lib/scrum/actions/_helpers";
import type { ScrumFlow, Sprint } from "@/app/core/lib/scrum/types";
import {
  createSprint,
  deleteSprint,
  reorderSprints,
  updateSprintMeta,
  updateSprintStories,
} from "@/app/core/lib/scrum/services/sprint";

function revalidate(flow: ScrumFlow, sprintId?: string): void {
  revalidateScrumFlow(flow, "sprint");
  if (sprintId) revalidatePath(`/core/${flow}/sprint/${sprintId}/edit`);
}

function parseSprintMetaForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  };
}

export async function createSprintAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const entity = await createSprint(flow, {
      ...parseSprintMetaForm(formData),
      storyIds: parseStringArray(formData, "storyIds"),
    });
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateSprintMetaAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const entity = await updateSprintMeta(
      flow,
      id,
      parseSprintMetaForm(formData),
    );
    revalidate(flow, id);
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateSprintStoriesAction(
  flow: ScrumFlow,
  id: string,
  storyIds: readonly string[],
): Promise<ActionResult<Sprint>> {
  try {
    const entity = await updateSprintStories(flow, id, storyIds);
    revalidate(flow, id);
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteSprintAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteSprint(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderSprintsAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Sprint[]>> {
  try {
    const entities = await reorderSprints(flow, orderedIds);
    revalidate(flow);
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}
/*
path :           app/core/lib/scrum/actions/epic.ts
tag :            ["scrum", "action", "epic", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "epic" du module Scrum.
                 Délègue au service epic et utilise _helpers.

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

relatedFiles:    ["@/app/core/lib/scrum/services/epic.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/epic"]

exports:         ["createEpicAction", "updateEpicAction", "deleteEpicAction",
                  "reorderEpicsAction"]

useBy:           ["@/app/core/components/scrum/EpicList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les epics via Server Actions"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import {
  handleActionError,
  parseStringArray,
  revalidateScrumFlow,
  type ActionResult,
} from "@/app/core/lib/scrum/actions/_helpers";
import type { Epic, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createEpic,
  deleteEpic,
  reorderEpics,
  updateEpic,
} from "@/app/core/lib/scrum/services/epic";

function parseEpicForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    scope: String(formData.get("scope") ?? ""),
    personas: parseStringArray(formData, "personas"),
  };
}

export async function createEpicAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Epic>> {
  try {
    const entity = await createEpic(flow, parseEpicForm(formData));
    revalidateScrumFlow(flow, "epic");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateEpicAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Epic>> {
  try {
    const entity = await updateEpic(flow, id, parseEpicForm(formData));
    revalidateScrumFlow(flow, "epic");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteEpicAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteEpic(flow, id);
    revalidateScrumFlow(flow, "epic");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderEpicsAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Epic[]>> {
  try {
    const entities = await reorderEpics(flow, orderedIds);
    revalidateScrumFlow(flow, "epic");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}
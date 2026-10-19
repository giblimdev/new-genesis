/*
path :           app/core/lib/scrum/actions/idee.ts
tag :            ["scrum", "action", "idee", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "idée" du module Scrum.
                 Délègue au service idee (makeCrudService) et utilise les
                 helpers partagés _helpers (revalidateScrumFlow,
                 handleActionError, ActionResult).

flow:            createIdeeAction(flow, formData) → parse → service → revalidate → ActionResult.
                 updateIdeeAction / deleteIdeeAction / reorderIdeesAction → idem.

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

relatedFiles:    ["@/app/core/lib/scrum/services/idee.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/idee"]

exports:         ["createIdeeAction", "updateIdeeAction", "deleteIdeeAction",
                  "reorderIdeesAction"]

useBy:           ["@/app/core/components/scrum/IdeeList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les idées via Server Actions"]

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
import type { Idee, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createIdee,
  deleteIdee,
  reorderIdees,
  updateIdee,
} from "@/app/core/lib/scrum/services/idee";

function parseIdeeForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    problem: String(formData.get("problem") ?? ""),
    hypotheses: String(formData.get("hypotheses") ?? ""),
    context: String(formData.get("context") ?? ""),
  };
}

export async function createIdeeAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Idee>> {
  try {
    const entity = await createIdee(flow, parseIdeeForm(formData));
    revalidateScrumFlow(flow, "idee");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateIdeeAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Idee>> {
  try {
    const entity = await updateIdee(flow, id, parseIdeeForm(formData));
    revalidateScrumFlow(flow, "idee");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteIdeeAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteIdee(flow, id);
    revalidateScrumFlow(flow, "idee");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderIdeesAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Idee[]>> {
  try {
    const entities = await reorderIdees(flow, orderedIds);
    revalidateScrumFlow(flow, "idee");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}
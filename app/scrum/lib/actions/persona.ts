/*
path :           app/core/lib/scrum/actions/persona.ts
tag :            ["scrum", "action", "persona", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "persona" du module Scrum.
                 Délègue au service persona et utilise _helpers.

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

relatedFiles:    ["@/app/core/lib/scrum/services/persona.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/persona"]

exports:         ["createPersonaAction", "updatePersonaAction",
                  "deletePersonaAction", "reorderPersonasAction"]

useBy:           ["@/app/core/components/scrum/PersonaList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les personas via Server Actions"]

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
} from "@/app/scrum/lib/actions/_helpers";
import type { Persona, ScrumFlow } from "@/app/scrum/lib/types";
import {
  createPersona,
  deletePersona,
  reorderPersonas,
  updatePersona,
} from "@/app/scrum/lib/services/persona";

function parsePersonaForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    need: String(formData.get("need") ?? ""),
    relatedFeatures: parseStringArray(formData, "relatedFeatures"),
  };
}

export async function createPersonaAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Persona>> {
  try {
    const entity = await createPersona(flow, parsePersonaForm(formData));
    revalidateScrumFlow(flow, "persona");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePersonaAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Persona>> {
  try {
    const entity = await updatePersona(flow, id, parsePersonaForm(formData));
    revalidateScrumFlow(flow, "persona");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePersonaAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deletePersona(flow, id);
    revalidateScrumFlow(flow, "persona");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderPersonasAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Persona[]>> {
  try {
    const entities = await reorderPersonas(flow, orderedIds);
    revalidateScrumFlow(flow, "persona");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}

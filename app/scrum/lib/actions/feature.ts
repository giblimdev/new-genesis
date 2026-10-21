/*
path :           app/core/lib/scrum/actions/feature.ts
tag :            ["scrum", "action", "feature", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "feature" du module Scrum.
                 Délègue au service feature et utilise _helpers.

flow:            FormData → parse → service → revalidate → ActionResult.
                 reorderFeaturesAction(flow, orderedIds) → service → revalidate → ActionResult.

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

relatedFiles:    ["@/app/core/lib/scrum/services/feature.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/feature"]

exports:         ["createFeatureAction", "updateFeatureAction",
                  "deleteFeatureAction", "reorderFeaturesAction"]

useBy:           ["@/app/core/components/scrum/FeatureList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les features via Server Actions"]

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
import type { Feature, ScrumFlow } from "@/app/scrum/lib/types";
import {
  createFeature,
  deleteFeature,
  reorderFeatures,
  updateFeature,
} from "@/app/scrum/lib/services/feature";

function parseFeatureForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    interest: String(formData.get("interest") ?? ""),
    personas: parseStringArray(formData, "personas"),
  };
}

export async function createFeatureAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Feature>> {
  try {
    const entity = await createFeature(flow, parseFeatureForm(formData));
    revalidateScrumFlow(flow, "feature");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateFeatureAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Feature>> {
  try {
    const entity = await updateFeature(flow, id, parseFeatureForm(formData));
    revalidateScrumFlow(flow, "feature");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteFeatureAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteFeature(flow, id);
    revalidateScrumFlow(flow, "feature");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderFeaturesAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Feature[]>> {
  try {
    const entities = await reorderFeatures(flow, orderedIds);
    revalidateScrumFlow(flow, "feature");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}

/*
path :           app/core/lib/scrum/actions/feature.ts
tag :            ["scrum", "action", "feature", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "feature" du module Scrum.
                 Expose createFeatureAction, updateFeatureAction,
                 deleteFeatureAction et reorderFeaturesAction.

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

relatedFiles:    ["@/app/core/lib/scrum/services/feature.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/feature"]

exports:         ["createFeatureAction", "updateFeatureAction",
                  "deleteFeatureAction", "reorderFeaturesAction",
                  "ActionResult"]

useBy:           ["@/app/core/components/scrum/FeatureList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les features via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { Feature, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createFeature,
  deleteFeature,
  reorderFeatures,
  updateFeature,
} from "@/app/core/lib/scrum/services/feature";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/feature`);
}

function parseStringArray(formData: FormData, key: string): string[] {
  const values = formData.getAll(key);
  if (values.length > 0) {
    return values.map(String).map((v) => v.trim()).filter(Boolean);
  }
  const single = formData.get(key);
  if (typeof single === "string" && single.length > 0) {
    return single.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

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
    const input = parseFeatureForm(formData);
    const entity = await createFeature(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function updateFeatureAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Feature>> {
  try {
    const input = parseFeatureForm(formData);
    const entity = await updateFeature(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function deleteFeatureAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteFeature(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function reorderFeaturesAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Feature[]>> {
  try {
    const entities = await reorderFeatures(flow, orderedIds);
    revalidate(flow);
    return { ok: true, data: entities };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
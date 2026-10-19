/*
path :           app/core/lib/scrum/actions/sprint.ts
tag :            ["scrum", "action", "sprint", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "sprint" du module Scrum.
                 Expose createSprintAction, updateSprintMetaAction,
                 updateSprintStoriesAction, deleteSprintAction et
                 reorderSprintsAction. updateSprintAction (ancienne signature
                 monolithique) est supprimée : la page d'édition fait deux
                 appels séquentiels (méta puis stories).

flow:            FormData → parse → service → revalidatePath → ActionResult.
                 reorderSprintsAction(flow, orderedIds) → service → idem.

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

relatedFiles:    ["@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/sprint"]

exports:         ["createSprintAction", "updateSprintMetaAction",
                  "updateSprintStoriesAction", "deleteSprintAction",
                  "reorderSprintsAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/SprintList.tsx",
                  "@/app/core/components/scrum/SprintEditor.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les sprints via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScrumFlow, Sprint } from "@/app/core/lib/scrum/types";
import {
  createSprint,
  deleteSprint,
  reorderSprints,
  updateSprintMeta,
  updateSprintStories,
} from "@/app/core/lib/scrum/services/sprint";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow, sprintId?: string): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/sprint`);
  if (sprintId) {
    revalidatePath(`/core/${flow}/sprint/${sprintId}/edit`);
  }
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

function parseSprintMetaForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Création                                                           */
/* ------------------------------------------------------------------ */

export async function createSprintAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const input = {
      ...parseSprintMetaForm(formData),
      storyIds: parseStringArray(formData, "storyIds"),
    };
    const entity = await createSprint(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Édition méta (nom, objectif, dates)                                */
/* ------------------------------------------------------------------ */

export async function updateSprintMetaAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const input = parseSprintMetaForm(formData);
    const entity = await updateSprintMeta(flow, id, input);
    revalidate(flow, id);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Édition des US (board DnD)                                         */
/* ------------------------------------------------------------------ */

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
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export async function deleteSprintAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteSprint(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Réordonnancement                                                   */
/* ------------------------------------------------------------------ */

export async function reorderSprintsAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Sprint[]>> {
  try {
    const entities = await reorderSprints(flow, orderedIds);
    revalidate(flow);
    return { ok: true, data: entities };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
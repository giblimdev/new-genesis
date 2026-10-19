/*
path :           app/core/lib/scrum/actions/sprint.ts
tag :            ["scrum", "action", "sprint", "server-action", "crud"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "sprint" du module Scrum.

flow:            FormData → parse → service → revalidatePath → { ok: true, data }.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/sprint"]

exports:         ["createSprintAction", "updateSprintAction",
                  "deleteSprintAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/SprintForm.tsx",
                  "@/app/core/components/scrum/SprintList.tsx"]

userStories:     ["*en tant que développeur je veux muter les sprints via Server Actions"]

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
  updateSprint,
} from "@/app/core/lib/scrum/services/sprint";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/sprint`);
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

function parseSprintForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    storyIds: parseStringArray(formData, "storyIds"),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  };
}

export async function createSprintAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const input = parseSprintForm(formData);
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

export async function updateSprintAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Sprint>> {
  try {
    const input = parseSprintForm(formData);
    const entity = await updateSprint(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
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
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
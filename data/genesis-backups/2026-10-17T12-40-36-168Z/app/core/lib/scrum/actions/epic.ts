/*
path :           app/core/lib/scrum/actions/epic.ts
tag :            ["scrum", "action", "epic", "server-action", "crud"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "epic" du module Scrum.

flow:            FormData → parse → service → revalidatePath → { ok: true, data }.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/epic.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/epic"]

exports:         ["createEpicAction", "updateEpicAction", "deleteEpicAction",
                  "ActionResult"]

useBy:           ["@/app/core/components/scrum/EpicForm.tsx",
                  "@/app/core/components/scrum/EpicList.tsx"]

userStories:     ["*en tant que développeur je veux muter les epics via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { Epic, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createEpic,
  deleteEpic,
  updateEpic,
} from "@/app/core/lib/scrum/services/epic";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/epic`);
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
    const input = parseEpicForm(formData);
    const entity = await createEpic(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function updateEpicAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Epic>> {
  try {
    const input = parseEpicForm(formData);
    const entity = await updateEpic(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function deleteEpicAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteEpic(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
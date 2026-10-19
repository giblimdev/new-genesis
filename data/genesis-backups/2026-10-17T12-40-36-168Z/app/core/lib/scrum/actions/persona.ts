/*
path :           app/core/lib/scrum/actions/persona.ts
tag :            ["scrum", "action", "persona", "server-action", "crud"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "persona" du module Scrum.

flow:            FormData → parse → service → revalidatePath → { ok: true, data }.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/persona.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/persona"]

exports:         ["createPersonaAction", "updatePersonaAction",
                  "deletePersonaAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/PersonaForm.tsx",
                  "@/app/core/components/scrum/PersonaList.tsx"]

userStories:     ["*en tant que développeur je veux muter les personas via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { Persona, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createPersona,
  deletePersona,
  updatePersona,
} from "@/app/core/lib/scrum/services/persona";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/persona`);
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
    const input = parsePersonaForm(formData);
    const entity = await createPersona(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function updatePersonaAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Persona>> {
  try {
    const input = parsePersonaForm(formData);
    const entity = await updatePersona(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function deletePersonaAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deletePersona(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
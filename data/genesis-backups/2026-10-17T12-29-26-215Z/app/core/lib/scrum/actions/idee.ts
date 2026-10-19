/*
path :           app/core/lib/scrum/actions/idee.ts
tag :            ["scrum", "action", "idee", "server-action", "crud"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "idée" du module Scrum. Expose
                 createIdeeAction, updateIdeeAction, deleteIdeeAction. Parse le
                 FormData, délègue au service, revalidatePath, retourne un objet
                 discriminé { ok, data?, error? }.

flow:            FormData → parse → service → revalidatePath → { ok: true, data }.
                 En cas d'erreur : { ok: false, error }.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/idee.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/idee"]

exports:         ["createIdeeAction", "updateIdeeAction", "deleteIdeeAction",
                  "ActionResult"]

useBy:           ["@/app/core/components/scrum/IdeeForm.tsx",
                  "@/app/core/components/scrum/IdeeList.tsx"]

userStories:     ["*en tant que développeur je veux muter les idées via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { Idee, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createIdee,
  deleteIdee,
  updateIdee,
} from "@/app/core/lib/scrum/services/idee";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/idee`);
}

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
    const input = parseIdeeForm(formData);
    const entity = await createIdee(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function updateIdeeAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Idee>> {
  try {
    const input = parseIdeeForm(formData);
    const entity = await updateIdee(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function deleteIdeeAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteIdee(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
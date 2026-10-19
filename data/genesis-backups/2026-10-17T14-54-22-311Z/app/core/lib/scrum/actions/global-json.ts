/*
path :           app/core/lib/scrum/actions/global-json.ts
tag :            ["scrum", "action", "global-json", "server-action", "export", "persist"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'export et la persistance du Global JSON.
                 Expose getGlobalJsonAction (retourne le document), serializeGlobalJsonAction
                 (retourne la chaîne JSON formatée) et updateGlobalJsonAction (valide
                 et écrit le JSON fourni par le client, puis renvoie la forme
                 canonique re-sérialisée).

flow:            getGlobalJsonAction(flow) → service getGlobalJson →
                 { ok: true, data: ScrumDocument }.
                 serializeGlobalJsonAction(flow) → service serializeGlobalJson →
                 { ok: true, data: string }.
                 updateGlobalJsonAction(flow, rawJson) → service saveGlobalJson
                 → revalidatePath(/core/${flow}/global-json) → service
                 serializeGlobalJson → { ok: true, data: string }.

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

relatedFiles:    ["@/app/core/lib/scrum/services/global-json.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/global-json"]

exports:         ["getGlobalJsonAction", "serializeGlobalJsonAction",
                  "updateGlobalJsonAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/GlobalJsonExport.tsx",
                  "@/app/core/[flow]/global-json/page.tsx"]

userStories:     ["*en tant que développeur je veux exporter et persister le document Scrum via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScrumDocument, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  getGlobalJson,
  saveGlobalJson,
  serializeGlobalJson,
} from "@/app/core/lib/scrum/services/global-json";

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

export async function getGlobalJsonAction(
  flow: ScrumFlow,
): Promise<ActionResult<ScrumDocument>> {
  try {
    const doc = await getGlobalJson(flow);
    return { ok: true, data: doc };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function serializeGlobalJsonAction(
  flow: ScrumFlow,
): Promise<ActionResult<string>> {
  try {
    const json = await serializeGlobalJson(flow);
    return { ok: true, data: json };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/**
 * Valide et persiste le JSON fourni par le client, puis renvoie la forme
 * canonique re-sérialisée (meta.updatedAt / schemaVersion rafraîchis par
 * writeScrumFile). Déclenche la revalidation de la page Global JSON.
 */
export async function updateGlobalJsonAction(
  flow: ScrumFlow,
  rawJson: string,
): Promise<ActionResult<string>> {
  try {
    await saveGlobalJson(flow, rawJson);
    revalidatePath(`/core/${flow}/global-json`);
    const json = await serializeGlobalJson(flow);
    return { ok: true, data: json };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
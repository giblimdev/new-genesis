/*
path :           app/core/lib/scrum/actions/global-json.ts
tag :            ["scrum", "action", "global-json", "server-action", "persist"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Action de persistance du Global JSON. Expose
                 uniquement updateGlobalJsonAction (valide et écrit le JSON
                 fourni par le client, puis renvoie la forme canonique
                 re-sérialisée). Les anciennes actions getGlobalJsonAction
                 et serializeGlobalJsonAction ont été supprimées : la page
                 Server /core/[flow]/global-json lit directement via les
                 services (getGlobalJson, serializeGlobalJson), conformément
                 à la séparation UI / Server Action déjà appliquée aux
                 sections CRUD (idee, feature, persona, epic, user-story,
                 sprint). Les garder exposait une surface d'API inutile et
                 dupliquait le contrat déjà porté par les services.

flow:            updateGlobalJsonAction(flow, rawJson) → service
                 saveGlobalJson (JSON.parse → validation Zod → writeScrumFile
                 atomique) → revalidatePath(/core/${flow}/global-json) →
                 service serializeGlobalJson (relecture disque + stringify
                 indenté 2 espaces) → { ok: true, data: string }.
                 En cas d'erreur (JSON mal formé, schéma non conforme,
                 erreur FS) : { ok: false, error }.

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

exports:         ["updateGlobalJsonAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/GlobalJsonExport.tsx"]

userStories:     ["*en tant que développeur je veux persister le document Scrum via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  saveGlobalJson,
  serializeGlobalJson,
} from "@/app/core/lib/scrum/services/global-json";

/* ------------------------------------------------------------------ */
/*  Résultat typé                                                      */
/* ------------------------------------------------------------------ */

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

/* ------------------------------------------------------------------ */
/*  Persistance                                                        */
/* ------------------------------------------------------------------ */

/**
 * Valide et persiste le JSON fourni par le client, puis renvoie la forme
 * canonique re-sérialisée (meta.updatedAt / schemaVersion rafraîchis par
 * writeScrumFile). Déclenche la revalidation de la page Global JSON.
 *
 * La relecture via serializeGlobalJson après saveGlobalJson est
 * volontaire : elle garantit que le client reçoit exactement ce qui a été
 * écrit sur disque, y compris les normalisations appliquées par Zod
 * (defaults, transforms) et le meta réinjecté par writeScrumFile.
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
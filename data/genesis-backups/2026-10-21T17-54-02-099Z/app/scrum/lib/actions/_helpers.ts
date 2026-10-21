/*
path :           app/core/lib/scrum/actions/_helpers.ts
tag :            ["scrum", "action", "helpers", "revalidate", "form", "generic"]
projectId:       new-genesis
type:            action
generic:         true

role:            Helpers PARTAGÉS par les 7 fichiers d'actions du module
                 Scrum (epic, feature, idee, persona, sprint, task,
                 user-story). Ce fichier n'est PAS un fichier "use server" :
                 il ne déclare aucune Server Action, il expose des helpers
                 synchrones (revalidateScrumFlow, parseStringArray) + un
                 ré-export du contrat neutre ActionResult / handleActionError.
                 Il est importé exclusivement par des fichiers "use server",
                 ce qui garantit son exécution en contexte serveur (et le
                 fait interdire indirectement côté client par la résolution
                 de next/cache).
                 Factorise ce qui était dupliqué à l'identique dans chaque
                 fichier d'actions Scrum :
                 - revalidateScrumFlow(flow, section?) : revalide la vue
                   d'ensemble /core/${flow} et la section /core/${flow}/<section>.
                 - parseStringArray(formData, key) : lit un champ FormData
                   multi-valué (getAll) OU une chaîne CSV (get + split) et
                   retourne un tableau nettoyé (utilisé pour personas,
                   relatedFeatures, storyIds).

flow:            revalidateScrumFlow(flow, section?) → revalidatePath ×2.
                 parseStringArray(formData, key) → tableau nettoyé.
                 handleActionError(error) → ré-export de @/lib/actions/result.

ecosystem:       Scrum = [
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

relatedFiles:    ["@/lib/actions/result.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/lib/actions/result",
                  "@/app/core/lib/scrum/types"]

exports:         ["ActionResult", "handleActionError", "revalidateScrumFlow",
                  "parseStringArray"]

useBy:           ["@/app/core/lib/scrum/actions/epic.ts",
                  "@/app/core/lib/scrum/actions/feature.ts",
                  "@/app/core/lib/scrum/actions/global-json.ts",
                  "@/app/core/lib/scrum/actions/idee.ts",
                  "@/app/core/lib/scrum/actions/persona.ts",
                  "@/app/core/lib/scrum/actions/sprint.ts",
                  "@/app/core/lib/scrum/actions/task.ts",
                  "@/app/core/lib/scrum/actions/user-story.ts"]

userStories:     ["*en tant que développeur je veux des helpers d'actions Scrum partagés"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/result";
import type { ScrumFlow } from "@/app/scrum/lib/types";

/* ------------------------------------------------------------------ */
/*  Ré-exports du contrat neutre                                       */
/* ------------------------------------------------------------------ */

export type { ActionResult };
export { handleActionError } from "@/lib/actions/result";

/* ------------------------------------------------------------------ */
/*  Revalidation                                                       */
/* ------------------------------------------------------------------ */

/**
 * Revalide la vue d'ensemble du flux et la section demandée.
 * `section` est optionnel (utile pour les actions qui ne concernent
 * qu'une seule section, ex. "sprint").
 *
 * IMPORTANT : cette fonction doit être appelée depuis une Server Action
 * (le "use server" de l'appelant garantit le contexte serveur requis
 * par revalidatePath).
 */
export function revalidateScrumFlow(flow: ScrumFlow, section?: string): void {
  revalidatePath(`/core/${flow}`);
  if (section) revalidatePath(`/core/${flow}/${section}`);
}

/* ------------------------------------------------------------------ */
/*  Lecture FormData                                                   */
/* ------------------------------------------------------------------ */

/**
 * Lit un champ FormData qui peut être :
 * - multi-valué (formData.getAll → string[]) : ex. plusieurs <input name="personas">
 * - ou une seule chaîne CSV (formData.get + split(",")) : ex. "Marie,Karim"
 * Retourne un tableau nettoyé (trim + filter Boolean).
 */
export function parseStringArray(formData: FormData, key: string): string[] {
  const values = formData.getAll(key);
  if (values.length > 0) {
    return values
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  const single = formData.get(key);
  if (typeof single === "string" && single.length > 0) {
    return single
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

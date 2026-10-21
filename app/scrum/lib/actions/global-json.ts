/*
path :           app/core/lib/scrum/actions/global-json.ts
tag :            ["scrum", "action", "global-json", "server-action", "persist"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Action de persistance du Global JSON. Expose
                 uniquement updateGlobalJsonAction (valide et écrit le JSON
                 fourni par le client, puis renvoie la forme canonique
                 re-sérialisée). Utilise _helpers pour revalidate et
                 handleActionError.

flow:            updateGlobalJsonAction(flow, rawJson) → saveGlobalJson →
                 revalidatePath(/core/${flow}/global-json) →
                 serializeGlobalJson → { ok: true, data: string }.
                 En cas d'erreur : { ok: false, error }.

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

relatedFiles:    ["@/app/core/lib/scrum/services/global-json.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/global-json"]

exports:         ["updateGlobalJsonAction"]

useBy:           ["@/app/core/components/scrum/GlobalJsonExport.tsx"]

userStories:     ["*en tant que développeur je veux persister le document Scrum via une Server Action"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import { revalidatePath } from "next/cache";

import {
  handleActionError,
  type ActionResult,
} from "@/app/scrum/lib/actions/_helpers";
import type { ScrumFlow } from "@/app/scrum/lib/types";
import {
  saveGlobalJson,
  serializeGlobalJson,
} from "@/app/scrum/lib/services/global-json";

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
    return handleActionError(error);
  }
}

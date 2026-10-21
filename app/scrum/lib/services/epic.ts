/*
path :           app/core/lib/services/epic.ts
tag :            ["scrum", "service", "epic", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "epic" du module
                 Scrum. Délègue à makeCrudService avec la clé "epic" et le
                 schéma epicInputSchema.

flow:            makeCrudService("epic", epicInputSchema) →
                 { list, create, update, delete, reorder } ré-exportés.

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
                    "@/app/core/lib/scrum/services/_crud.ts",
                   "@/app/core/lib/scrum/services/sprint.ts",
                   "@/app/core/lib/scrum/services/task.ts",
                   "@/app/core/lib/scrum/services/user-story.ts",
                   "@/app/core/lib/scrum/storage.ts",
                   "@/app/core/lib/scrum/types.ts",
                   "@/app/core/lib/scrum/validations.ts",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/_crud.ts",
                  "@/app/core/lib/scrum/validations.ts"]

imports:         ["@/app/core/lib/scrum/services/_crud",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listEpics", "createEpic", "updateEpic", "deleteEpic",
                  "reorderEpics"]

useBy:           ["@/app/core/lib/scrum/actions/epic.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les epics Scrum"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { makeCrudService } from "@/app/scrum/lib/services/_crud";
import { epicInputSchema } from "@/app/scrum/lib/validations";

export const {
  list: listEpics,
  create: createEpic,
  update: updateEpic,
  delete: deleteEpic,
  reorder: reorderEpics,
} = makeCrudService("epic", epicInputSchema);

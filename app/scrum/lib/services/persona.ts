/*
path :           app/core/lib/services/persona.ts
tag :            ["scrum", "service", "persona", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "persona" du module
                 Scrum. Délègue à makeCrudService avec la clé "persona" et
                 le schéma personaInputSchema.

flow:            makeCrudService("persona", personaInputSchema) →
                 { list, create, update, delete, reorder } ré-exportés.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts", 
                   "@/app/core/lib/scrum/actions/idee.ts",
                    "@/app/core/lib/scrum/services/_crud.ts",
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

relatedFiles:    ["@/app/core/lib/scrum/services/_crud.ts",
                  "@/app/core/lib/scrum/validations.ts"]

imports:         ["@/app/core/lib/scrum/services/_crud",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listPersonas", "createPersona", "updatePersona",
                  "deletePersona", "reorderPersonas"]

useBy:           ["@/app/core/lib/scrum/actions/persona.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les personas Scrum"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { makeCrudService } from "@/app/scrum/lib/services/_crud";
import { personaInputSchema } from "@/app/scrum/lib/validations";

export const {
  list: listPersonas,
  create: createPersona,
  update: updatePersona,
  delete: deletePersona,
  reorder: reorderPersonas,
} = makeCrudService("persona", personaInputSchema);

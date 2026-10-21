/*
path :           app/core/lib/services/idee.ts
tag :            ["scrum", "service", "idee", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "idée" du module
                 Scrum. Délègue à makeCrudService (factory générique) en
                 fournissant la clé de collection "idea" et le schéma
                 ideeInputSchema. Plus de duplication : la factory gère
                 la génération d'id, le calcul d'order, le cycle
                 find + replace, la vérification de présence et la
                 normalisation d'ordre.

flow:            makeCrudService("idea", ideeInputSchema) →
                 { list, create, update, delete, reorder } ré-exportés sous
                 les noms listIdees / createIdee / updateIdee /
                 deleteIdee / reorderIdees.

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

relatedFiles:    ["@/app/core/lib/scrum/services/_crud.ts",
                  "@/app/core/lib/scrum/validations.ts"]

imports:         ["@/app/core/lib/scrum/services/_crud",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listIdees", "createIdee", "updateIdee", "deleteIdee",
                  "reorderIdees"]

useBy:           ["@/app/core/lib/scrum/actions/idee.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les idées Scrum"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { makeCrudService } from "@/app/scrum/lib/services/_crud";
import { ideeInputSchema } from "@/app/scrum/lib/validations";

export const {
  list: listIdees,
  create: createIdee,
  update: updateIdee,
  delete: deleteIdee,
  reorder: reorderIdees,
} = makeCrudService("idea", ideeInputSchema);

/*
path :           app/core/lib/scrum/services/user-story.ts
tag :            ["scrum", "service", "user-story", "crud", "reorder", "cascade"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "user story" du
                 module Scrum. Délègue à makeCrudService avec la clé
                 "userStory" et le schéma userStoryInputSchema. Branche
                 l'unique hook afterDelete de la factory pour effectuer la
                 cascade delete des tasks dont storyId référence l'US
                 supprimée (évite les orphelins en base).

flow:            makeCrudService("userStory", userStoryInputSchema,
                 { afterDelete: (doc, deleted) => ({
                     ...doc,
                     task: doc.task.filter(t => t.storyId !== deleted.id),
                   })
                 })
                 → { list, create, update, delete, reorder } ré-exportés.

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

exports:         ["listUserStories", "createUserStory", "updateUserStory",
                  "deleteUserStory", "reorderUserStories"]

useBy:           ["@/app/core/lib/scrum/actions/user-story.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les user stories Scrum"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { makeCrudService } from "@/app/core/lib/scrum/services/_crud";
import { userStoryInputSchema } from "@/app/core/lib/scrum/validations";

export const {
  list: listUserStories,
  create: createUserStory,
  update: updateUserStory,
  delete: deleteUserStory,
  reorder: reorderUserStories,
} = makeCrudService("userStory", userStoryInputSchema, {
  afterDelete: (doc, deleted) => ({
    ...doc,
    task: doc.task.filter((t) => t.storyId !== deleted.id),
  }),
});
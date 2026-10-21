/*
path :           app/core/lib/services/task.ts
tag :            ["scrum", "service", "task", "crud", "reorder", "validate"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "task" du module
                 Scrum. Délègue à makeCrudService avec la clé "task" et le
                 schéma taskInputSchema. Branche l'unique hook validate de
                 la factory pour vérifier que storyId référence une
                 UserStory existante (sur create et update), évitant les
                 tasks orphelines.

flow:            makeCrudService("task", taskInputSchema,
                 { validate: (input, doc) => {
                     if (!doc.userStory.some(us => us.id === input.storyId)) {
                       throw new Error(`[scrum/task] UserStory introuvable : ${input.storyId}`); 
                     }
                   }
                 })
                 → { list, create, update, delete, reorder } ré-exportés.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                                       "@/app/core/lib/scrum/services/_crud.ts",

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

exports:         ["listTasks", "createTask", "updateTask", "deleteTask",
                  "reorderTasks"]

useBy:           ["@/app/core/lib/scrum/actions/task.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les tasks Scrum"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { makeCrudService } from "@/app/scrum/lib/services/_crud";
import { taskInputSchema } from "@/app/scrum/lib/validations";

export const {
  list: listTasks,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
  reorder: reorderTasks,
} = makeCrudService("task", taskInputSchema, {
  validate: (input, doc) => {
    const exists = doc.userStory.some((us) => us.id === input.storyId);
    if (!exists) {
      throw new Error(`[scrum/task] UserStory introuvable : ${input.storyId}`);
    }
  },
});

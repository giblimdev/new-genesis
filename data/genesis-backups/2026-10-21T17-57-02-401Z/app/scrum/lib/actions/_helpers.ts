/*
path :           app/scrum/lib/actions/_helpers.ts
tag :            ["scrum", "action", "helpers", "revalidate", "generic"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Helpers PARTAGÉS par les 8 fichiers d'actions du module Scrum.
                 Ce fichier n'est PAS un fichier "use server" : il expose des
                 helpers synchrones (revalidateScrumFlow, parseStringArray) et
                 un ré-export du contrat neutre ActionResult / handleActionError.
                 Importé exclusivement par des fichiers "use server".

flow:            revalidateScrumFlow(flow, section?) → revalidatePath ×2.
                 parseStringArray(formData, key) → tableau nettoyé.
                 handleActionError(error) → ré-export de @/lib/actions/result.

ecosystem:       Scrum = [
                   "@/app/scrum/lib/actions/_helpers.ts",
                   "@/app/scrum/lib/actions/epic.ts",
                   "@/app/scrum/lib/actions/feature.ts",
                   "@/app/scrum/lib/actions/global-json.ts",
                   "@/app/scrum/lib/actions/idee.ts",
                   "@/app/scrum/lib/actions/persona.ts",
                   "@/app/scrum/lib/actions/sprint.ts",
                   "@/app/scrum/lib/actions/task.ts",
                   "@/app/scrum/lib/actions/user-story.ts",
                   "@/app/scrum/lib/services/_crud.ts",
                   "@/app/scrum/lib/services/epic.ts",
                   "@/app/scrum/lib/services/feature.ts",
                   "@/app/scrum/lib/services/global-json.ts",
                   "@/app/scrum/lib/services/idee.ts",
                   "@/app/scrum/lib/services/persona.ts",
                   "@/app/scrum/lib/services/sprint.ts",
                   "@/app/scrum/lib/services/task.ts",
                   "@/app/scrum/lib/services/user-story.ts",
                   "@/app/scrum/lib/storage.ts",
                   "@/app/scrum/lib/types.ts",
                   "@/app/scrum/lib/validations.ts",
                 ]

relatedFiles:    ["@/lib/actions/result.ts",
                  "@/app/scrum/lib/types.ts"]

imports:         ["next/cache",
                  "@/lib/actions/result",
                  "@/app/scrum/lib/types"]

exports:         ["ActionResult", "handleActionError",
                  "revalidateScrumFlow", "parseStringArray"]

useBy:           ["@/app/scrum/lib/actions/epic.ts",
                  "@/app/scrum/lib/actions/feature.ts",
                  "@/app/scrum/lib/actions/global-json.ts",
                  "@/app/scrum/lib/actions/idee.ts",
                  "@/app/scrum/lib/actions/persona.ts",
                  "@/app/scrum/lib/actions/sprint.ts",
                  "@/app/scrum/lib/actions/task.ts",
                  "@/app/scrum/lib/actions/user-story.ts"]

userStories:     ["*en tant que développeur je veux des helpers d'actions Scrum partagés"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
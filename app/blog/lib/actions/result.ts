/*
path :           app/blog/lib/actions/result.ts
tag :            ["blog", "actions", "result", "discriminated", "generic", "re-export"]
projectId:       new-genesis
type:            action
generic:         true

role:            Re-export du contrat ActionResult<T> et du helper
                 handleActionError depuis @/lib/actions/result (module neutre).
                 Conservé pour compatibilité : les 10 fichiers du domaine
                 BlogActions continuent d'importer depuis ce chemin sans
                 modification. Le contrat est désormais défini une seule fois
                 (dans @/lib/actions/result.ts) et partagé avec le module
                 Scrum via @/app/core/lib/scrum/actions/_helpers.

flow:            Module TypeScript pur → ré-export de
                 ActionResult et handleActionError.

ecosystem:       BlogActions = [
                   "@/app/blog/lib/actions/article.ts",
                   "@/app/blog/lib/actions/article-form.ts",
                   "@/app/blog/lib/actions/comment.ts",
                   "@/app/blog/lib/actions/discussion.ts",
                   "@/app/blog/lib/actions/favorite.ts",
                   "@/app/blog/lib/actions/group.ts",
                   "@/app/blog/lib/actions/like.ts",
                   "@/app/blog/lib/actions/notification.ts",
                   "@/app/blog/lib/actions/result.ts",
                   "@/app/blog/lib/actions/taxonomy.ts",
                 ]

relatedFiles:    ["@/lib/actions/result.ts"]

imports:         ["@/lib/actions/result"]

exports:         ["ActionResult", "handleActionError"]

useBy:           ["@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/actions/comment.ts",
                  "@/app/blog/lib/actions/discussion.ts",
                  "@/app/blog/lib/actions/favorite.ts",
                  "@/app/blog/lib/actions/group.ts",
                  "@/app/blog/lib/actions/like.ts",
                  "@/app/blog/lib/actions/notification.ts",
                  "@/app/blog/lib/actions/taxonomy.ts"]

userStories:     ["*en tant que développeur je veux un contrat ActionResult partagé"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export type { ActionResult } from "@/lib/actions/result";
export { handleActionError } from "@/lib/actions/result";
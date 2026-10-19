/*
path :           app/blog/lib/actions/result.ts
tag :            ["blog", "actions", "result", "discriminated", "generic"]
projectId:       new-genesis
type:            action
generic:         true

role:            Type discriminé ActionResult<T> partagé par TOUTES les
                 Server Actions du module Blog, plus un helper
                 handleActionError(error) qui convertit une exception en
                 { ok: false, error } avec un message lisible. Factorisé
                 ici pour éviter la duplication constatée dans les
                 actions Scrum (chaque fichier redéfinissait ActionResult
                 et le try/catch).

flow:            Module TypeScript pur → export du type ActionResult<T>
                 et de la fonction handleActionError(error) qui renvoie
                 { ok: false, error: message }.

ecosystem:       BlogActions = [
                   "@/app/blog/lib/actions/article.ts",
                   "@/app/blog/lib/actions/comment.ts",
                   "@/app/blog/lib/actions/discussion.ts",
                   "@/app/blog/lib/actions/favorite.ts",
                   "@/app/blog/lib/actions/group.ts",
                   "@/app/blog/lib/actions/like.ts",
                   "@/app/blog/lib/actions/notification.ts",
                   "@/app/blog/lib/actions/result.ts",
                   "@/app/blog/lib/actions/taxonomy.ts",
                 ]

relatedFiles:    []
imports:         []
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

/**
 * Résultat discriminé d'une Server Action.
 * - `{ ok: true, data }` : succès, payload typé
 * - `{ ok: false, error }` : échec, message lisible
 */
export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

/**
 * Convertit une exception inconnue en `{ ok: false, error }`.
 * Utilisé dans les blocs `catch` de toutes les Server Actions Blog.
 */
export function handleActionError(error: unknown): {
  readonly ok: false;
  readonly error: string;
} {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Erreur inconnue.",
  };
}
/*
path :           app/blog/lib/actions/article-form.ts
tag :            ["blog", "action", "article", "form", "server-action", "void"]
projectId:       new-genesis
type :           action
generic:         false

role:            Server Actions dédiées à l'usage <form action={...}>.
                 React exige que la fonction passée à `action` retourne
                 `void` (ou `Promise<void>`). Les actions métier
                 (publishArticleAction, archiveArticleAction,
                 deleteArticleAction) retournent un ActionResult — donc
                 elles ne peuvent pas être passées directement à
                 `action={}`. Ces wrappers appellent l'action métier,
                 avalent le ActionResult, et retournent void. Aucune
                 logique métier ici : juste la frontière de typage.

flow:            publishArticleFormAction(articleId) →
                 publishArticleAction(articleId) → void (ignorer le
                 résultat).
                 archiveArticleFormAction(articleId) →
                 archiveArticleAction(articleId) → void.
                 deleteArticleFormAction(articleId) →
                 deleteArticleAction(articleId) → void.

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

relatedFiles:    ["@/app/blog/lib/actions/article.ts",
                  "@/app/blog/admin/articles/ArticleRow.tsx"]

imports:         ["@/app/blog/lib/actions/article"]

exports:         ["publishArticleFormAction",
                  "archiveArticleFormAction",
                  "deleteArticleFormAction"]

useBy:           ["@/app/blog/admin/articles/ArticleRow.tsx"]

userStories:     ["us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
} from "@/app/blog/lib/actions/article";

/* Wrappers compatibles <form action={}>. */
export async function publishArticleFormAction(articleId: string): Promise<void> {
  const result = await publishArticleAction(articleId);
  if (!result.ok) throw new Error(result.error);
}

export async function archiveArticleFormAction(articleId: string): Promise<void> {
  const result = await archiveArticleAction(articleId);
  if (!result.ok) throw new Error(result.error);
}

export async function deleteArticleFormAction(articleId: string): Promise<void> {
  const result = await deleteArticleAction(articleId);
  if (!result.ok) throw new Error(result.error);
}
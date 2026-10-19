/*
path :           app/blog/lib/actions/article.ts
tag :            ["blog", "action", "article", "server-action", "crud", "editorial"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions du CRUD article. 5 actions :
                 createArticleAction, updateArticleAction,
                 publishArticleAction, archiveArticleAction,
                 deleteArticleAction. Chaque action parse un FormData,
                 valide via articleInputSchema, dérive authorId côté
                 serveur (jamais via un paramètre client) via
                 requireBlogSession(), délègue au service, revalidatePath,
                 retourne ActionResult<Article>. Les blocs de contenu
                 sont désérialisés depuis un champ FormData JSON
                 ("content") déjà structuré par l'éditeur (id, parentId,
                 order, type, payload). Utilise handleActionError pour
                 le catch.

flow:            createArticleAction(formData) → requireBlogSession() →
                 parse → articleInputSchema.parse → createArticle(userId,
                 input) → revalidatePath("/blog/admin/articles") +
                 revalidatePath(`/blog/${article.slug}`) → { ok, data }.
                 updateArticleAction(articleId, formData) → require → parse
                 → updateArticle.
                 publishArticleAction(articleId) → require → publishArticle.
                 archiveArticleAction(articleId) → require → archiveArticle.
                 deleteArticleAction(articleId) → require → deleteArticle.

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

relatedFiles:    ["@/app/blog/lib/actions/result.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/validations.ts"]
imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/validations"]
exports:         ["createArticleAction", "updateArticleAction",
                  "publishArticleAction", "archiveArticleAction",
                  "deleteArticleAction"]
useBy:           ["@/app/blog/components/admin/ArticleForm.tsx",
                  "@/app/blog/articles/page.tsx",
                  "@/app/blog/articles/new/page.tsx",
                  "@/app/blog/articles/[id]/edit/page.tsx"]

userStories:     ["us1100005", "us1100006"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import { revalidatePath } from "next/cache";

import {
  handleActionError,
  type ActionResult,
} from "@/app/blog/lib/actions/result";
import { requireBlogSession } from "@/app/blog/lib/session";
import {
  archiveArticle,
  createArticle,
  deleteArticle,
  publishArticle,
  updateArticle,
} from "@/app/blog/lib/services/article";
import type { Article } from "@/app/blog/lib/types";
import { articleInputSchema } from "@/app/blog/lib/validations";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function revalidateArticle(slug?: string): void {
  revalidatePath("/blog/articles");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
}

function parseArticleForm(formData: FormData) {
  const rawContent = String(formData.get("content") ?? "[]");
  let parsedContent: unknown = [];
  try {
    parsedContent = JSON.parse(rawContent);
  } catch {
    throw new Error("Le contenu JSON des blocs est invalide.");
  }
  return {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    coverImage: String(formData.get("coverImage") ?? "").trim() || undefined,
    themeId: String(formData.get("themeId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "").trim() || undefined,
    subCategoryId:
      String(formData.get("subCategoryId") ?? "").trim() || undefined,
    tagIds: formData.getAll("tagIds").map(String),
    status: String(formData.get("status") ?? "draft"),
    visibility: String(formData.get("visibility") ?? "public"),
    featured: formData.get("featured") === "on",
    content: parsedContent,
  };
}

/* ------------------------------------------------------------------ */
/*  Création                                                          */
/* ------------------------------------------------------------------ */

export async function createArticleAction(
  formData: FormData,
): Promise<ActionResult<Article>> {
  try {
    const session = await requireBlogSession();
    const raw = parseArticleForm(formData);
    const input = articleInputSchema.parse(raw);
    const article = await createArticle(session.user.id, input);
    revalidateArticle(article.slug);
    return { ok: true, data: article };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Mise à jour                                                       */
/* ------------------------------------------------------------------ */

export async function updateArticleAction(
  articleId: string,
  formData: FormData,
): Promise<ActionResult<Article>> {
  try {
    await requireBlogSession();
    const raw = parseArticleForm(formData);
    const input = articleInputSchema.parse(raw);
    const article = await updateArticle(articleId, input);
    revalidateArticle(article.slug);
    return { ok: true, data: article };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Cycle de vie                                                      */
/* ------------------------------------------------------------------ */

export async function publishArticleAction(
  articleId: string,
): Promise<ActionResult<Article>> {
  try {
    await requireBlogSession();
    const article = await publishArticle(articleId);
    revalidateArticle(article.slug);
    return { ok: true, data: article };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveArticleAction(
  articleId: string,
): Promise<ActionResult<Article>> {
  try {
    await requireBlogSession();
    const article = await archiveArticle(articleId);
    revalidateArticle(article.slug);
    return { ok: true, data: article };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteArticleAction(
  articleId: string,
): Promise<ActionResult<null>> {
  try {
    await requireBlogSession();
    await deleteArticle(articleId);
    revalidateArticle();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
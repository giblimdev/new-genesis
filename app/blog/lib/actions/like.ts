/*
path :           app/blog/lib/actions/like.ts
tag :            ["blog", "action", "like", "server-action", "toggle"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des likes. toggleArticleLikeAction(articleId)
                 et toggleCommentLikeAction(articleId, commentId). Dérive
                 userId de requireBlogSession() (jamais client). Revalide
                 la page article concernée. Retourne ActionResult<{liked,
                 count}>.

flow:            toggleArticleLikeAction(articleId) → requireBlogSession()
                 → toggleLikeOnArticle(articleId, session.user.id) →
                 revalidatePath(`/blog/${slug}`) si slug connue, sinon
                 revalidatePath("/blog") → { ok, data }.
                 toggleCommentLikeAction(articleId, commentId) → require →
                 toggleLikeOnComment(...) → revalidate article.

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
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/comment.ts",
                  "@/app/blog/lib/services/like.ts",
                  "@/app/blog/lib/session.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/comment",
                  "@/app/blog/lib/services/like"]

exports:         ["toggleArticleLikeAction", "toggleCommentLikeAction"]

useBy:           ["@/app/blog/components/LikeButton.tsx"]

userStories:     ["us2100003", "us2100004"]
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
import { getArticleById } from "@/app/blog/lib/services/article";
import { toggleLikeOnComment } from "@/app/blog/lib/services/comment";
import {
  toggleLikeOnArticle,
  type ToggleArticleLikeResult,
} from "@/app/blog/lib/services/like";

function revalidateArticlePath(slug: string | undefined): void {
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
}

export async function toggleArticleLikeAction(
  articleId: string,
): Promise<ActionResult<ToggleArticleLikeResult>> {
  try {
    const session = await requireBlogSession();
    const result = await toggleLikeOnArticle(articleId, session.user.id);
    const article = await getArticleById(articleId);
    revalidateArticlePath(article?.slug);
    return { ok: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleCommentLikeAction(
  articleId: string,
  commentId: string,
): Promise<ActionResult<ToggleArticleLikeResult>> {
  try {
    const session = await requireBlogSession();
    const result = await toggleLikeOnComment(
      articleId,
      commentId,
      session.user.id,
    );
    const article = await getArticleById(articleId);
    revalidateArticlePath(article?.slug);
    return { ok: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
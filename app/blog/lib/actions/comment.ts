/*
path :           app/blog/lib/actions/comment.ts
tag :            ["blog", "action", "comment", "server-action", "moderation"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des commentaires. createCommentAction
                 (articleId, parentId, content) : require session,
                 crée le commentaire, notifie l'auteur du parent (si
                 parent ≠ article), revalide l'article.
                 softDeleteCommentAction(articleId, commentId) :
                 require session + auteur du commentaire ou admin.
                 Refuse si l'utilisateur n'est ni auteur ni admin.

flow:            createCommentAction → requireBlogSession() → parse →
                 createComment(articleId, session.user.id, { parentId,
                 content }) → si parent ≠ article → récupère l'auteur
                 du parent → pushNotification(authorId, { type: "reply",
                 actorId: session.user.id, ... }) → revalidatePath
                 article → { ok, data: comment }.
                 softDeleteCommentAction → require → getArticleById →
                 find comment → autorisation → softDeleteComment →
                 revalidate.

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
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/comment",
                  "@/app/blog/lib/services/notification",
                  "@/app/blog/lib/types"]

exports:         ["createCommentAction", "softDeleteCommentAction"]

useBy:           ["@/app/blog/components/CommentForm.tsx",
                  "@/app/blog/components/CommentTree.tsx"]

userStories:     ["us2100001", "us2100002"]
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
import { isAdmin } from "@/app/blog/lib/admin";
import { requireBlogSession } from "@/app/blog/lib/session";
import { getArticleById } from "@/app/blog/lib/services/article";
import {
  createComment,
  softDeleteComment,
} from "@/app/blog/lib/services/comment";
import { pushNotification } from "@/app/blog/lib/services/notification";
import type { Comment } from "@/app/blog/lib/types";

function revalidateArticle(slug: string): void {
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
}

export async function createCommentAction(
  articleId: string,
  parentId: string,
  content: string,
): Promise<ActionResult<Comment>> {
  try {
    const session = await requireBlogSession();
    const article = await getArticleById(articleId);
    if (!article) throw new Error("Article introuvable.");

    const comment = await createComment(articleId, session.user.id, {
      articleId,
      parentId,
      content,
    });

    /* Notification à l'auteur du commentaire parent (si différent) */
    if (parentId !== articleId) {
      const parent = article.comments.find((c) => c.id === parentId);
      if (parent && parent.authorId !== session.user.id) {
        await pushNotification(parent.authorId, {
          type: "reply",
          actorId: session.user.id,
          targetType: "comment",
          targetId: comment.id,
          excerpt: content.slice(0, 120),
        });
      }
    }

    revalidateArticle(article.slug);
    return { ok: true, data: comment };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function softDeleteCommentAction(
  articleId: string,
  commentId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    const article = await getArticleById(articleId);
    if (!article) throw new Error("Article introuvable.");
    const comment = article.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Commentaire introuvable.");

    const admin = await isAdmin();
    if (comment.authorId !== session.user.id && !admin) {
      return { ok: false, error: "Action non autorisée." };
    }

    await softDeleteComment(articleId, commentId);
    revalidateArticle(article.slug);
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
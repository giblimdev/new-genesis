/*
path :           app/blog/lib/actions/favorite.ts
tag :            ["blog", "action", "favorite", "folder", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des favoris. toggleFavoriteAction(articleId),
                 moveFavoriteAction(articleId, folderId | null),
                 createFolderAction(name), renameFolderAction(folderId, name),
                 deleteFolderAction(folderId). Chaque action dérive userId
                 de requireBlogSession(). Revalide /blog/user/favorites et
                 l'article concerné si pertinent.

flow:            toggleFavoriteAction → require → toggleFavorite(userId,
                 articleId) → revalidate → { ok, data: { favorited, count } }.
                 moveFavoriteAction → require → moveFavoriteToFolder →
                 revalidate → { ok, data: null }.
                 createFolderAction(name) → require → createFolder → { ok, data }.
                 renameFolderAction → require → renameFolder → revalidate.
                 deleteFolderAction → require → deleteFolder → revalidate.

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
                  "@/app/blog/lib/services/favorite.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/favorite",
                  "@/app/blog/lib/types"]

exports:         ["toggleFavoriteAction", "moveFavoriteAction",
                  "createFolderAction", "renameFolderAction",
                  "deleteFolderAction"]

useBy:           ["@/app/blog/components/FavoriteButton.tsx",
                  "@/app/blog/user/favorites/page.tsx"]

userStories:     ["us2100005", "us2100006"]
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
  createFolder,
  deleteFolder,
  moveFavoriteToFolder,
  renameFolder,
  toggleFavorite,
} from "@/app/blog/lib/services/favorite";
import type { FavoriteFolder } from "@/app/blog/lib/types";

function revalidateFavorites(): void {
  revalidatePath("/blog/user/favorites");
}

export interface ToggleFavoriteActionResult {
  readonly favorited: boolean;
  readonly count: number;
}

export async function toggleFavoriteAction(
  articleId: string,
): Promise<ActionResult<ToggleFavoriteActionResult>> {
  try {
    const session = await requireBlogSession();
    const result = await toggleFavorite(session.user.id, articleId);
    revalidateFavorites();
    return { ok: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function moveFavoriteAction(
  articleId: string,
  folderId: string | null,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await moveFavoriteToFolder(session.user.id, articleId, folderId);
    revalidateFavorites();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createFolderAction(
  name: string,
): Promise<ActionResult<FavoriteFolder>> {
  try {
    const session = await requireBlogSession();
    const folder = await createFolder(session.user.id, name);
    revalidateFavorites();
    return { ok: true, data: folder };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function renameFolderAction(
  folderId: string,
  name: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await renameFolder(session.user.id, folderId, name);
    revalidateFavorites();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteFolderAction(
  folderId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await deleteFolder(session.user.id, folderId);
    revalidateFavorites();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
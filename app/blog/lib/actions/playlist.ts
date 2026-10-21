/*
path :           app/blog/lib/actions/playlist.ts
tag :            ["blog", "action", "playlist", "server-action", "crud"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des playlists. Autorisation : admin OU
                 author (rôle Prisma) — cohérent avec le CTA « Nouvel
                 article » de /blog/page.tsx. Un user standard ne peut
                 PAS créer, éditer ou supprimer une playlist. L'action
                 assignArticleToPlaylistAction est autorisée si l'utilisateur
                 est admin OU auteur de l'article (il peut donc rattacher
                 son propre article à une playlist, mais pas un article
                 d'autrui).

                 8 actions exposées :
                 - createPlaylistAction(formData)
                 - updatePlaylistAction(playlistId, formData)
                 - deletePlaylistAction(playlistId)
                 - reorderPlaylistsAction(orderedIds)
                 - addArticleToPlaylistAction(playlistId, articleId)
                 - removeArticleFromPlaylistAction(playlistId, articleId)
                 - reorderArticlesInPlaylistAction(playlistId, orderedIds)
                 - assignArticleToPlaylistAction(articleId, playlistId | null)

                 Chaque action utilise requireBlogSession() pour
                 l'authentification et handleActionError pour le catch.
                 canManagePlaylists(userId) est un helper interne qui
                 vérifie admin OU author sans refaire requireBlogSession.

flow:            createPlaylistAction → require → canManage(userId) →
                 parse → playlistInputSchema.parse → createPlaylist →
                 revalidate → ActionResult<Playlist>.
                 updatePlaylistAction → require → canManage → parse →
                 updatePlaylist → revalidate → ActionResult<Playlist>.
                 deletePlaylistAction → require → canManage → delete →
                 revalidate → ActionResult<null>.
                 reorderPlaylistsAction → require → canManage → reorder →
                 revalidate → ActionResult<readonly Playlist[]>.
                 addArticleToPlaylistAction → require → canManage → add →
                 revalidate → ActionResult<Playlist>.
                 removeArticleFromPlaylistAction → require → canManage →
                 remove → revalidate → ActionResult<Playlist>.
                 reorderArticlesInPlaylistAction → require → canManage →
                 reorder → revalidate → ActionResult<Playlist>.
                 assignArticleToPlaylistAction → require → fetch article
                 → auth (admin OU auteur) → playlistId null ? retirer de
                 toutes : add → revalidate → ActionResult<null>.

ecosystem:       BlogActions = [
                   "@/app/blog/lib/actions/article.ts",
                   "@/app/blog/lib/actions/article-form.ts",
                   "@/app/blog/lib/actions/comment.ts",
                   "@/app/blog/lib/actions/discussion.ts",
                   "@/app/blog/lib/actions/favorite.ts",
                   "@/app/blog/lib/actions/group.ts",
                   "@/app/blog/lib/actions/like.ts",
                   "@/app/blog/lib/actions/notification.ts",
                   "@/app/blog/lib/actions/playlist.ts",
                   "@/app/blog/lib/actions/result.ts",
                   "@/app/blog/lib/actions/taxonomy.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/result.ts",
                  "@/app/blog/lib/services/playlist.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/session.ts",
                  "@/lib/prisma.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/playlist",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/validations",
                  "@/lib/prisma"]

exports:         ["createPlaylistAction", "updatePlaylistAction",
                  "deletePlaylistAction", "reorderPlaylistsAction",
                  "addArticleToPlaylistAction", "removeArticleFromPlaylistAction",
                  "reorderArticlesInPlaylistAction", "assignArticleToPlaylistAction"]

useBy:           ["@/app/blog/components/PlaylistForm.tsx",
                  "@/app/blog/components/PlaylistManager.tsx",
                  "@/app/blog/components/ArticleForm.tsx"]

userStories:     ["*en tant qu'auteur je veux regrouper mes articles en playlists"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
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
  addArticleToPlaylist,
  createPlaylist,
  deletePlaylist,
  listPlaylists,
  removeArticleFromPlaylist,
  reorderArticlesInPlaylist,
  reorderPlaylists,
  updatePlaylist,
} from "@/app/blog/lib/services/playlist";
import type { Playlist } from "@/app/blog/lib/types";
import { playlistInputSchema } from "@/app/blog/lib/validations";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Autorisation                                                      */
/* ------------------------------------------------------------------ */

/**
 * Admin OU author (rôle Prisma). Reçoit userId en paramètre pour éviter
 * de refaire requireBlogSession (déjà fait par l'appelant).
 */
async function canManagePlaylists(userId: string): Promise<boolean> {
  if (await isAdmin()) return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, deletedAt: true },
  });
  return Boolean(user && user.deletedAt === null && user.role === "author");
}

/* ------------------------------------------------------------------ */
/*  Revalidation                                                      */
/* ------------------------------------------------------------------ */

function revalidatePlaylist(slug?: string): void {
  revalidatePath("/blog");
  revalidatePath("/blog/playlists");
  revalidatePath("/blog/taxonomy");
  if (slug) revalidatePath(`/blog/playlist/${slug}`);
}

/* ------------------------------------------------------------------ */
/*  Parse FormData                                                    */
/* ------------------------------------------------------------------ */

function parsePlaylistForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description:
      String(formData.get("description") ?? "").trim() || undefined,
    coverImage:
      String(formData.get("coverImage") ?? "").trim() || undefined,
    visibility: String(formData.get("visibility") ?? "public"),
  };
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                              */
/* ------------------------------------------------------------------ */

export async function createPlaylistAction(
  formData: FormData,
): Promise<ActionResult<Playlist>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const raw = parsePlaylistForm(formData);
    const input = playlistInputSchema.parse(raw);
    const playlist = await createPlaylist(input);
    revalidatePlaylist(playlist.slug);
    return { ok: true, data: playlist };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePlaylistAction(
  playlistId: string,
  formData: FormData,
): Promise<ActionResult<Playlist>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const raw = parsePlaylistForm(formData);
    const input = playlistInputSchema.parse(raw);
    const playlist = await updatePlaylist(playlistId, input);
    revalidatePlaylist(playlist.slug);
    return { ok: true, data: playlist };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePlaylistAction(
  playlistId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    await deletePlaylist(playlistId);
    revalidatePlaylist();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderPlaylistsAction(
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Playlist[]>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const playlists = await reorderPlaylists(orderedIds);
    revalidatePlaylist();
    return { ok: true, data: playlists };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Gestion des articles                                              */
/* ------------------------------------------------------------------ */

export async function addArticleToPlaylistAction(
  playlistId: string,
  articleId: string,
): Promise<ActionResult<Playlist>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const playlist = await addArticleToPlaylist(playlistId, articleId);
    revalidatePlaylist(playlist.slug);
    return { ok: true, data: playlist };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeArticleFromPlaylistAction(
  playlistId: string,
  articleId: string,
): Promise<ActionResult<Playlist>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const playlist = await removeArticleFromPlaylist(playlistId, articleId);
    revalidatePlaylist(playlist.slug);
    return { ok: true, data: playlist };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderArticlesInPlaylistAction(
  playlistId: string,
  orderedIds: readonly string[],
): Promise<ActionResult<Playlist>> {
  try {
    const session = await requireBlogSession();
    if (!(await canManagePlaylists(session.user.id))) {
      return { ok: false, error: "Rôle administrateur ou auteur requis." };
    }
    const playlist = await reorderArticlesInPlaylist(playlistId, orderedIds);
    revalidatePlaylist(playlist.slug);
    return { ok: true, data: playlist };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Assignation d'un article à UNE playlist (ou retrait si null).
 * Autorisation : admin OU auteur de l'article. Si playlistId === null,
 * retire l'article de toutes les playlists (une seule possible).
 */
export async function assignArticleToPlaylistAction(
  articleId: string,
  playlistId: string | null,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    const article = await getArticleById(articleId);
    if (!article) {
      return { ok: false, error: "Article introuvable." };
    }
    const admin = await isAdmin();
    if (article.authorId !== session.user.id && !admin) {
      return { ok: false, error: "Action non autorisée." };
    }

    if (playlistId === null) {
      const playlists = await listPlaylists();
      for (const p of playlists) {
        if (p.articleIds.includes(articleId)) {
          await removeArticleFromPlaylist(p.id, articleId);
        }
      }
    } else {
      const playlist = await addArticleToPlaylist(playlistId, articleId);
      revalidatePlaylist(playlist.slug);
    }

    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/blog");
    revalidatePath("/blog/playlists");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
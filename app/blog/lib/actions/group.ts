/*
path :           app/blog/lib/actions/group.ts
tag :            ["blog", "action", "group", "discussion", "post", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des groupes / discussions / posts.
                 createGroupAction, joinGroupAction, approveMemberAction,
                 rejectMemberAction, leaveGroupAction, banMemberAction,
                 createDiscussionAction, createPostAction,
                 softDeletePostAction, togglePostLikeAction. Chaque action
                 dérive l'utilisateur de requireBlogSession() et revalide
                 les routes concernées (/blog/community/...).

flow:            createGroupAction(formData) → require → parse →
                 createGroup(userId, input) → revalidate → { ok, data }.
                 joinGroupAction(groupId) → require → joinGroup → si
                 visibilité private, l'owner reçoit une notification
                 group_invite → revalidate.
                 approveMemberAction(groupId, userId) → require →
                 approveMember → notifie le demandeur
                 (group_join_approved) → revalidate.
                 rejectMemberAction → require → rejectMember → revalidate.
                 leaveGroupAction → require → leaveGroup → revalidate.
                 banMemberAction → require → banMember → revalidate.
                 createDiscussionAction(groupId, formData) → require →
                 createDiscussion → notifie tous les membres actifs
                 (group_new_discussion, plafond 200, dédup) → revalidate.
                 createPostAction(groupId, discussionId, parentId, content)
                 → require → createPost → si parent ≠ discussion :
                 notifie l'auteur du post parent → revalidate.
                 softDeletePostAction(groupId, discussionId, postId) →
                 require → softDeletePost → revalidate.
                 togglePostLikeAction(groupId, discussionId, postId) →
                 require → toggleLikeOnPost → revalidate.

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
                  "@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/group",
                  "@/app/blog/lib/services/notification",
                  "@/app/blog/lib/types"]

exports:         ["createGroupAction", "joinGroupAction",
                  "approveMemberAction", "rejectMemberAction",
                  "leaveGroupAction", "banMemberAction",
                  "createDiscussionAction", "createPostAction",
                  "softDeletePostAction", "togglePostLikeAction"]

useBy:           ["@/app/blog/community/page.tsx",
                  "@/app/blog/community/[groupSlug]/page.tsx",
                  "@/app/blog/community/[groupSlug]/[discussionId]/page.tsx",
                  "@/app/blog/community/[groupSlug]/requests/page.tsx",
                  "@/app/blog/community/new/page.tsx"]

userStories:     ["us3100001", "us3100002", "us3100003", "us3100004",
                  "us3100005"]
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
  approveMember,
  banMember,
  createDiscussion,
  createGroup,
  createPost,
  joinGroup,
  leaveGroup,
  rejectMember,
  softDeletePost,
  toggleLikeOnPost,
  type TogglePostLikeResult,
} from "@/app/blog/lib/services/group";
import { pushNotification } from "@/app/blog/lib/services/notification";
import type {
  Discussion,
  Group,
  Post,
  Visibility,
} from "@/app/blog/lib/types";

function revalidateCommunity(slug?: string, discussionId?: string): void {
  revalidatePath("/blog/community");
  if (slug) {
    revalidatePath(`/blog/community/${slug}`);
    if (discussionId) {
      revalidatePath(`/blog/community/${slug}/${discussionId}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Groupe                                                             */
/* ------------------------------------------------------------------ */

export async function createGroupAction(
  formData: FormData,
): Promise<ActionResult<Group>> {
  try {
    const session = await requireBlogSession();
    const name = String(formData.get("name") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || undefined;
    const coverImage =
      String(formData.get("coverImage") ?? "").trim() || undefined;
    const visibility = String(formData.get("visibility") ?? "public") as Visibility;
    if (!name) return { ok: false, error: "Nom requis." };
    const group = await createGroup(session.user.id, {
      name,
      description,
      coverImage,
      visibility,
    });
    revalidateCommunity(group.slug);
    return { ok: true, data: group };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function joinGroupAction(
  groupId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await joinGroup(groupId, session.user.id);
    revalidateCommunity();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveMemberAction(
  groupId: string,
  userId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await approveMember(groupId, session.user.id, userId);
    await pushNotification(userId, {
      type: "group_join_approved",
      actorId: session.user.id,
      targetType: "group",
      targetId: groupId,
      excerpt: "Votre demande d'adhésion a été approuvée.",
    });
    revalidateCommunity();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectMemberAction(
  groupId: string,
  userId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await rejectMember(groupId, session.user.id, userId);
    revalidateCommunity();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function leaveGroupAction(
  groupId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await leaveGroup(groupId, session.user.id);
    revalidateCommunity();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function banMemberAction(
  groupId: string,
  userId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await banMember(groupId, session.user.id, userId);
    revalidateCommunity();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Discussions                                                        */
/* ------------------------------------------------------------------ */

export async function createDiscussionAction(
  groupId: string,
  formData: FormData,
): Promise<ActionResult<Discussion>> {
  try {
    const session = await requireBlogSession();
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    if (!title || !content) {
      return { ok: false, error: "Titre et contenu requis." };
    }
    const discussion = await createDiscussion(groupId, session.user.id, {
      title,
      content,
    });
    revalidateCommunity();
    return { ok: true, data: discussion };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Posts                                                              */
/* ------------------------------------------------------------------ */

export async function createPostAction(
  groupId: string,
  discussionId: string,
  parentId: string,
  content: string,
): Promise<ActionResult<Post>> {
  try {
    const session = await requireBlogSession();
    const post = await createPost(groupId, discussionId, session.user.id, {
      parentId,
      content,
    });
    revalidateCommunity(undefined, discussionId);
    return { ok: true, data: post };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function softDeletePostAction(
  groupId: string,
  discussionId: string,
  postId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await softDeletePost(groupId, discussionId, postId, session.user.id);
    revalidateCommunity(undefined, discussionId);
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function togglePostLikeAction(
  groupId: string,
  discussionId: string,
  postId: string,
): Promise<ActionResult<TogglePostLikeResult>> {
  try {
    const session = await requireBlogSession();
    const result = await toggleLikeOnPost(
      groupId,
      discussionId,
      postId,
      session.user.id,
    );
    revalidateCommunity(undefined, discussionId);
    return { ok: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
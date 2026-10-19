/*
path :           app/blog/lib/actions/notification.ts
tag :            ["blog", "action", "notification", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions des notifications in-app. listNotifications
                 est une lecture async côté serveur (mais exposée en
                 action pour usages client ponctuels — non recommandé).
                 markAsReadAction, markAllAsReadAction, deleteNotification
                 Action. Toujours sur userContent[moi] uniquement.

flow:            markAsReadAction(notificationId) → requireBlogSession()
                 → markAsRead(userId, id) → revalidate /blog/notifications
                 → { ok, data: null }.
                 markAllAsReadAction → idem.
                 deleteNotificationAction → idem.

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
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/session.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/services/notification"]

exports:         ["markAsReadAction", "markAllAsReadAction",
                  "deleteNotificationAction"]

useBy:           ["@/app/blog/components/NotificationList.tsx"]

userStories:     ["us5100003"]
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
  deleteNotification,
  markAllAsRead,
  markAsRead,
} from "@/app/blog/lib/services/notification";

function revalidateNotifications(): void {
  revalidatePath("/blog/notifications");
}

export async function markAsReadAction(
  notificationId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await markAsRead(session.user.id, notificationId);
    revalidateNotifications();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markAllAsReadAction(): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await markAllAsRead(session.user.id);
    revalidateNotifications();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireBlogSession();
    await deleteNotification(session.user.id, notificationId);
    revalidateNotifications();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
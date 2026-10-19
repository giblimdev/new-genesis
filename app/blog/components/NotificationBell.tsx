/*
path :           app/blog/components/NotificationBell.tsx
tag :            ["blog", "component", "notification", "bell", "server"]
projectId:       new-genesis
type :           component
generic:         false

role:            Cloche de notifications affichant le nombre non-lu.
                 Server Component (lecture countUnread côté serveur),
                 rendu sous Suspense par le parent. Lien vers
                 /blog/notifications.

flow:            NotificationBell async → getBlogSession → si null :
                 null → countUnread(userId) → rend <Link> avec badge.

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/session.ts"]

imports:         ["next/link", "lucide-react",
                  "@/app/blog/lib/services/notification",
                  "@/app/blog/lib/session"]

exports:         ["NotificationBell"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["us5100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import { Bell } from "lucide-react";

import { countUnread } from "@/app/blog/lib/services/notification";
import { getBlogSession } from "@/app/blog/lib/session";

export async function NotificationBell() {
  const session = await getBlogSession();
  if (!session?.user) return null;
  const unread = await countUnread(session.user.id);

  return (
    <Link
      href="/blog/notifications"
      aria-label={
        unread > 0
          ? `Notifications (${unread} non lues)`
          : "Notifications"
      }
      className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bell className="size-4" aria-hidden />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-chart-1 px-1 text-[10px] font-bold text-white shadow">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
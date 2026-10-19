/*
path :           app/blog/notifications/page.tsx
tag :            ["blog", "page", "notifications", "protected"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page des notifications in-app. Sync page + Suspense ;
                 require session, lit listNotifications via le service
                 et rend NotificationList (Client) qui gère marquage
                 lu / suppression via les Server Actions existantes.

flow:            NotificationsPage → Suspense → NotificationsSection
                 async → getBlogSession → si null : message login →
                 listNotifications(userId) → <NotificationList items />.

ecosystem:       Blog = [
                   ... (identique à [slug]/page.tsx)
                 ]

relatedFiles:    ["@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/NotificationList.tsx"]

imports:         ["react", "next/link", "lucide-react",
                  "@/app/blog/lib/services/notification",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/NotificationList",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogNotificationsPage"]

useBy:           []

userStories:     ["us5100003"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";

import { listNotifications } from "@/app/blog/lib/services/notification";
import { getBlogSession } from "@/app/blog/lib/session";
import { NotificationList } from "@/app/blog/components/NotificationList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogNotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
          Mon compte
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Bell className="size-5 text-chart-1" aria-hidden />
          Notifications
        </h1>
      </header>
      <Suspense fallback={<NotifSkeleton />}>
        <NotificationsSection />
      </Suspense>
    </div>
  );
}

async function NotificationsSection() {
  const session = await getBlogSession();
  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour voir vos notifications.
        </p>
        <Button
          render={<Link href="/core/auth/login" />}
          className="mt-4 gap-2"
        >
          Se connecter
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  const items = await listNotifications(session.user.id);
  return <NotificationList items={items} />;
}

function NotifSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}
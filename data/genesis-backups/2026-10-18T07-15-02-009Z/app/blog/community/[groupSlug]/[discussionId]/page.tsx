/*
path :           app/blog/community/[groupSlug]/[discussionId]/page.tsx
tag :            ["blog", "page", "community", "discussion", "detail"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'une discussion de groupe. Sync page + Suspense.
                 Affiche le post racine (discussion.content) + les
                 réponses via DiscussionThread (buildTree sur
                 discussion.posts). Formulaire de réponse + bouton
                 Répondre par post. 404 si groupe/discussion absents
                 ou si groupe private et visiteur non-membre.

flow:            DiscussionPage → Suspense → DiscussionSection →
                 await → getGroupBySlug → find discussion → getSession →
                 vérifie visibilité → rend header + DiscussionThread
                 + NewPostForm si membre actif.

ecosystem:       Blog = [
                   ... (identique à [slug]/page.tsx)
                 ]

relatedFiles:    ["@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/DiscussionThread.tsx",
                  "@/app/blog/components/NewPostForm.tsx"]

imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/blog/lib/services/group",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/DiscussionThread",
                  "@/app/blog/components/NewPostForm",
                  "@/components/ui/skeleton"]

exports:         ["default BlogDiscussionPage"]

useBy:           []

userStories:     ["us3100003", "us3100004"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getGroupBySlug } from "@/app/blog/lib/services/group";
import { getBlogSession } from "@/app/blog/lib/session";
import { DiscussionThread } from "@/app/blog/components/DiscussionThread";
import { NewPostForm } from "@/app/blog/components/NewPostForm";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ groupSlug: string; discussionId: string }>;

export default function BlogDiscussionPage({
  params,
}: {
  params: PageParams;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <Suspense fallback={<DiscSkeleton />}>
        <DiscussionSection params={params} />
      </Suspense>
    </div>
  );
}

async function DiscussionSection({ params }: { readonly params: PageParams }) {
  const { groupSlug, discussionId } = await params;
  const group = await getGroupBySlug(groupSlug);
  if (!group) notFound();

  const discussion = group.discussions.find((d) => d.id === discussionId);
  if (!discussion) notFound();

  const session = await getBlogSession();
  const viewerId = session?.user?.id ?? null;
  const member = viewerId
    ? group.members.find(
        (m) => m.userId === viewerId && m.status === "active",
      )
    : undefined;
  const isOwnerOrMod =
    member?.role === "owner" || member?.role === "moderator";

  if (group.visibility === "private" && !member) notFound();

  return (
    <article className="space-y-8">
      <header className="space-y-2 rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-2">
          {group.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {discussion.title}
        </h1>
        <p className="whitespace-pre-wrap text-sm text-foreground/90">
          {discussion.content}
        </p>
        <p className="text-xs text-muted-foreground">
          par {discussion.authorId.slice(0, 8)} ·{" "}
          {new Date(discussion.createdAt).toLocaleString("fr-FR")}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Réponses ({discussion.posts.filter((p) => !p.deletedAt).length})
        </h2>
        <DiscussionThread
          groupId={group.id}
          discussionId={discussion.id}
          posts={discussion.posts}
          isAuthenticated={Boolean(viewerId)}
          isOwnerOrMod={isOwnerOrMod}
          currentUserId={viewerId}
        />
        {member && (
          <div className="pt-4">
            <NewPostForm
              groupId={group.id}
              discussionId={discussion.id}
              parentId={discussion.id}
            />
          </div>
        )}
      </section>
    </article>
  );
}

function DiscSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
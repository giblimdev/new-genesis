/*
path :           app/blog/community/[groupSlug]/[discussionId]/page.tsx
tag :            ["blog", "page", "community", "discussion", "detail", "avatar"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'une discussion de groupe. Sync page + Suspense.
                 Affiche le post racine (discussion.content) + les
                 réponses via DiscussionThread (buildTree sur
                 discussion.posts). Formulaire de réponse + bouton
                 Répondre par post. 404 si groupe/discussion absents
                 ou si groupe private et visiteur non-membre.
                 Résout les profils auteurs (discussion.authorId +
                 tous les posts.authorId) via resolveAuthorProfiles
                 pour afficher nom + avatar réels.
                 ⚠️ `await io()` avant getBlogSession() (NowGenerator
                 Prisma 7 synchrone bloquant).

flow:            DiscussionPage → Suspense → DiscussionSection →
                 await io() → await params → getGroupBySlug →
                 find discussion → getBlogSession → vérifie visibilité
                 → resolveAuthorProfiles([discussion.authorId, ...posts.
                 authorId]) → rend header (avatar + nom de
                 discussion.authorId) + DiscussionThread
                 (authorProfiles) + NewPostForm si membre actif.

ecosystem:       Blog = [
                   "@/app/blog/[slug]/page.tsx",
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/articles/[id]/edit/page.tsx",
                   "@/app/blog/articles/ArticleRow.tsx",
                   "@/app/blog/articles/new/page.tsx",
                   "@/app/blog/articles/page.tsx",
                   "@/app/blog/community/[groupSlug]/[discussionId]/page.tsx",
                   "@/app/blog/community/[groupSlug]/page.tsx",
                   "@/app/blog/community/[groupSlug]/requests/page.tsx",
                   "@/app/blog/community/new/page.tsx",
                   "@/app/blog/community/page.tsx",
                   "@/app/blog/help/page.tsx",
                   "@/app/blog/notifications/page.tsx",
                   "@/app/blog/page.tsx",
                   "@/app/blog/search/page.tsx",
                   "@/app/blog/tag/[slug]/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/[subCategory]/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/page.tsx",
                   "@/app/blog/theme/[slug]/page.tsx",
                   "@/app/blog/user/articles/page.tsx",
                   "@/app/blog/user/favorites/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/services/author.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/DiscussionThread.tsx",
                  "@/app/blog/components/NewPostForm.tsx"]

imports:         ["react", "next/navigation", "next/cache", "lucide-react",
                  "@/app/blog/lib/services/group",
                  "@/app/blog/lib/services/author",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/DiscussionThread",
                  "@/app/blog/components/NewPostForm",
                  "@/components/ui/avatar",
                  "@/components/ui/skeleton",
                  "@/utils/initials"]

exports:         ["default BlogDiscussionPage"]

useBy:           []

userStories:     ["us3100003", "us3100004",
                  "*en tant qu'utilisateur je veux voir le nom et l'avatar des participants"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { io } from "next/cache";

import { getGroupBySlug } from "@/app/blog/lib/services/group";
import { resolveAuthorProfiles } from "@/app/blog/lib/services/author";
import { getBlogSession } from "@/app/blog/lib/session";
import { DiscussionThread } from "@/app/blog/components/DiscussionThread";
import { NewPostForm } from "@/app/blog/components/NewPostForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { initialsOf } from "@/utils/initials";

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
  /* ⚠️ io() AVANT Prisma (cf. en-tête). */
  await io();

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

  /* Résolution des profils : discussion + tous les posts. */
  const allAuthorIds = [
    discussion.authorId,
    ...discussion.posts.map((p) => p.authorId),
  ];
  const authorProfiles = await resolveAuthorProfiles(allAuthorIds);

  const discussionAuthor = authorProfiles.get(discussion.authorId);
  const authorName = discussionAuthor?.name ?? "Utilisateur inconnu";
  const authorImage = discussionAuthor?.image ?? null;

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
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="size-6">
            {authorImage && <AvatarImage src={authorImage} alt="" />}
            <AvatarFallback className="bg-gradient-to-br from-chart-2 to-chart-3 text-[10px] font-bold text-white">
              {initialsOf(authorName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{authorName}</span>
          <span aria-hidden>·</span>
          <span>
            {new Date(discussion.createdAt).toLocaleString("fr-FR")}
          </span>
        </div>
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
          authorProfiles={authorProfiles}
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
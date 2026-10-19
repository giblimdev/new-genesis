/*
path :           app/blog/community/[groupSlug]/page.tsx
tag :            ["blog", "page", "community", "group", "detail"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'un groupe. Sync page + Suspense. Affiche
                 header (nom, description, visibilité, nombre de
                 membres), bouton Rejoindre / Quitter / Gérer les
                 demandes (owner), puis la liste des discussions et un
                 formulaire "Ouvrir une discussion". 404 si groupe
                 absent. Groupes private : 404 sauf membre actif.

flow:            GroupPage → Suspense → GroupSection → await →
                 getGroupBySlug → si null 404 → si private et pas
                 membre : 404 → getBlogSession → rend header +
                 <GroupActions /> + liste discussions + <NewDiscussionForm />
                 si membre actif.

ecosystem:       Blog = [
                   ... (identique à [slug]/page.tsx)
                 ]

relatedFiles:    ["@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/GroupActions.tsx",
                  "@/app/blog/components/NewDiscussionForm.tsx"]

imports:         ["react", "next/navigation", "next/link", "lucide-react",
                  "@/app/blog/lib/services/group",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/GroupActions",
                  "@/app/blog/components/NewDiscussionForm",
                  "@/components/ui/skeleton"]

exports:         ["default BlogGroupPage"]

useBy:           []

userStories:     ["us3100001", "us3100002", "us3100003"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, Users } from "lucide-react";

import { getGroupBySlug } from "@/app/blog/lib/services/group";
import { getBlogSession } from "@/app/blog/lib/session";
import { GroupActions } from "@/app/blog/components/GroupActions";
import { NewDiscussionForm } from "@/app/blog/components/NewDiscussionForm";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ groupSlug: string }>;

export default function BlogGroupPage({ params }: { params: PageParams }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <Suspense fallback={<GroupSkeleton />}>
        <GroupSection params={params} />
      </Suspense>
    </div>
  );
}

async function GroupSection({ params }: { readonly params: PageParams }) {
  const { groupSlug } = await params;
  const group = await getGroupBySlug(groupSlug);
  if (!group) notFound();

  const session = await getBlogSession();
  const viewerId = session?.user?.id ?? null;
  const member = viewerId
    ? group.members.find(
        (m) => m.userId === viewerId && m.status === "active",
      )
    : undefined;
  const isOwnerOrMod = member?.role === "owner" || member?.role === "moderator";
  const isMember = Boolean(member);

  if (group.visibility === "private" && !isMember) notFound();

  const activeMembers = group.members.filter(
    (m) => m.status === "active",
  ).length;

  return (
    <div className="space-y-8">
      <header className="space-y-3 rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-2">
              Groupe ·{" "}
              {group.visibility === "public"
                ? "Public"
                : group.visibility === "private"
                  ? "Privé"
                  : "Non listé"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {activeMembers} membre{activeMembers > 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="size-3.5" aria-hidden />
                {group.discussions.length} discussion
                {group.discussions.length > 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <GroupActions
            group={group}
            isMember={isMember}
            isOwnerOrMod={isOwnerOrMod}
            isAuthenticated={Boolean(viewerId)}
          />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Discussions
        </h2>
        {group.discussions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune discussion pour l&apos;instant.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {group.discussions.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/blog/community/${group.slug}/${d.id}`}
                  className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {d.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {d.posts.filter((p) => !p.deletedAt).length} réponse
                    {d.posts.length > 1 ? "s" : ""} ·{" "}
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isMember && (
        <section className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Ouvrir une discussion
          </h2>
          <NewDiscussionForm groupId={group.id} />
        </section>
      )}
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
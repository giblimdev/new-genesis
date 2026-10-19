/*
path :           app/blog/community/page.tsx
tag :            ["blog", "page", "community", "groups", "public"]
projectId:       new-genesis
type :           page
generic:         false

role:            Listing public des groupes (public + unlisted ; les
                 private n'apparaissent qu'à leurs membres, calculé
                 ici simplement en filtrant public). Sync page +
                 Suspense ; rend GroupCard pour chaque groupe et un
                 CTA "Créer un groupe" (protégé par session).

flow:            CommunityPage → Suspense → CommunitySection →
                 getBlogSession + listGroups("public") →
                 grille GroupCard + CTA.

ecosystem:       Blog = [
                   ... (identique à [slug]/page.tsx)
                 ]

relatedFiles:    ["@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/GroupCard.tsx"]

imports:         ["react", "next/link", "lucide-react",
                  "@/app/blog/lib/services/group",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/GroupCard",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogCommunityPage"]

useBy:           []

userStories:     ["us3100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { listGroups } from "@/app/blog/lib/services/group";
import { getBlogSession } from "@/app/blog/lib/session";
import { GroupCard } from "@/app/blog/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogCommunityPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-2">
            Communauté
          </p>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Users className="size-5 text-chart-2" aria-hidden />
            Groupes de discussion
          </h1>
        </div>
        <Suspense fallback={null}>
          <CreateCta />
        </Suspense>
      </header>
      <Suspense fallback={<CommunitySkeleton />}>
        <CommunitySection />
      </Suspense>
    </div>
  );
}

async function CreateCta() {
  const session = await getBlogSession();
  if (!session?.user) return null;
  return (
    <Button render={<Link href="/blog/community/new" />} className="gap-2">
      <Plus className="size-4" aria-hidden />
      Créer un groupe
    </Button>
  );
}

async function CommunitySection() {
  const groups = await listGroups("public");
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun groupe public pour l&apos;instant.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}
    </div>
  );
}

function CommunitySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}
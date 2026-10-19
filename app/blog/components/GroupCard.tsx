/*
path :           app/blog/components/GroupCard.tsx
tag :            ["blog", "component", "group", "card"]
projectId:       new-genesis
type :           component
generic:         false

role:            Carte de groupe pour le listing /blog/community.
                 Affiche nom, description, nombre de membres, nombre
                 de discussions, badge visibilité. Lien vers la page
                 du groupe. Server Component pur.

flow:            Props { group } → rend <Link> stylé.

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts"]

imports:         ["next/link", "lucide-react",
                  "@/app/blog/lib/types"]

exports:         ["GroupCard", "GroupCardProps"]

useBy:           ["@/app/blog/community/page.tsx"]

userStories:     ["us3100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";

import type { Group } from "@/app/blog/lib/types";

export interface GroupCardProps {
  readonly group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const members = group.members.filter((m) => m.status === "active").length;
  return (
    <Link
      href={`/blog/community/${group.slug}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-xl"
    >
      <header className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-chart-2 to-chart-3 text-white shadow">
          <Users className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground">
            {group.name}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-2">
            {group.visibility === "public"
              ? "Public"
              : group.visibility === "private"
                ? "Privé"
                : "Non listé"}
          </p>
        </div>
      </header>
      {group.description && (
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
          {group.description}
        </p>
      )}
      <footer className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden />
          {members} membre{members > 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5" aria-hidden />
          {group.discussions.length} discussion
          {group.discussions.length > 1 ? "s" : ""}
        </span>
      </footer>
    </Link>
  );
}
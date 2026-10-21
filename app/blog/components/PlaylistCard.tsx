/*
path :           app/blog/components/PlaylistCard.tsx
tag :            ["blog", "component", "playlist", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte de playlist pour le listing /blog/playlists. Affiche
                 la couverture (ou placeholder gradient), le nom, la
                 description, le nombre d'articles, la visibilité, et un
                 CTA « Ouvrir ». Server Component pur, aucune interaction.

flow:            Reçoit { playlist } → rend un <Link> vers
                 /blog/playlist/[slug] avec couverture, nom, description
                 (line-clamp-2), pied « N articles · Visibilité ».

ecosystem:       BlogUI = [
                   ... (voir tableau de référence)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/media-url.ts",
                  "@/app/blog/playlists/page.tsx"]

imports:         ["next/link", "lucide-react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/media-url"]

exports:         ["PlaylistCard", "PlaylistCardProps"]

useBy:           ["@/app/blog/playlists/page.tsx"]

userStories:     ["*en tant que lecteur je veux parcourir les playlists"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import { ListVideo, Lock } from "lucide-react";

import type { Playlist } from "@/app/blog/lib/types";
import { resolveMediaUrl } from "@/app/blog/lib/media-url";

export interface PlaylistCardProps {
  readonly playlist: Playlist;
}

function visibilityLabel(v: Playlist["visibility"]): string {
  return v === "public"
    ? "Public"
    : v === "private"
      ? "Privé"
      : "Non listé";
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const cover = playlist.coverImage
    ? resolveMediaUrl(playlist.coverImage)
    : undefined;
  const count = playlist.articleIds.length;

  return (
    <Link
      href={`/blog/playlist/${playlist.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-chart-4/20 via-chart-2/15 to-chart-5/15">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-chart-4">
            <ListVideo className="size-10" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start gap-2">
          <h2 className="line-clamp-2 flex-1 text-lg font-bold tracking-tight text-foreground">
            {playlist.name}
          </h2>
          {playlist.visibility === "private" && (
            <Lock className="mt-1 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          )}
        </div>

        {playlist.description && (
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {playlist.description}
          </p>
        )}

        <p className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ListVideo className="size-3.5" aria-hidden />
            {count} article{count > 1 ? "s" : ""}
          </span>
          <span aria-hidden>·</span>
          <span>{visibilityLabel(playlist.visibility)}</span>
        </p>
      </div>
    </Link>
  );
}
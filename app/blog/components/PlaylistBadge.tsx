/*
path :           app/blog/components/PlaylistBadge.tsx
tag :            ["blog", "component", "playlist", "badge", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Badge inline affichant le nom d'une playlist. Rendu dans
                 ArticleHeader à côté des tags. Cliquable → ouvre la page
                 publique de la playlist. Server Component pur (aucune
                 interaction). Style cohérent avec les badges de tags
                 (accent chart-4 pour distinguer playlist ≠ tag).

flow:            Reçoit { playlist } → rend un <Link> avec icône ListVideo
                 + nom tronqué + aria-label explicite.

ecosystem:       BlogUI = [
                   ... (voir tableau de référence)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/components/ArticleHeader.tsx"]

imports:         ["next/link", "lucide-react",
                  "@/app/blog/lib/types"]

exports:         ["PlaylistBadge", "PlaylistBadgeProps"]

useBy:           ["@/app/blog/components/ArticleHeader.tsx"]

userStories:     ["*en tant que lecteur je veux voir à quelle playlist appartient un article"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import { ListVideo } from "lucide-react";

import type { Playlist } from "@/app/blog/lib/types";

export interface PlaylistBadgeProps {
  readonly playlist: Pick<Playlist, "slug" | "name">;
}

export function PlaylistBadge({ playlist }: PlaylistBadgeProps) {
  return (
    <Link
      href={`/blog/playlist/${playlist.slug}`}
      aria-label={`Playlist : ${playlist.name}`}
      className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-2.5 py-1 text-xs font-medium text-chart-4 transition-colors hover:bg-chart-4/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ListVideo className="size-3" aria-hidden />
      <span className="max-w-[12rem] truncate">{playlist.name}</span>
    </Link>
  );
}
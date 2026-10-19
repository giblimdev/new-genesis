/*
path :           app/blog/components/TableOfContents.tsx
tag :            ["blog", "component", "toc", "navigation", "ui"]
projectId:       new-genesis
type :           component
generic:         false

role:            Table des matières dérivée de la hiérarchie content[].
                 Liste les entrées {id, title, depth} avec indentation
                 progressive et deep-linking (#id). Pas de scroll spy
                 JS : ancres natives, le sticky est géré par le parent.

flow:            Reçoit entries → rend une <nav> avec des <a href="#id">
                 stylés selon la profondeur.

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/components/ArticleBody.tsx"]

imports:         ["lucide-react"]

exports:         ["TableOfContents", "TableOfContentsProps", "TocEntry"]

useBy:           ["@/app/blog/components/ArticleBody.tsx"]

userStories:     ["us4100003"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { List } from "lucide-react";

import type { TocEntry } from "@/app/blog/components/ArticleBody";

export type { TocEntry };

export interface TableOfContentsProps {
  readonly entries: readonly TocEntry[];
}

export function TableOfContents({ entries }: TableOfContentsProps) {
  if (entries.length === 0) return null;
  return (
    <nav aria-label="Table des matières" className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <List className="size-3.5" aria-hidden />
        Sommaire
      </p>
      <ul className="space-y-1 text-sm">
        {entries.map((e) => (
          <li
            key={e.id}
            style={{ paddingLeft: `${(e.depth - 1) * 12}px` }}
          >
            <a
              href={`#${e.id}`}
              className="block truncate rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={e.title}
            >
              {e.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
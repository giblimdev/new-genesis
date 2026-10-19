/*
path :           app/blog/components/SearchFilters.tsx
tag :            ["blog", "component", "search", "filters", "server"]
projectId:       new-genesis
type :           component
generic:         false

role:            Panneau de filtres combinables pour /blog/search.
                 Server Component : affiche des <select> natifs +
                 <input> GET qui pointent vers /blog/search. Aucun
                 JS client requis : le formulaire est natif.
                 Pré-remplit les valeurs depuis searchParams.

flow:            Props { themes, tags, current: { q, themeSlug,
                 categorySlug, subCategorySlug, tagSlug, authorId,
                 featured, from, to } } → rend <form method="get">
                 avec selects dépendants simplifiés (theme → cat →
                 sub via optgroup).

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts"]

imports:         ["@/app/blog/lib/types"]

exports:         ["SearchFilters", "SearchFiltersProps"]

useBy:           ["@/app/blog/search/page.tsx"]

userStories:     ["us4100002"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Tag, Theme } from "@/app/blog/lib/types";

export interface SearchFiltersProps {
  readonly themes: readonly Theme[];
  readonly tags: readonly Tag[];
  readonly current: {
    readonly q?: string;
    readonly themeSlug?: string;
    readonly tagSlug?: string;
    readonly featured?: boolean;
  };
}

export function SearchFilters({ themes, tags, current }: SearchFiltersProps) {
  return (
    <form
      method="get"
      action="/blog/search"
      className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-muted-foreground">Recherche</span>
        <input
          type="search"
          name="q"
          defaultValue={current.q ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-muted-foreground">Thème</span>
        <select
          name="theme"
          defaultValue={current.themeSlug ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Tous</option>
          {themes.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-muted-foreground">Tag</span>
        <select
          name="tag"
          defaultValue={current.tagSlug ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Tous</option>
          {tags.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 self-end text-xs">
        <input
          type="checkbox"
          name="featured"
          value="1"
          defaultChecked={current.featured}
          className="size-4 rounded border-input"
        />
        <span className="font-medium text-muted-foreground">À la une</span>
      </label>

      <div className="col-span-full flex justify-end">
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Filtrer
        </button>
      </div>
    </form>
  );
}
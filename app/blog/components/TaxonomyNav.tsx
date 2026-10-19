/*
path :           app/blog/components/TaxonomyNav.tsx
tag :            ["blog", "component", "taxonomy", "nav", "breadcrumb"]
projectId:       new-genesis
type :           component
generic:         false

role:            Navigation taxonomique (thème → catégorie → sous-
                 catégorie) sous forme de pills cliquables. Utilisable
                 sur la home et les pages de listing. Server Component
                 pur : reçoit themes + themeId actif pour surligner.
                 Affiche thèmes, puis catégories du thème actif, puis
                 sous-catégories de la catégorie active.

flow:            Props { themes, activeThemeId?, activeCategoryId?,
                 activeSubCategoryId? } → rend 3 rangées de pills
                 avec liens vers /blog/theme/[slug] etc.

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts"]

imports:         ["next/link", "@/app/blog/lib/types"]

exports:         ["TaxonomyNav", "TaxonomyNavProps"]

useBy:           ["@/app/blog/page.tsx",
                  "@/app/blog/theme/[slug]/page.tsx"]

userStories:     ["us4100004"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";

import type { Theme } from "@/app/blog/lib/types";

export interface TaxonomyNavProps {
  readonly themes: readonly Theme[];
  readonly activeThemeId?: string;
  readonly activeCategoryId?: string;
  readonly activeSubCategoryId?: string;
}

function Pill({
  href,
  active,
  children,
}: {
  readonly href: string;
  readonly active: boolean;
  readonly children: React.ReactNode;
}) {
  const cls = active
    ? "inline-flex items-center rounded-full bg-chart-1/15 px-3 py-1 text-xs font-semibold text-chart-1"
    : "inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
  return (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}

export function TaxonomyNav({
  themes,
  activeThemeId,
  activeCategoryId,
  activeSubCategoryId,
}: TaxonomyNavProps) {
  const theme = themes.find((t) => t.id === activeThemeId);
  const category = theme?.categories.find((c) => c.id === activeCategoryId);
  const subCategories = category?.subCategories ?? [];

  return (
    <nav aria-label="Taxonomie" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <Pill
            key={t.id}
            href={`/blog/theme/${t.slug}`}
            active={t.id === activeThemeId}
          >
            {t.name}
          </Pill>
        ))}
      </div>
      {theme && theme.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {theme.categories.map((c) => (
            <Pill
              key={c.id}
              href={`/blog/theme/${theme.slug}/${c.slug}`}
              active={c.id === activeCategoryId}
            >
              {c.name}
            </Pill>
          ))}
        </div>
      )}
      {category && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subCategories.map((s) => (
            <Pill
              key={s.id}
              href={`/blog/theme/${theme!.slug}/${category.slug}/${s.slug}`}
              active={s.id === activeSubCategoryId}
            >
              {s.name}
            </Pill>
          ))}
        </div>
      )}
    </nav>
  );
}
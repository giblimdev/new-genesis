/*
path :           app/blog/page.tsx
tag :            ["blog", "page", "articles", "list", "public"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'index du blog. Affiche les articles published +
                 public via searchArticles (tri publishedAt DESC) et la
                 TaxonomyNav pour la découverte. Sync page + Suspense ;
                 le composant async charge thèmes + articles en parallèle.
                 Remplace la version statique (const ARTICLES en dur) par
                 une lecture réelle du document JSON. Sert de page
                 d'entrée du module Blog — le lien /blog est branché dans
                 components/layout/header/nav/frontWorkSpace.ts.

flow:            BlogPage (sync) →
                 <Suspense fallback=<BlogSkeleton />> →
                 <BlogSection /> async →
                 Promise.all([listThemes(),
                 searchArticles({ page: 1, pageSize: 20 })]) →
                 rend hero + CTA (Recherche, Communauté) +
                 TaxonomyNav (si thèmes existent) +
                 grille ArticleCard + état vide si aucun article.

ecosystem:       Blog = [
                   "@/app/blog/[slug]/page.tsx",
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
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
                   "@/app/blog/user/favorites/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/services/search.ts",
                  "@/app/blog/lib/services/taxonomy.ts",
                  "@/app/blog/components/ArticleCard.tsx",
                  "@/app/blog/components/TaxonomyNav.tsx"]

imports:         ["react", "next/link", "lucide-react", "next",
                  "@/app/blog/lib/services/search",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/components/ArticleCard",
                  "@/app/blog/components/TaxonomyNav",
                  "@/components/ui/skeleton"]

exports:         ["default BlogPage", "metadata"]

useBy:           ["@/components/layout/header/nav/frontWorkSpace.ts"]

userStories:     ["us4100001", "us4100004"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Tag as TagIcon } from "lucide-react";
import type { Metadata } from "next";

import { searchArticles } from "@/app/blog/lib/services/search";
import { listThemes } from "@/app/blog/lib/services/taxonomy";
import { ArticleCard } from "@/app/blog/components/ArticleCard";
import { TaxonomyNav } from "@/app/blog/components/TaxonomyNav";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, retours d'expérience et tutoriels autour de Genesis et du développement produit.",
};

/* ------------------------------------------------------------------ */
/*  Page (sync)                                                        */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      <Suspense fallback={<BlogSkeleton />}>
        <BlogSection />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async                                                      */
/* ------------------------------------------------------------------ */

async function BlogSection() {
  const [themes, result] = await Promise.all([
    listThemes(),
    searchArticles({ page: 1, pageSize: 20 }),
  ]);

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/*  Hero                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="relative overflow-hidden px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-chart-1/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 size-96 rounded-full bg-chart-3/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <TagIcon className="size-3.5 text-chart-2" aria-hidden />
            Blog · Articles & tutoriels
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Articles & tutoriels
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Retours d&apos;expérience, guides pratiques et explorations autour
            de Genesis.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/blog/search"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <BookOpen className="size-4" aria-hidden />
              Rechercher
            </Link>
            <Link
              href="/blog/community"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Sparkles className="size-4" aria-hidden />
              Communauté
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Navigation taxonomique (si thèmes existent)                */}
      {/* ---------------------------------------------------------- */}
      {themes.length > 0 && (
        <section className="px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <TaxonomyNav themes={themes} />
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- */}
      {/*  Grille d'articles                                          */}
      {/* ---------------------------------------------------------- */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun article publié pour l&apos;instant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }).map((_, i) => {
                const p = i + 1;
                const active = p === result.page;
                return (
                  <Link
                    key={p}
                    href={`/blog?page=${p}`}
                    className={
                      active
                        ? "inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
                        : "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border/60 px-3 text-sm text-muted-foreground hover:bg-muted"
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function BlogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-12 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
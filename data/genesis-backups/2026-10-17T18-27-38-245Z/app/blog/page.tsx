/*
path :           app/blog/page.tsx
tag :            ["blog", "page", "articles", "list"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'index du blog. Affiche la liste des articles publiés
                 sous forme de cartes responsives (grille 1 / 2 / 3 colonnes).
                 Server Component pur : les articles proviennent d'une
                 constante locale (à remplacer par une lecture en base ou en
                 MDX quand le module Blog sera branché).

flow:            Server Component → lit ARTICLES → rend un hero + une grille
                 de BlogCard → état vide si aucun article.

ecosystem:       Blog = [
                   "@/app/blog/page.tsx",
                 ]

relatedFiles:    ["@/app/layout.tsx"]

imports:         ["next/link", "lucide-react"]

exports:         ["default BlogPage", "metadata"]

useBy:           []

userStories:     ["*en tant que lecteur je veux consulter la liste des articles du blog"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, retours d'expérience et tutoriels autour de Genesis et du développement produit.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogArticle {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly publishedAt: string;
  readonly readingMinutes: number;
  readonly tags: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Données (à remplacer par une source réelle)                        */
/* ------------------------------------------------------------------ */

const ARTICLES: readonly BlogArticle[] = [
  {
    slug: "bienvenue-dans-genesis",
    title: "Bienvenue dans Genesis",
    excerpt:
      "Découvrez l'atelier qui structure vos projets : conception Scrum, outils de développement et blog intégré.",
    publishedAt: "2026-10-01",
    readingMinutes: 4,
    tags: ["genesis", "introduction"],
  },
  {
    slug: "scrum-en-pratique",
    title: "Scrum en pratique : de l'idée au sprint",
    excerpt:
      "Comment Genesis articule idées, features, personas, epics, user stories et sprints dans un flux continu.",
    publishedAt: "2026-10-08",
    readingMinutes: 7,
    tags: ["scrum", "méthode", "conception"],
  },
  {
    slug: "better-auth-nextjs",
    title: "Authentifier une app Next.js avec Better Auth",
    excerpt:
      "Mise en place de Better Auth : adapter Prisma, sessions, OAuth GitHub et Google, routes catch-all.",
    publishedAt: "2026-10-15",
    readingMinutes: 9,
    tags: ["auth", "next.js", "better-auth"],
  },
];

/* ------------------------------------------------------------------ */
/*  Carte d'article                                                    */
/* ------------------------------------------------------------------ */

function BlogCard({ article }: { readonly article: BlogArticle }) {
  const dateLabel = new Date(article.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background:
            "linear-gradient(90deg, var(--chart-2), transparent)",
        }}
      />

      <div
        aria-hidden
        className="relative grid aspect-video place-items-center bg-gradient-to-br from-chart-1/15 via-chart-2/15 to-chart-3/15 text-chart-2"
      >
        <BookOpen className="size-12" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-chart-2/10 px-2 py-0.5 text-[11px] font-medium text-chart-2"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {article.title}
        </h2>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {article.readingMinutes} min
          </span>
        </div>

        <Link
          href={`/blog/${article.slug}`}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-chart-2 transition-transform group-hover:translate-x-0.5"
        >
          Lire l&apos;article
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
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
            <Tag className="size-3.5 text-chart-2" aria-hidden />
            Blog · Articles & tutoriels
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Articles & tutoriels
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Retours d&apos;expérience, guides pratiques et explorations autour
            de Genesis.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {ARTICLES.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun article publié pour l&apos;instant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ARTICLES.map((article) => (
                <BlogCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
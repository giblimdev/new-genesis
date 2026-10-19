/*
path :           app/blog/articles/page.tsx
tag :            ["blog", "page", "admin", "article", "list"]
projectId:       new-genesis
type :           page
generic:         false

role:            File d'articles côté admin. Affiche les articles de
                 l'utilisateur courant (ou tous si admin) avec badge
                 statut/visibilité, boutons Éditer / Publier / Archiver /
                 Supprimer. Sync page + Suspense. Les wrappers de
                 mutation compatibles <form action> (publishArticleFormAction,
                 archiveArticleFormAction, deleteArticleFormAction) sont
                 importés depuis article-form.ts (Server Actions,
                 "use server") et PASSÉS EN PROPS à ArticleRow (Client
                 Component) — Next.js interdit les Server Actions
                 inline dans un Client Component.

                 ⚠️ `await io()` AVANT `getBlogSession()` : Prisma 7 lit
                 `new Date()` de manière synchrone dans son NowGenerator
                 (bug connu, cf. nextjs.org/docs/messages/blocking-
                 prerender-current-time). Sans point de suspension
                 préalable sous <Suspense>, le prérendu bloque.

flow:            BlogAdminArticlesPage (sync) → Suspense →
                 ArticlesSection async → await io() → getBlogSession
                 + isAdmin → listArticles → filtre par authorId si
                 non admin → tri → rend tableau responsive + liens
                 Éditer + ArticleRow (props : article + 3 wrappers
                 de mutation Promise<void>).

ecosystem:       BlogAdmin = [
                   "@/app/blog/articles/[id]/edit/page.tsx",
                   "@/app/blog/articles/new/page.tsx",
                   "@/app/blog/articles/page.tsx",
                   "@/app/blog/articles/ArticleRow.tsx",
                   "@/app/blog/setup/page.tsx",
                   "@/app/blog/taxonomy/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/actions/article-form.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["react", "next/link", "next/cache", "lucide-react",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/actions/article-form",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/types",
                  "@/app/blog/admin/articles/ArticleRow",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogAdminArticlesPage"]

useBy:           []

userStories:     ["us1100005", "us1100006"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { io } from "next/cache";
import { ArrowUpRight, Clock, Eye, Plus } from "lucide-react";

import { ArticleRow } from "@/app/blog/articles/ArticleRow";
import {
  archiveArticleFormAction,
  deleteArticleFormAction,
  publishArticleFormAction,
} from "@/app/blog/lib/actions/article-form";
import { isAdmin } from "@/app/blog/lib/admin";
import { getBlogSession } from "@/app/blog/lib/session";
import { listArticles } from "@/app/blog/lib/services/article";
import type { Article } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Page (sync)                                                        */
/* ------------------------------------------------------------------ */

export default function BlogAdminArticlesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
            Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Articles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos brouillons, publications et archives.
          </p>
        </div>
        <Button
          render={<Link href="/blog/admin/articles/new" />}
          className="gap-2"
        >
          <Plus className="size-4" aria-hidden />
          Nouvel article
        </Button>
      </header>

      <Suspense fallback={<ArticlesListSkeleton />}>
        <ArticlesSection />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async                                                      */
/* ------------------------------------------------------------------ */

const STATUS_ORDER: Record<Article["status"], number> = {
  draft: 0,
  published: 1,
  archived: 2,
};

async function ArticlesSection() {
  /* ⚠️ io() AVANT Prisma : Prisma 7 lit new Date() de façon synchrone
     dans son NowGenerator (bug connu). */
  await io();

  const session = await getBlogSession();
  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour gérer vos articles.
        </p>
        <Button
          render={<Link href="/core/auth/login" />}
          className="mt-4 gap-2"
        >
          Se connecter
          <ArrowUpRight className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  const admin = await isAdmin();
  const all = await listArticles();
  const visible = admin
    ? all
    : all.filter((a) => a.authorId === session.user.id);

  /* Tri : brouillons → publiés → archivés, puis updatedAt descendant. */
  const articles = [...visible].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun article pour l&apos;instant.
        </p>
        <Button
          render={<Link href="/blog/admin/articles/new" />}
          className="mt-4 gap-2"
        >
          <Plus className="size-4" aria-hidden />
          Créer le premier article
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {articles.map((article) => (
        <ArticleRow
          key={article.id}
          article={article}
          publishAction={publishArticleFormAction}
          archiveAction={archiveArticleFormAction}
          deleteAction={deleteArticleFormAction}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function ArticlesListSkeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-7 w-40" />
        </li>
      ))}
    </ul>
  );
}
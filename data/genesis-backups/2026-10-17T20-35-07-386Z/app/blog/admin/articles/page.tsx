/*
path :           app/blog/admin/articles/page.tsx
tag :            ["blog", "page", "admin", "article", "list"]
projectId:       new-genesis
type :           page
generic:         false

role:            File d'articles côté admin. Affiche les articles de
                 l'utilisateur courant (ou tous si admin) avec badge
                 statut/visibilité, boutons Éditer / Publier / Archiver /
                 Supprimer. Sync page + Suspense. Les mutations passent
                 par les Server Actions existantes (publishArticleAction,
                 archiveArticleAction, deleteArticleAction).

flow:            AdminArticlesPage (sync) → Suspense → AdminArticlesSection
                 async → getBlogSession + isAdmin → listArticles → filtre
                 par authorId si non admin → rend tableau responsive +
                 liens Éditer (vers /blog/admin/articles/[id]/edit) +
                 boutons d'action.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["react", "next/link", "lucide-react",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/actions/article",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/types",
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
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
} from "@/app/blog/lib/actions/article";
import { isAdmin } from "@/app/blog/lib/admin";
import { getBlogSession } from "@/app/blog/lib/session";
import { listArticles } from "@/app/blog/lib/services/article";
import type { Article } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogAdminArticlesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
            Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Articles
          </h1>
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

async function ArticlesSection() {
  const session = await getBlogSession();
  if (!session?.user) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        Connectez-vous pour gérer vos articles.
      </p>
    );
  }
  const admin = await isAdmin();
  const all = await listArticles();
  const articles = admin
    ? all
    : all.filter((a) => a.authorId === session.user.id);

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
        <ArticleRow key={article.id} article={article} />
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { readonly status: Article["status"] }) {
  const map = {
    draft: { label: "Brouillon", cls: "bg-muted text-muted-foreground" },
    published: { label: "Publié", cls: "bg-chart-4/15 text-chart-4" },
    archived: { label: "Archivé", cls: "bg-chart-5/15 text-chart-5" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function VisibilityBadge({ visibility }: { readonly visibility: Article["visibility"] }) {
  const map = {
    public: "Public",
    unlisted: "Non listé",
    private: "Privé",
  } as const;
  return (
    <span className="text-[11px] text-muted-foreground">
      {map[visibility]}
    </span>
  );
}

function ArticleRow({ article }: { readonly article: Article }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Link
          href={`/blog/admin/articles/${article.id}/edit`}
          className="block truncate text-sm font-semibold text-foreground hover:underline"
        >
          {article.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          /{article.slug} · {article.viewCount} vues ·{" "}
          {article.readingTimeMin} min
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <StatusBadge status={article.status} />
        <VisibilityBadge visibility={article.visibility} />
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:shrink-0">
        <Button
          render={<Link href={`/blog/admin/articles/${article.id}/edit`} />}
          size="sm"
          variant="ghost"
          className="gap-1.5"
        >
          <Pencil className="size-3.5" aria-hidden />
          Éditer
        </Button>

        {article.status !== "published" && (
          <form
            action={async () => {
              "use server";
              await publishArticleAction(article.id);
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Publier
            </Button>
          </form>
        )}

        {article.status !== "archived" && (
          <form
            action={async () => {
              "use server";
              await archiveArticleAction(article.id);
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              Archiver
            </Button>
          </form>
        )}

        <form
          action={async () => {
            "use server";
            await deleteArticleAction(article.id);
          }}
        >
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Supprimer
          </Button>
        </form>
      </div>
    </li>
  );
}

function ArticlesListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
/*
path :           app/blog/admin/articles/[id]/edit/page.tsx
tag :            ["blog", "page", "admin", "article", "edit"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'édition d'article. Sync page + Suspense ;
                 charge article + thèmes + tags + manifeste médias
                 dans un composant async et rend ArticleForm
                 (mode="edit", initial=article). ArticleForm gère
                 updateArticleAction. 404 si article introuvable.

flow:            EditArticlePage → Suspense → EditArticleSection →
                 await params → getArticleById(id) → si absent 404 →
                 listThemes + listTags + getMediaManifest →
                 <ArticleForm mode="edit" initial={article} ... />.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/components/admin/ArticleForm.tsx",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/taxonomy.ts",
                  "@/app/blog/lib/media.ts"]

imports:         ["react", "next/navigation",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/media",
                  "@/app/blog/components/admin/ArticleForm",
                  "@/components/ui/skeleton"]

exports:         ["default BlogAdminEditArticlePage"]

useBy:           []

userStories:     ["us1100005"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getArticleById } from "@/app/blog/lib/services/article";
import { listTags, listThemes } from "@/app/blog/lib/services/taxonomy";
import { getMediaManifest } from "@/app/blog/lib/media";
import { ArticleForm } from "@/app/blog/components/admin/ArticleForm";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ id: string }>;

export default function BlogAdminEditArticlePage({
  params,
}: {
  params: PageParams;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
          Administration
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Éditer un article
        </h1>
      </header>
      <Suspense fallback={<FormSkeleton />}>
        <EditArticleSection params={params} />
      </Suspense>
    </div>
  );
}

async function EditArticleSection({
  params,
}: {
  readonly params: PageParams;
}) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const [themes, tags] = await Promise.all([listThemes(), listTags()]);
  const mediaManifest = getMediaManifest();

  return (
    <ArticleForm
      mode="edit"
      initial={article}
      themes={themes}
      tags={tags}
      mediaManifest={mediaManifest}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
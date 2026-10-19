/*
path :           app/blog/admin/articles/[id]/edit/page.tsx
tag :            ["blog", "page", "admin", "article", "edit", "protected"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'édition d'article. Sync page + Suspense ; toute
                 la logique runtime (await params, require session,
                 chargement article + taxonomie + manifeste médias) est
                 isolée dans un composant async. Rend ArticleForm
                 (mode="edit", initial=article). L'autorisation est
                 vérifiée côté serveur : l'auteur ou un admin peut
                 éditer ; sinon 404 (pour ne pas révéler l'existence
                 de l'article). Le formulaire déclenche
                 updateArticleAction (déjà existante) qui revalide
                 /blog/admin/articles et /blog/[slug].

flow:            BlogAdminEditArticlePage (sync) →
                 <Suspense fallback=<FormSkeleton />> →
                 <EditArticleSection params /> async →
                 await params → getArticleById(id) → si absent 404 →
                 getBlogSession() → si null 404 →
                 (isAuthor || isAdmin) sinon 404 →
                 Promise.all([listThemes(), listTags()]) +
                 getMediaManifest() → <ArticleForm mode="edit"
                 initial={article} themes={themes} tags={tags}
                 mediaManifest={mediaManifest} />.

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
                  "@/app/blog/lib/media.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/admin.ts"]

imports:         ["react", "next/navigation",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/media",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/admin",
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
import { getBlogSession } from "@/app/blog/lib/session";
import { isAdmin } from "@/app/blog/lib/admin";
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

  /* 1. Article */
  const article = await getArticleById(id);
  if (!article) notFound();

  /* 2. Session (obligatoire) + autorisation serveur */
  const session = await getBlogSession();
  if (!session?.user) notFound();

  const admin = await isAdmin();
  const isAuthor = article.authorId === session.user.id;
  if (!isAuthor && !admin) notFound();

  /* 3. Taxonomie + manifeste médias à jour */
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
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
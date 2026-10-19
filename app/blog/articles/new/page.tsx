/*
path :           app/blog/admin/articles/new/page.tsx
tag :            ["blog", "page", "admin", "article", "new"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page de création d'article. Sync page + Suspense ;
                 charge thèmes + tags + manifeste médias dans un
                 composant async et rend ArticleForm (mode="create").

flow:            NewArticlePage (sync) → Suspense → NewArticleSection
                 async → listThemes + listTags + getMediaManifest →
                 <ArticleForm mode="create" ... />.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/ArticleForm.tsx",
                   "@/app/blog/components/CoverImagePicker.tsx",
                   "@/app/blog/components/QuickCreateCategoryDialog.tsx",
                   "@/app/blog/components/QuickCreateTagDialog.tsx",
                   "@/app/blog/components/articleDraft.ts",
                 ]

relatedFiles:    ["@/app/blog/components/ArticleForm.tsx",
                  "@/app/blog/lib/services/taxonomy.ts",
                  "@/app/blog/lib/media.ts"]

imports:         ["react",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/media",
                  "@/app/blog/components/ArticleForm",
                  "@/components/ui/skeleton"]

exports:         ["default BlogAdminNewArticlePage"]

useBy:           []

userStories:     ["us1100005"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";

import { listTags, listThemes } from "@/app/blog/lib/services/taxonomy";
import { getMediaManifest } from "@/app/blog/lib/media";
import { ArticleForm } from "@/app/blog/components/ArticleForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogAdminNewArticlePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
          Administration
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouvel article
        </h1>
      </header>
      <Suspense fallback={<FormSkeleton />}>
        <NewArticleSection />
      </Suspense>
    </div>
  );
}

async function NewArticleSection() {
  const [themes, tags] = await Promise.all([listThemes(), listTags()]);
  const mediaManifest = getMediaManifest();
  return (
    <ArticleForm
      mode="create"
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
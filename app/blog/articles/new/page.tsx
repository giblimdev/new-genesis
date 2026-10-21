/*
path :           app/blog/articles/new/page.tsx
tag :            ["blog", "page", "admin", "article", "new", "playlist"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de création d'article. Sync page + Suspense ; charge
                 thèmes + tags + playlists + manifeste médias dans un
                 composant async et rend ArticleForm (mode="create").
                 `currentPlaylistId` est null (aucune assignation initiale).

flow:            NewArticlePage (sync) → Suspense → NewArticleSection
                 async → Promise.all([listThemes, listTags, listPlaylists])
                 + getMediaManifest → <ArticleForm mode="create" ... />

ecosystem:       Blog = [
                   ... (voir tableau de référence)
                 ]

relatedFiles:    ["@/app/blog/components/ArticleForm.tsx",
                  "@/app/blog/lib/services/taxonomy.ts",
                  "@/app/blog/lib/services/playlist.ts",
                  "@/app/blog/lib/media.ts"]

imports:         ["react",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/services/playlist",
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
import { listPlaylists } from "@/app/blog/lib/services/playlist";
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
  const [themes, tags, playlists] = await Promise.all([
    listThemes(),
    listTags(),
    listPlaylists(),
  ]);
  const mediaManifest = getMediaManifest();
  return (
    <ArticleForm
      mode="create"
      themes={themes}
      tags={tags}
      playlists={playlists}
      currentPlaylistId={null}
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
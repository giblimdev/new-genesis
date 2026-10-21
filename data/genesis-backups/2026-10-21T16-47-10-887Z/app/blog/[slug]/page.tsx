/*
path :           app/blog/[slug]/page.tsx
tag :            ["blog", "page", "article", "public", "streaming", "avatar"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page article publique streamée via Cache Components
                 (page sync + Suspense + composant async). Affiche
                 ArticleHeader + ArticleBody (TOC + renderer) +
                 section commentaires (CommentTree + CommentForm).
                 Gère 404 (draft privé, archived non unlisted). Bandeau
                 « brouillon » si preview=1 et auteur/admin. Incrémente
                 viewCount via session cookie (une fois par session).
                 Résout les profils auteurs (article + commentaires)
                 via resolveAuthorProfiles pour afficher nom + avatar
                 réels dans ArticleHeader et CommentTree — les
                 entités Blog (JSON) ne dupliquent pas les données
                 Prisma User, on joint à l'affichage.
                 ⚠️ `await io()` avant getBlogSession() (NowGenerator
                 Prisma 7 synchrone bloquant).

flow:            Page (sync) → <Suspense fallback=<ArticleSkeleton/>> →
                 <ArticleSection params searchParams /> async →
                 await io() → await params → getArticleBySlug(slug) →
                 si null → 404 → si status=draft et pas auteur/admin
                 → 404 → si archived et visibility≠unlisted et pas
                 auteur/admin → 404 → fetch tagNames + resolveAuthor
                 Profiles([authorId, ...commentAuthorIds]) →
                 éventuellement incrementViewCount → rend
                 ArticleHeader + ArticleBody + CommentForm (racine)
                 + CommentTree.

ecosystem:       Blog = [
                   "@/app/blog/[slug]/page.tsx",
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/articles/[id]/edit/page.tsx",
                   "@/app/blog/articles/ArticleRow.tsx",
                   "@/app/blog/articles/new/page.tsx",
                   "@/app/blog/articles/page.tsx",
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
                   "@/app/blog/user/articles/page.tsx",
                   "@/app/blog/user/favorites/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/taxonomy.ts",
                  "@/app/blog/lib/services/favorite.ts",
                  "@/app/blog/lib/services/author.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/components/ArticleHeader.tsx",
                  "@/app/blog/components/ArticleBody.tsx",
                  "@/app/blog/components/CommentForm.tsx",
                  "@/app/blog/components/CommentTree.tsx"]

imports:         ["react", "next/navigation", "next/cache",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/services/favorite",
                  "@/app/blog/lib/services/author",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/ArticleHeader",
                  "@/app/blog/components/ArticleBody",
                  "@/app/blog/components/CommentForm",
                  "@/app/blog/components/CommentTree",
                  "@/components/ui/skeleton"]

exports:         ["default BlogArticlePage", "generateMetadata"]

useBy:           []

userStories:     ["us4100003",
                  "*en tant qu'utilisateur je veux voir le nom de l'auteur de l'article"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import type { Metadata } from "next";

import {
  getArticleBySlug,
  incrementViewCount,
} from "@/app/blog/lib/services/article";
import { listTags } from "@/app/blog/lib/services/taxonomy";
import { getUserFavorites } from "@/app/blog/lib/services/favorite";
import { resolveAuthorProfiles } from "@/app/blog/lib/services/author";
import { isAdmin } from "@/app/blog/lib/admin";
import { getBlogSession } from "@/app/blog/lib/session";
import { ArticleHeader } from "@/app/blog/components/ArticleHeader";
import { ArticleBody } from "@/app/blog/components/ArticleBody";
import { CommentForm } from "@/app/blog/components/CommentForm";
import { CommentTree } from "@/app/blog/components/CommentTree";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ slug: string }>;
type PageSearch = Promise<{ preview?: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.title,
    description: article.summary,
  };
}

export default function BlogArticlePage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: PageSearch;
}) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleSection params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ArticleSection({
  params,
  searchParams,
}: {
  readonly params: PageParams;
  readonly searchParams: PageSearch;
}) {
  /* ⚠️ io() AVANT Prisma : Prisma 7 lit new Date() de façon
     synchrone dans son NowGenerator (bug connu). Sans point de
     suspension préalable sous <Suspense>, Next.js peut lever
     « Blocking Route ». */
  await io();

  const { slug } = await params;
  const { preview } = await searchParams;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const session = await getBlogSession();
  const viewerId = session?.user?.id ?? null;
  const admin = viewerId ? await isAdmin() : false;
  const isAuthor = viewerId === article.authorId;
  const canViewDraft = Boolean(preview === "1" && (isAuthor || admin));

  if (article.status === "draft" && !canViewDraft) notFound();
  if (
    article.status === "archived" &&
    article.visibility !== "unlisted" &&
    !isAuthor &&
    !admin
  ) {
    notFound();
  }
  if (
    article.visibility === "private" &&
    !isAuthor &&
    !admin
  ) {
    notFound();
  }

  /* Incrément de vues (une fois par session côté client idéalement,
     ici on tolère un incrément par rendu serveur en démo). */
  if (article.status === "published" && !preview) {
    try {
      await incrementViewCount(article.id);
    } catch {
      /* noop */
    }
  }

  const allTags = await listTags();
  const tagNames = article.tagIds
    .map((id) => allTags.find((t) => t.id === id)?.name)
    .filter((n): n is string => Boolean(n));

  /* Résolution des profils auteurs : article + commentaires. */
  const allAuthorIds = [
    article.authorId,
    ...article.comments.map((c) => c.authorId),
  ];
  const authorProfiles = await resolveAuthorProfiles(allAuthorIds);

  const articleAuthor = authorProfiles.get(article.authorId);
  const authorName = articleAuthor?.name ?? "Utilisateur inconnu";
  const authorImage = articleAuthor?.image ?? null;

  const favorites = viewerId ? await getUserFavorites(viewerId) : null;
  const isFavorited = favorites
    ? favorites.unfiledFavorites.includes(article.id) ||
      favorites.favoriteFolders.some((f) => f.articleIds.includes(article.id))
    : false;
  const isLiked = viewerId ? article.likedBy.includes(viewerId) : false;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">
      {canViewDraft && (
        <div className="rounded-xl border border-chart-3/40 bg-chart-3/5 p-3 text-sm text-chart-3">
          Aperçu brouillon — visible uniquement par l&apos;auteur et les admins.
        </div>
      )}

      <ArticleHeader
        article={article}
        tagNames={tagNames}
        authorName={authorName}
        authorImage={authorImage}
        isAuthenticated={Boolean(viewerId)}
        initiallyLiked={isLiked}
        initiallyFavorited={isFavorited}
      />

      <ArticleBody articleId={article.id} content={article.content} />

      <section className="space-y-4 border-t border-border/60 pt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Commentaires ({article.comments.filter((c) => !c.deletedAt).length})
        </h2>
        <CommentForm
          articleId={article.id}
          parentId={article.id}
          isAuthenticated={Boolean(viewerId)}
        />
        <CommentTree
          articleId={article.id}
          comments={article.comments}
          isAuthenticated={Boolean(viewerId)}
          currentUserId={viewerId}
          authorProfiles={authorProfiles}
        />
      </section>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
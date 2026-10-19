/*
path :           app/blog/components/ArticleHeader.tsx
tag :            ["blog", "component", "article", "header", "ui"]
projectId:       new-genesis
type :           component
generic:         false

role:            En-tête d'article publique. Importe resolveMediaUrl
                 depuis media-url (client-safe). Boutons Like et Favori
                 restent des Client Components importés.

flow:            Reçoit article + tagNames + authorName + isAuthenticated
                 + initiallyLiked + initiallyFavorited → rend le header.

ecosystem:       BlogUI = [
                   ... (identique à Livraison 1)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/media-url.ts",
                  "@/app/blog/components/LikeButton.tsx",
                  "@/app/blog/components/FavoriteButton.tsx"]

imports:         ["lucide-react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/media-url",
                  "@/app/blog/components/LikeButton",
                  "@/app/blog/components/FavoriteButton"]

exports:         ["ArticleHeader", "ArticleHeaderProps"]

useBy:           ["@/app/blog/[slug]/page.tsx"]

userStories:     ["us4100003"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Calendar, Clock, Tag as TagIcon, User } from "lucide-react";

import type { Article } from "@/app/blog/lib/types";
import { resolveMediaUrl } from "@/app/blog/lib/media-url";
import { LikeButton } from "@/app/blog/components/LikeButton";
import { FavoriteButton } from "@/app/blog/components/FavoriteButton";

export interface ArticleHeaderProps {
  readonly article: Article;
  readonly tagNames: readonly string[];
  readonly authorName: string;
  readonly isAuthenticated: boolean;
  readonly initiallyLiked: boolean;
  readonly initiallyFavorited: boolean;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleHeader({
  article,
  tagNames,
  authorName,
  isAuthenticated,
  initiallyLiked,
  initiallyFavorited,
}: ArticleHeaderProps) {
  const cover = article.coverImage
    ? resolveMediaUrl(article.coverImage)
    : undefined;

  return (
    <header className="space-y-6">
      {cover && (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        {tagNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full bg-chart-2/10 px-2.5 py-1 text-xs font-medium text-chart-2"
              >
                <TagIcon className="size-3" aria-hidden />
                {name}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {article.title}
        </h1>

        <p className="text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {article.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {authorName}
          </span>
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden />
              {formatDate(article.publishedAt)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {article.readingTimeMin} min de lecture
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <LikeButton
            articleId={article.id}
            initialCount={article.likedBy.length}
            initiallyLiked={initiallyLiked}
            isAuthenticated={isAuthenticated}
          />
          <FavoriteButton
            articleId={article.id}
            initiallyFavorited={initiallyFavorited}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </header>
  );
}
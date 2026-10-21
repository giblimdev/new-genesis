/*
path :           app/blog/components/ArticleHeader.tsx
tag :            ["blog", "component", "article", "header", "ui", "avatar"]
projectId:       new-genesis
type :           component
generic:         false

role:            En-tête d'article publique. Importe resolveMediaUrl
                 depuis media-url (client-safe). Affiche la couverture,
                 les tags, le titre, le résumé, puis la ligne de méta
                 (avatar + nom de l'auteur, date de publication, temps
                 de lecture), et les boutons Like / Favori (Client
                 Components importés).
                 L'avatar de l'auteur est optionnel : si `authorImage`
                 est fourni (résolu côté serveur via
                 resolveAuthorProfiles dans app/blog/[slug]/page.tsx),
                 on l'affiche ; sinon on retombe sur un
                 AvatarFallback avec les initiales du nom. Le nom
                 affiché vient de la prop `authorName` (jamais
                 tronqué en UUID) — voir resolveAuthorProfiles
                 (@/app/blog/lib/services/author.ts).

flow:            Reçoit article + tagNames + authorName + authorImage
                 (optionnel) + isAuthenticated + initiallyLiked +
                 initiallyFavorited → rend le header. Aucun état, aucun
                 effet (Server Component pur côté rendu ; les
                 interactions sont portées par LikeButton et
                 FavoriteButton, Client Components).

ecosystem:       BlogUI = [
                   "@/app/blog/components/ArticleBody.tsx",
                   "@/app/blog/components/ArticleCard.tsx",
                   "@/app/blog/components/ArticleHeader.tsx",
                   "@/app/blog/components/CommentForm.tsx",
                   "@/app/blog/components/CommentTree.tsx",
                   "@/app/blog/components/ContentBlockRenderer.tsx",
                   "@/app/blog/components/DiscussionThread.tsx",
                   "@/app/blog/components/FavoriteButton.tsx",
                   "@/app/blog/components/GroupCard.tsx",
                   "@/app/blog/components/LikeButton.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/app/blog/components/NotificationList.tsx",
                   "@/app/blog/components/PostTree.tsx",
                   "@/app/blog/components/SearchFilters.tsx",
                   "@/app/blog/components/TableOfContents.tsx",
                   "@/app/blog/components/TaxonomyNav.tsx",
                   "@/app/blog/components/block-editor/BlockEditor.tsx",
                   "@/app/blog/components/block-editor/BlockList.tsx",
                   "@/app/blog/components/block-editor/BlockToolbar.tsx",
                   "@/app/blog/components/block-editor/BlockTypeMenu.tsx",
                   "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/CodeBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/EmbedBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ParagraphBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/SectionBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/media-url.ts",
                  "@/app/blog/lib/services/author.ts",
                  "@/app/blog/components/LikeButton.tsx",
                  "@/app/blog/components/FavoriteButton.tsx"]

imports:         ["lucide-react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/media-url",
                  "@/app/blog/components/LikeButton",
                  "@/app/blog/components/FavoriteButton",
                  "@/components/ui/avatar",
                  "@/utils/initials"]

exports:         ["ArticleHeader", "ArticleHeaderProps"]

useBy:           ["@/app/blog/[slug]/page.tsx"]

userStories:     ["us4100003",
                  "*en tant qu'utilisateur je veux voir le nom et l'avatar de l'auteur d'un article"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Calendar, Clock, Tag as TagIcon } from "lucide-react";

import type { Article } from "@/app/blog/lib/types";
import { resolveMediaUrl } from "@/app/blog/lib/media-url";
import { LikeButton } from "@/app/blog/components/LikeButton";
import { FavoriteButton } from "@/app/blog/components/FavoriteButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/utils/initials";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ArticleHeaderProps {
  readonly article: Article;
  readonly tagNames: readonly string[];
  /** Nom complet de l'auteur (jamais un UUID tronqué). */
  readonly authorName: string;
  /**
   * URL de l'image de profil de l'auteur (Prisma User.image).
   * Optionnel : si absent/null, un AvatarFallback affiche les initiales
   * du nom. Résolu côté serveur via resolveAuthorProfiles().
   */
  readonly authorImage?: string | null;
  readonly isAuthenticated: boolean;
  readonly initiallyLiked: boolean;
  readonly initiallyFavorited: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function ArticleHeader({
  article,
  tagNames,
  authorName,
  authorImage = null,
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
          {/* Auteur : avatar (image si dispo, initiales sinon) + nom réel. */}
          <span className="inline-flex items-center gap-2">
            <Avatar className="size-6">
              {authorImage && <AvatarImage src={authorImage} alt="" />}
              <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-[10px] font-bold text-white">
                {initialsOf(authorName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{authorName}</span>
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
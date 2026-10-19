/*
path :           app/blog/components/block-editor/BlockToolbar.tsx
tag :            ["blog", "component", "block-editor", "toolbar", "actions"]
projectId:       new-genesis
type :           component
generic:         false

role:            Barre d'actions attachée à chaque bloc dans l'éditeur.
                 6 boutons icônes avec aria-label : Éditer, Monter,
                 Descendre, Indenter, Désindenter, Supprimer. Chaque
                 bouton a un état disabled calculé par le parent
                 (BlockEditor), qui possède la connaissance de l'arbre.
                 Aucune logique métier ici : purement présentationnel,
                 reçoit des callbacks et des booléens.

flow:            Reçoit 6 callbacks (onEdit, onMoveUp, onMoveDown,
                 onIndent, onOutdent, onDelete) + 6 booléens
                 (canMoveUp, canMoveDown, canIndent, canOutdent,
                 canDelete) + un label (nom du bloc pour l'accessibilité).
                 Rend une rangée de boutons ghost (size icon-xs). Clic
                 → callback.

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
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/TagForm.tsx",
                   "@/app/blog/components/admin/TaxonomyForm.tsx",
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

relatedFiles:    ["@/app/blog/components/block-editor/BlockList.tsx",
                  "@/app/blog/components/block-editor/BlockEditor.tsx"]
imports:         ["lucide-react",
                  "@/components/ui/button"]
exports:         ["BlockToolbar", "BlockToolbarProps"]
useBy:           ["@/app/blog/components/block-editor/BlockList.tsx"]

userStories:     ["us1100007"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : onClick handlers interactifs.

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export interface BlockToolbarProps {
  readonly label: string;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly canIndent: boolean;
  readonly canOutdent: boolean;
  readonly canDelete: boolean;
  readonly onEdit: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onIndent: () => void;
  readonly onOutdent: () => void;
  readonly onDelete: () => void;
}

export function BlockToolbar({
  label,
  canMoveUp,
  canMoveDown,
  canIndent,
  canOutdent,
  canDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
  onDelete,
}: BlockToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={`Actions pour ${label}`}
      className="flex shrink-0 items-center gap-0.5"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onEdit}
        aria-label={`Éditer ${label}`}
      >
        <Pencil aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label={`Monter ${label}`}
      >
        <ArrowUp aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label={`Descendre ${label}`}
      >
        <ArrowDown aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onIndent}
        disabled={!canIndent}
        aria-label={`Indenter ${label}`}
      >
        <ArrowRight aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onOutdent}
        disabled={!canOutdent}
        aria-label={`Désindenter ${label}`}
      >
        <ArrowLeft aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onDelete}
        disabled={!canDelete}
        aria-label={`Supprimer ${label}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  );
}
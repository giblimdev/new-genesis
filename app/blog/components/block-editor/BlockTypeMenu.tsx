/*
path :           app/blog/components/block-editor/BlockTypeMenu.tsx
tag :            ["blog", "component", "block-editor", "menu", "generic"]
projectId:       new-genesis
type:            component
generic:         false

role:            Menu d'ajout de bloc. Affiche une grille de 8 boutons
                 (un par type de bloc) avec icône et libellé. Chaque
                 bouton appelle onPick(type) — c'est le parent
                 (BlockEditor) qui ouvre le formulaire correspondant.
                 Les types peuvent être filtrés via disabledTypes (utile
                 pour empêcher une section d'être son propre enfant, ou
                 pour bloquer l'ajout à profondeur max).

flow:            Client → reçoit onPick + disabledTypes → rend une grille
                 de boutons Lucide + label → clic → onPick(type).

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

relatedFiles:    ["@/app/blog/lib/types.ts"]
imports:         ["lucide-react",
                  "@/app/blog/lib/types",
                  "@/components/ui/button"]
exports:         ["BlockTypeMenu", "BlockTypeMenuProps"]
useBy:           ["@/app/blog/components/block-editor/BlockEditor.tsx"]

userStories:     ["us1100007"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : onClick handler interactif.

import {
  Code2,
  FileText,
  Film,
  ImageIcon,
  Link2,
  ListTree,
  Music,
  Paperclip,
  type LucideIcon,
} from "lucide-react";

import type { ContentBlockType } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";

interface BlockTypeEntry {
  readonly type: ContentBlockType;
  readonly label: string;
  readonly icon: LucideIcon;
}

const BLOCK_TYPES: readonly BlockTypeEntry[] = [
  { type: "section", label: "Section", icon: ListTree },
  { type: "paragraph", label: "Paragraphe", icon: FileText },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Vidéo", icon: Film },
  { type: "audio", label: "Audio", icon: Music },
  { type: "code", label: "Code", icon: Code2 },
  { type: "embed", label: "Embed", icon: Link2 },
  { type: "document", label: "Document", icon: Paperclip },
];

export interface BlockTypeMenuProps {
  readonly onPick: (type: ContentBlockType) => void;
  readonly disabledTypes?: readonly ContentBlockType[];
}

export function BlockTypeMenu({
  onPick,
  disabledTypes = [],
}: BlockTypeMenuProps) {
  const disabled = new Set(disabledTypes);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {BLOCK_TYPES.map(({ type, label, icon: Icon }) => {
        const isDisabled = disabled.has(type);
        return (
          <Button
            key={type}
            type="button"
            variant="outline"
            onClick={() => onPick(type)}
            disabled={isDisabled}
            className="h-auto flex-col gap-1.5 py-3"
          >
            <Icon className="size-5" aria-hidden />
            <span className="text-xs">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
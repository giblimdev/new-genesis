/*
path :           app/blog/components/block-editor/forms/SectionBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "section"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'édition/création d'un bloc section
                 (conteneur hiérarchique). Un seul champ : le titre
                 (requis, max 200 caractères), qui devient l'ancre
                 #id et la ligne de TOC. Client Component minimaliste :
                 useState contrôlé, pas de react-hook-form pour rester
                 sous 100 lignes.

flow:            Client → useState(title) → submit → onSubmit({ type:
                 "section", title: trim }) → le parent (BlockEditor)
                 fusionne avec les champs de base (id, parentId, order,
                 createdAt, updatedAt).

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
imports:         ["react",
                  "@/app/blog/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/input",
                  "@/components/ui/field"]
exports:         ["SectionBlockForm", "SectionBlockFormProps",
                  "SectionBlockPayload"]
useBy:           ["@/app/blog/components/block-editor/BlockEditor.tsx"]

userStories:     ["us1100007"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, interactions formulaire.

import { useState } from "react";

import type { SectionBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type SectionBlockPayload = Omit<
  SectionBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface SectionBlockFormProps {
  readonly initial?: SectionBlock;
  readonly onSubmit: (payload: SectionBlockPayload) => void;
  readonly onCancel: () => void;
}

export function SectionBlockForm({
  initial,
  onSubmit,
  onCancel,
}: SectionBlockFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ type: "section", title: title.trim() });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="section-title">Titre de la section</FieldLabel>
        <Input
          id="section-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex. Introduction"
          required
          maxLength={200}
        />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
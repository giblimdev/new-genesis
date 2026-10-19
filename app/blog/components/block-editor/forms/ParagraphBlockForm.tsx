/*
path :           app/blog/components/block-editor/forms/ParagraphBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "paragraph"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'édition/création d'un bloc paragraph.
                 Un seul champ : le texte (requis, pas de Markdown,
                 pas de HTML). Le compteur de mots est affiché en
                 direct pour donner un ordre d'idée au rédacteur.

flow:            Client → useState(text) → submit → onSubmit({ type:
                 "paragraph", text: trim }).

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

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/utils/reading-time.ts"]
imports:         ["react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/utils/reading-time",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/textarea"]
exports:         ["ParagraphBlockForm", "ParagraphBlockFormProps",
                  "ParagraphBlockPayload"]
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

import type { ParagraphBlock } from "@/app/blog/lib/types";
import { countWords } from "@/app/blog/lib/utils/reading-time";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export type ParagraphBlockPayload = Omit<
  ParagraphBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface ParagraphBlockFormProps {
  readonly initial?: ParagraphBlock;
  readonly onSubmit: (payload: ParagraphBlockPayload) => void;
  readonly onCancel: () => void;
}

export function ParagraphBlockForm({
  initial,
  onSubmit,
  onCancel,
}: ParagraphBlockFormProps) {
  const [text, setText] = useState(initial?.text ?? "");
  const words = countWords(text);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ type: "paragraph", text: text.trim() });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="paragraph-text">Texte</FieldLabel>
        <Textarea
          id="paragraph-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Écrivez votre paragraphe. Pas de Markdown, pas de HTML."
          rows={8}
          required
          className="min-h-[160px]"
        />
        <p className="text-xs text-muted-foreground">
          {words} mot{words > 1 ? "s" : ""}
        </p>
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!text.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
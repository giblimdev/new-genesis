/*
path :           app/blog/components/block-editor/forms/CodeBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "code"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'un bloc code. Champs : language (requis),
                 code (requis, textarea mono), caption (opt). Le rendu
                 public colore le code via Shiki (ContentBlockRenderer).

flow:            Client → useState → submit → onSubmit({ type: "code",
                 language: trim().toLowerCase(), code, caption? }).

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
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]
exports:         ["CodeBlockForm", "CodeBlockFormProps",
                  "CodeBlockPayload"]
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

import type { CodeBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CodeBlockPayload = Omit<
  CodeBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface CodeBlockFormProps {
  readonly initial?: CodeBlock;
  readonly onSubmit: (payload: CodeBlockPayload) => void;
  readonly onCancel: () => void;
}

export function CodeBlockForm({
  initial,
  onSubmit,
  onCancel,
}: CodeBlockFormProps) {
  const [language, setLanguage] = useState(initial?.language ?? "ts");
  const [code, setCode] = useState(initial?.code ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: "code",
          language: language.trim().toLowerCase(),
          code,
          caption: caption.trim() || undefined,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="code-language">Langage</FieldLabel>
          <Input
            id="code-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="ts, tsx, bash, json…"
            required
            maxLength={50}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="code-caption">
            Légende (optionnel)
          </FieldLabel>
          <Input
            id="code-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={200}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="code-content">Code</FieldLabel>
        <Textarea
          id="code-content"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          rows={10}
          required
          className="min-h-[200px] font-mono text-xs"
          spellCheck={false}
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!code.trim() || !language.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
/*
path :           app/blog/components/block-editor/forms/EmbedBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "embed"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'un bloc embed (iframe contrôlée). Champs :
                 url (requis, validée par z.url()), provider (select
                 youtube/vimeo/codesandbox/twitter/other), caption (opt).
                 Les domaines autorisés par provider sont définis dans
                 le renderer (défense en profondeur) — ce formulaire ne
                 fait que la validation de forme.

flow:            Client → useState → submit → onSubmit({ type:
                 "embed", url: trim, provider, caption? }).

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
                  "@/components/ui/native-select"]
exports:         ["EmbedBlockForm", "EmbedBlockFormProps",
                  "EmbedBlockPayload"]
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

import type { EmbedBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type EmbedProvider = EmbedBlock["provider"];

export type EmbedBlockPayload = Omit<
  EmbedBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface EmbedBlockFormProps {
  readonly initial?: EmbedBlock;
  readonly onSubmit: (payload: EmbedBlockPayload) => void;
  readonly onCancel: () => void;
}

export function EmbedBlockForm({
  initial,
  onSubmit,
  onCancel,
}: EmbedBlockFormProps) {
  const [url, setUrl] = useState(initial?.url ?? "");
  const [provider, setProvider] = useState<EmbedProvider>(
    initial?.provider ?? "youtube",
  );
  const [caption, setCaption] = useState(initial?.caption ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: "embed",
          url: url.trim(),
          provider,
          caption: caption.trim() || undefined,
        });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="embed-url">URL de l&apos;embed</FieldLabel>
        <Input
          id="embed-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="embed-provider">Fournisseur</FieldLabel>
          <NativeSelect
            id="embed-provider"
            value={provider}
            onChange={(event) =>
              setProvider(event.target.value as EmbedProvider)
            }
          >
            <NativeSelectOption value="youtube">YouTube</NativeSelectOption>
            <NativeSelectOption value="vimeo">Vimeo</NativeSelectOption>
            <NativeSelectOption value="codesandbox">
              CodeSandbox
            </NativeSelectOption>
            <NativeSelectOption value="twitter">X / Twitter</NativeSelectOption>
            <NativeSelectOption value="other">Autre</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="embed-caption">
            Légende (optionnel)
          </FieldLabel>
          <Input
            id="embed-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!url.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
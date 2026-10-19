/*
path :           app/blog/components/block-editor/forms/DocumentBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "document", "media"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'un bloc document. Champs : path (requis,
                 datalist), title (requis), mimeType (requis), sizeBytes
                 (requis, int). Le rendu public affiche un lien de
                 téléchargement via resolveMediaUrl.

flow:            Client → useState → submit → onSubmit({ type:
                 "document", path, title, mimeType, sizeBytes }).

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
                  "@/components/ui/input"]
exports:         ["DocumentBlockForm", "DocumentBlockFormProps",
                  "DocumentBlockPayload"]
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

import type { DocumentBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type DocumentBlockPayload = Omit<
  DocumentBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface DocumentBlockFormProps {
  readonly initial?: DocumentBlock;
  readonly mediaManifest: readonly string[];
  readonly onSubmit: (payload: DocumentBlockPayload) => void;
  readonly onCancel: () => void;
}

export function DocumentBlockForm({
  initial,
  mediaManifest,
  onSubmit,
  onCancel,
}: DocumentBlockFormProps) {
  const [path, setPath] = useState(initial?.path ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [mimeType, setMimeType] = useState(
    initial?.mimeType ?? "application/pdf",
  );
  const [sizeBytes, setSizeBytes] = useState(
    initial?.sizeBytes !== undefined ? String(initial.sizeBytes) : "",
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: "document",
          path: path.trim(),
          title: title.trim(),
          mimeType: mimeType.trim(),
          sizeBytes: Number(sizeBytes),
        });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="document-path">Chemin du fichier</FieldLabel>
        <Input
          id="document-path"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="ex. guide.pdf"
          list="document-block-manifest"
          required
        />
        <datalist id="document-block-manifest">
          {mediaManifest.map((file) => (
            <option key={file} value={file} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="document-title">Titre du document</FieldLabel>
          <Input
            id="document-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="document-mime">Type MIME</FieldLabel>
          <Input
            id="document-mime"
            value={mimeType}
            onChange={(event) => setMimeType(event.target.value)}
            placeholder="application/pdf"
            required
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="document-size">Taille (octets)</FieldLabel>
        <Input
          id="document-size"
          type="number"
          inputMode="numeric"
          value={sizeBytes}
          onChange={(event) => setSizeBytes(event.target.value)}
          min={1}
          required
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={
            !path.trim() || !title.trim() || !mimeType.trim() || !sizeBytes
          }
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
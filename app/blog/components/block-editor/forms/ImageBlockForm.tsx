/*
path :           app/blog/components/block-editor/forms/ImageBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "image", "media"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'un bloc image. Champs : path (requis,
                 datalist mediaManifest), alt (requis, accessibilité),
                 caption (opt), credit (opt), width/height (opt int).
                 Le datalist permet l'autocomplétion sur les fichiers
                 présents dans /public/blog/ sans restreindre la saisie
                 manuelle (démos futures, chemins distants en prod).

flow:            Client → useState pour chaque champ → submit →
                 onSubmit({ type: "image", path, alt, caption?,
                 credit?, width?, height? }). Les nombres vides sont
                 filtrés (undefined).

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
                  "@/app/blog/lib/media.ts"]
imports:         ["react",
                  "@/app/blog/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input"]
exports:         ["ImageBlockForm", "ImageBlockFormProps",
                  "ImageBlockPayload"]
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

import type { ImageBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ImageBlockPayload = Omit<
  ImageBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface ImageBlockFormProps {
  readonly initial?: ImageBlock;
  readonly mediaManifest: readonly string[];
  readonly onSubmit: (payload: ImageBlockPayload) => void;
  readonly onCancel: () => void;
}

export function ImageBlockForm({
  initial,
  mediaManifest,
  onSubmit,
  onCancel,
}: ImageBlockFormProps) {
  const [path, setPath] = useState(initial?.path ?? "");
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [credit, setCredit] = useState(initial?.credit ?? "");
  const [width, setWidth] = useState(
    initial?.width !== undefined ? String(initial.width) : "",
  );
  const [height, setHeight] = useState(
    initial?.height !== undefined ? String(initial.height) : "",
  );

  const datalistId = "image-block-manifest";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: "image",
          path: path.trim(),
          alt: alt.trim(),
          caption: caption.trim() || undefined,
          credit: credit.trim() || undefined,
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
        });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="image-path">Chemin du fichier</FieldLabel>
        <Input
          id="image-path"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="ex. mon-image.jpg"
          list={datalistId}
          required
        />
        <datalist id={datalistId}>
          {mediaManifest.map((file) => (
            <option key={file} value={file} />
          ))}
        </datalist>
      </Field>

      <Field>
        <FieldLabel htmlFor="image-alt">
          Texte alternatif (accessibilité)
        </FieldLabel>
        <Input
          id="image-alt"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder="Décrivez l'image en une phrase"
          required
          maxLength={300}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="image-caption">Légende (optionnel)</FieldLabel>
          <Input
            id="image-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="image-credit">Crédit (optionnel)</FieldLabel>
          <Input
            id="image-credit"
            value={credit}
            onChange={(event) => setCredit(event.target.value)}
            maxLength={200}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="image-width">Largeur (px)</FieldLabel>
          <Input
            id="image-width"
            type="number"
            inputMode="numeric"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            min={1}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="image-height">Hauteur (px)</FieldLabel>
          <Input
            id="image-height"
            type="number"
            inputMode="numeric"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            min={1}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!path.trim() || !alt.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
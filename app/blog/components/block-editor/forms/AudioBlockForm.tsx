/*
path :           app/blog/components/block-editor/forms/AudioBlockForm.tsx
tag :            ["blog", "component", "block-editor", "form", "audio", "media"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'un bloc audio. Champs : path (requis,
                 datalist), caption (opt), durationSec (opt int).

flow:            Client → useState → submit → onSubmit({ type: "audio",
                 path, caption?, durationSec? }).

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
exports:         ["AudioBlockForm", "AudioBlockFormProps",
                  "AudioBlockPayload"]
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

import type { AudioBlock } from "@/app/blog/lib/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type AudioBlockPayload = Omit<
  AudioBlock,
  "id" | "parentId" | "order" | "createdAt" | "updatedAt"
>;

export interface AudioBlockFormProps {
  readonly initial?: AudioBlock;
  readonly mediaManifest: readonly string[];
  readonly onSubmit: (payload: AudioBlockPayload) => void;
  readonly onCancel: () => void;
}

export function AudioBlockForm({
  initial,
  mediaManifest,
  onSubmit,
  onCancel,
}: AudioBlockFormProps) {
  const [path, setPath] = useState(initial?.path ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [duration, setDuration] = useState(
    initial?.durationSec !== undefined ? String(initial.durationSec) : "",
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: "audio",
          path: path.trim(),
          caption: caption.trim() || undefined,
          durationSec: duration ? Number(duration) : undefined,
        });
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="audio-path">Chemin de l&apos;audio</FieldLabel>
        <Input
          id="audio-path"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="ex. interview.mp3"
          list="audio-block-manifest"
          required
        />
        <datalist id="audio-block-manifest">
          {mediaManifest.map((file) => (
            <option key={file} value={file} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="audio-caption">Légende (optionnel)</FieldLabel>
          <Input
            id="audio-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="audio-duration">
            Durée (secondes, optionnel)
          </FieldLabel>
          <Input
            id="audio-duration"
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            min={1}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!path.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
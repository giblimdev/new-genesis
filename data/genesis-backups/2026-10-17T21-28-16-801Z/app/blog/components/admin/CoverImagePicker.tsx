/*
path :           app/blog/components/admin/CoverImagePicker.tsx
tag :            ["blog", "admin", "form", "cover", "upload", "paste", "client"]
projectId:       new-genesis
type :           component
generic:         false

role:            Sélecteur de couverture pour ArticleForm. Remplace
                 l'ancien <Input> + <datalist>. Permet de choisir un
                 fichier (clic ou drag & drop), de coller une image
                 (Ctrl+V), de prévisualiser et de retirer la couverture.
                 N'UPLOAD PAS lui-même : il retourne le File au parent
                 via onFileSelected, et affiche une preview locale via
                 URL.createObjectURL. L'upload est déclenché par le
                 parent au submit (flux "upload différé" pour éviter
                 les orphelins en cas d'annulation).

flow:            Props { value: string; localFile: File | null;
                 onFileSelected(file); onRemove(); } →
                   - drop zone : onDrop / clic → <input type=file hidden>
                   - onPaste sur le container (focus requis)
                   - sur fichier reçu : validation MIME + taille côté
                     client (feedback immédiat) → onFileSelected(file)
                   - preview : localFile ? blob URL : value ? /blog/…
                   - bouton "Retirer" → onRemove()

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/CoverImagePicker.tsx",
                   "@/app/blog/lib/uploads/actions.ts",
                   "@/app/blog/lib/uploads/storage.ts",
                   "@/app/blog/lib/uploads/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/components/admin/ArticleForm.tsx",
                  "@/app/blog/lib/uploads/validations.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/blog/lib/uploads/validations",
                  "@/components/ui/button"]

exports:         ["CoverImagePicker", "CoverImagePickerProps"]

useBy:           ["@/app/blog/components/admin/ArticleForm.tsx"]

userStories:     ["us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, drag&drop, clipboard, URL.createObjectURL, toast.

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  ALLOWED_IMAGE_MIME,
  MAX_UPLOAD_BYTES,
} from "@/app/blog/lib/uploads/validations";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface CoverImagePickerProps {
  /** Chemin relatif stocké dans coverImage (ex. "articles/2026/x.jpg"). */
  readonly value: string;
  /** Fichier local en attente d'upload (upload différé). */
  readonly localFile: File | null;
  /** Callback : nouveau fichier sélectionné (pas encore uploadé). */
  readonly onFileSelected: (file: File) => void;
  /** Callback : suppression de la couverture courante. */
  readonly onRemove: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function publicUrl(relativePath: string): string {
  return `/blog/${relativePath}`;
}

function isAllowedMime(type: string): boolean {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(type);
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function CoverImagePicker({
  value,
  localFile,
  onFileSelected,
  onRemove,
}: CoverImagePickerProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* Preview locale : blob URL pour localFile, sinon chemin serveur. */
  useEffect(() => {
    if (!localFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(localFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const displayUrl = previewUrl ?? (value ? publicUrl(value) : null);
  const showPreview = displayUrl !== null;

  function validateAndSelect(file: File) {
    if (!isAllowedMime(file.type)) {
      toast.error("Format non supporté (JPEG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Image trop lourde (max 5 Mo).");
      return;
    }
    onFileSelected(file);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) validateAndSelect(file);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(event.clipboardData.items).find((i) =>
      i.type.startsWith("image/"),
    );
    if (!item) return;
    const file = item.getAsFile();
    if (file) validateAndSelect(file);
  }

  /* ------------------------------------------------------------------ */
  /*  Rendu                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_IMAGE_MIME.join(",")}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label="Choisir une image de couverture"
      />

      {showPreview ? (
        /* -------- Aperçu (locale ou serveur) -------- */
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-3 sm:flex-row sm:items-center">
          <img
            src={displayUrl!}
            alt="Aperçu de la couverture"
            className="h-24 w-full rounded-lg object-cover sm:w-40"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-mono text-xs text-muted-foreground">
              {localFile
                ? `Nouveau fichier : ${localFile.name} (pas encore enregistré)`
                : `/blog/${value}`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload className="size-3.5" aria-hidden />
                Remplacer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Retirer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* -------- Drop zone -------- */
        <div
          role="button"
          tabIndex={0}
          aria-label="Déposer, coller ou choisir une image de couverture"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isDragging
              ? "border-chart-1 bg-chart-1/5"
              : "border-border/60 bg-muted/10 hover:bg-muted/20"
          }`}
        >
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Déposer une image, coller (Ctrl+V) ou cliquer
          </p>
          <p className="text-[11px] text-muted-foreground">
            JPEG, PNG, WebP, GIF — max 5 Mo
          </p>
        </div>
      )}
    </div>
  );
}
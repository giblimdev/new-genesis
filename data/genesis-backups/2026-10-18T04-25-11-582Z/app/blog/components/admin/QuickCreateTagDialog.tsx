/*
path :           app/blog/components/admin/QuickCreateTagDialog.tsx
tag :            ["blog", "admin", "form", "taxonomy", "tag", "quick-create", "dialog", "client"]
projectId:       new-genesis
type :           component
generic:         false

role:            Dialog de création rapide d'un tag depuis ArticleForm.
                 Évite un aller-retour vers /blog/admin/taxonomy quand
                 l'utilisateur a besoin d'un tag qui n'existe pas
                 encore. Appelle createTagAction puis onCreated(id)
                 pour que le parent coche automatiquement le nouveau
                 tag et rafraîchisse la liste.

flow:            Props { open, onOpenChange, onCreated } →
                   - useState(name, isPending)
                   - submit → createTagAction({name})
                   - succès : toast + onCreated(id) + onOpenChange(false)
                   - erreur : toast.error (ex. tag existant)

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/CoverImagePicker.tsx",
                   "@/app/blog/components/admin/QuickCreateCategoryDialog.tsx",
                   "@/app/blog/components/admin/QuickCreateTagDialog.tsx",
                   "@/app/blog/components/admin/articleDraft.ts",
                 ]

relatedFiles:    ["@/app/blog/components/admin/ArticleForm.tsx",
                  "@/app/blog/lib/actions/taxonomy.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/blog/lib/actions/taxonomy",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/field",
                  "@/components/ui/input"]

exports:         ["QuickCreateTagDialog", "QuickCreateTagDialogProps"]

useBy:           ["@/app/blog/components/admin/ArticleForm.tsx"]

userStories:     ["us1100004", "us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useTransition, Dialog, toast.

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createTagAction } from "@/app/blog/lib/actions/taxonomy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface QuickCreateTagDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function QuickCreateTagDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateTagDialogProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      toast.error("Le nom est requis.");
      return;
    }

    startTransition(async () => {
      const result = await createTagAction({ name: trimmed });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tag créé.");
      onCreated(result.data.id);
      setName("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau tag</DialogTitle>
          <DialogDescription>
            Ajouté à la liste, sans quitter le formulaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="quick-tag-name">Nom</FieldLabel>
            <Input
              id="quick-tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={40}
              autoFocus
              disabled={isPending}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

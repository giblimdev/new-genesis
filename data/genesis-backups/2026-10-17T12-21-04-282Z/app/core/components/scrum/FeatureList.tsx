/*
path :           app/core/components/scrum/FeatureList.tsx
tag :            ["scrum", "feature", "list", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des features d'un flux Scrum. Gère l'état local (dialog de
                 création, dialog d'édition, confirmation de suppression). Délègue
                 les mutations aux Server Actions. Grille responsive 1 / 2 / 3 / 4
                 colonnes (mobile / sm / md / lg) — calibrée pour le layout Help
                 (max-w-7xl → 1216px de contenu utile, xl:1280px inatteignable).

flow:            Reçoit flow + features (server) → useState pour éditer/créer →
                 FeatureForm dans un Dialog → submit → Server Action → toast →
                 router.refresh().

ecosystem:       ScrumUI = [
                   "@/app/core/components/scrum/EpicCard.tsx",
                   "@/app/core/components/scrum/EpicForm.tsx",
                   "@/app/core/components/scrum/EpicList.tsx",
                   "@/app/core/components/scrum/FeatureCard.tsx",
                   "@/app/core/components/scrum/FeatureForm.tsx",
                   "@/app/core/components/scrum/FeatureList.tsx",
                   "@/app/core/components/scrum/FlowSelector.tsx",
                   "@/app/core/components/scrum/GlobalJsonExport.tsx",
                   "@/app/core/components/scrum/IdeeCard.tsx",
                   "@/app/core/components/scrum/IdeeForm.tsx",
                   "@/app/core/components/scrum/IdeeList.tsx",
                   "@/app/core/components/scrum/PersonaCard.tsx",
                   "@/app/core/components/scrum/PersonaForm.tsx",
                   "@/app/core/components/scrum/PersonaList.tsx",
                   "@/app/core/components/scrum/ScrumNav.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/FeatureCard.tsx",
                  "@/app/core/components/scrum/FeatureForm.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/feature.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/feature",
                  "@/app/core/components/scrum/FeatureCard",
                  "@/app/core/components/scrum/FeatureForm",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["FeatureList", "FeatureListProps"]

useBy:           ["@/app/core/[flow]/feature/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister et gérer les features Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs), router.refresh, toast.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { Feature, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createFeatureAction,
  deleteFeatureAction,
  updateFeatureAction,
} from "@/app/core/lib/scrum/actions/feature";
import { FeatureCard } from "@/app/core/components/scrum/FeatureCard";
import { FeatureForm } from "@/app/core/components/scrum/FeatureForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface FeatureListProps {
  readonly flow: ScrumFlow;
  readonly features: readonly Feature[];
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function FeatureList({ flow, features }: FeatureListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [deleting, setDeleting] = useState<Feature | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createFeatureAction(flow, formData);
    setPending(false);

    if (result.ok) {
      toast.success("Feature créée.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updateFeatureAction(flow, editing.id, formData);
    setPending(false);

    if (result.ok) {
      toast.success("Feature mise à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deleteFeatureAction(flow, deleting.id);
    setPending(false);

    if (result.ok) {
      toast.success("Feature supprimée.");
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Features
          </h2>
          <p className="text-sm text-muted-foreground">
            {features.length} feature{features.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouvelle feature
        </Button>
      </div>

      {features.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-2/10 text-chart-2">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucune feature pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Explorez le problème et listez les features candidates issues du
            brainstorming.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="size-4" aria-hidden />
            Créer la première feature
          </Button>
        </div>
      )}

      {features.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle feature</DialogTitle>
            <DialogDescription>
              Décrivez la feature, son intérêt et les personas associés.
            </DialogDescription>
          </DialogHeader>
          <FeatureForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Éditer la feature</DialogTitle>
            <DialogDescription>
              Mettez à jour la description, l&apos;intérêt ou les personas.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <FeatureForm
              defaultValues={editing}
              onSubmit={handleUpdate}
              pending={pending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette feature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. La feature « {deleting?.title} »
              sera retirée du flux {flow}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
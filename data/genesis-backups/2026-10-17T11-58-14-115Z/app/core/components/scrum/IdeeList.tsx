/*
path :           app/core/components/scrum/IdeeList.tsx
tag :            ["scrum", "idee", "list", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des idées d'un flux Scrum. Gère l'état local (dialog de
                 lecture, dialog de création, dialog d'édition, confirmation de
                 suppression). Délègue les mutations aux Server Actions.
                 Les DialogContent utilisent `sm:max-w-2xl` (et non
                 `max-w-2xl`) pour contourner le `sm:max-w-sm` par défaut,
                 plus `max-h-[90vh]` + `grid-rows` pour rendre le contenu
                 scrollable.

flow:            Reçoit flow + idees (server) → useState pour lire / éditer /
                 créer / supprimer → IdeeDetailDialog (lecture) +
                 IdeeForm (création/édition) dans Dialog → submit →
                 Server Action → toast → router.refresh().

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
                   "@/app/core/components/scrum/IdeeDetailDialog.tsx",
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

relatedFiles:    ["@/app/core/components/scrum/IdeeCard.tsx",
                  "@/app/core/components/scrum/IdeeDetailDialog.tsx",
                  "@/app/core/components/scrum/IdeeForm.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/idee.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/idee",
                  "@/app/core/components/scrum/IdeeCard",
                  "@/app/core/components/scrum/IdeeDetailDialog",
                  "@/app/core/components/scrum/IdeeForm",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["IdeeList", "IdeeListProps"]

useBy:           ["@/app/core/[flow]/idee/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister, lire et gérer les idées Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs), router.refresh, toast.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Plus } from "lucide-react";
import { toast } from "sonner";

import type { Idee, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  createIdeeAction,
  deleteIdeeAction,
  updateIdeeAction,
} from "@/app/core/lib/scrum/actions/idee";
import { IdeeCard } from "@/app/core/components/scrum/IdeeCard";
import { IdeeDetailDialog } from "@/app/core/components/scrum/IdeeDetailDialog";
import { IdeeForm } from "@/app/core/components/scrum/IdeeForm";
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

export interface IdeeListProps {
  readonly flow: ScrumFlow;
  readonly idees: readonly Idee[];
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function IdeeList({ flow, idees }: IdeeListProps) {
  const router = useRouter();
  const [reading, setReading] = useState<Idee | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Idee | null>(null);
  const [deleting, setDeleting] = useState<Idee | null>(null);
  const [pending, setPending] = useState(false);

  /* --- Création --- */
  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createIdeeAction(flow, formData);
    setPending(false);

    if (result.ok) {
      toast.success("Idée créée.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  /* --- Édition --- */
  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updateIdeeAction(flow, editing.id, formData);
    setPending(false);

    if (result.ok) {
      toast.success("Idée mise à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  /* --- Suppression --- */
  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deleteIdeeAction(flow, deleting.id);
    setPending(false);

    if (result.ok) {
      toast.success("Idée supprimée.");
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête de liste */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Idées
          </h2>
          <p className="text-sm text-muted-foreground">
            {idees.length} idée{idees.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouvelle idée
        </Button>
      </div>

      {/* État vide */}
      {idees.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-1/10 text-chart-1">
            <Lightbulb className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucune idée pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Commencez par formuler un problème à résoudre. C&apos;est la
            première étape du flux Scrum.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="size-4" aria-hidden />
            Créer la première idée
          </Button>
        </div>
      )}

      {/* Grille des cartes */}
      {idees.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {idees.map((idee) => (
            <IdeeCard
              key={idee.id}
              idee={idee}
              onRead={setReading}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Dialog lecture */}
      <IdeeDetailDialog
        idee={reading}
        open={reading !== null}
        onOpenChange={(open) => !open && setReading(null)}
      />

      {/* Dialog création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="grid-rows-[auto_minmax(0,1fr)] max-h-[90vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle idée</DialogTitle>
            <DialogDescription>
              Formulez le problème à résoudre, pas la solution.
            </DialogDescription>
          </DialogHeader>
          <IdeeForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      {/* Dialog édition */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="grid-rows-[auto_minmax(0,1fr)] max-h-[90vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Éditer l&apos;idée</DialogTitle>
            <DialogDescription>
              Mettez à jour le problème, les hypothèses ou le contexte.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <IdeeForm
              defaultValues={editing}
              onSubmit={handleUpdate}
              pending={pending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette idée ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L&apos;idée « {deleting?.title} »
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
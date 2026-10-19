/*
path :           app/core/components/scrum/SprintList.tsx
tag :            ["scrum", "sprint", "list", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des sprints d'un flux Scrum. Gère l'état local (dialogs) et
                 délègue les mutations aux Server Actions. Reçoit les user stories
                 du flux pour résoudre sprint.storyIds → UserStory[] une seule fois
                 (Map) et les propager à chaque SprintCard. Grille responsive
                 1 / 2 / 3 / 4 colonnes (mobile / sm / md / lg).

flow:            Reçoit flow + sprints + userStories (server) → construit
                 Map<storyId, UserStory> → useState → SprintForm dans un Dialog
                 → submit → Server Action → toast → router.refresh().

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

relatedFiles:    ["@/app/core/components/scrum/SprintCard.tsx",
                  "@/app/core/components/scrum/SprintForm.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/sprint.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/sprint",
                  "@/app/core/components/scrum/SprintCard",
                  "@/app/core/components/scrum/SprintForm",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["SprintList", "SprintListProps"]

useBy:           ["@/app/core/[flow]/sprint/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister et gérer les sprints Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs), router.refresh, toast.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Rocket } from "lucide-react";
import { toast } from "sonner";

import type { ScrumFlow, Sprint, UserStory } from "@/app/core/lib/scrum/types";
import {
  createSprintAction,
  deleteSprintAction,
  updateSprintAction,
} from "@/app/core/lib/scrum/actions/sprint";
import { SprintCard } from "@/app/core/components/scrum/SprintCard";
import { SprintForm } from "@/app/core/components/scrum/SprintForm";
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

export interface SprintListProps {
  readonly flow: ScrumFlow;
  readonly sprints: readonly Sprint[];
  readonly userStories: readonly UserStory[];
}

export function SprintList({ flow, sprints, userStories }: SprintListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Sprint | null>(null);
  const [deleting, setDeleting] = useState<Sprint | null>(null);
  const [pending, setPending] = useState(false);

  // Résolution storyId → UserStory en O(1), construite une seule fois par rendu.
  const storyById = new Map<string, UserStory>(
    userStories.map((story) => [story.id, story]),
  );

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createSprintAction(flow, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Sprint créé.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updateSprintAction(flow, editing.id, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Sprint mis à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deleteSprintAction(flow, deleting.id);
    setPending(false);
    if (result.ok) {
      toast.success("Sprint supprimé.");
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
            Sprints
          </h2>
          <p className="text-sm text-muted-foreground">
            {sprints.length} sprint{sprints.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouveau sprint
        </Button>
      </div>

      {sprints.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-1/10 text-chart-1">
            <Rocket className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucun sprint pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Décidez quoi faire, quand et pourquoi. Définissez votre premier
            incrément.
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)} className="mt-2">
            <Plus className="size-4" aria-hidden />
            Créer le premier sprint
          </Button>
        </div>
      )}

      {sprints.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sprints.map((sprint) => {
            const resolvedStories = sprint.storyIds
              .map((id) => storyById.get(id))
              .filter((s): s is UserStory => s !== undefined);
            return (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                stories={resolvedStories}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau sprint</DialogTitle>
            <DialogDescription>
              Décrivez l&apos;objectif du sprint et les user stories incluses.
            </DialogDescription>
          </DialogHeader>
          <SprintForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Éditer le sprint</DialogTitle>
            <DialogDescription>
              Mettez à jour l&apos;objectif, les user stories ou les dates.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <SprintForm
              defaultValues={editing}
              onSubmit={handleUpdate}
              pending={pending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce sprint ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le sprint « {deleting?.name} » sera
              retiré du flux {flow}.
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
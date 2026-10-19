/*
path :           app/core/components/scrum/UserStoryList.tsx
tag :            ["scrum", "user-story", "list", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des user stories d'un flux Scrum. Gère l'état local (dialogs)
                 et délègue les mutations aux Server Actions. Reçoit les epics du
                 flux pour résoudre epicId → epic.name une seule fois (Map) et le
                 propager à chaque carte. Grille responsive 1 / 2 / 3 / 4 colonnes
                 (mobile / sm / md / lg) — calibrée pour le layout Help
                 (max-w-7xl → 1216px de contenu utile, xl:1280px inatteignable).

flow:            Reçoit flow + stories + epics (server) → construit
                 Map<epicId, epicName> → useState → UserStoryForm dans un Dialog
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

relatedFiles:    ["@/app/core/components/scrum/UserStoryCard.tsx",
                  "@/app/core/components/scrum/UserStoryForm.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/user-story.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/user-story",
                  "@/app/core/components/scrum/UserStoryCard",
                  "@/app/core/components/scrum/UserStoryForm",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["UserStoryList", "UserStoryListProps"]

useBy:           ["@/app/core/[flow]/user-story/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister et gérer les user stories Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs), router.refresh, toast.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";

import type { Epic, ScrumFlow, UserStory } from "@/app/core/lib/scrum/types";
import {
  createUserStoryAction,
  deleteUserStoryAction,
  updateUserStoryAction,
} from "@/app/core/lib/scrum/actions/user-story";
import { UserStoryCard } from "@/app/core/components/scrum/UserStoryCard";
import { UserStoryForm } from "@/app/core/components/scrum/UserStoryForm";
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

export interface UserStoryListProps {
  readonly flow: ScrumFlow;
  readonly stories: readonly UserStory[];
  readonly epics: readonly Epic[];
}

export function UserStoryList({ flow, stories, epics }: UserStoryListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserStory | null>(null);
  const [deleting, setDeleting] = useState<UserStory | null>(null);
  const [pending, setPending] = useState(false);

  // Résolution epicId → epic.name en O(1), construite une seule fois par rendu.
  const epicNames = new Map<string, string>(
    epics.map((epic) => [epic.id, epic.name]),
  );

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createUserStoryAction(flow, formData);
    setPending(false);
    if (result.ok) {
      toast.success("User story créée.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updateUserStoryAction(flow, editing.id, formData);
    setPending(false);
    if (result.ok) {
      toast.success("User story mise à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deleteUserStoryAction(flow, deleting.id);
    setPending(false);
    if (result.ok) {
      toast.success("User story supprimée.");
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
            User stories
          </h2>
          <p className="text-sm text-muted-foreground">
            {stories.length} user stor{stories.length > 1 ? "ies" : "y"}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouvelle user story
        </Button>
      </div>

      {stories.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-5/10 text-chart-5">
            <ListChecks className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucune user story pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Découpez les epics en incréments développables et testables.
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)} className="mt-2">
            <Plus className="size-4" aria-hidden />
            Créer la première user story
          </Button>
        </div>
      )}

      {stories.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stories.map((story) => (
            <UserStoryCard
              key={story.id}
              story={story}
              epicName={
                story.epicId ? epicNames.get(story.epicId) : undefined
              }
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle user story</DialogTitle>
            <DialogDescription>
              Rédigez le récit, les critères d&apos;acceptation et l&apos;estimation.
            </DialogDescription>
          </DialogHeader>
          <UserStoryForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Éditer la user story</DialogTitle>
            <DialogDescription>
              Mettez à jour le récit, les critères ou l&apos;estimation.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <UserStoryForm
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
            <AlertDialogTitle>Supprimer cette user story ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. La user story « {deleting?.title} »
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
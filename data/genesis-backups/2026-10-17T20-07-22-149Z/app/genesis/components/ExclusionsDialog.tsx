/*
path :           app/genesis/components/ExclusionsDialog.tsx
tag :            ["genesis", "exclusions", "dialog", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Dialog de gestion des exclusions. Affiche la liste courante
                 dans un Textarea (une entrée par ligne). Bouton Enregistrer →
                 setExclusionsAction → toast → onSaved(). Bouton Réinitialiser
                 → restaure DEFAULT_EXCLUSIONS. Bouton Annuler → ferme sans
                 écrire. Validation côté serveur via Zod.

flow:            Reçoit open + onOpenChange + exclusions courantes →
                 useState draft → Enregistrer → setExclusionsAction(draft) →
                 toast succès/erreur → si succès, onSaved() (pour refresh) et
                 ferme.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "sonner",
                  "@/app/genesis/actions/exclusions",
                  "@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/textarea"]

exports:         ["ExclusionsDialog", "ExclusionsDialogProps"]

useBy:           ["@/app/genesis/components/ReadFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer les exclusions dans une dialog"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (draft), useTransition, toast.

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setExclusionsAction } from "@/app/genesis/actions/exclusions";
import { DEFAULT_EXCLUSIONS } from "@/app/genesis/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface ExclusionsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly exclusions: readonly string[];
  readonly onSaved: () => void;
}

export function ExclusionsDialog({
  open,
  onOpenChange,
  exclusions,
  onSaved,
}: ExclusionsDialogProps) {
  const [draft, setDraft] = useState<string>(exclusions.join("\n"));
  const [isPending, startTransition] = useTransition();

  // À chaque (ré)ouverture, on réaligne le draft sur les exclusions courantes.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setDraft(exclusions.join("\n"));
    }
    onOpenChange(next);
  }

  function parseDraft(): string[] {
    return draft
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function handleReset() {
    setDraft(DEFAULT_EXCLUSIONS.join("\n"));
  }

  function handleSave() {
    const next = parseDraft();
    startTransition(async () => {
      const result = await setExclusionsAction(next);
      if (result.ok) {
        toast.success(`Exclusions enregistrées (${result.data.exclusions.length}).`);
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exclusions</DialogTitle>
          <DialogDescription>
            Une entrée par ligne. Un nom seul exclut un dossier/fichier
            (<code>node_modules</code>) ; un pattern <code>*.ext</code> exclut
            une extension (<code>*.png</code>).
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          rows={16}
          className="font-mono text-xs"
          aria-label="Liste des exclusions"
        />

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
          >
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
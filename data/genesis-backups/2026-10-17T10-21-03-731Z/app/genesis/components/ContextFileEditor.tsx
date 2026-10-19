/*
path :           app/genesis/components/ContextFileEditor.tsx
tag :            ["genesis", "copy-to-ia", "editor", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Éditeur d'un fichier de contexte (CONTRIBUTING.md,
                 prisma/schema.prisma, package.json). Affiche un en-tête avec
                 label + path + badge existant/absent, une checkbox "Inclure",
                 un Textarea éditable et un bouton Enregistrer (désactivé si
                 aucune modification). Bandeau "modifications non enregistrées"
                 tant que le contenu diffère de la valeur d'origine.

flow:            Reçoit file + checked + 3 callbacks (onToggleCheck,
                 onChangeContent, onSave) → useState(draft) initialisé au
                 contenu du fichier → à chaque frappe, draft change → bouton
                 Enregistrer activé si draft !== file.content → clic → onSave(id,
                 draft) → à la réponse ok, le parent met à jour file.content,
                 ce qui réaligne le badge dirty.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
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
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
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

relatedFiles:    ["@/app/genesis/components/CopyToIaPanel.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react",
                  "@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/checkbox",
                  "@/components/ui/textarea"]

exports:         ["ContextFileEditor", "ContextFileEditorProps"]

useBy:           ["@/app/genesis/components/CopyToIaPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer et sélectionner un fichier de contexte"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (draft), interactions (checkbox, boutons).

import { useState } from "react";
import { Check, Save } from "lucide-react";

import type { ContextFile } from "@/app/genesis/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export interface ContextFileEditorProps {
  readonly file: ContextFile;
  readonly checked: boolean;
  readonly saving: boolean;
  readonly onToggleCheck: (id: ContextFile["id"], checked: boolean) => void;
  readonly onSave: (id: ContextFile["id"], content: string) => void;
}

export function ContextFileEditor({
  file,
  checked,
  saving,
  onToggleCheck,
  onSave,
}: ContextFileEditorProps) {
  const [draft, setDraft] = useState(file.content);

  const dirty = draft !== file.content;

  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => onToggleCheck(file.id, value === true)}
            aria-label={`Inclure ${file.path}`}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {file.label}
            </h3>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {file.path}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              file.exists
                ? "bg-chart-2/10 text-chart-2"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {file.exists ? "existe" : "absent"}
          </span>
          {dirty && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-500">
              • non enregistré
            </span>
          )}
        </div>
      </header>

      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
        rows={12}
        aria-label={`Contenu de ${file.path}`}
        className="font-mono text-xs"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSave(file.id, draft)}
          disabled={!dirty || saving}
        >
          {saving ? (
            "Enregistrement…"
          ) : (
            <>
              <Save className="size-3.5" aria-hidden />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {checked && !dirty && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Check className="size-3" aria-hidden />
          Inclus dans le texte de sortie
        </p>
      )}
    </section>
  );
}
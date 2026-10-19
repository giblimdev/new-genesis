/*
path :           app/genesis/components/CopyToIaPanel.tsx
tag :            ["genesis", "copy-to-ia", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil copy-to-ia. Reçoit les 3 fichiers
                 initiaux du serveur, gère la sélection, le prompt libre,
                 les éditions, les sauvegardes et le texte final. Le texte
                 final est :
                 - initialisé à l'arrivée sur la page (assemblage des 3
                   fichiers pré-cochés + prompt vide)
                 - éditable directement par l'utilisateur
                 - reconstructible via le bouton Régénérer
                 - copiable dans le presse-papier (seul le JSON, ici du
                   Markdown, est copié — pas d'export fichier).

flow:            Reçoit files (server) → useState(files, selectedIds
                 initialisé aux 3 ids, prompt="", outputText initialisé à
                 assembleContext(files, ""), outputDirty=false, saving,
                 copied) → ContextFileEditor × 3 + prompt Textarea +
                 ContextOutput → à chaque save réussi, met à jour files[i]
                 (contenu + exists) → bouton Régénérer : outputText =
                 assembleContext(cochés, prompt) + dirty=false.

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

relatedFiles:    ["@/app/genesis/actions/context-files.ts",
                  "@/app/genesis/lib/context-files.ts",
                  "@/app/genesis/components/ContextFileEditor.tsx",
                  "@/app/genesis/components/ContextOutput.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/context-files",
                  "@/app/genesis/actions/context-files",
                  "@/app/genesis/components/ContextFileEditor",
                  "@/app/genesis/components/ContextOutput",
                  "@/components/ui/textarea"]

exports:         ["CopyToIaPanel", "CopyToIaPanelProps"]

useBy:           ["@/app/genesis/copy-to-ia/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux assembler et copier un contexte IA"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState, useTransition, navigator.clipboard, toast.

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { ContextFile, ContextFileId } from "@/app/genesis/lib/types";
import { assembleContext } from "@/app/genesis/lib/context-files";
import { saveContextFileAction } from "@/app/genesis/actions/context-files";
import { ContextFileEditor } from "@/app/genesis/components/ContextFileEditor";
import { ContextOutput } from "@/app/genesis/components/ContextOutput";
import { Textarea } from "@/components/ui/textarea";

export interface CopyToIaPanelProps {
  readonly initialFiles: readonly ContextFile[];
}

export function CopyToIaPanel({ initialFiles }: CopyToIaPanelProps) {
  const [files, setFiles] = useState<readonly ContextFile[]>(initialFiles);
  const [selectedIds, setSelectedIds] = useState<Set<ContextFileId>>(
    () => new Set(initialFiles.map((file) => file.id)),
  );
  const [prompt, setPrompt] = useState("");
  const [outputText, setOutputText] = useState(() =>
    assembleContext(initialFiles, ""),
  );
  const [outputDirty, setOutputDirty] = useState(false);
  const [savingId, setSavingId] = useState<ContextFileId | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  /* ------------------------- Sélection / prompt ------------------- */

  function handleToggleCheck(id: ContextFileId, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /* ---------------------------- Save fichier ---------------------- */

  function handleSaveFile(id: ContextFileId, content: string) {
    setSavingId(id);
    startTransition(async () => {
      const response = await saveContextFileAction(id, content);
      setSavingId(null);
      if (response.ok) {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === id
              ? { ...file, content, exists: true }
              : file,
          ),
        );
        toast.success("Fichier enregistré.");
      } else {
        toast.error(response.error);
      }
    });
  }

  /* ------------------------ Régénération texte -------------------- */

  function handleRegenerate() {
    const checked = files.filter((file) => selectedIds.has(file.id));
    const next = assembleContext(checked, prompt);
    setOutputText(next);
    setOutputDirty(false);
    toast.success("Texte régénéré.");
  }

  function handleOutputChange(value: string) {
    setOutputText(value);
    setOutputDirty(true);
  }

  /* ---------------------------- Copier ---------------------------- */

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success("Contexte copié dans le presse-papier.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le contexte.");
    }
  }

  /* ------------------------------ Rendu --------------------------- */

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-chart-2" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Prompt</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Instruction libre ajoutée en tête du texte (facultatif).
        </p>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          aria-label="Prompt libre"
          placeholder="Ex. Ajoute une page de contact en respectant les conventions du projet…"
          className="text-sm"
        />
      </section>

      <div className="space-y-3">
        {files.map((file) => (
          <ContextFileEditor
            key={file.id}
            file={file}
            checked={selectedIds.has(file.id)}
            saving={savingId === file.id}
            onToggleCheck={handleToggleCheck}
            onSave={handleSaveFile}
          />
        ))}
      </div>

      <ContextOutput
        value={outputText}
        dirty={outputDirty}
        copied={copied}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        onChange={handleOutputChange}
      />
    </div>
  );
}
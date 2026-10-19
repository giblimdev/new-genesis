/*
path :           app/genesis/components/ResultDialog.tsx
tag :            ["genesis", "result", "dialog", "export", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Dialog plein écran qui affiche le résultat d'une sélection
                 (ReadFilesResult). Un Select permet de basculer entre la vue
                 JSON (actif par défaut, copiable et sauvegardable) et la vue
                 Markdown (lecture seule). En-tête : compteur de fichiers +
                 taille totale + compteur de skipped + Select + boutons.
                 Le bloc <pre> occupe toute la hauteur restante (dialog fixé
                 à 85vh) avec scrollbar interne.

flow:            Reçoit result + open + onOpenChange → useState(view: "json" |
                 "md") → calcule jsonString (JSON.stringify 2 espaces) et
                 mdString (sections ## par fichier) → Select bascule la vue →
                 <pre> affiche la vue courante → boutons Copier / Sauvegarder
                 actifs seulement en mode json.

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

relatedFiles:    ["@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/read-files",
                  "@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/select"]

exports:         ["ResultDialog", "ResultDialogProps"]

useBy:           ["@/app/genesis/components/ReadFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux prévisualiser et exporter le JSON de ma sélection"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : navigator.clipboard, useTransition, toast, Select, useState.

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Save } from "lucide-react";
import { toast } from "sonner";

import { saveSelectionAction } from "@/app/genesis/actions/read-files";
import type { ReadFilesResult } from "@/app/genesis/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ResultDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly result: ReadFilesResult | null;
}

type ViewMode = "json" | "md";

/* ------------------------------------------------------------------ */
/*  Helpers purs                                                       */
/* ------------------------------------------------------------------ */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "ts",
    tsx: "tsx",
    js: "js",
    jsx: "jsx",
    json: "json",
    md: "md",
    css: "css",
    html: "html",
    yml: "yml",
    yaml: "yaml",
    prisma: "prisma",
  };
  return map[ext] ?? "text";
}

function buildMarkdown(result: ReadFilesResult): string {
  const lines: string[] = [];
  lines.push(
    `# Sélection — ${result.fileCount} fichier${result.fileCount > 1 ? "s" : ""} · ${formatSize(result.totalSize)}`,
  );
  lines.push("");
  for (const file of result.files) {
    lines.push(`## ${file.path}`);
    lines.push("");
    lines.push("```" + languageFromPath(file.path));
    lines.push(file.content);
    lines.push("```");
    lines.push("");
  }
  if (result.skipped.length > 0) {
    lines.push(`## Fichiers ignorés (${result.skipped.length})`);
    lines.push("");
    for (const skip of result.skipped) {
      lines.push(`- \`${skip.path}\` — ${skip.reason}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function ResultDialog({ open, onOpenChange, result }: ResultDialogProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<ViewMode>("json");
  const [isPending, startTransition] = useTransition();

  const jsonString = useMemo(
    () => (result ? JSON.stringify(result, null, 2) : ""),
    [result],
  );
  const mdString = useMemo(() => (result ? buildMarkdown(result) : ""), [result]);

  const displayed = view === "json" ? jsonString : mdString;
  const isJsonView = view === "json";

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("JSON copié dans le presse-papier.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le JSON.");
    }
  }

  function handleSave() {
    if (!result) return;
    startTransition(async () => {
      const response = await saveSelectionAction(jsonString);
      if (response.ok) {
        toast.success(`Sauvegardé : ${response.data}`);
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-6xl flex-col gap-3 p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>Sélection</DialogTitle>
          <DialogDescription>
            {result
              ? `${result.fileCount} fichier${result.fileCount > 1 ? "s" : ""} · ${formatSize(result.totalSize)}${result.skipped.length > 0 ? ` · ${result.skipped.length} ignoré${result.skipped.length > 1 ? "s" : ""}` : ""}`
              : "Aucun résultat."}
          </DialogDescription>
        </DialogHeader>

        {result && (
          <>
            {/* Barre de contrôles — fixe, hors zone scrollable */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border/60 py-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="result-view"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Format
                </label>
                <Select
                  value={view}
                  onValueChange={(value) => setView(value as ViewMode)}
                >
                  <SelectTrigger id="result-view" className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="md">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!isJsonView}
                  title={!isJsonView ? "Disponible en vue JSON uniquement" : undefined}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" aria-hidden />
                      Copier
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !isJsonView}
                  title={!isJsonView ? "Disponible en vue JSON uniquement" : undefined}
                >
                  <Save className="size-4" aria-hidden />
                  {isPending ? "Sauvegarde…" : "Sauvegarder"}
                </Button>
              </div>
            </div>

            {/* Zone de code — occupe toute la hauteur restante */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <pre className="h-full overflow-auto p-5 font-mono text-xs leading-relaxed text-foreground/90">
                <code>{displayed}</code>
              </pre>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
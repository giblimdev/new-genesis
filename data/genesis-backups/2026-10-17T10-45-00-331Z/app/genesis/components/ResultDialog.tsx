/*
path :           app/genesis/components/ResultDialog.tsx
tag :            ["genesis", "result", "dialog", "export", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Dialog plein écran qui affiche le résultat d'une sélection
                 (ReadFilesResult) dans deux onglets : JSON (actif par défaut,
                 copiable et sauvegardable) et MD (lecture seule, rendu simple
                 par sections). En-tête : compteur de fichiers + taille totale
                 + compteur de skipped. Boutons Copier / Sauvegarder portent
                 UNIQUEMENT sur le JSON.

flow:            Reçoit result + open + onOpenChange → calcule jsonString
                 (JSON.stringify 2 espaces) et mdString (sections ## par
                 fichier) → onglet JSON : <pre> + boutons Copier / Sauvegarder
                 → onglet MD : <pre> formaté, non copiable → toast sur
                 succès/erreur de copie et sauvegarde.

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

relatedFiles:    ["@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/read-files",
                  "@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/tabs"]

exports:         ["ResultDialog", "ResultDialogProps"]

useBy:           ["@/app/genesis/components/ReadFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux prévisualiser et exporter le JSON de ma sélection"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : navigator.clipboard, useTransition, toast, Tabs.

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ResultDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly result: ReadFilesResult | null;
}

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
  const [isPending, startTransition] = useTransition();

  const jsonString = useMemo(
    () => (result ? JSON.stringify(result, null, 2) : ""),
    [result],
  );
  const mdString = useMemo(() => (result ? buildMarkdown(result) : ""), [result]);

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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Sélection</DialogTitle>
          <DialogDescription>
            {result
              ? `${result.fileCount} fichier${result.fileCount > 1 ? "s" : ""} · ${formatSize(result.totalSize)}${result.skipped.length > 0 ? ` · ${result.skipped.length} ignoré${result.skipped.length > 1 ? "s" : ""}` : ""}`
              : "Aucun résultat."}
          </DialogDescription>
        </DialogHeader>

        {result && (
          <Tabs defaultValue="json" className="space-y-3">
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="md">Markdown</TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-3">
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCopy}>
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
                <Button type="button" onClick={handleSave} disabled={isPending}>
                  <Save className="size-4" aria-hidden />
                  {isPending ? "Sauvegarde…" : "Sauvegarder"}
                </Button>
              </div>
              <pre className="max-h-[60vh] overflow-auto rounded-2xl border border-border/60 bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground/90">
                <code>{jsonString}</code>
              </pre>
            </TabsContent>

            <TabsContent value="md">
              <pre className="max-h-[60vh] overflow-auto rounded-2xl border border-border/60 bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground/90">
                <code>{mdString}</code>
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
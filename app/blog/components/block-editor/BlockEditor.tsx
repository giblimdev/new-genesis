/*
path :           app/blog/components/block-editor/BlockEditor.tsx
tag :            ["blog", "component", "block-editor", "orchestrator", "tree"]
projectId:       new-genesis
type :           component
generic:         false

role:            Orchestrateur de l'éditeur de blocs d'article.
                 Maintient l'état local `blocks: ContentBlock[]`, un
                 état `editing: { blockId } | null` (édition d'un bloc
                 existant) et un état `adding: { parentId, type } |
                 null` (ajout d'un nouveau bloc). Fusionne les payloads
                 des 8 formulaires enfants avec les champs de base (id,
                 parentId, order, createdAt, updatedAt) et applique les
                 helpers d'arbre (insertBlock, moveBlock, removeBlock)
                 + une normalisation locale des order par parentId pour
                 éliminer les trous. Remonte le résultat au parent via
                 onChange(blocks) après chaque mutation. Fournit à
                 BlockList un renderer par type de bloc (aperçu lecture
                 seule dans l'éditeur) et un constructeur de props pour
                 la toolbar (calcul des booléens canMoveUp/canMoveDown/
                 canIndent/canOutdent/canDelete). Profondeur max = 6
                 (respect du schéma Zod). Aucun appel Server Action ici :
                 tout est remonté à ArticleForm qui déclenche l'action.

flow:            Props { initialBlocks, rootId, mediaManifest, onChange }
                 → useState(blocks) → blocList rendu.
                 Ajout : onPick(type) → setAdding({ parentId:
                 currentRoot, type }) → formulaire → onSubmit(payload) →
                 addBlock(parentId, payload) → onChange.
                 Édition : onEdit(block) → setEditing({ blockId }) →
                 formulaire pré-rempli → onSubmit(payload) →
                 updateBlock(blockId, payload) → onChange.
                 Suppression : onDelete(blockId) → confirm → removeBlock
                 récursif → onChange.
                 Monter/descendre : swap order avec frère adjacent →
                 normalizeOrders → onChange.
                 Indenter : nouveau parent = frère précédent, order =
                 max+1 dans le nouveau parent → moveBlock → normalize →
                 onChange.
                 Désindenter : nouveau parent = parent du parent, order
                 = max+1 → moveBlock → normalize → onChange.

ecosystem:       BlogUI = [
                   "@/app/blog/components/ArticleBody.tsx",
                   "@/app/blog/components/ArticleCard.tsx",
                   "@/app/blog/components/ArticleHeader.tsx",
                   "@/app/blog/components/CommentForm.tsx",
                   "@/app/blog/components/CommentTree.tsx",
                   "@/app/blog/components/ContentBlockRenderer.tsx",
                   "@/app/blog/components/DiscussionThread.tsx",
                   "@/app/blog/components/FavoriteButton.tsx",
                   "@/app/blog/components/GroupCard.tsx",
                   "@/app/blog/components/LikeButton.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/app/blog/components/NotificationList.tsx",
                   "@/app/blog/components/PostTree.tsx",
                   "@/app/blog/components/SearchFilters.tsx",
                   "@/app/blog/components/TableOfContents.tsx",
                   "@/app/blog/components/TaxonomyNav.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/TagForm.tsx",
                   "@/app/blog/components/admin/TaxonomyForm.tsx",
                   "@/app/blog/components/block-editor/BlockEditor.tsx",
                   "@/app/blog/components/block-editor/BlockList.tsx",
                   "@/app/blog/components/block-editor/BlockToolbar.tsx",
                   "@/app/blog/components/block-editor/BlockTypeMenu.tsx",
                   "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/CodeBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/EmbedBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ParagraphBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/SectionBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/tree.ts",
                  "@/app/blog/components/block-editor/BlockList.tsx",
                  "@/app/blog/components/block-editor/BlockTypeMenu.tsx",
                  "@/app/blog/components/block-editor/forms/SectionBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/ParagraphBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/CodeBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/EmbedBlockForm.tsx",
                  "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx"]
imports:         ["react", "lucide-react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/tree",
                  "@/app/blog/components/block-editor/BlockList",
                  "@/app/blog/components/block-editor/BlockTypeMenu",
                  "@/app/blog/components/block-editor/forms/SectionBlockForm",
                  "@/app/blog/components/block-editor/forms/ParagraphBlockForm",
                  "@/app/blog/components/block-editor/forms/ImageBlockForm",
                  "@/app/blog/components/block-editor/forms/VideoBlockForm",
                  "@/app/blog/components/block-editor/forms/AudioBlockForm",
                  "@/app/blog/components/block-editor/forms/CodeBlockForm",
                  "@/app/blog/components/block-editor/forms/EmbedBlockForm",
                  "@/app/blog/components/block-editor/forms/DocumentBlockForm",
                  "@/components/ui/button",
                  "@/components/ui/dialog"]
exports:         ["BlockEditor", "BlockEditorProps"]
useBy:           ["@/app/blog/components/admin/ArticleForm.tsx"]

userStories:     ["us1100007"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useMemo, dialogs, interactions.

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type {
  AudioBlock,
  CodeBlock,
  ContentBlock,
  ContentBlockType,
  DocumentBlock,
  EmbedBlock,
  ImageBlock,
  ParagraphBlock,
  SectionBlock,
  VideoBlock,
} from "@/app/blog/lib/types";
import {
  buildTree,
  insertBlock,
  moveBlock,
  removeBlock,
} from "@/app/blog/lib/tree";
import {
  BlockList,
  type BlockRenderContext,
} from "@/app/blog/components/block-editor/BlockList";
import { BlockTypeMenu } from "@/app/blog/components/block-editor/BlockTypeMenu";
import {
  SectionBlockForm,
  type SectionBlockPayload,
} from "@/app/blog/components/block-editor/forms/SectionBlockForm";
import {
  ParagraphBlockForm,
  type ParagraphBlockPayload,
} from "@/app/blog/components/block-editor/forms/ParagraphBlockForm";
import {
  ImageBlockForm,
  type ImageBlockPayload,
} from "@/app/blog/components/block-editor/forms/ImageBlockForm";
import {
  VideoBlockForm,
  type VideoBlockPayload,
} from "@/app/blog/components/block-editor/forms/VideoBlockForm";
import {
  AudioBlockForm,
  type AudioBlockPayload,
} from "@/app/blog/components/block-editor/forms/AudioBlockForm";
import {
  CodeBlockForm,
  type CodeBlockPayload,
} from "@/app/blog/components/block-editor/forms/CodeBlockForm";
import {
  EmbedBlockForm,
  type EmbedBlockPayload,
} from "@/app/blog/components/block-editor/forms/EmbedBlockForm";
import {
  DocumentBlockForm,
  type DocumentBlockPayload,
} from "@/app/blog/components/block-editor/forms/DocumentBlockForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Constantes                                                        */
/* ------------------------------------------------------------------ */

const MAX_DEPTH = 6;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

/**
 * Réassigne order = 0..n-1 dans chaque groupe de frères (même parentId),
 * trié par order courant. Garantit l'absence de trous après
 * déplacement/indentation.
 */
function normalizeOrders(
  blocks: readonly ContentBlock[],
): readonly ContentBlock[] {
  const byParent = new Map<string, ContentBlock[]>();
  for (const b of blocks) {
    const list = byParent.get(b.parentId) ?? [];
    list.push(b);
    byParent.set(b.parentId, list);
  }
  const ordered = new Map<string, ContentBlock>();
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.order - b.order);
    siblings.forEach((b, i) => {
      ordered.set(b.id, { ...b, order: i } as ContentBlock);
    });
  }
  return blocks.map((b) => ordered.get(b.id) ?? b);
}

function depthOf(
  blocks: readonly ContentBlock[],
  blockId: string,
  rootId: string,
): number {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  let depth = 0;
  let current = byId.get(blockId)?.parentId;
  const seen = new Set<string>();
  while (current && current !== rootId) {
    if (seen.has(current)) break;
    seen.add(current);
    depth += 1;
    current = byId.get(current)?.parentId;
  }
  return depth;
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

export interface BlockEditorProps {
  readonly initialBlocks: readonly ContentBlock[];
  readonly rootId: string;
  readonly mediaManifest: readonly string[];
  readonly onChange: (blocks: readonly ContentBlock[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                         */
/* ------------------------------------------------------------------ */

export function BlockEditor({
  initialBlocks,
  rootId,
  mediaManifest,
  onChange,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<readonly ContentBlock[]>(initialBlocks);
  const [adding, setAdding] = useState<{
    parentId: string;
    type: ContentBlockType;
  } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Écriture locale + propagation                                    */
  /* ------------------------------------------------------------------ */

  function commit(next: readonly ContentBlock[]) {
    const normalized = normalizeOrders(next);
    setBlocks(normalized);
    onChange(normalized);
  }

  /* ------------------------------------------------------------------ */
  /*  Ajout                                                            */
  /* ------------------------------------------------------------------ */

  function startAdd(parentId: string, type: ContentBlockType) {
    setAdding({ parentId, type });
  }

  function cancelAdd() {
    setAdding(null);
  }

  function submitAdd(
    payload:
      | SectionBlockPayload
      | ParagraphBlockPayload
      | ImageBlockPayload
      | VideoBlockPayload
      | AudioBlockPayload
      | CodeBlockPayload
      | EmbedBlockPayload
      | DocumentBlockPayload,
  ) {
    if (!adding) return;
    const base = {
      id: newId(),
      parentId: adding.parentId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const block = { ...base, ...payload } as ContentBlock;
    const next = insertBlock(blocks, block);
    commit(next);
    setAdding(null);
  }

  /* ------------------------------------------------------------------ */
  /*  Édition                                                          */
  /* ------------------------------------------------------------------ */

  function startEdit(blockId: string) {
    setEditing(blockId);
  }

  function cancelEdit() {
    setEditing(null);
  }

  function submitEdit(
    payload:
      | SectionBlockPayload
      | ParagraphBlockPayload
      | ImageBlockPayload
      | VideoBlockPayload
      | AudioBlockPayload
      | CodeBlockPayload
      | EmbedBlockPayload
      | DocumentBlockPayload,
  ) {
    if (!editing) return;
    const next = blocks.map((b) =>
      b.id === editing
        ? ({ ...b, ...payload, updatedAt: nowIso() } as ContentBlock)
        : b,
    );
    commit(next);
    setEditing(null);
  }

  /* ------------------------------------------------------------------ */
  /*  Suppression                                                      */
  /* ------------------------------------------------------------------ */

  function handleDelete(blockId: string) {
    const next = removeBlock(blocks, blockId);
    commit(next);
  }

  /* ------------------------------------------------------------------ */
  /*  Déplacement vertical                                             */
  /* ------------------------------------------------------------------ */

  function moveVertical(blockId: string, direction: "up" | "down") {
    const current = blocks.find((b) => b.id === blockId);
    if (!current) return;
    const siblings = blocks
      .filter((b) => b.parentId === current.parentId)
      .sort((a, b) => a.order - b.order);
    const index = siblings.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const sibling = siblings[targetIndex];
    const next = blocks.map((b) => {
      if (b.id === current.id) return { ...b, order: sibling.order };
      if (b.id === sibling.id) return { ...b, order: current.order };
      return b;
    });
    commit(next);
  }

  /* ------------------------------------------------------------------ */
  /*  Indentation / désindentation                                     */
  /* ------------------------------------------------------------------ */

  function indent(blockId: string) {
    const current = blocks.find((b) => b.id === blockId);
    if (!current) return;
    const siblings = blocks
      .filter((b) => b.parentId === current.parentId)
      .sort((a, b) => a.order - b.order);
    const index = siblings.findIndex((b) => b.id === blockId);
    if (index <= 0) return;
    const previous = siblings[index - 1];

    const previousDepth = depthOf(blocks, previous.id, rootId);
    if (previousDepth + 1 >= MAX_DEPTH) return;

    const newOrder = blocks
      .filter((b) => b.parentId === previous.id)
      .reduce((max, b) => Math.max(max, b.order + 1), 0);

    try {
      const next = moveBlock(blocks, blockId, previous.id, newOrder);
      commit(next);
    } catch {
      /* anti-cycle déjà vérifié par moveBlock */
    }
  }

  function outdent(blockId: string) {
    const current = blocks.find((b) => b.id === blockId);
    if (!current || current.parentId === rootId) return;
    const currentParent = blocks.find((b) => b.id === current.parentId);
    if (!currentParent) return;
    const grandParentId = currentParent.parentId;

    const newOrder = blocks
      .filter((b) => b.parentId === grandParentId)
      .reduce((max, b) => Math.max(max, b.order + 1), 0);

    try {
      const next = moveBlock(blocks, blockId, grandParentId, newOrder);
      commit(next);
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Rendu d'un bloc (aperçu dans l'éditeur)                          */
  /* ------------------------------------------------------------------ */

  function renderContent(block: ContentBlock): React.ReactNode {
    switch (block.type) {
      case "section":
        return (
          <p className="text-base font-bold text-foreground">{block.title}</p>
        );
      case "paragraph":
        return (
          <p className="line-clamp-3 text-sm text-foreground/80">
            {block.text}
          </p>
        );
      case "image":
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Image · {block.path}
            </p>
            <p className="text-xs text-muted-foreground">alt: {block.alt}</p>
          </div>
        );
      case "video":
        return (
          <p className="text-sm font-medium text-foreground">
            Vidéo · {block.path}
          </p>
        );
      case "audio":
        return (
          <p className="text-sm font-medium text-foreground">
            Audio · {block.path}
          </p>
        );
      case "code":
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Code · {block.language}
            </p>
            <pre className="max-h-32 overflow-hidden rounded bg-muted p-2 font-mono text-xs">
              {block.code.slice(0, 200)}
              {block.code.length > 200 ? "…" : ""}
            </pre>
          </div>
        );
      case "embed":
        return (
          <p className="text-sm font-medium text-foreground">
            Embed · {block.provider} · {block.url}
          </p>
        );
      case "document":
        return (
          <p className="text-sm font-medium text-foreground">
            Document · {block.title}
          </p>
        );
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Construction des props de toolbar                                */
  /* ------------------------------------------------------------------ */

  function buildToolbarProps(
    block: ContentBlock,
    context: BlockRenderContext,
  ) {
    return {
      label: labelOf(block),
      canMoveUp: context.canMoveUp,
      canMoveDown: context.canMoveDown,
      canIndent:
        context.canIndent &&
        context.depth < MAX_DEPTH,
      canOutdent: context.canOutdent,
      canDelete: context.canDelete,
      onEdit: () => startEdit(block.id),
      onMoveUp: () => moveVertical(block.id, "up"),
      onMoveDown: () => moveVertical(block.id, "down"),
      onIndent: () => indent(block.id),
      onOutdent: () => outdent(block.id),
      onDelete: () => handleDelete(block.id),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Formulaire actif                                                 */
  /* ------------------------------------------------------------------ */

  const activeBlock = editing
    ? blocks.find((b) => b.id === editing)
    : undefined;

  const dialogOpen = adding !== null || editing !== null;
  const dialogType = adding?.type ?? activeBlock?.type;

  const formNode = useMemo(() => {
    if (!dialogType) return null;
    if (adding) {
      return renderAddForm(dialogType, mediaManifest, submitAdd, cancelAdd);
    }
    if (activeBlock) {
      return renderEditForm(
        activeBlock,
        mediaManifest,
        submitEdit,
        cancelEdit,
      );
    }
    return null;
  }, [dialogType, adding, activeBlock, mediaManifest]);

  /* ------------------------------------------------------------------ */
  /*  Rendu principal                                                  */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-4">
      <BlockList
        blocks={blocks}
        rootId={rootId}
        renderContent={renderContent}
        buildToolbarProps={buildToolbarProps}
        emptyState={
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun bloc pour l&apos;instant. Ajoutez une première section,
              un paragraphe ou une image pour démarrer.
            </p>
          </div>
        }
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => startAdd(rootId, "paragraph")}
          className="gap-2"
        >
          <Plus className="size-4" aria-hidden />
          Ajouter un bloc à la racine
        </Button>
      </div>

      {/* Menu + formulaire unifiés dans une Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            cancelAdd();
            cancelEdit();
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {adding ? "Ajouter un bloc" : "Éditer le bloc"}
            </DialogTitle>
            <DialogDescription>
              {adding
                ? "Choisissez un type de bloc, puis remplissez le formulaire."
                : "Modifiez le contenu du bloc puis enregistrez."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {adding && !formNode ? (
              <BlockTypeMenu onPick={(type) => startAdd(adding.parentId, type)} />
            ) : (
              formNode
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers de rendu de formulaire                                    */
/* ------------------------------------------------------------------ */

function labelOf(block: ContentBlock): string {
  switch (block.type) {
    case "section":
      return `section "${block.title}"`;
    case "paragraph":
      return "paragraphe";
    case "image":
      return "image";
    case "video":
      return "vidéo";
    case "audio":
      return "audio";
    case "code":
      return "bloc de code";
    case "embed":
      return "embed";
    case "document":
      return "document";
  }
}

function renderAddForm(
  type: ContentBlockType,
  mediaManifest: readonly string[],
  onSubmit: (
    payload:
      | SectionBlockPayload
      | ParagraphBlockPayload
      | ImageBlockPayload
      | VideoBlockPayload
      | AudioBlockPayload
      | CodeBlockPayload
      | EmbedBlockPayload
      | DocumentBlockPayload,
  ) => void,
  onCancel: () => void,
): React.ReactNode {
  switch (type) {
    case "section":
      return <SectionBlockForm onSubmit={onSubmit} onCancel={onCancel} />;
    case "paragraph":
      return <ParagraphBlockForm onSubmit={onSubmit} onCancel={onCancel} />;
    case "image":
      return (
        <ImageBlockForm
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "video":
      return (
        <VideoBlockForm
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "audio":
      return (
        <AudioBlockForm
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "code":
      return <CodeBlockForm onSubmit={onSubmit} onCancel={onCancel} />;
    case "embed":
      return <EmbedBlockForm onSubmit={onSubmit} onCancel={onCancel} />;
    case "document":
      return (
        <DocumentBlockForm
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
  }
}

function renderEditForm(
  block: ContentBlock,
  mediaManifest: readonly string[],
  onSubmit: (
    payload:
      | SectionBlockPayload
      | ParagraphBlockPayload
      | ImageBlockPayload
      | VideoBlockPayload
      | AudioBlockPayload
      | CodeBlockPayload
      | EmbedBlockPayload
      | DocumentBlockPayload,
  ) => void,
  onCancel: () => void,
): React.ReactNode {
  switch (block.type) {
    case "section":
      return (
        <SectionBlockForm
          initial={block as SectionBlock}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "paragraph":
      return (
        <ParagraphBlockForm
          initial={block as ParagraphBlock}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "image":
      return (
        <ImageBlockForm
          initial={block as ImageBlock}
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "video":
      return (
        <VideoBlockForm
          initial={block as VideoBlock}
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "audio":
      return (
        <AudioBlockForm
          initial={block as AudioBlock}
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "code":
      return (
        <CodeBlockForm
          initial={block as CodeBlock}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "embed":
      return (
        <EmbedBlockForm
          initial={block as EmbedBlock}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
    case "document":
      return (
        <DocumentBlockForm
          initial={block as DocumentBlock}
          mediaManifest={mediaManifest}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );
  }
}
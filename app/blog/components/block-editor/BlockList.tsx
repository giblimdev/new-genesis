/*
path :           app/blog/components/block-editor/BlockList.tsx
tag :            ["blog", "component", "block-editor", "tree", "recursive"]
projectId:       new-genesis
type :           component
generic:         false

role:            Rendu récursif de l'arbre content[] dans l'éditeur.
                 Reçoit un tableau plat de blocs + rootId (article.id ou
                 id de discussion), reconstruit l'arbre via buildTree,
                 puis rend chaque nœud via un renderer fourni par le
                 parent (BlockEditor). Aucune logique métier ici :
                 BlockList ne fait que l'assemblage visuel. Un
                 sous-composant interne BlockNode gère l'indentation
                 (bordure gauche) et le rendu récursif des enfants. Si
                 l'arbre est vide, un emptyState (fourni par le parent)
                 est affiché.

flow:            Client → useMemo(buildTree(blocks, rootId)) → rend
                 chaque racine via BlockNode → récursion sur children.

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
                  "@/app/blog/components/block-editor/BlockToolbar.tsx"]
imports:         ["react",
                  "@/app/blog/lib/types",
                  "@/app/blog/lib/tree",
                  "@/app/blog/components/block-editor/BlockToolbar"]
exports:         ["BlockList", "BlockListProps", "BlockRenderContext"]
useBy:           ["@/app/blog/components/block-editor/BlockEditor.tsx"]

userStories:     ["us1100007"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useMemo + interactions via les toolbars enfants.

import { useMemo } from "react";

import type { ContentBlock } from "@/app/blog/lib/types";
import { buildTree } from "@/app/blog/lib/tree";
import {
  BlockToolbar,
  type BlockToolbarProps,
} from "@/app/blog/components/block-editor/BlockToolbar";

export interface BlockRenderContext {
  readonly depth: number;
  readonly siblings: readonly ContentBlock[];
  readonly parentId: string;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly canIndent: boolean;
  readonly canOutdent: boolean;
  readonly canDelete: boolean;
}

export interface BlockListProps {
  readonly blocks: readonly ContentBlock[];
  readonly rootId: string;
  readonly renderContent: (
    block: ContentBlock,
    context: BlockRenderContext,
  ) => React.ReactNode;
  readonly buildToolbarProps: (
    block: ContentBlock,
    context: BlockRenderContext,
  ) => BlockToolbarProps;
  readonly emptyState?: React.ReactNode;
}

export function BlockList({
  blocks,
  rootId,
  renderContent,
  buildToolbarProps,
  emptyState,
}: BlockListProps) {
  const tree = useMemo(() => buildTree(blocks, rootId), [blocks, rootId]);

  if (tree.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <ul className="space-y-3">
      {tree.map((node, index) => (
        <BlockNode
          key={node.id}
          node={node}
          siblings={tree}
          siblingsRootId={rootId}
          depth={1}
          index={index}
          isRootLevel={true}
          renderContent={renderContent}
          buildToolbarProps={buildToolbarProps}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Nœud récursif                                                     */
/* ------------------------------------------------------------------ */

interface BlockNodeProps {
  readonly node: import("@/app/blog/lib/tree").TreeNode<ContentBlock>;
  readonly siblings: readonly import("@/app/blog/lib/tree").TreeNode<ContentBlock>[];
  readonly siblingsRootId: string;
  readonly depth: number;
  readonly index: number;
  readonly isRootLevel: boolean;
  readonly renderContent: (
    block: ContentBlock,
    context: BlockRenderContext,
  ) => React.ReactNode;
  readonly buildToolbarProps: (
    block: ContentBlock,
    context: BlockRenderContext,
  ) => BlockToolbarProps;
}

function BlockNode({
  node,
  siblings,
  depth,
  index,
  isRootLevel,
  renderContent,
  buildToolbarProps,
}: BlockNodeProps) {
  const context: BlockRenderContext = {
    depth,
    siblings: siblings as readonly ContentBlock[],
    parentId: node.parentId,
    canMoveUp: index > 0,
    canMoveDown: index < siblings.length - 1,
    canIndent: index > 0,
    canOutdent: !isRootLevel,
    canDelete: true,
  };

  const toolbarProps = buildToolbarProps(node as ContentBlock, context);

  return (
    <li className="flex flex-col gap-2">
      <div
        className="rounded-xl border border-border/60 bg-card p-3"
        style={{ marginLeft: `${(depth - 1) * 20}px` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {renderContent(node as ContentBlock, context)}
          </div>
          <BlockToolbar {...toolbarProps} />
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="space-y-3">
          {node.children.map((child, childIndex) => (
            <BlockNode
              key={child.id}
              node={child}
              siblings={node.children}
              siblingsRootId={node.id}
              depth={depth + 1}
              index={childIndex}
              isRootLevel={false}
              renderContent={renderContent}
              buildToolbarProps={buildToolbarProps}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
/*
path :           app/blog/lib/tree.ts
tag :            ["blog", "tree", "flat", "helpers", "shared"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Helpers d'arbre plat (parentId + order, racine =
                 article.id ou discussion.id) partagés par content[],
                 comments[] et posts[]. buildTree reconstruit un arbre
                 récursif depuis un tableau plat ; insertBlock ajoute un
                 bloc avec order = max + 1 parmi ses frères ; removeBlock
                 supprime récursivement un bloc et tous ses descendants ;
                 moveBlock change parentId + order avec anti-cycle ;
                 flattenBlocks aplatit un arbre (utile pour l'export
                 Prisma). Les mêmes helpers servent aux trois arbres du
                 document — un seul validateur, un seul helper, un seul
                 aplatisseur. Aucune dépendance à storage.

flow:            buildTree(blocks, rootId) → Map<parentId, blocks[]> →
                 récursion depuis rootId → TreeNode[].
                 insertBlock(blocks, parentId, newBlock) → calcule order =
                 max(orders[parentId]) + 1 → push → retourne le tableau.
                 removeBlock(blocks, blockId) → collecte récursivement les
                 ids descendants → filter.
                 moveBlock(blocks, blockId, newParentId, newOrder) → vérifie
                 que newParentId n'est pas un descendant de blockId (anti-
                 cycle) → réassigne parentId + order.
                 flattenBlocks(tree) → parcours DFS → tableau plat.

ecosystem:       BlogCore = [
                   "@/app/blog/lib/admin.ts",
                   "@/app/blog/lib/ecosystem.ts",
                   "@/app/blog/lib/media.ts",
                   "@/app/blog/lib/session.ts",
                   "@/app/blog/lib/storage.ts",
                   "@/app/blog/lib/tree.ts",
                   "@/app/blog/lib/types.ts",
                   "@/app/blog/lib/utils/reading-time.ts",
                   "@/app/blog/lib/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/validations.ts"]
imports:         ["@/app/blog/lib/types"]
exports:         ["buildTree", "insertBlock", "removeBlock",
                  "moveBlock", "flattenBlocks", "TreeNode",
                  "FlatNode"]
useBy:           ["@/app/blog/lib/storage.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/comment.ts",
                  "@/app/blog/lib/services/discussion.ts",
                  "@/app/blog/lib/services/search.ts",
                  "@/app/blog/components/ArticleBody.tsx",
                  "@/app/blog/components/CommentTree.tsx",
                  "@/app/blog/components/PostTree.tsx"]

userStories:     ["us1100011"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ContentBlock } from "@/app/blog/lib/types";

/* ------------------------------------------------------------------ */
/*  Types génériques                                                  */
/* ------------------------------------------------------------------ */

/** Forme minimale d'un nœud d'arbre plat. */
export interface FlatNode {
  readonly id: string;
  readonly parentId: string;
  readonly order: number;
}

/** Un nœud d'arbre enrichi de ses enfants. */
export type TreeNode<T extends FlatNode> = T & {
  readonly children: readonly TreeNode<T>[];
};

/* ------------------------------------------------------------------ */
/*  buildTree                                                         */
/* ------------------------------------------------------------------ */

/**
 * Reconstruit un arbre récursif depuis un tableau plat.
 *  - Le nœud racine est `rootId` (article.id ou discussion.id) : il n'est
 *    pas dans `nodes`, mais tous ses enfants directs ont parentId =
 *    rootId.
 *  - Les frères sont triés par `order` croissant.
 *  - Complexité O(n log n) : tri local par parent, puis assemblage.
 */
export function buildTree<T extends FlatNode>(
  nodes: readonly T[],
  rootId: string,
): readonly TreeNode<T>[] {
  const childrenByParent = new Map<string, T[]>();
  for (const node of nodes) {
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parentId, siblings);
  }
  for (const siblings of childrenByParent.values()) {
    siblings.sort((a, b) => a.order - b.order);
  }

  function attach(parentId: string): readonly TreeNode<T>[] {
    const siblings = childrenByParent.get(parentId) ?? [];
    return siblings.map((node) => ({
      ...node,
      children: attach(node.id),
    }));
  }

  return attach(rootId);
}

/* ------------------------------------------------------------------ */
/*  insertBlock                                                       */
/* ------------------------------------------------------------------ */

/**
 * Ajoute un bloc à un parent donné.
 * - `order` = max(order des frères existants) + 1.
 * - Retourne un NOUVEAU tableau (immutabilité).
 * - Le parentId est fourni par l'appelant (racine = article.id).
 */
export function insertBlock<T extends FlatNode>(
  blocks: readonly T[],
  newBlock: Omit<T, "order">,
): readonly T[] {
  const maxOrder = blocks
    .filter((b) => b.parentId === newBlock.parentId)
    .reduce((max, b) => Math.max(max, b.order), -1);

  return [...blocks, { ...newBlock, order: maxOrder + 1 } as T];
}

/* ------------------------------------------------------------------ */
/*  removeBlock                                                       */
/* ------------------------------------------------------------------ */

/**
 * Supprime un bloc ET tous ses descendants (récursif).
 * - Retourne un NOUVEAU tableau.
 * - Si le bloc n'existe pas, retourne `blocks` inchangé.
 */
export function removeBlock<T extends FlatNode>(
  blocks: readonly T[],
  blockId: string,
): readonly T[] {
  const toRemove = new Set<string>([blockId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const b of blocks) {
      if (!toRemove.has(b.id) && toRemove.has(b.parentId)) {
        toRemove.add(b.id);
        grew = true;
      }
    }
  }
  return blocks.filter((b) => !toRemove.has(b.id));
}

/* ------------------------------------------------------------------ */
/*  moveBlock                                                         */
/* ------------------------------------------------------------------ */

/**
 * Déplace un bloc vers un nouveau parent avec un nouvel ordre.
 * - Anti-cycle : interdit de déplacer un bloc sous l'un de ses propres
 *   descendants (ni sous lui-même).
 * - Lève une erreur si `blockId` ou `newParentId` sont introuvables.
 * - Retourne un NOUVEAU tableau.
 */
export function moveBlock<T extends FlatNode>(
  blocks: readonly T[],
  blockId: string,
  newParentId: string,
  newOrder: number,
): readonly T[] {
  const source = blocks.find((b) => b.id === blockId);
  if (!source) {
    throw new Error(`[tree] Bloc introuvable : "${blockId}"`);
  }
  if (blockId === newParentId) {
    throw new Error(`[tree] Un bloc ne peut pas être son propre parent.`);
  }

  /* Anti-cycle : newParentId ne doit pas être un descendant de blockId. */
  const descendants = new Set<string>();
  let grew = true;
  descendants.add(blockId);
  while (grew) {
    grew = false;
    for (const b of blocks) {
      if (!descendants.has(b.id) && descendants.has(b.parentId)) {
        descendants.add(b.id);
        grew = true;
      }
    }
  }
  if (descendants.has(newParentId)) {
    throw new Error(
      `[tree] Déplacement cyclique interdit : "${newParentId}" est un descendant de "${blockId}".`,
    );
  }

  return blocks.map((b) =>
    b.id === blockId ? { ...b, parentId: newParentId, order: newOrder } : b,
  );
}

/* ------------------------------------------------------------------ */
/*  flattenBlocks                                                     */
/* ------------------------------------------------------------------ */

/**
 * Aplatit un arbre reconstruit (résultat de buildTree) en tableau plat.
 * Utile pour l'export Prisma (ContentBlock / Comment / Post avec parentId).
 * - Parcours DFS pré-ordonné (parent avant enfants, frères par order).
 */
export function flattenBlocks<T extends FlatNode>(
  tree: readonly TreeNode<T>[],
): readonly T[] {
  const out: T[] = [];
  function walk(nodes: readonly TreeNode<T>[]): void {
    for (const node of nodes) {
      const { children, ...rest } = node;
      out.push(rest as unknown as T);
      walk(children);
    }
  }
  walk(tree);
  return out;
}

/* ------------------------------------------------------------------ */
/*  Ré-exports utilitaires                                            */
/* ------------------------------------------------------------------ */

/** Signature typée pour les helpers qui opèrent sur content[]. */
export type ContentBlockTree = readonly TreeNode<ContentBlock>[];
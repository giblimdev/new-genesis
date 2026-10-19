/*
path :           app/blog/components/ArticleBody.tsx
tag :            ["blog", "component", "article", "body", "toc"]
projectId:       new-genesis
type:            component
generic:         false

role:            Corps d'article publique. Reconstruit l'arbre
                 content[] via buildTree, calcule la TOC (liste de
                 sections {id, title, depth}) et rend :
                 - TableOfContents (sidebar lg, inline mobile)
                 - ContentBlockRenderer pour le corps.
                 Server Component pur.

flow:            Reçoit article.content (ContentBlock[]) + articleId →
                 const tree = buildTree(content, articleId) →
                 const toc = collectSections(tree) → rend le layout
                 2 colonnes lg avec TOC sticky + corps.

ecosystem:       BlogUI = [
                   ... (identique à ArticleCard)
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts",
                  "@/app/blog/lib/tree.ts",
                  "@/app/blog/components/ContentBlockRenderer.tsx",
                  "@/app/blog/components/TableOfContents.tsx"]

imports:         ["@/app/blog/lib/types",
                  "@/app/blog/lib/tree",
                  "@/app/blog/components/ContentBlockRenderer",
                  "@/app/blog/components/TableOfContents"]

exports:         ["ArticleBody", "ArticleBodyProps"]

useBy:           ["@/app/blog/[slug]/page.tsx"]

userStories:     ["us4100003"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ContentBlock } from "@/app/blog/lib/types";
import { buildTree, type TreeNode } from "@/app/blog/lib/tree";
import { ContentBlockRenderer } from "@/app/blog/components/ContentBlockRenderer";
import { TableOfContents } from "@/app/blog/components/TableOfContents";

export interface ArticleBodyProps {
  readonly articleId: string;
  readonly content: readonly ContentBlock[];
}

export interface TocEntry {
  readonly id: string;
  readonly title: string;
  readonly depth: number;
}

function collectSections(
  nodes: readonly TreeNode<ContentBlock>[],
  depth = 1,
): TocEntry[] {
  const out: TocEntry[] = [];
  for (const node of nodes) {
    if (node.type === "section") {
      out.push({ id: node.id, title: node.title, depth });
    }
    if (node.children.length > 0) {
      out.push(...collectSections(node.children, depth + 1));
    }
  }
  return out;
}

export function ArticleBody({ articleId, content }: ArticleBodyProps) {
  const tree = buildTree(content, articleId);
  const toc = collectSections(tree);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <ContentBlockRenderer nodes={tree} />
      </div>
      {toc.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents entries={toc} />
          </div>
        </aside>
      )}
      {toc.length > 0 && (
        <details className="rounded-xl border border-border/60 bg-muted/20 p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Table des matières
          </summary>
          <div className="mt-3">
            <TableOfContents entries={toc} />
          </div>
        </details>
      )}
    </div>
  );
}
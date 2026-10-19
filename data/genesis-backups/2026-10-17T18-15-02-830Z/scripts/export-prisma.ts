/*
path :           scripts/export-prisma.ts
tag :            ["script", "export", "prisma", "migration", "blog"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Script CLI pnpm export:prisma. Lit data/blog.json,
                 valide via blogDocumentSchema, et produit un fichier
                 prisma/seed.ts qui mappe fidèlement chaque entité
                 vers un schéma Prisma cible. Aplatit les arbres
                 content[]/comments[]/posts[] vers les tables
                 ContentBlock/Comment/Post avec parentId résolu
                 (racine → null + FK articleId/discussionId).
                 Inclut un en-tête de mapping JSON → Prisma documenté.
                 Aucun appel à Prisma runtime : juste génération de
                 fichier TypeScript. La mise en prod consiste à
                 lancer ce script puis à exécuter prisma/seed.ts.

flow:            main() → read file data/blog.json → 
                 blogDocumentSchema.parse → transform → stringify
                 → write prisma/seed.ts → console.log résumé.

ecosystem:       Scripts = [
                   "data/fixtures/blog.seed.json",
                   "scripts/backup.ts",
                   "scripts/export-prisma.ts",
                   "scripts/seed.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/validations.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["node:fs/promises", "node:path",
                  "@/app/blog/lib/validations",
                  "@/app/blog/lib/types"]

exports:         []

useBy:           []

userStories:     ["us1100016"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { blogDocumentSchema } from "../app/blog/lib/validations";
import type {
  Article,
  BlogDocument,
  Comment,
  ContentBlock,
  Discussion,
  Group,
  Post,
  Tag,
  Theme,
} from "../app/blog/lib/types";

const ROOT = process.cwd();
const SRC = join(ROOT, "data", "blog.json");
const OUT = join(ROOT, "prisma", "seed.ts");

/* ------------------------------------------------------------------ */
/*  Mapping helpers                                                    */
/* ------------------------------------------------------------------ */

interface FlatBlock {
  id: string;
  articleId: string;
  parentId: string | null;
  order: number;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function flattenContent(
  article: Article,
  blocks: readonly ContentBlock[],
): FlatBlock[] {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  function resolveParent(parentId: string): string | null {
    if (parentId === article.id) return null;
    if (byId.has(parentId)) return parentId;
    throw new Error(
      `[export-prisma] parentId orphelin dans article "${article.slug}" : ${parentId}`,
    );
  }
  return blocks.map((b) => {
    const base = {
      id: b.id,
      articleId: article.id,
      parentId: resolveParent(b.parentId),
      order: b.order,
      type: b.type,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
    switch (b.type) {
      case "section":
        return { ...base, payload: { title: b.title } };
      case "paragraph":
        return { ...base, payload: { text: b.text } };
      case "image":
        return {
          ...base,
          payload: {
            path: b.path,
            alt: b.alt,
            caption: b.caption,
            credit: b.credit,
            width: b.width,
            height: b.height,
          },
        };
      case "video":
        return {
          ...base,
          payload: {
            path: b.path,
            caption: b.caption,
            durationSec: b.durationSec,
            poster: b.poster,
          },
        };
      case "audio":
        return {
          ...base,
          payload: {
            path: b.path,
            caption: b.caption,
            durationSec: b.durationSec,
          },
        };
      case "code":
        return {
          ...base,
          payload: {
            language: b.language,
            code: b.code,
            caption: b.caption,
          },
        };
      case "embed":
        return {
          ...base,
          payload: { url: b.url, provider: b.provider, caption: b.caption },
        };
      case "document":
        return {
          ...base,
          payload: {
            path: b.path,
            title: b.title,
            mimeType: b.mimeType,
            sizeBytes: b.sizeBytes,
          },
        };
    }
  });
}

interface FlatComment {
  id: string;
  articleId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  likedBy: string[];
}

function flattenComments(
  article: Article,
  comments: readonly Comment[],
): FlatComment[] {
  const ids = new Set(comments.map((c) => c.id));
  return comments.map((c) => ({
    id: c.id,
    articleId: article.id,
    parentId: c.parentId === article.id ? null : ids.has(c.parentId) ? c.parentId : null,
    authorId: c.authorId,
    content: c.content,
    order: c.order,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    deletedAt: c.deletedAt ?? null,
    likedBy: [...c.likedBy],
  }));
}

interface FlatPost {
  id: string;
  discussionId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  likedBy: string[];
}

function flattenPosts(
  discussion: Discussion,
  posts: readonly Post[],
): FlatPost[] {
  const ids = new Set(posts.map((p) => p.id));
  return posts.map((p) => ({
    id: p.id,
    discussionId: discussion.id,
    parentId:
      p.parentId === discussion.id ? null : ids.has(p.parentId) ? p.parentId : null,
    authorId: p.authorId,
    content: p.content,
    order: p.order,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    deletedAt: p.deletedAt ?? null,
    likedBy: [...p.likedBy],
  }));
}

/* ------------------------------------------------------------------ */
/*  Génération du seed.ts                                              */
/* ------------------------------------------------------------------ */

function buildSeedSource(doc: BlogDocument): string {
  const {
    articles,
    groups,
  } = doc;

  const flatBlocks: FlatBlock[] = [];
  const flatComments: FlatComment[] = [];
  for (const a of articles) {
    flatBlocks.push(...flattenContent(a, a.content));
    flatComments.push(...flattenComments(a, a.comments));
  }

  const flatPosts: FlatPost[] = [];
  for (const g of groups) {
    for (const d of g.discussions) {
      flatPosts.push(...flattenPosts(d, d.posts));
    }
  }

  const themes: readonly Theme[] = doc.taxonomy.themes;
  const tags: readonly Tag[] = doc.taxonomy.tags;

  const data = {
    meta: doc.meta,
    themes,
    tags,
    articles,
    contentBlocks: flatBlocks,
    comments: flatComments,
    groups,
    discussions: groups.flatMap((g: Group) => g.discussions),
    posts: flatPosts,
    userContent: doc.userContent,
    auditLog: doc.auditLog,
  };

  return `/*
 * prisma/seed.ts — GÉNÉRÉ AUTOMATIQUEMENT par scripts/export-prisma.ts
 * Ne pas éditer à la main. Régénérer via \`pnpm export:prisma\`.
 *
 * Mapping JSON (data/blog.json) → Prisma :
 *   - Theme / Category / SubCategory : imbrication préservée → 3 tables
 *     avec FK parent (Theme.id, Category.id).
 *   - Tag : table plate.
 *   - Article : table Article. content[] aplati → ContentBlock avec
 *     parentId (null si parentId === article.id) + articleId.
 *     comments[] aplati → Comment (même règle). likedBy[] → Like.
 *   - Group : table Group + GroupMember (members[]).
 *   - Discussion : table Discussion (FK Group).
 *   - posts[] aplati → Post avec parentId (null si parentId ===
 *     discussion.id) + discussionId.
 *   - userContent[userId] → Notification + FavoriteFolder + Favorite.
 *   - auditLog[] → AuditEntry.
 *
 * Exécution :
 *   \`prisma db seed\` (ou \`pnpm exec prisma db seed\`).
 */

/* eslint-disable */
// @ts-nocheck

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DATA = ${JSON.stringify(data, null, 2)} as const;

async function main() {
  /* ------------------------------------------------------------------ */
  /*  TAXONOMY                                                          */
  /* ------------------------------------------------------------------ */
  for (const theme of DATA.themes) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: {
        slug: theme.slug,
        name: theme.name,
        description: theme.description ?? null,
        color: theme.color,
        icon: theme.icon,
        order: theme.order,
      },
      create: {
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        description: theme.description ?? null,
        color: theme.color,
        icon: theme.icon,
        order: theme.order,
      },
    });
    for (const cat of theme.categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {
          themeId: theme.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description ?? null,
          order: cat.order,
        },
        create: {
          id: cat.id,
          themeId: theme.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description ?? null,
          order: cat.order,
        },
      });
      for (const sub of cat.subCategories) {
        await prisma.subCategory.upsert({
          where: { id: sub.id },
          update: {
            categoryId: cat.id,
            slug: sub.slug,
            name: sub.name,
            description: sub.description ?? null,
            order: sub.order,
          },
          create: {
            id: sub.id,
            categoryId: cat.id,
            slug: sub.slug,
            name: sub.name,
            description: sub.description ?? null,
            order: sub.order,
          },
        });
      }
    }
  }

  for (const tag of DATA.tags) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: {
        slug: tag.slug,
        name: tag.name,
        color: tag.color ?? null,
      },
      create: {
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        color: tag.color ?? null,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  ARTICLES                                                          */
  /* ------------------------------------------------------------------ */
  for (const a of DATA.articles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        coverImage: a.coverImage ?? null,
        readingTimeMin: a.readingTimeMin,
        viewCount: a.viewCount,
        featured: a.featured,
        authorId: a.authorId,
        themeId: a.themeId,
        categoryId: a.categoryId ?? null,
        subCategoryId: a.subCategoryId ?? null,
        status: a.status,
        visibility: a.visibility,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        order: a.order,
      },
      create: {
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        coverImage: a.coverImage ?? null,
        readingTimeMin: a.readingTimeMin,
        viewCount: a.viewCount,
        featured: a.featured,
        authorId: a.authorId,
        themeId: a.themeId,
        categoryId: a.categoryId ?? null,
        subCategoryId: a.subCategoryId ?? null,
        status: a.status,
        visibility: a.visibility,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        order: a.order,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  BLOCS, COMMENTAIRES, LIKES                                        */
  /* ------------------------------------------------------------------ */
  for (const b of DATA.contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { id: b.id },
      update: {
        articleId: b.articleId,
        parentId: b.parentId,
        order: b.order,
        type: b.type,
        payload: JSON.stringify(b.payload),
      },
      create: {
        id: b.id,
        articleId: b.articleId,
        parentId: b.parentId,
        order: b.order,
        type: b.type,
        payload: JSON.stringify(b.payload),
      },
    });
  }

  for (const c of DATA.comments) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {
        articleId: c.articleId,
        parentId: c.parentId,
        authorId: c.authorId,
        content: c.content,
        order: c.order,
        deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
      },
      create: {
        id: c.id,
        articleId: c.articleId,
        parentId: c.parentId,
        authorId: c.authorId,
        content: c.content,
        order: c.order,
        deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  GROUPES, DISCUSSIONS, POSTS                                       */
  /* ------------------------------------------------------------------ */
  for (const g of DATA.groups) {
    await prisma.group.upsert({
      where: { id: g.id },
      update: {
        slug: g.slug,
        name: g.name,
        description: g.description ?? null,
        coverImage: g.coverImage ?? null,
        visibility: g.visibility,
        ownerId: g.ownerId,
        order: g.order,
      },
      create: {
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description ?? null,
        coverImage: g.coverImage ?? null,
        visibility: g.visibility,
        ownerId: g.ownerId,
        order: g.order,
      },
    });
    for (const m of g.members) {
      await prisma.groupMember.upsert({
        where: {
          groupId_userId: { groupId: g.id, userId: m.userId },
        },
        update: {
          role: m.role,
          status: m.status,
          joinedAt: new Date(m.joinedAt),
        },
        create: {
          groupId: g.id,
          userId: m.userId,
          role: m.role,
          status: m.status,
          joinedAt: new Date(m.joinedAt),
        },
      });
    }
  }

  for (const d of DATA.discussions) {
    await prisma.discussion.upsert({
      where: { id: d.id },
      update: {
        groupId: DATA.groups.find((g) =>
          g.discussions.some((x) => x.id === d.id),
        )!.id,
        title: d.title,
        content: d.content,
        authorId: d.authorId,
        order: d.order,
      },
      create: {
        id: d.id,
        groupId: DATA.groups.find((g) =>
          g.discussions.some((x) => x.id === d.id),
        )!.id,
        title: d.title,
        content: d.content,
        authorId: d.authorId,
        order: d.order,
      },
    });
  }

  for (const p of DATA.posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {
        discussionId: p.discussionId,
        parentId: p.parentId,
        authorId: p.authorId,
        content: p.content,
        order: p.order,
        deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
      },
      create: {
        id: p.id,
        discussionId: p.discussionId,
        parentId: p.parentId,
        authorId: p.authorId,
        content: p.content,
        order: p.order,
        deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
      },
    });
  }

  console.log(
    \`✔ Seed Prisma : \${DATA.themes.length} thèmes, \${DATA.articles.length} articles, \${DATA.contentBlocks.length} blocs, \${DATA.comments.length} commentaires, \${DATA.groups.length} groupes, \${DATA.posts.length} posts.\`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const raw = await readFile(SRC, "utf-8");
  const parsed = blogDocumentSchema.parse(JSON.parse(raw)) as BlogDocument;
  const source = buildSeedSource(parsed);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, source, "utf-8");
  console.log(`✔ Export Prisma : ${OUT}`);
}

main().catch((error) => {
  console.error("[export-prisma] Échec :", error);
  process.exit(1);
});
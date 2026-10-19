/*
path :           scripts/export-prisma.ts
tag :            ["script", "export", "prisma", "migration", "blog", "users"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Script CLI pnpm export:prisma. Lit data/blog.json,
                 valide via blogDocumentSchema, et produit prisma/seed.ts
                 qui mappe FIDÈLEMENT chaque entité vers le schéma Prisma
                 cible. Couvre : User (fictifs + présents dans le
                 document), Theme/Category/SubCategory, Tag, Article,
                 ArticleTag (jointure), ContentBlock (flat parentId),
                 Comment (flat parentId), Like (extrait de likedBy[]),
                 Group, GroupMember, Discussion, Post (flat parentId),
                 Notification (depuis userContent[].notifications[]),
                 FavoriteFolder, Favorite (unfiled + folders),
                 AuditEntry. Aplatit les arbres content[]/comments[]/
                 posts[] en résolvant parentId (racine → null + FK
                 parente). Documente le mapping dans l'en-tête du seed
                 généré. Les utilisateurs référencés dans authorId,
                 ownerId, actorId, members[].userId sont collectés et
                 upsertés avant toute autre entité (contrainte FK).

flow:            main() → read data/blog.json → blogDocumentSchema.parse
                 → transform → collecte des userId référencés →
                 buildSeedSource(doc) → mkdir prisma/ → write
                 prisma/seed.ts → console.log résumé.

ecosystem:       Scripts = [
                   "data/fixtures/blog.seed.json",
                   "scripts/backup.ts",
                   "scripts/export-prisma.ts",
                   "scripts/seed.ts",
                   "scripts/seed-users.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/validations.ts",
                  "@/app/blog/lib/types.ts",
                  "prisma/schema.prisma"]

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
  Notification,
  Post,
  Theme,
  UserContent,
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

function flattenContent(article: Article): FlatBlock[] {
  const byId = new Map(article.content.map((b) => [b.id, b]));
  function resolveParent(parentId: string): string | null {
    if (parentId === article.id) return null;
    if (byId.has(parentId)) return parentId;
    throw new Error(
      `[export-prisma] parentId orphelin dans article "${article.slug}" : ${parentId}`,
    );
  }
  return article.content.map((b) => {
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
          payload: { language: b.language, code: b.code, caption: b.caption },
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
}

function flattenComments(article: Article, comments: readonly Comment[]): FlatComment[] {
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
}

function flattenPosts(discussion: Discussion, posts: readonly Post[]): FlatPost[] {
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
  }));
}

interface FlatLike {
  id: string;
  targetType: "article" | "comment" | "post";
  targetId: string;
  userId: string;
  articleId: string | null;
  commentId: string | null;
  postId: string | null;
}

function extractLikes(doc: BlogDocument): FlatLike[] {
  const out: FlatLike[] = [];
  for (const a of doc.articles) {
    for (const userId of a.likedBy) {
      out.push({
        id: `like-art-${a.id}-${userId}`,
        targetType: "article",
        targetId: a.id,
        userId,
        articleId: a.id,
        commentId: null,
        postId: null,
      });
    }
    for (const c of a.comments) {
      for (const userId of c.likedBy) {
        out.push({
          id: `like-com-${c.id}-${userId}`,
          targetType: "comment",
          targetId: c.id,
          userId,
          articleId: null,
          commentId: c.id,
          postId: null,
        });
      }
    }
  }
  for (const g of doc.groups) {
    for (const d of g.discussions) {
      for (const p of d.posts) {
        for (const userId of p.likedBy) {
          out.push({
            id: `like-post-${p.id}-${userId}`,
            targetType: "post",
            targetId: p.id,
            userId,
            articleId: null,
            commentId: null,
            postId: p.id,
          });
        }
      }
    }
  }
  return out;
}

interface FlatFavorite {
  id: string;
  userId: string;
  articleId: string;
  folderId: string | null;
}

interface FlatFavoriteFolder {
  id: string;
  userId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FlatNotification {
  id: string;
  userId: string;
  type: Notification["type"];
  actorId: string;
  targetType: Notification["targetType"];
  targetId: string;
  excerpt: string;
  readAt: string | null;
  createdAt: string;
}

function flattenUserContent(
  userContent: Record<string, UserContent>,
  articles: readonly Article[],
): {
  favorites: FlatFavorite[];
  folders: FlatFavoriteFolder[];
  notifications: FlatNotification[];
} {
  const articleIds = new Set(articles.map((a) => a.id));
  const favorites: FlatFavorite[] = [];
  const folders: FlatFavoriteFolder[] = [];
  const notifications: FlatNotification[] = [];

  for (const [userId, uc] of Object.entries(userContent)) {
    for (const aId of uc.unfiledFavorites) {
      if (!articleIds.has(aId)) continue;
      favorites.push({
        id: `fav-${userId}-${aId}`,
        userId,
        articleId: aId,
        folderId: null,
      });
    }
    for (const folder of uc.favoriteFolders) {
      folders.push({
        id: folder.id,
        userId,
        name: folder.name,
        order: folder.order,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      });
      for (const aId of folder.articleIds) {
        if (!articleIds.has(aId)) continue;
        favorites.push({
          id: `fav-${userId}-${folder.id}-${aId}`,
          userId,
          articleId: aId,
          folderId: folder.id,
        });
      }
    }
    for (const n of uc.notifications) {
      notifications.push({
        id: n.id,
        userId,
        type: n.type,
        actorId: n.actorId,
        targetType: n.targetType,
        targetId: n.targetId,
        excerpt: n.excerpt,
        readAt: n.readAt ?? null,
        createdAt: n.createdAt,
      });
    }
  }

  return { favorites, folders, notifications };
}

interface FlatUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Collecte tous les userId référencés dans le document.
 * Génère un stub User minimal pour chacun (id + email + name dérivés),
 * afin que le seed Prisma puisse satisfaire les FK avant tout autre
 * upsert. Les utilisateurs déjà présents en base ne sont pas écrasés
 * (update: {} dans le seed généré).
 */
function collectReferencedUsers(doc: BlogDocument): FlatUser[] {
  const ids = new Set<string>();

  for (const id of doc.meta.adminIds) ids.add(id);
  for (const a of doc.articles) {
    ids.add(a.authorId);
    for (const c of a.comments) ids.add(c.authorId);
  }
  for (const g of doc.groups) {
    ids.add(g.ownerId);
    for (const m of g.members) ids.add(m.userId);
    for (const d of g.discussions) {
      ids.add(d.authorId);
      for (const p of d.posts) ids.add(p.authorId);
    }
  }
  for (const [userId, uc] of Object.entries(doc.userContent)) {
    ids.add(userId);
    for (const n of uc.notifications) ids.add(n.actorId);
  }
  for (const entry of doc.auditLog) ids.add(entry.actorId);

  const users: FlatUser[] = [];
  for (const id of ids) {
    users.push({
      id,
      name: `User ${id.slice(0, 8)}`,
      email: `${id}@seed.local`,
    });
  }
  return users.sort((a, b) => a.id.localeCompare(b.id));
}

/* ------------------------------------------------------------------ */
/*  Génération du seed.ts                                              */
/* ------------------------------------------------------------------ */

function buildSeedSource(doc: BlogDocument): string {
  const flatBlocks: FlatBlock[] = [];
  const flatComments: FlatComment[] = [];
  for (const a of doc.articles) {
    flatBlocks.push(...flattenContent(a));
    flatComments.push(...flattenComments(a, a.comments));
  }

  const flatPosts: FlatPost[] = [];
  for (const g of doc.groups) {
    for (const d of g.discussions) {
      flatPosts.push(...flattenPosts(d, d.posts));
    }
  }

  const themes: readonly Theme[] = doc.taxonomy.themes;
  const flatLikes = extractLikes(doc);
  const { favorites, folders, notifications } = flattenUserContent(
    doc.userContent,
    doc.articles,
  );
  const users = collectReferencedUsers(doc);

  const data = {
    meta: doc.meta,
    users,
    themes,
    tags: doc.taxonomy.tags,
    articles: doc.articles,
    contentBlocks: flatBlocks,
    comments: flatComments,
    likes: flatLikes,
    groups: doc.groups,
    discussions: doc.groups.flatMap((g: Group) => g.discussions),
    posts: flatPosts,
    notifications,
    folders,
    favorites,
    auditLog: doc.auditLog,
  };

  return `/*
 * prisma/seed.ts — GÉNÉRÉ AUTOMATIQUEMENT par scripts/export-prisma.ts
 * Ne pas éditer à la main. Régénérer via \`pnpm export:prisma\`.
 *
 * Mapping JSON (data/blog.json) → Prisma :
 *
 *   - User          : stubs créés pour tous les ids référencés (authorId,
 *                     ownerId, members[].userId, notifications[].actorId,
 *                     auditLog[].actorId). Ne réécrit JAMAIS un User
 *                     existant (update: {}). Idempotent.
 *   - Theme         : 1:1.
 *   - Category      : imbriquée theme.categories[] → FK themeId.
 *   - SubCategory   : imbriquée category.subCategories[] → FK categoryId.
 *   - Tag           : table plate.
 *   - Article       : 1:1 (authorId, themeId, categoryId, subCategoryId).
 *   - ArticleTag    : jointure article.tagIds[] → rows (articleId, tagId).
 *   - ContentBlock  : content[] aplati (parentId === article.id → null).
 *   - Comment       : comments[] aplati (parentId === article.id → null).
 *   - Like          : extrait de article.likedBy[] / comment.likedBy[] /
 *                     post.likedBy[] → rows (targetType, targetId, userId).
 *   - Group         : 1:1.
 *   - GroupMember   : members[] → FK groupId + userId, PK composite.
 *   - Discussion    : group.discussions[] → FK groupId.
 *   - Post          : posts[] aplati (parentId === discussion.id → null).
 *   - Notification  : userContent[userId].notifications[].
 *   - FavoriteFolder: userContent[userId].favoriteFolders[].
 *   - Favorite      : unfiledFavorites[] (folderId null) + folders[].articleIds[]
 *                     (folderId non null). Un article figure au plus une fois
 *                     par user — contrainte @@unique([userId, articleId]).
 *   - AuditEntry    : auditLog[] 1:1.
 *
 * Exécution :
 *   pnpm prisma db seed
 *   pnpm prisma db seed -- --reset
 */

/* eslint-disable */
// @ts-nocheck

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const RESET = process.argv.includes("--reset");

const DATA = ${JSON.stringify(data, null, 2)} as const;

async function wipe() {
  /* Ordre respectant les FK (enfants d'abord). */
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.favoriteFolder.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.auditEntry.deleteMany();
}

async function main() {
  if (RESET) await wipe();

  /* ------------------------------------------------------------------ */
  /*  USERS — stubs pour satisfaire les FK                              */
  /* ------------------------------------------------------------------ */
  for (const u of DATA.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {}, // ne jamais écraser un User existant
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: false,
      },
    });
  }

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
  /*  ARTICLES + ArticleTag                                             */
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
    for (const tagId of a.tagIds) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: a.id, tagId } },
        update: {},
        create: { articleId: a.id, tagId },
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  CONTENT BLOCKS + COMMENTAIRES                                     */
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
  /*  LIKES                                                             */
  /* ------------------------------------------------------------------ */
  for (const l of DATA.likes) {
    await prisma.like.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        targetType: l.targetType,
        targetId: l.targetId,
        userId: l.userId,
        articleId: l.articleId,
        commentId: l.commentId,
        postId: l.postId,
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
        where: { groupId_userId: { groupId: g.id, userId: m.userId } },
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
    const parentGroup = DATA.groups.find((g) =>
      g.discussions.some((x) => x.id === d.id),
    );
    if (!parentGroup) continue;
    await prisma.discussion.upsert({
      where: { id: d.id },
      update: {
        groupId: parentGroup.id,
        title: d.title,
        content: d.content,
        authorId: d.authorId,
        order: d.order,
      },
      create: {
        id: d.id,
        groupId: parentGroup.id,
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

  /* ------------------------------------------------------------------ */
  /*  NOTIFICATIONS                                                     */
  /* ------------------------------------------------------------------ */
  for (const n of DATA.notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {
        userId: n.userId,
        type: n.type,
        actorId: n.actorId,
        targetType: n.targetType,
        targetId: n.targetId,
        excerpt: n.excerpt,
        readAt: n.readAt ? new Date(n.readAt) : null,
      },
      create: {
        id: n.id,
        userId: n.userId,
        type: n.type,
        actorId: n.actorId,
        targetType: n.targetType,
        targetId: n.targetId,
        excerpt: n.excerpt,
        readAt: n.readAt ? new Date(n.readAt) : null,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  FAVORITES                                                         */
  /* ------------------------------------------------------------------ */
  for (const f of DATA.folders) {
    await prisma.favoriteFolder.upsert({
      where: { id: f.id },
      update: {
        userId: f.userId,
        name: f.name,
        order: f.order,
      },
      create: {
        id: f.id,
        userId: f.userId,
        name: f.name,
        order: f.order,
      },
    });
  }
  for (const fav of DATA.favorites) {
    await prisma.favorite.upsert({
      where: { id: fav.id },
      update: {
        userId: fav.userId,
        articleId: fav.articleId,
        folderId: fav.folderId,
      },
      create: {
        id: fav.id,
        userId: fav.userId,
        articleId: fav.articleId,
        folderId: fav.folderId,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  AUDIT                                                             */
  /* ------------------------------------------------------------------ */
  for (const e of DATA.auditLog) {
    await prisma.auditEntry.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        actorId: e.actorId,
        action: e.action,
        resourceId: e.resourceId,
        metadata: e.metadata ? JSON.stringify(e.metadata) : null,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  RÉSUMÉ                                                            */
  /* ------------------------------------------------------------------ */
  console.log(
    \`✔ Seed Prisma : \${DATA.users.length} users, \${DATA.themes.length} thèmes, \${DATA.articles.length} articles, \${DATA.contentBlocks.length} blocs, \${DATA.comments.length} commentaires, \${DATA.likes.length} likes, \${DATA.groups.length} groupes, \${DATA.posts.length} posts, \${DATA.notifications.length} notifications, \${DATA.favorites.length} favoris, \${DATA.folders.length} dossiers.\`,
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
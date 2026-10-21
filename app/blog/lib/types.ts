/*
path :           app/blog/lib/types.ts
tag :            ["blog", "types", "z.infer", "config", "generic"]
projectId:       new-genesis
type:            config
generic:         true

role:            Types TypeScript du module Blog, dérivés par z.infer
                 depuis @/app/blog/lib/validations.ts. Source unique de
                 vérité : aucune interface manuelle, aucun type écrit à
                 la main. Réexporte BlogDocument, BlogMeta, Taxonomy,
                 Theme, Category, SubCategory, Tag, Playlist (NOUVEAU),
                 PlaylistInput (NOUVEAU), PlaylistVisibility (NOUVEAU),
                 Article, ContentBlock et ses 8 sous-types, Comment,
                 Group, GroupMember, Discussion, Post, Notification,
                 FavoriteFolder, UserContent, AuditEntry, ainsi que les
                 schémas d'input correspondants et les constantes
                 partagées (BLOG_SCHEMA_VERSION = 3,
                 BLOG_ALLOWED_CONTENT_TYPES).

flow:            Module TypeScript pur → ré-export des types via
                 z.infer<typeof schema> + ré-export explicite des
                 constantes exportées par validations.ts. Aucun état,
                 aucun effet, aucune dépendance runtime au-delà de zod
                 (import type uniquement).

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

relatedFiles:    ["@/app/blog/lib/validations.ts"]

imports:         ["zod", "@/app/blog/lib/validations"]

exports:         ["BlogDocument", "BlogMeta", "Taxonomy", "Theme",
                  "Category", "SubCategory", "Tag",
                  "Playlist", "PlaylistInput", "PlaylistVisibility",
                  "Article", "ArticleStatus", "Visibility",
                  "ContentBlock", "SectionBlock", "ParagraphBlock",
                  "ImageBlock", "VideoBlock", "AudioBlock", "CodeBlock",
                  "EmbedBlock", "DocumentBlock", "ContentBlockType",
                  "Comment", "Group", "GroupMember", "Discussion", "Post",
                  "Notification", "FavoriteFolder", "UserContent",
                  "AuditEntry", "ArticleInput", "CommentInput",
                  "DiscussionInput", "PostInput", "GroupInput",
                  "NotificationInput", "FavoriteFolderInput",
                  "BLOG_SCHEMA_VERSION", "BLOG_ALLOWED_CONTENT_TYPES"]

useBy:           ["@/app/blog/lib/storage.ts",
                  "@/app/blog/lib/tree.ts",
                  "@/app/blog/lib/utils/reading-time.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/services/comment.ts",
                  "@/app/blog/lib/services/favorite.ts",
                  "@/app/blog/lib/services/group.ts",
                  "@/app/blog/lib/services/like.ts",
                  "@/app/blog/lib/services/notification.ts",
                  "@/app/blog/lib/services/playlist.ts",
                  "@/app/blog/lib/services/search.ts",
                  "@/app/blog/lib/services/taxonomy.ts"]

userStories:     ["us1100010",
                  "*en tant qu'auteur je veux regrouper mes articles en playlists"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { z } from "zod";

import {
  BLOG_SCHEMA_VERSION as BLOG_SCHEMA_VERSION_VALUE,
  articleInputSchema,
  articleSchema,
  articleStatusEnum,
  auditEntrySchema,
  audioBlockSchema,
  blogDocumentSchema,
  blogMetaSchema,
  categorySchema,
  codeBlockSchema,
  commentInputSchema,
  commentSchema,
  contentBlockSchema,
  discussionInputSchema,
  discussionSchema,
  documentBlockSchema,
  embedBlockSchema,
  favoriteFolderInputSchema,
  favoriteFolderSchema,
  groupInputSchema,
  groupMemberSchema,
  groupSchema,
  imageBlockSchema,
  notificationInputSchema,
  notificationSchema,
  paragraphBlockSchema,
  playlistInputSchema,
  playlistSchema,
  playlistVisibilityEnum,
  postInputSchema,
  postSchema,
  sectionBlockSchema,
  subCategorySchema,
  tagSchema,
  taxonomySchema,
  themeSchema,
  userContentMapSchema,
  userContentSchema,
  videoBlockSchema,
  visibilityEnum,
} from "@/app/blog/lib/validations";

/* ------------------------------------------------------------------ */
/*  Constantes partagées                                              */
/* ------------------------------------------------------------------ */

export const BLOG_SCHEMA_VERSION = BLOG_SCHEMA_VERSION_VALUE;

/** Les 8 types de blocs de contenu supportés par le module. */
export const BLOG_ALLOWED_CONTENT_TYPES = [
  "section",
  "paragraph",
  "image",
  "video",
  "audio",
  "code",
  "embed",
  "document",
] as const;

export type ContentBlockType = (typeof BLOG_ALLOWED_CONTENT_TYPES)[number];

/* ------------------------------------------------------------------ */
/*  Entités du document                                               */
/* ------------------------------------------------------------------ */

export type BlogMeta = z.infer<typeof blogMetaSchema>;
export type SubCategory = z.infer<typeof subCategorySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;

export type Playlist = z.infer<typeof playlistSchema>;
export type PlaylistInput = z.infer<typeof playlistInputSchema>;
export type PlaylistVisibility = z.infer<typeof playlistVisibilityEnum>;

export type ArticleStatus = z.infer<typeof articleStatusEnum>;
export type Visibility = z.infer<typeof visibilityEnum>;

/* ------------------------------------------------------------------ */
/*  Blocs de contenu                                                  */
/* ------------------------------------------------------------------ */

export type SectionBlock = z.infer<typeof sectionBlockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type VideoBlock = z.infer<typeof videoBlockSchema>;
export type AudioBlock = z.infer<typeof audioBlockSchema>;
export type CodeBlock = z.infer<typeof codeBlockSchema>;
export type EmbedBlock = z.infer<typeof embedBlockSchema>;
export type DocumentBlock = z.infer<typeof documentBlockSchema>;

export type ContentBlock = z.infer<typeof contentBlockSchema>;

/* ------------------------------------------------------------------ */
/*  Article, commentaires                                             */
/* ------------------------------------------------------------------ */

export type Comment = z.infer<typeof commentSchema>;
export type Article = z.infer<typeof articleSchema>;

/* ------------------------------------------------------------------ */
/*  Groupes, discussions, posts                                       */
/* ------------------------------------------------------------------ */

export type GroupMember = z.infer<typeof groupMemberSchema>;
export type Post = z.infer<typeof postSchema>;
export type Discussion = z.infer<typeof discussionSchema>;
export type Group = z.infer<typeof groupSchema>;

/* ------------------------------------------------------------------ */
/*  Contenu personnel                                                 */
/* ------------------------------------------------------------------ */

export type Notification = z.infer<typeof notificationSchema>;
export type FavoriteFolder = z.infer<typeof favoriteFolderSchema>;
export type UserContent = z.infer<typeof userContentSchema>;
export type UserContentMap = z.infer<typeof userContentMapSchema>;

/* ------------------------------------------------------------------ */
/*  Journal d'audit                                                   */
/* ------------------------------------------------------------------ */

export type AuditEntry = z.infer<typeof auditEntrySchema>;

/* ------------------------------------------------------------------ */
/*  Document complet                                                  */
/* ------------------------------------------------------------------ */

export type BlogDocument = z.infer<typeof blogDocumentSchema>;

/* ------------------------------------------------------------------ */
/*  Inputs (Server Actions)                                           */
/* ------------------------------------------------------------------ */

export type ArticleInput = z.infer<typeof articleInputSchema>;
export type CommentInput = z.infer<typeof commentInputSchema>;
export type DiscussionInput = z.infer<typeof discussionInputSchema>;
export type PostInput = z.infer<typeof postInputSchema>;
export type GroupInput = z.infer<typeof groupInputSchema>;
export type NotificationInput = z.infer<typeof notificationInputSchema>;
export type FavoriteFolderInput = z.infer<typeof favoriteFolderInputSchema>;
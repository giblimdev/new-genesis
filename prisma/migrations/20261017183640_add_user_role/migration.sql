-- AlterTable
ALTER TABLE "user" ADD COLUMN "role" TEXT DEFAULT 'user';

-- CreateTable
CREATE TABLE "theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "themeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "category_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sub_category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sub_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImage" TEXT,
    "readingTimeMin" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "status" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "article_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "article_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "article_tag" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("articleId", "tagId"),
    CONSTRAINT "article_tag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "article_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_block_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_block_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "content_block" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT,
    "commentId" TEXT,
    "postId" TEXT,
    CONSTRAINT "like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "visibility" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "group_member" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("groupId", "userId"),
    CONSTRAINT "group_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "discussion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "post_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "favorite_folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorite_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorite_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "favorite_folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "theme_slug_key" ON "theme"("slug");

-- CreateIndex
CREATE INDEX "theme_order_idx" ON "theme"("order");

-- CreateIndex
CREATE INDEX "category_themeId_order_idx" ON "category"("themeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "category_themeId_slug_key" ON "category"("themeId", "slug");

-- CreateIndex
CREATE INDEX "sub_category_categoryId_order_idx" ON "sub_category"("categoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_categoryId_slug_key" ON "sub_category"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_slug_key" ON "article"("slug");

-- CreateIndex
CREATE INDEX "article_themeId_status_idx" ON "article"("themeId", "status");

-- CreateIndex
CREATE INDEX "article_authorId_idx" ON "article"("authorId");

-- CreateIndex
CREATE INDEX "article_publishedAt_idx" ON "article"("publishedAt");

-- CreateIndex
CREATE INDEX "content_block_articleId_parentId_order_idx" ON "content_block"("articleId", "parentId", "order");

-- CreateIndex
CREATE INDEX "comment_articleId_parentId_order_idx" ON "comment"("articleId", "parentId", "order");

-- CreateIndex
CREATE INDEX "like_userId_idx" ON "like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "like_targetType_targetId_userId_key" ON "like"("targetType", "targetId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_slug_key" ON "group"("slug");

-- CreateIndex
CREATE INDEX "group_member_userId_idx" ON "group_member"("userId");

-- CreateIndex
CREATE INDEX "discussion_groupId_order_idx" ON "discussion"("groupId", "order");

-- CreateIndex
CREATE INDEX "post_discussionId_parentId_order_idx" ON "post"("discussionId", "parentId", "order");

-- CreateIndex
CREATE INDEX "notification_userId_readAt_idx" ON "notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notification_userId_createdAt_idx" ON "notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "favorite_folder_userId_order_idx" ON "favorite_folder"("userId", "order");

-- CreateIndex
CREATE INDEX "favorite_userId_folderId_idx" ON "favorite"("userId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_userId_articleId_key" ON "favorite"("userId", "articleId");

-- CreateIndex
CREATE INDEX "audit_entry_actorId_createdAt_idx" ON "audit_entry"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_entry_resourceId_idx" ON "audit_entry"("resourceId");

/*
path :           app/blog/playlists/manage/page.tsx
tag :            ["blog", "page", "playlist", "manage", "protected", "admin"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de gestion admin/author des playlists. Sync page +
                 Suspense ; require session + role admin ou author ; sinon
                 404 (principe « trust the server » : l'autorisation est
                 aussi vérifiée dans les Server Actions). Rend
                 <PlaylistManager playlists /> qui gère le CRUD.

                 ⚠️ `await io()` AVANT getBlogSession() (Prisma 7).

flow:            BlogPlaylistsManagePage (sync) → Suspense →
                 ManageSection async → await io() → getBlogSession →
                 si null 404 → isAdmin OU role author sinon 404 →
                 listPlaylists() → <PlaylistManager />.

ecosystem:       Blog = [
                   ... (voir tableau de référence)
                 ]

relatedFiles:    ["@/app/blog/lib/services/playlist.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/components/PlaylistManager.tsx",
                  "@/lib/prisma.ts"]

imports:         ["react", "next/navigation", "next/cache", "next/link",
                  "lucide-react",
                  "@/app/blog/lib/services/playlist",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/admin",
                  "@/app/blog/components/PlaylistManager",
                  "@/lib/prisma",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogPlaylistsManagePage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'auteur je veux gérer mes playlists"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import type { Metadata } from "next";
import { ArrowLeft, ListVideo } from "lucide-react";

import { listPlaylists } from "@/app/blog/lib/services/playlist";
import { getBlogSession } from "@/app/blog/lib/session";
import { isAdmin } from "@/app/blog/lib/admin";
import { PlaylistManager } from "@/app/blog/components/PlaylistManager";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Gérer les playlists · Blog",
};

export default function BlogPlaylistsManagePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
          Administration
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <ListVideo className="size-5 text-chart-4" aria-hidden />
          Playlists
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez, éditez et supprimez les playlists éditoriales du blog.
        </p>
      </header>

      <Suspense fallback={<ManageSkeleton />}>
        <ManageSection />
      </Suspense>
    </div>
  );
}

async function ManageSection() {
  await io();

  const session = await getBlogSession();
  if (!session?.user) notFound();

  const admin = await isAdmin();
  if (!admin) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, deletedAt: true },
    });
    if (!user || user.deletedAt !== null || user.role !== "author") {
      notFound();
    }
  }

  const playlists = await listPlaylists();
  return <PlaylistManager playlists={playlists} />;
}

function ManageSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}
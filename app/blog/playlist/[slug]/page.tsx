/*
path :           app/blog/playlist/[slug]/page.tsx
tag :            ["blog", "page", "playlist", "detail", "public"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page publique d'une playlist. Sync page + Suspense ;
                 charge la playlist, ses articles ordonnés
                 (playlist.articleIds[]) et un CTA de gestion si
                 viewer est admin. 404 si playlist absente ou si
                 visibility === "private" et viewer ≠ admin. Les articles
                 sont filtrés : seuls published + public (ou unlisted
                 si viewer est admin) sont rendus. Affiche la couverture
                 (hero), nom, description, compteur, et une grille
                 ordonnée d'<ArticleCard />.

                 ⚠️ `await io()` AVANT getBlogSession() (Prisma 7).

flow:            PlaylistPage → Suspense → PlaylistSection → await io()
                 → await params → getPlaylistBySlug → si null 404 → si
                 private et pas admin 404 → Promise.all([listArticles,
                 getBlogSession, isAdmin]) → filtre par articleIds puis
                 par status/visibility → rend hero + grille + CTA
                 Gérer (si admin).

ecosystem:       Blog = [
                   ... (voir tableau de référence)
                 ]

relatedFiles:    ["@/app/blog/lib/services/playlist.ts",
                  "@/app/blog/lib/services/article.ts",
                  "@/app/blog/lib/session.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/media-url.ts",
                  "@/app/blog/components/ArticleCard.tsx"]

imports:         ["react", "next/link", "next/navigation", "next/cache",
                  "lucide-react",
                  "@/app/blog/lib/services/playlist",
                  "@/app/blog/lib/services/article",
                  "@/app/blog/lib/session",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/media-url",
                  "@/app/blog/components/ArticleCard",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogPlaylistPage", "generateMetadata"]

useBy:           []

userStories:     ["*en tant que lecteur je veux parcourir une playlist dans l'ordre"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import type { Metadata } from "next";
import { ListVideo, Lock, Settings } from "lucide-react";

import { getPlaylistBySlug } from "@/app/blog/lib/services/playlist";
import { listArticles } from "@/app/blog/lib/services/article";
import { getBlogSession } from "@/app/blog/lib/session";
import { isAdmin } from "@/app/blog/lib/admin";
import { resolveMediaUrl } from "@/app/blog/lib/media-url";
import { ArticleCard } from "@/app/blog/components/ArticleCard";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) return { title: "Playlist introuvable" };
  return {
    title: playlist.name,
    description: playlist.description,
  };
}

export default function BlogPlaylistPage({
  params,
}: {
  params: PageParams;
}) {
  return (
    <Suspense fallback={<PlaylistSkeleton />}>
      <PlaylistSection params={params} />
    </Suspense>
  );
}

async function PlaylistSection({
  params,
}: {
  readonly params: PageParams;
}) {
  await io();

  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);
  if (!playlist) notFound();

  const admin = await isAdmin();
  if (playlist.visibility === "private" && !admin) notFound();

  const session = await getBlogSession();
  const viewerId = session?.user?.id ?? null;

  const allArticles = await listArticles();
  const byId = new Map(allArticles.map((a) => [a.id, a]));

  const ordered = playlist.articleIds
    .map((id) => byId.get(id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined)
    .filter((a) => {
      if (a.status !== "published") return admin || a.authorId === viewerId;
      if (a.visibility === "private")
        return admin || a.authorId === viewerId;
      if (a.visibility === "unlisted") return true;
      return true;
    });

  const cover = playlist.coverImage
    ? resolveMediaUrl(playlist.coverImage)
    : undefined;
  const count = playlist.articleIds.length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:py-14">
      <header className="space-y-3">
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <span aria-hidden>·</span>
          <Link href="/blog/playlists" className="hover:text-foreground">
            Playlists
          </Link>
          <span aria-hidden>·</span>
          <span className="text-foreground">{playlist.name}</span>
        </nav>

        {cover && (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-4">
              <ListVideo className="size-3.5" aria-hidden />
              Playlist
              {playlist.visibility === "private" && (
                <Lock className="ml-1 size-3" aria-hidden />
              )}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {playlist.description}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {count} article{count > 1 ? "s" : ""}
            </p>
          </div>
          {admin && (
            <Link
              href="/blog/playlists/manage"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} gap-2`}
            >
              <Settings className="size-3.5" aria-hidden />
              Gérer
            </Link>
          )}
        </div>
      </header>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun article visible dans cette playlist pour l&apos;instant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
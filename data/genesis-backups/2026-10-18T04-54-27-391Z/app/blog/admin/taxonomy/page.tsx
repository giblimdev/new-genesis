/*
path :           app/blog/admin/taxonomy/page.tsx
tag :            ["blog", "page", "admin", "taxonomy"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'administration de la taxonomie. Sync page +
                 Suspense. La lecture de searchParams (?return=<url>)
                 est isolée dans TaxonomySection (async), SOUS
                 <Suspense> : c'est la seule façon de lire searchParams
                 sans bloquer le prérendu (règle Next.js 16, cf.
                 nextjs.org/docs/messages/blocking-prerender-runtime).
                 Le header (statique) ne dépend pas de searchParams ;
                 le bouton « Retour au formulaire » est donc rendu par
                 TaxonomySection, en haut du contenu, juste après le
                 header.

                 Charge themes + tags dans TaxonomySection et rend
                 les composants existants TaxonomyForm (CRUD
                 thème/catégorie/sous-catégorie en accordéon) et
                 TagForm (dans une dialog gérée localement par un
                 petit orchestrateur inline).

                 Sécurité : safeReturnUrl() refuse tout ce qui n'est
                 pas un chemin interne commençant par "/" (anti open
                 redirect : pas de "//evil.com", pas de
                 "https://evil.com", pas de "\n").

                 Le bouton « Retour au formulaire » est rendu en
                 <Link className={buttonVariants()}> — PAS en
                 <Button render={<Link />}>, conformément à la
                 convention AdminUsersPage (un lien de navigation
                 doit rester un <a>).

flow:            BlogAdminTaxonomyPage (sync, AUCUN accès à
                 searchParams) → header statique → <Suspense
                 fallback={<TaxonomySkeleton />}> → TaxonomySection
                 (async) → await searchParams → safeReturnUrl →
                 si returnUrl : lien « Retour au formulaire » →
                 Promise.all([listThemes, listTags]) →
                 <TaxonomyForm themes /> + <TagSection tags />.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/components/admin/TaxonomyForm.tsx",
                  "@/app/blog/components/admin/TagForm.tsx",
                  "@/app/blog/components/TagSection.tsx",
                  "@/app/blog/lib/services/taxonomy.ts"]

imports:         ["react", "next/link", "lucide-react",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/components/admin/TaxonomyForm",
                  "@/app/blog/components/TagSection",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogAdminTaxonomyPage"]

useBy:           []

userStories:     ["us1100001", "us1100002", "us1100003", "us1100004"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { listTags, listThemes } from "@/app/blog/lib/services/taxonomy";
import { TaxonomyForm } from "@/app/blog/components/admin/TaxonomyForm";
import { TagSection } from "@/app/blog/components/TagSection";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Validation du paramètre return                                     */
/* ------------------------------------------------------------------ */

/**
 * Refuse tout ce qui n'est pas un chemin interne commençant par "/".
 * Protège contre les open redirects (ex. ?return=//evil.com ou
 * ?return=https://evil.com).
 */
function safeReturnUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("\n") || raw.includes("\r")) return null;
  return raw;
}

/* ------------------------------------------------------------------ */
/*  Page (sync, aucun accès à searchParams)                            */
/* ------------------------------------------------------------------ */

export default function BlogAdminTaxonomyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
          Administration
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Taxonomie
        </h1>
        <p className="text-sm text-muted-foreground">
          Gérez les thèmes, catégories, sous-catégories et tags du blog.
        </p>
      </header>

      <Suspense fallback={<TaxonomySkeleton />}>
        <TaxonomySection />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async (searchParams sous Suspense)                         */
/* ------------------------------------------------------------------ */

interface TaxonomySectionProps {
  readonly searchParams?: Promise<{ return?: string | string[] }>;
}

async function TaxonomySection({ searchParams }: TaxonomySectionProps) {
  /* searchParams est optionnel : lors du premier rendu Suspense, il
     peut être undefined (fallback) ; Next.js passe ensuite la Promise. */
  const params = searchParams ? await searchParams : {};
  const raw = Array.isArray(params.return) ? params.return[0] : params.return;
  const returnUrl = safeReturnUrl(raw);

  const [themes, tags] = await Promise.all([listThemes(), listTags()]);

  return (
    <div className="space-y-6">
      {returnUrl && (
        <Link
          href={returnUrl}
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} -ml-2 gap-1.5 text-muted-foreground hover:text-foreground`}
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Retour au formulaire
        </Link>
      )}

      <TaxonomyForm themes={themes} />
      <TagSection tags={tags} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function TaxonomySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
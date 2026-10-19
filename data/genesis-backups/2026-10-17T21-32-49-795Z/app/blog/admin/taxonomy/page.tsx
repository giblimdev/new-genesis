/*
path :           app/blog/admin/taxonomy/page.tsx
tag :            ["blog", "page", "admin", "taxonomy"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'administration de la taxonomie. Sync page +
                 Suspense ; charge themes + tags dans un composant
                 async et rend les composants existants TaxonomyForm
                 (CRUD thème/catégorie/sous-catégorie en accordéon) et
                 TagForm (dans une dialog gérée localement par un
                 petit orchestrateur inline).

                 Supporte un query param optionnel ?return=<url> :
                 si présent (ex. retour depuis ArticleForm quand
                 l'utilisateur clique « Gérer la taxonomie »), affiche
                 un bouton « Retour au formulaire » qui pousse vers
                 cette URL. Le brouillon du formulaire article est
                 préservé côté client via sessionStorage (voir
                 articleDraft.ts) — cette page n'a rien à faire de
                 plus, la restauration se fait au montage d'ArticleForm.

                 Sécurité : safeReturnUrl() refuse tout ce qui n'est
                 pas un chemin interne commençant par "/" (anti open
                 redirect : pas de "//evil.com", pas de
                 "https://evil.com", pas de "\n").

                 Le bouton « Retour au formulaire » est rendu en
                 <Link className={buttonVariants()}> — PAS en
                 <Button render={<Link />}>, conformément à la
                 convention AdminUsersPage (un lien de navigation
                 doit rester un <a> pour la sémantique et
                 l'accessibilité).

flow:            BlogAdminTaxonomyPage (async, lit searchParams) →
                 safeReturnUrl(params.return) → returnUrl | null →
                 header (lien « Retour au formulaire » si returnUrl)
                 → Suspense → TaxonomySection async → listThemes +
                 listTags → <TaxonomyForm themes /> + <TagSection tags />.

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
/*  Page                                                              */
/* ------------------------------------------------------------------ */

interface BlogAdminTaxonomyPageProps {
  readonly searchParams: Promise<{ return?: string | string[] }>;
}

export default async function BlogAdminTaxonomyPage({
  searchParams,
}: BlogAdminTaxonomyPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.return) ? params.return[0] : params.return;
  const returnUrl = safeReturnUrl(raw);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        {returnUrl && (
          <Link
            href={returnUrl}
            className={`${buttonVariants({ variant: "ghost", size: "sm" })} -ml-2 gap-1.5 text-muted-foreground hover:text-foreground`}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Retour au formulaire
          </Link>
        )}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
            Administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Taxonomie
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez les thèmes, catégories, sous-catégories et tags du blog.
          </p>
        </div>
      </header>

      <Suspense fallback={<TaxonomySkeleton />}>
        <TaxonomySection />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async                                                      */
/* ------------------------------------------------------------------ */

async function TaxonomySection() {
  const [themes, tags] = await Promise.all([listThemes(), listTags()]);
  return (
    <>
      <TaxonomyForm themes={themes} />
      <TagSection tags={tags} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function TaxonomySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
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

flow:            AdminTaxonomyPage → Suspense → AdminTaxonomySection →
                 listThemes + listTags → <TaxonomyForm themes /> +
                 <TagSection tags /> (Client Component local).

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/components/admin/TaxonomyForm.tsx",
                  "@/app/blog/components/admin/TagForm.tsx",
                  "@/app/blog/lib/services/taxonomy.ts"]

imports:         ["react", "lucide-react",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/types",
                  "@/app/blog/components/admin/TaxonomyForm",
                  "@/app/blog/components/admin/TagForm",
                  "@/app/blog/components/TagSection",
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

import { listTags, listThemes } from "@/app/blog/lib/services/taxonomy";
import { TaxonomyForm } from "@/app/blog/components/admin/TaxonomyForm";
import { TagSection } from "@/app/blog/components/TagSection";
import { Skeleton } from "@/components/ui/skeleton";

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
      </header>
      <Suspense fallback={<TaxonomySkeleton />}>
        <TaxonomySection />
      </Suspense>
    </div>
  );
}

async function TaxonomySection() {
  const [themes, tags] = await Promise.all([listThemes(), listTags()]);
  return (
    <>
      <TaxonomyForm themes={themes} />
      <TagSection tags={tags} />
    </>
  );
}

function TaxonomySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
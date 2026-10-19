/*
path :           app/core/[flow]/feature/page.tsx
tag :            ["help", "feature", "page", "scrum"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de gestion des features pour un flux Scrum. Composant page
                 synchrone qui monte un <Suspense> ; la validation du flow et la
                 lecture des données sont isolées dans un composant async. Le
                 skeleton reproduit la grille 1 / 2 / 3 / 4 colonnes de FeatureList.

flow:            Server Component sync → <Suspense fallback=<FeatureListSkeleton />> →
                 <FeatureSection params={params} /> async → await params → validation
                 via SCRUM_FLOWS → listFeatures(flow) → <FeatureList />.

ecosystem:       Help = [
                   "@/app/core/[flow]/epic/page.tsx",
                   "@/app/core/[flow]/feature/page.tsx",
                   "@/app/core/[flow]/global-json/page.tsx",
                   "@/app/core/[flow]/idee/page.tsx",
                   "@/app/core/[flow]/layout.tsx",
                   "@/app/core/[flow]/page.tsx",
                   "@/app/core/[flow]/persona/page.tsx",
                   "@/app/core/[flow]/sprint/page.tsx",
                   "@/app/core/[flow]/user-story/page.tsx",
                   "@/app/core/layout.tsx",
                   "@/app/core/page.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/FeatureList.tsx",
                  "@/app/core/lib/scrum/services/feature.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/feature",
                  "@/app/core/components/scrum/FeatureList",
                  "@/components/ui/skeleton"]

exports:         ["default FeaturePage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux gérer les features d'un flux Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { listFeatures } from "@/app/core/lib/scrum/services/feature";
import { FeatureList } from "@/app/core/components/scrum/FeatureList";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PageParams = Promise<{ flow: string }>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isScrumFlow(value: string): value is ScrumFlow {
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/*  Page (sync)                                                        */
/* ------------------------------------------------------------------ */

export default function FeaturePage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<FeatureListSkeleton />}>
      <FeatureSection params={params} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async                                                      */
/* ------------------------------------------------------------------ */

async function FeatureSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const features = await listFeatures(flow);
  return <FeatureList flow={flow} features={features} />;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function FeatureListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
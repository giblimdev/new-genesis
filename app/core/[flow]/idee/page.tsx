/*
path :           app/core/help/[flow]/idee/page.tsx
tag :            ["help", "idee", "page", "scrum"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de gestion des idées pour un flux Scrum donné. Le composant
                 page est synchrone et ne fait que monter un <Suspense>. Tout l'accès
                 runtime (await params, validation, lecture des données) est isolé
                 dans le composant async <IdeeSection />, conformément à Cache
                 Components.

flow:            Server Component sync → <Suspense fallback=<IdeeListSkeleton />> →
                 <IdeeSection params={params} /> async → await params → validation
                 via SCRUM_FLOWS → listIdees(flow) → <IdeeList />.

ecosystem:       Help = [
                   "@/app/core/help/[flow]/epic/page.tsx",
                   "@/app/core/help/[flow]/feature/page.tsx",
                   "@/app/core/help/[flow]/global-json/page.tsx",
                   "@/app/core/help/[flow]/idee/page.tsx",
                   "@/app/core/help/[flow]/layout.tsx",
                   "@/app/core/help/[flow]/page.tsx",
                   "@/app/core/help/[flow]/persona/page.tsx",
                   "@/app/core/help/[flow]/sprint/page.tsx",
                   "@/app/core/help/[flow]/user-story/page.tsx",
                   "@/app/core/help/layout.tsx",
                   "@/app/core/help/page.tsx",
                 ]

relatedFiles:    ["@/components/scrum/IdeeList.tsx",
                  "@/app/core/lib/scrum/services/idee.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/idee",
                  "@/components/scrum/IdeeList",
                  "@/components/ui/skeleton"]

exports:         ["default IdeePage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux gérer les idées d'un flux Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { listIdees } from "@/app/core/lib/scrum/services/idee";
import { IdeeList } from "@/app/core/components/scrum/IdeeList";
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
/*  Page (sync, ne fait que monter le Suspense)                        */
/* ------------------------------------------------------------------ */

export default function IdeePage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<IdeeListSkeleton />}>
      <IdeeSection params={params} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async (toute la logique runtime est ici)                   */
/* ------------------------------------------------------------------ */

async function IdeeSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const idees = await listIdees(flow);
  return <IdeeList flow={flow} idees={idees} />;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function IdeeListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
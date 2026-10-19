/*
path :           app/core/[flow]/global-json/page.tsx
tag :            ["global-json", "page", "scrum", "export"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'export Global JSON pour un flux Scrum. Sync page + Suspense ;
                 la validation du flow et la sérialisation sont isolées dans un
                 composant async.

flow:            Sync page → <Suspense fallback=<GlobalJsonSkeleton />> →
                 <GlobalJsonSection params /> async → await params → validation →
                 serializeGlobalJson(flow) → <GlobalJsonExport flow json />.

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

relatedFiles:    ["@/app/core/components/scrum/GlobalJsonExport.tsx",
                  "@/app/core/lib/scrum/services/global-json.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/global-json",
                  "@/app/core/components/scrum/GlobalJsonExport",
                  "@/components/ui/skeleton"]

exports:         ["default GlobalJsonPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux exporter le JSON complet d'un flux"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { serializeGlobalJson } from "@/app/core/lib/scrum/services/global-json";
import { GlobalJsonExport } from "@/app/core/components/scrum/GlobalJsonExport";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ flow: string }>;

function isScrumFlow(value: string): value is ScrumFlow {
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

export default function GlobalJsonPage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<GlobalJsonSkeleton />}>
      <GlobalJsonSection params={params} />
    </Suspense>
  );
}

async function GlobalJsonSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const json = await serializeGlobalJson(flow);
  return <GlobalJsonExport flow={flow} json={json} />;
}

function GlobalJsonSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Skeleton className="h-[60vh] w-full rounded-2xl" />
    </div>
  );
}
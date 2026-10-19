/*
path :           app/core/[flow]/persona/page.tsx
tag :            ["help", "persona", "page", "scrum"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de gestion des personas pour un flux Scrum. Composant page
                 synchrone qui monte un <Suspense> ; validation du flow et lecture
                 des données isolées dans un composant async. Le skeleton reproduit
                 la grille 1 / 2 / 3 / 4 colonnes de PersonaList.

flow:            Sync page → <Suspense fallback=<PersonaListSkeleton />> →
                 <PersonaSection params /> async → await params → validation →
                 listPersonas(flow) → <PersonaList />.

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

relatedFiles:    ["@/app/core/components/scrum/PersonaList.tsx",
                  "@/app/core/lib/scrum/services/persona.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/persona",
                  "@/app/core/components/scrum/PersonaList",
                  "@/components/ui/skeleton"]

exports:         ["default PersonaPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux gérer les personas d'un flux Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { listPersonas } from "@/app/core/lib/scrum/services/persona";
import { PersonaList } from "@/app/core/components/scrum/PersonaList";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ flow: string }>;

function isScrumFlow(value: string): value is ScrumFlow {
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

export default function PersonaPage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<PersonaListSkeleton />}>
      <PersonaSection params={params} />
    </Suspense>
  );
}

async function PersonaSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const personas = await listPersonas(flow);
  return <PersonaList flow={flow} personas={personas} />;
}

function PersonaListSkeleton() {
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
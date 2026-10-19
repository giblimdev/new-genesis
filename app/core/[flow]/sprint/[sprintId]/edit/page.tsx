/*
path :           app/core/[flow]/sprint/[sprintId]/edit/page.tsx
tag :            ["scrum", "sprint", "edit", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'édition d'un sprint. Sync page + Suspense ; toute la
                 logique runtime (await params, validation flow, chargement
                 sprint + US + epics, calcul du backlog) est isolée dans un
                 composant async. La résolution du sprintId est robuste :
                 accepte params.sprintId, params.id ou params.slug (utile si
                 le dossier dynamique est renommé). Le backlog est calculé
                 par soustraction : US du flow qui ne sont dans AUCUN sprint.

flow:            Sync page → <Suspense fallback=<SprintEditSkeleton />> →
                 <SprintEditSection params /> async → await params →
                 résolution sprintId → isScrumFlow → Promise.all([listSprints,
                 listUserStories, readScrumFile]) → find sprint → notFound
                 si absent → backlog = US - sprint courant - autres sprints →
                 <SprintEditor />.

ecosystem:       ScrumUI = [
                   "@/app/core/components/scrum/EpicCard.tsx",
                   "@/app/core/components/scrum/EpicForm.tsx",
                   "@/app/core/components/scrum/EpicList.tsx",
                   "@/app/core/components/scrum/FeatureCard.tsx",
                   "@/app/core/components/scrum/FeatureForm.tsx",
                   "@/app/core/components/scrum/FeatureList.tsx",
                   "@/app/core/components/scrum/FlowSelector.tsx",
                   "@/app/core/components/scrum/GlobalJsonExport.tsx",
                   "@/app/core/components/scrum/IdeeCard.tsx",
                   "@/app/core/components/scrum/IdeeDetailDialog.tsx",
                   "@/app/core/components/scrum/IdeeForm.tsx",
                   "@/app/core/components/scrum/IdeeList.tsx",
                   "@/app/core/components/scrum/PersonaCard.tsx",
                   "@/app/core/components/scrum/PersonaForm.tsx",
                   "@/app/core/components/scrum/PersonaList.tsx",
                   "@/app/core/components/scrum/ScrumNav.tsx",
                   "@/app/core/components/scrum/SortableItem.tsx",
                   "@/app/core/components/scrum/SortableList.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintEditor.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/SprintStoriesBoard.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                   "@/app/core/components/scrum/UserStoryMiniCard.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/SprintEditor.tsx",
                  "@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/storage",
                  "@/app/core/lib/scrum/services/sprint",
                  "@/app/core/lib/scrum/services/user-story",
                  "@/app/core/components/scrum/SprintEditor",
                  "@/components/ui/skeleton"]

exports:         ["default SprintEditPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux éditer un sprint et réorganiser ses US"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { readScrumFile } from "@/app/core/lib/scrum/storage";
import { listSprints } from "@/app/core/lib/scrum/services/sprint";
import { listUserStories } from "@/app/core/lib/scrum/services/user-story";
import { SprintEditor } from "@/app/core/components/scrum/SprintEditor";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * `Record<string, string>` plutôt qu'une forme fixe : tolère que le
 * segment dynamique s'appelle sprintId, id ou slug selon le nom du
 * dossier. La résolution se fait dans SprintEditSection.
 */
type PageParams = Promise<Record<string, string>>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isScrumFlow(value: string | undefined): value is ScrumFlow {
  if (!value) return false;
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

function resolveSprintId(params: Record<string, string>): string | null {
  return params.sprintId ?? params.id ?? params.slug ?? null;
}

/* ------------------------------------------------------------------ */
/*  Page (sync)                                                        */
/* ------------------------------------------------------------------ */

export default function SprintEditPage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<SprintEditSkeleton />}>
      <SprintEditSection params={params} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Section async                                                      */
/* ------------------------------------------------------------------ */

async function SprintEditSection({ params }: { readonly params: PageParams }) {
  const resolved = await params;

  const flow = resolved.flow;
  if (!isScrumFlow(flow)) {
    notFound();
  }

  const sprintId = resolveSprintId(resolved);
  if (!sprintId) {
    notFound();
  }

  const [sprints, allStories, doc] = await Promise.all([
    listSprints(flow),
    listUserStories(flow),
    readScrumFile(flow),
  ]);

  const sprint = sprints.find((s) => s.id === sprintId);
  if (!sprint) {
    notFound();
  }

  // Backlog = US du flow qui ne sont dans AUCUN sprint.
  const otherSprintIds = new Set(
    sprints.filter((s) => s.id !== sprintId).flatMap((s) => s.storyIds),
  );

  const currentSprintIds = new Set(sprint.storyIds);

  const backlog = allStories.filter(
    (us) => !currentSprintIds.has(us.id) && !otherSprintIds.has(us.id),
  );

  const otherSprintsStoryCount = allStories.filter((us) =>
    otherSprintIds.has(us.id),
  ).length;

  return (
    <SprintEditor
      flow={flow}
      sprint={sprint}
      backlog={backlog}
      allStories={allStories}
      allEpics={doc.epic}
      otherSprintsStoryCount={otherSprintsStoryCount}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SprintEditSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
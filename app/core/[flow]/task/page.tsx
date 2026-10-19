/*
path :           app/core/[flow]/task/page.tsx
tag :            ["help", "task", "page", "scrum"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de gestion des tasks pour un flux Scrum. Sync page +
                 Suspense ; validation du flow et lecture des tasks ET des
                 user stories dans un composant async (Promise.all) pour
                 permettre l'affichage du titre de l'US parente sur chaque
                 TaskCard et alimenter le Select du formulaire.

flow:            Sync page → <Suspense fallback=<TaskListSkeleton />> →
                 <TaskSection params /> async → await params → validation →
                 Promise.all([listTasks(flow), listUserStories(flow)]) →
                 <TaskList flow tasks stories />.

ecosystem:       Help = [
                   "@/app/core/[flow]/epic/page.tsx",
                   "@/app/core/[flow]/feature/page.tsx",
                   "@/app/core/[flow]/global-json/page.tsx",
                   "@/app/core/[flow]/idee/page.tsx",
                   "@/app/core/[flow]/layout.tsx",
                   "@/app/core/[flow]/page.tsx",
                   "@/app/core/[flow]/persona/page.tsx",
                   "@/app/core/[flow]/sprint/page.tsx",
                   "@/app/core/[flow]/task/page.tsx",
                   "@/app/core/[flow]/user-story/page.tsx",
                   "@/app/core/layout.tsx",
                   "@/app/core/page.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/TaskList.tsx",
                  "@/app/core/lib/scrum/services/task.ts",
                  "@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/task",
                  "@/app/core/lib/scrum/services/user-story",
                  "@/app/core/components/scrum/TaskList",
                  "@/components/ui/skeleton"]

exports:         ["default TaskPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux gérer les tasks d'un flux Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/core/lib/scrum/types";
import { listTasks } from "@/app/core/lib/scrum/services/task";
import { listUserStories } from "@/app/core/lib/scrum/services/user-story";
import { TaskList } from "@/app/core/components/scrum/TaskList";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ flow: string }>;

function isScrumFlow(value: string): value is ScrumFlow {
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

export default function TaskPage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<TaskListSkeleton />}>
      <TaskSection params={params} />
    </Suspense>
  );
}

async function TaskSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const [tasks, stories] = await Promise.all([
    listTasks(flow),
    listUserStories(flow),
  ]);

  return <TaskList flow={flow} tasks={tasks} stories={stories} />;
}

function TaskListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
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
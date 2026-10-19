/*
path :           app/core/lib/scrum/actions/task.ts
tag :            ["scrum", "action", "task", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "task" du module Scrum.
                 Expose createTaskAction, updateTaskAction, deleteTaskAction
                 et reorderTasksAction.

flow:            FormData → parse → service → revalidatePath → ActionResult.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/task.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/epic.ts",
                   "@/app/core/lib/scrum/services/feature.ts",
                   "@/app/core/lib/scrum/services/global-json.ts",
                   "@/app/core/lib/scrum/services/idee.ts",
                   "@/app/core/lib/scrum/services/persona.ts",
                   "@/app/core/lib/scrum/services/sprint.ts",
                   "@/app/core/lib/scrum/services/task.ts",
                   "@/app/core/lib/scrum/services/user-story.ts",
                   "@/app/core/lib/scrum/storage.ts",
                   "@/app/core/lib/scrum/types.ts",
                   "@/app/core/lib/scrum/validations.ts",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/services/task.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["next/cache",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/task"]

exports:         ["createTaskAction", "updateTaskAction", "deleteTaskAction",
                  "reorderTasksAction", "ActionResult"]

useBy:           ["@/app/core/components/scrum/TaskList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les tasks via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScrumFlow, Task, TaskStatus } from "@/app/core/lib/scrum/types";
import {
  createTask,
  deleteTask,
  reorderTasks,
  updateTask,
} from "@/app/core/lib/scrum/services/task";

/* ------------------------------------------------------------------ */
/*  Résultat typé                                                      */
/* ------------------------------------------------------------------ */

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

/* ------------------------------------------------------------------ */
/*  Revalidation                                                       */
/* ------------------------------------------------------------------ */

function revalidate(flow: ScrumFlow): void {
  revalidatePath(`/core/${flow}`);
  revalidatePath(`/core/${flow}/task`);
}

/* ------------------------------------------------------------------ */
/*  Parsing FormData                                                   */
/* ------------------------------------------------------------------ */

const VALID_STATUSES: readonly TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
];

function parseStatus(raw: string | null): TaskStatus {
  if (raw && (VALID_STATUSES as readonly string[]).includes(raw)) {
    return raw as TaskStatus;
  }
  return "todo";
}

function parseTaskForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: parseStatus(formData.get("status") as string | null),
    storyId: String(formData.get("storyId") ?? ""),
    assignee: String(formData.get("assignee") ?? ""),
    estimate: String(formData.get("estimate") ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Création                                                           */
/* ------------------------------------------------------------------ */

export async function createTaskAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Task>> {
  try {
    const input = parseTaskForm(formData);
    const entity = await createTask(flow, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Mise à jour                                                        */
/* ------------------------------------------------------------------ */

export async function updateTaskAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Task>> {
  try {
    const input = parseTaskForm(formData);
    const entity = await updateTask(flow, id, input);
    revalidate(flow);
    return { ok: true, data: entity };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export async function deleteTaskAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteTask(flow, id);
    revalidate(flow);
    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Réordonnancement                                                   */
/* ------------------------------------------------------------------ */

export async function reorderTasksAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Task[]>> {
  try {
    const entities = await reorderTasks(flow, orderedIds);
    revalidate(flow);
    return { ok: true, data: entities };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
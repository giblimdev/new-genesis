/*
path :           app/core/lib/scrum/actions/task.ts
tag :            ["scrum", "action", "task", "server-action", "crud", "reorder"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la section "task" du module Scrum.
                 Délègue au service task et utilise _helpers.
                 parseStatus garantit une valeur de TaskStatus valide.

flow:            FormData → parse → service → revalidate → ActionResult.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/_helpers.ts",
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/task.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/_crud.ts",
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

imports:         ["@/app/core/lib/scrum/actions/_helpers",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/services/task"]

exports:         ["createTaskAction", "updateTaskAction", "deleteTaskAction",
                  "reorderTasksAction"]

useBy:           ["@/app/core/components/scrum/TaskList.tsx"]

userStories:     ["*en tant que développeur je veux muter et réorganiser les tasks via Server Actions"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import {
  handleActionError,
  revalidateScrumFlow,
  type ActionResult,
} from "@/app/scrum/lib/actions/_helpers";
import type { ScrumFlow, Task, TaskStatus } from "@/app/scrum/lib/types";
import {
  createTask,
  deleteTask,
  reorderTasks,
  updateTask,
} from "@/app/scrum/lib/services/task";

const VALID_STATUSES: readonly TaskStatus[] = ["todo", "in_progress", "done"];

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

export async function createTaskAction(
  flow: ScrumFlow,
  formData: FormData,
): Promise<ActionResult<Task>> {
  try {
    const entity = await createTask(flow, parseTaskForm(formData));
    revalidateScrumFlow(flow, "task");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTaskAction(
  flow: ScrumFlow,
  id: string,
  formData: FormData,
): Promise<ActionResult<Task>> {
  try {
    const entity = await updateTask(flow, id, parseTaskForm(formData));
    revalidateScrumFlow(flow, "task");
    return { ok: true, data: entity };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTaskAction(
  flow: ScrumFlow,
  id: string,
): Promise<ActionResult<null>> {
  try {
    await deleteTask(flow, id);
    revalidateScrumFlow(flow, "task");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderTasksAction(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<ActionResult<readonly Task[]>> {
  try {
    const entities = await reorderTasks(flow, orderedIds);
    revalidateScrumFlow(flow, "task");
    return { ok: true, data: entities };
  } catch (error) {
    return handleActionError(error);
  }
}

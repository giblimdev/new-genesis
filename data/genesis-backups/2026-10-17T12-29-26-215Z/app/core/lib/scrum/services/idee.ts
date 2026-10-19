/*
path :           app/core/lib/scrum/services/idee.ts
tag :            ["scrum", "service", "idee", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "idée" du module Scrum. Expose
                 listIdees, createIdee, updateIdee, deleteIdee. Reçoit un flow et un
                 input validé. Lit/écrit le document via storage. Aucune dépendance UI.

flow:            listIdees → readScrumFile → doc.idea. createIdee → nouvelle Idee →
                 push → writeScrumFile. updateIdee → map → writeScrumFile.
                 deleteIdee → filter → writeScrumFile.

ecosystem:       Scrum = [
                   ... (17 fichiers identiques)
                 ]

relatedFiles:    ["@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["node:crypto",
                  "@/app/core/lib/scrum/storage",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listIdees", "createIdee", "updateIdee", "deleteIdee"]

useBy:           ["@/app/core/lib/scrum/actions/idee.ts"]

userStories:     ["*en tant que développeur je veux CRUD les idées Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { Idee, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  ideeInputSchema,
  type IdeeInput,
} from "@/app/core/lib/scrum/validations";

export async function listIdees(flow: ScrumFlow): Promise<readonly Idee[]> {
  const doc = await readScrumFile(flow);
  return doc.idea;
}

export async function createIdee(
  flow: ScrumFlow,
  input: IdeeInput,
): Promise<Idee> {
  const valid = ideeInputSchema.parse(input);
  const now = new Date().toISOString();

  const entity: Idee = {
    id: randomUUID(),
    title: valid.title,
    problem: valid.problem,
    hypotheses: valid.hypotheses,
    context: valid.context,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
  await writeScrumFile(flow, { ...doc, idea: [...doc.idea, entity] });

  return entity;
}

export async function updateIdee(
  flow: ScrumFlow,
  id: string,
  input: IdeeInput,
): Promise<Idee> {
  const valid = ideeInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  let updated: Idee | null = null;

  const next: readonly Idee[] = doc.idea.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      title: valid.title,
      problem: valid.problem,
      hypotheses: valid.hypotheses,
      context: valid.context,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/idee] Idée introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, idea: next });
  return updated;
}

export async function deleteIdee(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.idea.filter((item) => item.id !== id);

  if (next.length === doc.idea.length) {
    throw new Error(`[scrum/idee] Idée introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, idea: next });
}
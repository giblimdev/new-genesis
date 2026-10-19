/*
path :           app/core/lib/scrum/services/persona.ts
tag :            ["scrum", "service", "persona", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "persona" du module
                 Scrum. Chaque création assigne order = max + 1.
                 reorderPersonas réassigne 0..n-1 selon orderedIds.

flow:            listPersonas → readScrumFile (trié). createPersona → push.
                 updatePersona → find + replace. deletePersona → filter.
                 reorderPersonas → normalise order → write.

ecosystem:       Scrum = [
                   "@/app/core/lib/scrum/actions/epic.ts",
                   "@/app/core/lib/scrum/actions/feature.ts",
                   "@/app/core/lib/scrum/actions/global-json.ts",
                   "@/app/core/lib/scrum/actions/idee.ts",
                   "@/app/core/lib/scrum/actions/persona.ts",
                   "@/app/core/lib/scrum/actions/sprint.ts",
                   "@/app/core/lib/scrum/actions/user-story.ts",
                   "@/app/core/lib/scrum/services/epic.ts",
                   "@/app/core/lib/scrum/services/feature.ts",
                   "@/app/core/lib/scrum/services/global-json.ts",
                   "@/app/core/lib/scrum/services/idee.ts",
                   "@/app/core/lib/scrum/services/persona.ts",
                   "@/app/core/lib/scrum/services/sprint.ts",
                   "@/app/core/lib/scrum/services/user-story.ts",
                   "@/app/core/lib/scrum/storage.ts",
                   "@/app/core/lib/scrum/types.ts",
                   "@/app/core/lib/scrum/validations.ts",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/types.ts"]

imports:         ["node:crypto",
                  "@/app/core/lib/scrum/storage",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations"]

exports:         ["listPersonas", "createPersona", "updatePersona",
                  "deletePersona", "reorderPersonas"]

useBy:           ["@/app/core/lib/scrum/actions/persona.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les personas Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { Persona, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  personaInputSchema,
  reorderInputSchema,
  type PersonaInput,
} from "@/app/core/lib/scrum/validations";

export async function listPersonas(
  flow: ScrumFlow,
): Promise<readonly Persona[]> {
  const doc = await readScrumFile(flow);
  return doc.persona;
}

export async function createPersona(
  flow: ScrumFlow,
  input: PersonaInput,
): Promise<Persona> {
  const valid = personaInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.persona.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Persona = {
    id: randomUUID(),
    name: valid.name,
    kind: valid.kind,
    need: valid.need,
    relatedFeatures: valid.relatedFeatures,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, persona: [...doc.persona, entity] });
  return entity;
}

export async function updatePersona(
  flow: ScrumFlow,
  id: string,
  input: PersonaInput,
): Promise<Persona> {
  const valid = personaInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.persona.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/persona] Persona introuvable : ${id}`);
  }

  const updated: Persona = {
    ...existing,
    name: valid.name,
    kind: valid.kind,
    need: valid.need,
    relatedFeatures: valid.relatedFeatures,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.persona.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, persona: next });
  return updated;
}

export async function deletePersona(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.persona.filter((item) => item.id !== id);

  if (next.length === doc.persona.length) {
    throw new Error(`[scrum/persona] Persona introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, persona: next });
}

export async function reorderPersonas(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Persona[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.persona.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/persona] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Persona[] = doc.persona.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/persona] Persona inconnu : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, persona: next });
  return next;
}
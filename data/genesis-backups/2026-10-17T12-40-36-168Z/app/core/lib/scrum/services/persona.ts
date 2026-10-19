/*
path :           app/core/lib/scrum/services/persona.ts
tag :            ["scrum", "service", "persona", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "persona" du module Scrum.

flow:            listPersonas → readScrumFile → doc.persona. createPersona → push.
                 updatePersona → map. deletePersona → filter.

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

exports:         ["listPersonas", "createPersona", "updatePersona", "deletePersona"]

useBy:           ["@/app/core/lib/scrum/actions/persona.ts"]

userStories:     ["*en tant que développeur je veux CRUD les personas Scrum"]

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

  const entity: Persona = {
    id: randomUUID(),
    name: valid.name,
    kind: valid.kind,
    need: valid.need,
    relatedFeatures: valid.relatedFeatures,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
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

  let updated: Persona | null = null;

  const next: readonly Persona[] = doc.persona.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      name: valid.name,
      kind: valid.kind,
      need: valid.need,
      relatedFeatures: valid.relatedFeatures,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/persona] Persona introuvable : ${id}`);
  }

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
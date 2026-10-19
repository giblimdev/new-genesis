/*
path :           app/core/lib/scrum/services/feature.ts
tag :            ["scrum", "service", "feature", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "feature" du module
                 Scrum. Chaque création assigne order = max + 1.
                 reorderFeatures réassigne 0..n-1 selon orderedIds.

flow:            listFeatures → readScrumFile (trié). createFeature → push.
                 updateFeature → find + replace. deleteFeature → filter.
                 reorderFeatures → normalise order → write.

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

exports:         ["listFeatures", "createFeature", "updateFeature",
                  "deleteFeature", "reorderFeatures"]

useBy:           ["@/app/core/lib/scrum/actions/feature.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les features Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { Feature, ScrumFlow } from "@/app/core/lib/scrum/types";
import {
  featureInputSchema,
  reorderInputSchema,
  type FeatureInput,
} from "@/app/core/lib/scrum/validations";

export async function listFeatures(
  flow: ScrumFlow,
): Promise<readonly Feature[]> {
  const doc = await readScrumFile(flow);
  return doc.feature;
}

export async function createFeature(
  flow: ScrumFlow,
  input: FeatureInput,
): Promise<Feature> {
  const valid = featureInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.feature.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Feature = {
    id: randomUUID(),
    title: valid.title,
    description: valid.description,
    interest: valid.interest,
    personas: valid.personas,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, feature: [...doc.feature, entity] });
  return entity;
}

export async function updateFeature(
  flow: ScrumFlow,
  id: string,
  input: FeatureInput,
): Promise<Feature> {
  const valid = featureInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.feature.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/feature] Feature introuvable : ${id}`);
  }

  const updated: Feature = {
    ...existing,
    title: valid.title,
    description: valid.description,
    interest: valid.interest,
    personas: valid.personas,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.feature.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, feature: next });
  return updated;
}

export async function deleteFeature(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.feature.filter((item) => item.id !== id);

  if (next.length === doc.feature.length) {
    throw new Error(`[scrum/feature] Feature introuvable : ${id}`);
  }

  await writeScrumFile(flow, { ...doc, feature: next });
}

export async function reorderFeatures(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Feature[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.feature.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/feature] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Feature[] = doc.feature.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/feature] Feature inconnue : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, feature: next });
  return next;
}
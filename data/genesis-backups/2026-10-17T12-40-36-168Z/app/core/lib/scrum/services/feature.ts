/*
path :           app/core/lib/scrum/services/feature.ts
tag :            ["scrum", "service", "feature", "crud"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD pour la section "feature" du module Scrum.

flow:            listFeatures → readScrumFile → doc.feature. createFeature → push →
                 writeScrumFile. updateFeature → map. deleteFeature → filter.

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

exports:         ["listFeatures", "createFeature", "updateFeature", "deleteFeature"]

useBy:           ["@/app/core/lib/scrum/actions/feature.ts"]

userStories:     ["*en tant que développeur je veux CRUD les features Scrum"]

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

  const entity: Feature = {
    id: randomUUID(),
    title: valid.title,
    description: valid.description,
    interest: valid.interest,
    personas: valid.personas,
    createdAt: now,
    updatedAt: now,
  };

  const doc = await readScrumFile(flow);
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

  let updated: Feature | null = null;

  const next: readonly Feature[] = doc.feature.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      title: valid.title,
      description: valid.description,
      interest: valid.interest,
      personas: valid.personas,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) {
    throw new Error(`[scrum/feature] Feature introuvable : ${id}`);
  }

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
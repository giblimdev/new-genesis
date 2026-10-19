/*
path :           app/core/lib/scrum/types.ts
tag :            ["scrum", "types", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Types partagés pour le module Scrum. Définit ScrumFlow (les trois flux
                 disponibles : scrum-business, scrum-app, scrum-genesis), ScrumDocument
                 (structure du JSON de persistance) et les 6 entités : Idee, Feature,
                 Persona, Epic, UserStory, Sprint. Aucune dépendance runtime, aucun effet.

flow:            Module TypeScript pur → export des types + factory
                 createEmptyScrumDocument(). Importable côté serveur ET côté client.

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

relatedFiles:    ["@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/storage.ts"]

imports:         []

exports:         ["ScrumFlow", "ScrumSection", "ScrumDocument", "ScrumMeta",
                  "ScrumEntityBase", "Idee", "Feature", "Persona", "Epic",
                  "UserStory", "Sprint", "SCRUM_FLOWS", "SCRUM_SECTIONS",
                  "SCRUM_SCHEMA_VERSION", "createEmptyScrumDocument"]

useBy:           ["@/app/core/lib/scrum/validations.ts",
                  "@/app/core/lib/scrum/storage.ts",
                  "@/app/core/lib/scrum/services/idee.ts",
                  "@/app/core/lib/scrum/services/feature.ts",
                  "@/app/core/lib/scrum/services/persona.ts",
                  "@/app/core/lib/scrum/services/epic.ts",
                  "@/app/core/lib/scrum/services/user-story.ts",
                  "@/app/core/lib/scrum/services/sprint.ts",
                  "@/app/core/lib/scrum/services/global-json.ts",
                  "@/app/core/lib/scrum/actions/idee.ts",
                  "@/app/core/lib/scrum/actions/feature.ts",
                  "@/app/core/lib/scrum/actions/persona.ts",
                  "@/app/core/lib/scrum/actions/epic.ts",
                  "@/app/core/lib/scrum/actions/user-story.ts",
                  "@/app/core/lib/scrum/actions/sprint.ts"]

userStories:     ["*en tant que développeur je veux des types partagés pour le CRUD Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Flow                                                               */
/* ------------------------------------------------------------------ */

export type ScrumFlow = "scrum-business" | "scrum-app" | "scrum-genesis";

export const SCRUM_FLOWS: readonly ScrumFlow[] = [
  "scrum-business",
  "scrum-app",
  "scrum-genesis",
] as const;

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

export type ScrumSection =
  | "idee"
  | "feature"
  | "persona"
  | "epic"
  | "userStory"
  | "sprint";

export const SCRUM_SECTIONS: readonly ScrumSection[] = [
  "idee",
  "feature",
  "persona",
  "epic",
  "userStory",
  "sprint",
] as const;

/* ------------------------------------------------------------------ */
/*  Base commune                                                       */
/* ------------------------------------------------------------------ */

export interface ScrumEntityBase {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Entités métier                                                     */
/* ------------------------------------------------------------------ */

export interface Idee extends ScrumEntityBase {
  readonly title: string;
  readonly problem: string;
  readonly hypotheses: string;
  readonly context?: string;
}

export interface Feature extends ScrumEntityBase {
  readonly title: string;
  readonly description: string;
  readonly interest: string;
  readonly personas: readonly string[];
}

export interface Persona extends ScrumEntityBase {
  readonly name: string;
  readonly kind: string;
  readonly need: string;
  readonly relatedFeatures: readonly string[];
}

export interface Epic extends ScrumEntityBase {
  readonly name: string;
  readonly goal: string;
  readonly scope: string;
  readonly personas: readonly string[];
}

export interface UserStory extends ScrumEntityBase {
  readonly title: string;
  readonly story: string;
  readonly acceptance: string;
  readonly estimate?: string;
  readonly epicId?: string;
}

export interface Sprint extends ScrumEntityBase {
  readonly name: string;
  readonly goal: string;
  readonly storyIds: readonly string[];
  readonly startDate?: string;
  readonly endDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Document                                                           */
/* ------------------------------------------------------------------ */

export interface ScrumMeta {
  readonly schemaVersion: number;
  readonly updatedAt: string;
}

export interface ScrumDocument {
  readonly idea: readonly Idee[];
  readonly feature: readonly Feature[];
  readonly persona: readonly Persona[];
  readonly epic: readonly Epic[];
  readonly userStory: readonly UserStory[];
  readonly sprint: readonly Sprint[];
  readonly meta: ScrumMeta;
}

/* ------------------------------------------------------------------ */
/*  Factory                                                            */
/* ------------------------------------------------------------------ */

export const SCRUM_SCHEMA_VERSION = 1;

export function createEmptyScrumDocument(): ScrumDocument {
  return {
    idea: [],
    feature: [],
    persona: [],
    epic: [],
    userStory: [],
    sprint: [],
    meta: {
      schemaVersion: SCRUM_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    },
  };
}
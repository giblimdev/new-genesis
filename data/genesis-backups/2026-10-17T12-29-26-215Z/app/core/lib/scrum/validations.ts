/*
path :           app/core/lib/scrum/validations.ts
tag :            ["scrum", "validation", "zod", "strict", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour la validation runtime du module Scrum. Définit un
                 schéma par entité (idee, feature, persona, epic, userStory, sprint)
                 + le schéma du document complet. scrumDocumentSchema est en mode
                 strict (toutes les couches) : les clés inconnues produisent une
                 erreur avec chemin précis — indispensable pour l'éditeur Global
                 JSON qui doit signaler les fautes de frappe. Les schémas d'input
                 restent en mode Zod par défaut (compatibles react-hook-form +
                 zodResolver). Exporte les types inférés pour les inputs.

flow:            Module TypeScript pur → export des schémas Zod et des types
                 inférés. Aucun état, aucun effet, aucune dépendance runtime autre
                 que zod.

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

relatedFiles:    ["@/app/core/lib/scrum/types.ts"]

imports:         ["zod"]

exports:         ["ideeInputSchema", "featureInputSchema", "personaInputSchema",
                  "epicInputSchema", "userStoryInputSchema", "sprintInputSchema",
                  "scrumDocumentSchema",
                  "IdeeInput", "FeatureInput", "PersonaInput", "EpicInput",
                  "UserStoryInput", "SprintInput", "ScrumDocumentInput"]

useBy:           ["@/app/core/lib/scrum/storage.ts",
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

userStories:     ["*en tant que développeur je veux valider les entrées Scrum avec Zod"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const requiredText = (max = 5000) =>
  z.string().trim().min(1, "Ce champ est requis.").max(max, `Maximum ${max} caractères.`);

const optionalText = (max = 5000) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} caractères.`)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const stringArray = z
  .array(z.string().trim().min(1))
  .default([])
  .transform((arr) => [...new Set(arr)]);

/* ------------------------------------------------------------------ */
/*  Idée                                                               */
/* ------------------------------------------------------------------ */

export const ideeInputSchema = z.object({
  title: requiredText(200),
  problem: requiredText(5000),
  hypotheses: requiredText(5000),
  context: optionalText(2000),
});

export type IdeeInput = z.input<typeof ideeInputSchema>;

/* ------------------------------------------------------------------ */
/*  Feature                                                            */
/* ------------------------------------------------------------------ */

export const featureInputSchema = z.object({
  title: requiredText(200),
  description: requiredText(5000),
  interest: requiredText(2000),
  personas: stringArray,
});

export type FeatureInput = z.input<typeof featureInputSchema>;

/* ------------------------------------------------------------------ */
/*  Persona                                                            */
/* ------------------------------------------------------------------ */

export const personaInputSchema = z.object({
  name: requiredText(200),
  kind: requiredText(100),
  need: requiredText(5000),
  relatedFeatures: stringArray,
});

export type PersonaInput = z.input<typeof personaInputSchema>;

/* ------------------------------------------------------------------ */
/*  Epic                                                               */
/* ------------------------------------------------------------------ */

export const epicInputSchema = z.object({
  name: requiredText(200),
  goal: requiredText(5000),
  scope: requiredText(5000),
  personas: stringArray,
});

export type EpicInput = z.input<typeof epicInputSchema>;

/* ------------------------------------------------------------------ */
/*  User Story                                                         */
/* ------------------------------------------------------------------ */

export const userStoryInputSchema = z.object({
  title: requiredText(200),
  story: requiredText(2000),
  acceptance: requiredText(5000),
  estimate: optionalText(100),
  epicId: optionalText(100),
});

export type UserStoryInput = z.input<typeof userStoryInputSchema>;

/* ------------------------------------------------------------------ */
/*  Sprint                                                             */
/* ------------------------------------------------------------------ */

export const sprintInputSchema = z.object({
  name: requiredText(200),
  goal: requiredText(5000),
  storyIds: stringArray,
  startDate: optionalText(50),
  endDate: optionalText(50),
});

export type SprintInput = z.input<typeof sprintInputSchema>;

/* ------------------------------------------------------------------ */
/*  Document complet                                                   */
/* ------------------------------------------------------------------ */

/*
 * Mode strict sur TOUTES les couches (entityBaseSchema + chaque .extend()
 * + meta + racine). Toute clé inconnue produit une erreur Zod avec un
 * chemin précis (ex. idea[0].titl). C'est ce qui permet à l'éditeur
 * Global JSON d'afficher une erreur explicite plutôt que de supprimer
 * silencieusement une faute de frappe.
 *
 * .strict() est répété sur chaque .extend() par robustesse : en Zod v3
 * et v4, .extend() préserve unknownKeys du parent, mais la répétition
 * rend l'intention explicite et immunise contre un changement de
 * comportement entre versions.
 */
const entityBaseSchema = z
  .object({
    id: z.string().min(1),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

export const scrumDocumentSchema = z
  .object({
    idea: z.array(
      entityBaseSchema
        .extend({
          title: z.string(),
          problem: z.string(),
          hypotheses: z.string(),
          context: z.string().optional(),
        })
        .strict(),
    ),
    feature: z.array(
      entityBaseSchema
        .extend({
          title: z.string(),
          description: z.string(),
          interest: z.string(),
          personas: z.array(z.string()),
        })
        .strict(),
    ),
    persona: z.array(
      entityBaseSchema
        .extend({
          name: z.string(),
          kind: z.string(),
          need: z.string(),
          relatedFeatures: z.array(z.string()),
        })
        .strict(),
    ),
    epic: z.array(
      entityBaseSchema
        .extend({
          name: z.string(),
          goal: z.string(),
          scope: z.string(),
          personas: z.array(z.string()),
        })
        .strict(),
    ),
    userStory: z.array(
      entityBaseSchema
        .extend({
          title: z.string(),
          story: z.string(),
          acceptance: z.string(),
          estimate: z.string().optional(),
          epicId: z.string().optional(),
        })
        .strict(),
    ),
    sprint: z.array(
      entityBaseSchema
        .extend({
          name: z.string(),
          goal: z.string(),
          storyIds: z.array(z.string()),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .strict(),
    ),
    meta: z
      .object({
        schemaVersion: z.number().int().positive(),
        updatedAt: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export type ScrumDocumentInput = z.input<typeof scrumDocumentSchema>;
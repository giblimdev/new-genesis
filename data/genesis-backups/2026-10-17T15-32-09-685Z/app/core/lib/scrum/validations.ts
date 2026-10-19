/*
path :           app/core/lib/scrum/validations.ts
tag :            ["scrum", "validation", "zod", "strict", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour la validation runtime du module Scrum.
                 Un schéma d'input par entité (idee, feature, persona, epic,
                 userStory, sprint) + le schéma du document complet + le
                 payload de réordonnancement. Depuis la refonte Sprint, le
                 schéma sprint est scindé en trois :
                 - sprintInputSchema (complet) pour la création
                 - sprintMetaInputSchema (sans storyIds) pour l'édition méta
                 - sprintStoriesInputSchema (storyIds only) pour le board DnD
                 scrumDocumentSchema est en mode strict (clés inconnues
                 rejetées). Le champ `order` est optionnel avec `.default(0)` :
                 les documents antérieurs sont migrés silencieusement.
                 reorderInputSchema impose l'unicité des ids (refine) en
                 plus de la longueur minimale : un payload à doublons est
                 rejeté AVANT d'atteindre les services (sinon positionById
                 écraserait silencieusement les positions).

flow:            Module TypeScript pur → export des schémas Zod et des types
                 inférés. Aucun état, aucun effet, aucune dépendance runtime
                 autre que zod.

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
                  "sprintMetaInputSchema", "sprintStoriesInputSchema",
                  "scrumDocumentSchema", "reorderInputSchema",
                  "IdeeInput", "FeatureInput", "PersonaInput", "EpicInput",
                  "UserStoryInput", "SprintInput", "SprintMetaInput",
                  "SprintStoriesInput", "ScrumDocumentInput", "ReorderInput"]

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
/*  Sprint — trois schémas                                             */
/* ------------------------------------------------------------------ */

/*
 * sprintInputSchema — schéma complet, utilisé UNIQUEMENT par createSprint.
 * storyIds y figure avec `.default([])` pour permettre la création d'un
 * sprint vide (l'utilisateur ajoutera les US via la page d'édition DnD).
 */
export const sprintInputSchema = z.object({
  name: requiredText(200),
  goal: requiredText(5000),
  storyIds: stringArray,
  startDate: optionalText(50),
  endDate: optionalText(50),
});

export type SprintInput = z.input<typeof sprintInputSchema>;

/*
 * sprintMetaInputSchema — édition des métadonnées (nom, objectif, dates).
 * Utilisé par updateSprintMetaAction et le formulaire méta de SprintEditor.
 * storyIds y est ABSENT : la liste des US est pilotée uniquement par le
 * board DnD via sprintStoriesInputSchema.
 */
export const sprintMetaInputSchema = z.object({
  name: requiredText(200),
  goal: requiredText(5000),
  startDate: optionalText(50),
  endDate: optionalText(50),
});

export type SprintMetaInput = z.input<typeof sprintMetaInputSchema>;

/*
 * sprintStoriesInputSchema — payload du board DnD.
 * Reçoit la liste ordonnée des ids d'US appartenant au sprint.
 * Les ids absents du sprint courant sont considérés comme retirés
 * (retour au backlog). Les ids inconnus sont rejetés par le service.
 */
export const sprintStoriesInputSchema = z.object({
  storyIds: stringArray,
});

export type SprintStoriesInput = z.input<typeof sprintStoriesInputSchema>;

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
 * `order` est optionnel avec `.default(0)` : les documents antérieurs à
 * l'introduction du champ sont migrés silencieusement. Un tri stable
 * préserve l'ordre d'insertion initial.
 */
const entityBaseSchema = z
  .object({
    id: z.string().min(1),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    order: z.number().int().min(0).default(0),
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

/* ------------------------------------------------------------------ */
/*  Réordonnancement (payload d'action)                                */
/* ------------------------------------------------------------------ */

/*
 * L'unicité est vérifiée AVANT d'atteindre les services : sans ce garde,
 * `new Map(orderedIds.map((id, index) => [id, index]))` écraserait
 * silencieusement les positions des doublons (ex. ['a','a','b'] donnerait
 * a→1, b→2 au lieu de a→0, b→1 ou de rejeter le payload). Les services
 * peuvent donc se contenter de la vérification de cardinalité
 * (orderedIds.length === idSet.size) pour détecter des ids manquants.
 */
export const reorderInputSchema = z
  .object({
    orderedIds: z
      .array(z.string().min(1))
      .min(1)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        {
          message:
            "Ids dupliqués : chaque id doit apparaître une seule fois.",
        },
      ),
  })
  .strict();

export type ReorderInput = z.input<typeof reorderInputSchema>;
/*
path :           app/core/lib/scrum/services/sprint.ts
tag :            ["scrum", "service", "sprint", "crud", "reorder"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Service CRUD + reorder pour la section "sprint" du module
                 Scrum. Depuis la refonte Sprint, updateSprint est scindé en
                 deux opérations indépendantes :
                 - updateSprintMeta : nom, objectif, dates (sans storyIds)
                 - updateSprintStories : liste ordonnée d'ids d'US
                 updateSprintStories retire automatiquement les US assignées
                 de tout autre sprint (garantit l'unicité). Chaque création
                 assigne order = max + 1. reorderSprints réassigne 0..n-1.

flow:            listSprints → readScrumFile (trié). createSprint → push.
                 updateSprintMeta → find + replace. updateSprintStories →
                 retire des autres sprints + assigne au courant.
                 deleteSprint → filter. reorderSprints → normalise order.

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

exports:         ["listSprints", "createSprint", "updateSprintMeta",
                  "updateSprintStories", "deleteSprint", "reorderSprints"]

useBy:           ["@/app/core/lib/scrum/actions/sprint.ts"]

userStories:     ["*en tant que développeur je veux CRUD et réorganiser les sprints Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { randomUUID } from "node:crypto";

import { readScrumFile, writeScrumFile } from "@/app/core/lib/scrum/storage";
import type { ScrumFlow, Sprint } from "@/app/core/lib/scrum/types";
import {
  reorderInputSchema,
  sprintInputSchema,
  sprintMetaInputSchema,
  sprintStoriesInputSchema,
  type SprintInput,
  type SprintMetaInput,
} from "@/app/core/lib/scrum/validations";

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function listSprints(
  flow: ScrumFlow,
): Promise<readonly Sprint[]> {
  const doc = await readScrumFile(flow);
  return doc.sprint;
}

/* ------------------------------------------------------------------ */
/*  Création                                                           */
/* ------------------------------------------------------------------ */

export async function createSprint(
  flow: ScrumFlow,
  input: SprintInput,
): Promise<Sprint> {
  const valid = sprintInputSchema.parse(input);
  const now = new Date().toISOString();

  const doc = await readScrumFile(flow);
  const maxOrder = doc.sprint.reduce(
    (max, item) => Math.max(max, item.order ?? 0),
    -1,
  );

  const entity: Sprint = {
    id: randomUUID(),
    name: valid.name,
    goal: valid.goal,
    storyIds: valid.storyIds,
    startDate: valid.startDate,
    endDate: valid.endDate,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeScrumFile(flow, { ...doc, sprint: [...doc.sprint, entity] });
  return entity;
}

/* ------------------------------------------------------------------ */
/*  Édition méta (nom, objectif, dates) — sans toucher aux storyIds    */
/* ------------------------------------------------------------------ */

export async function updateSprintMeta(
  flow: ScrumFlow,
  id: string,
  input: SprintMetaInput,
): Promise<Sprint> {
  const valid = sprintMetaInputSchema.parse(input);
  const doc = await readScrumFile(flow);

  const existing = doc.sprint.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  const updated: Sprint = {
    ...existing,
    name: valid.name,
    goal: valid.goal,
    startDate: valid.startDate,
    endDate: valid.endDate,
    updatedAt: new Date().toISOString(),
  };

  const next = doc.sprint.map((item) => (item.id === id ? updated : item));
  await writeScrumFile(flow, { ...doc, sprint: next });
  return updated;
}

/* ------------------------------------------------------------------ */
/*  Édition des US (board DnD) — retire des autres sprints             */
/* ------------------------------------------------------------------ */

/*
 * Remplace la liste ordonnée des US du sprint. Une US présente dans un
 * autre sprint est automatiquement retirée de cet autre sprint (déplacement
 * implicite). C'est le comportement attendu quand l'utilisateur assigne à
 * un sprint une US qui était ailleurs. Les US absentes de la nouvelle liste
 * retournent au backlog (elles ne sont plus dans aucun sprint).
 */
export async function updateSprintStories(
  flow: ScrumFlow,
  id: string,
  storyIds: readonly string[],
): Promise<Sprint> {
  const valid = sprintStoriesInputSchema.parse({ storyIds });
  const doc = await readScrumFile(flow);

  const existing = doc.sprint.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  // Vérifie que chaque id fourni correspond à une US existante du flow.
  const knownStoryIds = new Set(doc.userStory.map((us) => us.id));
  for (const storyId of valid.storyIds) {
    if (!knownStoryIds.has(storyId)) {
      throw new Error(`[scrum/sprint] UserStory inconnue : ${storyId}`);
    }
  }

  const targetIds = new Set(valid.storyIds);

  const next = doc.sprint.map((item) => {
    if (item.id === id) {
      // Sprint courant : nouvelle liste ordonnée.
      return {
        ...item,
        storyIds: valid.storyIds,
        updatedAt: new Date().toISOString(),
      };
    }
    // Autres sprints : retire les US déplacées (unicité).
    const filtered = item.storyIds.filter((sid) => !targetIds.has(sid));
    if (filtered.length !== item.storyIds.length) {
      return { ...item, storyIds: filtered };
    }
    return item;
  });

  await writeScrumFile(flow, { ...doc, sprint: next });
  const updated = next.find((s) => s.id === id);
  if (!updated) {
    // Impossible en pratique (find + id vérifié plus haut).
    throw new Error(`[scrum/sprint] Sprint introuvable après écriture : ${id}`);
  }
  return updated;
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export async function deleteSprint(
  flow: ScrumFlow,
  id: string,
): Promise<void> {
  const doc = await readScrumFile(flow);
  const next = doc.sprint.filter((item) => item.id !== id);

  if (next.length === doc.sprint.length) {
    throw new Error(`[scrum/sprint] Sprint introuvable : ${id}`);
  }

  // Les US du sprint supprimé ne sont pas modifiées : comme storyIds est
  // porté par le sprint, leur suppression libère les US (retour au backlog
  // automatique, calculé côté page d'édition par soustraction).
  await writeScrumFile(flow, { ...doc, sprint: next });
}

/* ------------------------------------------------------------------ */
/*  Réordonnancement                                                   */
/* ------------------------------------------------------------------ */

export async function reorderSprints(
  flow: ScrumFlow,
  orderedIds: readonly string[],
): Promise<readonly Sprint[]> {
  const valid = reorderInputSchema.parse({ orderedIds });
  const doc = await readScrumFile(flow);

  const idSet = new Set(doc.sprint.map((item) => item.id));
  if (valid.orderedIds.length !== idSet.size) {
    throw new Error(
      `[scrum/sprint] Reorder invalide : ${valid.orderedIds.length} ids fournis, ${idSet.size} attendus.`,
    );
  }

  const positionById = new Map(
    valid.orderedIds.map((id, index) => [id, index]),
  );

  const next: readonly Sprint[] = doc.sprint.map((item) => {
    const position = positionById.get(item.id);
    if (position === undefined) {
      throw new Error(`[scrum/sprint] Sprint inconnu : ${item.id}`);
    }
    return { ...item, order: position };
  });

  await writeScrumFile(flow, { ...doc, sprint: next });
  return next;
}
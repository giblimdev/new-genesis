/*
path :           app/blog/lib/utils/reading-time.ts
tag :            ["blog", "reading-time", "utils", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Calcule le temps de lecture d'un article à partir du
                 texte des blocs de contenu. Compte les mots des blocs
                 paragraph (texte courant) ET des blocs section (titres),
                 applique un rythme de 200 mots par minute, arrondit à
                 l'entier supérieur et retourne au minimum 1 minute. Pur,
                 aucun effet de bord, aucune dépendance runtime hors
                 types.

flow:            computeReadingTimeMin(blocks) → itère sur les blocs →
                 accumule le nombre de mots (paragraph.text +
                 section.title) → Math.ceil(words / 200) → Math.max(1,
                 min).
                 countWords(text) → split sur /\s+/ → filter Boolean →
                 length.

ecosystem:       BlogCore = [
                   "@/app/blog/lib/admin.ts",
                   "@/app/blog/lib/ecosystem.ts",
                   "@/app/blog/lib/media.ts",
                   "@/app/blog/lib/session.ts",
                   "@/app/blog/lib/storage.ts",
                   "@/app/blog/lib/tree.ts",
                   "@/app/blog/lib/types.ts",
                   "@/app/blog/lib/utils/reading-time.ts",
                   "@/app/blog/lib/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/types.ts"]
imports:         ["@/app/blog/lib/types"]
exports:         ["computeReadingTimeMin", "countWords"]
useBy:           ["@/app/blog/lib/services/article.ts"]

userStories:     ["us1100005"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ContentBlock } from "@/app/blog/lib/types";

/* ------------------------------------------------------------------ */
/*  Constantes                                                        */
/* ------------------------------------------------------------------ */

const WORDS_PER_MINUTE = 200;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Compte les mots d'un texte : split sur les espaces, filtre les vides. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calcule le temps de lecture en minutes (entier, ≥ 1).
 * Compte le texte des blocs paragraph + le titre des blocs section.
 */
export function computeReadingTimeMin(
  blocks: readonly ContentBlock[],
): number {
  let words = 0;
  for (const block of blocks) {
    if (block.type === "paragraph") {
      words += countWords(block.text);
    } else if (block.type === "section") {
      words += countWords(block.title);
    }
  }
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}
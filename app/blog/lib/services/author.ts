/*
path :           app/blog/lib/services/author.ts
tag :            ["blog", "service", "author", "profile", "resolve"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Résout des profils utilisateurs (nom + image) à partir
                 d'une liste d'IDs. Sert aux composants de rendu (cartes,
                 commentaires, posts de discussion) qui n'ont que
                 l'authorId (les entités Blog sont stockées en JSON et ne
                 dupliquent pas les données Prisma User). Point d'entrée
                 unique pour toute « jointure » authorId → User.

flow:            resolveAuthorProfiles(userIds) → dédoublonne les IDs →
                 prisma.user.findMany({ where: { id: { in: unique } },
                 select: { id, name, image } }) → Map<id, AuthorProfile>.

ecosystem:       BlogServices = [
                   "@/app/blog/lib/services/article.ts",
                   "@/app/blog/lib/services/author.ts",
                   "@/app/blog/lib/services/comment.ts",
                   "@/app/blog/lib/services/favorite.ts",
                   "@/app/blog/lib/services/group.ts",
                   "@/app/blog/lib/services/like.ts",
                   "@/app/blog/lib/services/notification.ts",
                   "@/app/blog/lib/services/search.ts",
                   "@/app/blog/lib/services/taxonomy.ts",
                 ]

relatedFiles:    ["@/lib/prisma.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["@/lib/prisma"]

exports:         ["resolveAuthorProfiles", "AuthorProfile"]

useBy:           ["@/app/blog/[slug]/page.tsx",
                  "@/app/blog/community/[groupSlug]/page.tsx",
                  "@/app/blog/community/[groupSlug]/[discussionId]/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le nom et l'avatar des auteurs"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { prisma } from "@/lib/prisma";

export interface AuthorProfile {
  readonly id: string;
  readonly name: string;
  readonly image: string | null;
}

/**
 * Résout des profils utilisateurs depuis une liste d'IDs.
 * Retourne toujours une Map (vide si aucun ID résolvable) pour simplifier
 * l'usage côté page : `profiles.get(id)?.name ?? "Utilisateur inconnu"`.
 */
export async function resolveAuthorProfiles(
  userIds: readonly string[],
): Promise<ReadonlyMap<string, AuthorProfile>> {
  const unique = Array.from(new Set(userIds)).filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );
  if (unique.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true, image: true },
  });

  return new Map(
    users.map((u) => [
      u.id,
      { id: u.id, name: u.name, image: u.image },
    ]),
  );
}
/*
path :           app/admin/users/actions.ts
tag :            ["admin", "users", "action", "role", "server-action"]
projectId:       new-genesis
type :           action
generic:         false

role:            Server Action de mise à jour du rôle d'un utilisateur.
                 Vérifie que l'appelant est administrateur (via
                 getSession + prisma.user.role), puis met à jour le
                 champ `role` de l'utilisateur cible. Revalide
                 /admin/users. Retourne ActionResult<null>.

flow:            updateUserRoleAction(userId, role) → getSession() →
                 si null : erreur → prisma.user.findUnique(appelant) →
                 si role !== "admin" : erreur → validation role ∈
                 {"user","admin"} → prisma.user.update({ where: {id:
                 userId}, data: {role} }) → revalidatePath("/admin/users")
                 → { ok: true, data: null }.

ecosystem:       Admin = [
                   "@/app/admin/users/actions.ts",
                   "@/app/admin/users/page.tsx",
                   "@/app/admin/users/RoleSelect.tsx",
                 ]

relatedFiles:    ["@/lib/prisma.ts",
                  "@/lib/auth/session.ts",
                  "@/app/blog/lib/actions/result.ts"]

imports:         ["next/cache",
                  "@/lib/prisma",
                  "@/lib/auth/session",
                  "@/app/blog/lib/actions/result"]

exports:         ["updateUserRoleAction"]

useBy:           ["@/app/admin/users/RoleSelect.tsx"]

userStories:     ["*en tant qu'administrateur je veux changer le rôle d'un utilisateur"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  handleActionError,
  type ActionResult,
} from "@/app/blog/lib/actions/result";

const VALID_ROLES = new Set(["user", "admin"]);

export async function updateUserRoleAction(
  userId: string,
  role: string,
): Promise<ActionResult<null>> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Authentification requise." };
    }

    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (caller?.role !== "admin") {
      return { ok: false, error: "Rôle administrateur requis." };
    }

    if (!VALID_ROLES.has(role)) {
      return { ok: false, error: `Rôle invalide : ${role}.` };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
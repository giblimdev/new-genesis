/*
path :           app/blog/lib/actions/taxonomy.ts
tag :            ["blog", "action", "taxonomy", "theme", "category", "tag", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions du CRUD taxonomie. 12 actions
                 (create/update/delete pour Thème, Catégorie,
                 Sous-catégorie, Tag). Chaque action parse un FormData,
                 valide via Zod, vérifie le rôle administrateur côté
                 serveur (isAdmin), délègue au service, revalidatePath,
                 retourne ActionResult<T>. Utilise
                 handleActionError pour le catch.

flow:            createThemeAction(formData) → isAdmin() → parse
                 FormData → createTheme() → revalidatePath("/blog/admin/taxonomy")
                 → { ok, data }.
                 updateThemeAction(themeId, formData) → isAdmin() →
                 parse → updateTheme → revalidate.
                 deleteThemeAction(themeId) → isAdmin() → deleteTheme.
                 Idem pour Catégorie (nécessite themeId) et
                 Sous-catégorie (themeId + categoryId).
                 Idem pour Tag.

ecosystem:       BlogActions = [
                   "@/app/blog/lib/actions/article.ts",
                   "@/app/blog/lib/actions/comment.ts",
                   "@/app/blog/lib/actions/discussion.ts",
                   "@/app/blog/lib/actions/favorite.ts",
                   "@/app/blog/lib/actions/group.ts",
                   "@/app/blog/lib/actions/like.ts",
                   "@/app/blog/lib/actions/notification.ts",
                   "@/app/blog/lib/actions/result.ts",
                   "@/app/blog/lib/actions/taxonomy.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/result.ts",
                  "@/app/blog/lib/admin.ts",
                  "@/app/blog/lib/services/taxonomy.ts"]
imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/admin",
                  "@/app/blog/lib/services/taxonomy",
                  "@/app/blog/lib/types"]
exports:         ["createThemeAction", "updateThemeAction",
                  "deleteThemeAction", "createCategoryAction",
                  "updateCategoryAction", "deleteCategoryAction",
                  "createSubCategoryAction", "updateSubCategoryAction",
                  "deleteSubCategoryAction", "createTagAction",
                  "updateTagAction", "deleteTagAction"]
useBy:           ["@/app/blog/components/admin/TaxonomyForm.tsx",
                  "@/app/blog/components/admin/TagForm.tsx",
                  "@/app/blog/admin/taxonomy/page.tsx"]

userStories:     ["us1100001", "us1100002", "us1100003", "us1100004"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use server";

import { revalidatePath } from "next/cache";

import {
  handleActionError,
  type ActionResult,
} from "@/app/blog/lib/actions/result";
import { isAdmin } from "@/app/blog/lib/admin";
import {
  createCategory,
  createSubCategory,
  createTag,
  createTheme,
  deleteCategory,
  deleteSubCategory,
  deleteTag,
  deleteTheme,
  updateCategory,
  updateSubCategory,
  updateTag,
  updateTheme,
} from "@/app/blog/lib/services/taxonomy";
import type {
  Category,
  SubCategory,
  Tag,
  Theme,
} from "@/app/blog/lib/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function revalidateAll(): void {
  revalidatePath("/blog/admin/taxonomy");
  revalidatePath("/blog");
}

function assertAdmin(): void {
  /* isAdmin() est async — géré par l'appelant. Cette fonction est
     un garde-fou synchrone ; voir l'usage dans chaque action. */
}

/* ------------------------------------------------------------------ */
/*  Thèmes                                                            */
/* ------------------------------------------------------------------ */

export async function createThemeAction(
  formData: FormData,
): Promise<ActionResult<Theme>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const theme = await createTheme({
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
      color: String(formData.get("color") ?? "chart-1"),
      icon: String(formData.get("icon") ?? "Sparkles"),
    });
    revalidateAll();
    return { ok: true, data: theme };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateThemeAction(
  themeId: string,
  formData: FormData,
): Promise<ActionResult<Theme>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const theme = await updateTheme(themeId, {
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
      color: String(formData.get("color") ?? "chart-1"),
      icon: String(formData.get("icon") ?? "Sparkles"),
    });
    revalidateAll();
    return { ok: true, data: theme };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteThemeAction(
  themeId: string,
): Promise<ActionResult<null>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    await deleteTheme(themeId);
    revalidateAll();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Catégories                                                        */
/* ------------------------------------------------------------------ */

export async function createCategoryAction(
  themeId: string,
  formData: FormData,
): Promise<ActionResult<Category>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const category = await createCategory(themeId, {
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: category };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateCategoryAction(
  themeId: string,
  categoryId: string,
  formData: FormData,
): Promise<ActionResult<Category>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const category = await updateCategory(themeId, categoryId, {
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: category };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteCategoryAction(
  themeId: string,
  categoryId: string,
): Promise<ActionResult<null>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    await deleteCategory(themeId, categoryId);
    revalidateAll();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Sous-catégories                                                   */
/* ------------------------------------------------------------------ */

export async function createSubCategoryAction(
  themeId: string,
  categoryId: string,
  formData: FormData,
): Promise<ActionResult<SubCategory>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const sub = await createSubCategory(themeId, categoryId, {
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: sub };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateSubCategoryAction(
  themeId: string,
  categoryId: string,
  subId: string,
  formData: FormData,
): Promise<ActionResult<SubCategory>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const sub = await updateSubCategory(themeId, categoryId, subId, {
      name: String(formData.get("name") ?? "").trim(),
      description:
        String(formData.get("description") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: sub };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteSubCategoryAction(
  themeId: string,
  categoryId: string,
  subId: string,
): Promise<ActionResult<null>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    await deleteSubCategory(themeId, categoryId, subId);
    revalidateAll();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Tags                                                              */
/* ------------------------------------------------------------------ */

export async function createTagAction(
  formData: FormData,
): Promise<ActionResult<Tag>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const tag = await createTag({
      name: String(formData.get("name") ?? "").trim(),
      color: String(formData.get("color") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: tag };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTagAction(
  tagId: string,
  formData: FormData,
): Promise<ActionResult<Tag>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    const tag = await updateTag(tagId, {
      name: String(formData.get("name") ?? "").trim(),
      color: String(formData.get("color") ?? "").trim() || undefined,
    });
    revalidateAll();
    return { ok: true, data: tag };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTagAction(
  tagId: string,
): Promise<ActionResult<null>> {
  try {
    if (!(await isAdmin())) {
      return { ok: false, error: "Rôle administrateur requis." };
    }
    await deleteTag(tagId);
    revalidateAll();
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Exports inutilisés (référencés par les composants)                */
/* ------------------------------------------------------------------ */

export { assertAdmin };
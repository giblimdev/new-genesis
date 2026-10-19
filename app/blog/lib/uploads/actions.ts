/*
path :           app/blog/lib/uploads/actions.ts
tag :            ["blog", "upload", "action", "server-action", "cover"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions d'upload et de rollback pour les
                 couvertures d'article. uploadArticleCoverAction reçoit
                 un File + un slugBase depuis le client, délègue à
                 persistCoverImage (validation + écriture atomique),
                 et retourne le chemin relatif à injecter dans le
                 FormData de createArticleAction / updateArticleAction.
                 deleteCoverFileAction sert au rollback si la création
                 de l'article échoue après l'upload.

flow:            uploadArticleCoverAction(formData) →
                   - file = formData.get("file")
                   - slugBase = formData.get("slug") ?? "cover"
                   - persistCoverImage(file, slugBase)
                   - { ok: true, data: { path } }
                 deleteCoverFileAction(path) →
                   - deleteCoverFile(path)
                   - { ok: true, data: null }
                 Les erreurs passent par handleActionError (ActionResult
                 du blog, même contrat que les autres actions).

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/CoverImagePicker.tsx",
                   "@/app/blog/lib/uploads/actions.ts",
                   "@/app/blog/lib/uploads/storage.ts",
                   "@/app/blog/lib/uploads/validations.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/uploads/storage.ts",
                  "@/app/blog/lib/uploads/validations.ts",
                  "@/app/blog/lib/actions/result.ts"]

imports:         ["next/cache",
                  "@/app/blog/lib/actions/result",
                  "@/app/blog/lib/uploads/storage"]

exports:         ["uploadArticleCoverAction", "deleteCoverFileAction"]

useBy:           ["@/app/blog/components/admin/ArticleForm.tsx"]

userStories:     ["us1100005", "us1100006"]

status:          planned
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
import {
  deleteCoverFile,
  persistCoverImage,
} from "@/app/blog/lib/uploads/storage";

/* ------------------------------------------------------------------ */
/*  Upload                                                             */
/* ------------------------------------------------------------------ */

export async function uploadArticleCoverAction(
  formData: FormData,
): Promise<ActionResult<{ path: string }>> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Aucun fichier reçu." };
    }
    const rawSlug = formData.get("slug");
    const slugBase =
      typeof rawSlug === "string" && rawSlug.trim().length > 0
        ? rawSlug
        : "cover";

    const { relativePath } = await persistCoverImage(file, slugBase);
    revalidatePath("/blog/admin/articles");
    return { ok: true, data: { path: relativePath } };
  } catch (error) {
    return handleActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/*  Rollback                                                           */
/* ------------------------------------------------------------------ */

export async function deleteCoverFileAction(
  path: string,
): Promise<ActionResult<null>> {
  try {
    await deleteCoverFile(path);
    revalidatePath("/blog/admin/articles");
    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
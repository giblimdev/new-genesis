/*
path :           app/blog/components/articleDraft.ts
tag :            ["blog", "admin", "article", "draft", "sessionStorage", "client"]
projectId:       new-genesis
type :           helper
generic:         false

role:            Persistance du brouillon de formulaire d'article dans
                 sessionStorage. Permet à l'utilisateur de quitter
                 ArticleForm (ex. vers /blog/admin/taxonomy) puis d'y
                 revenir sans perdre sa saisie. Ne persiste QUE les
                 champs sérialisables : File n'est jamais conservé.
                 TTL 24 h : un brouillon plus ancien est ignoré.
                 Isolé par mode ("create" | "edit") et par articleId
                 en edit.

flow:            draftKeyFor(mode, articleId) → clé stable.
                 loadDraft(mode, articleId) → ArticleDraftPayload | null.
                 saveDraft(mode, articleId, data) → écrit dans
                 sessionStorage, no-op si non dispo ou quota dépassé.
                 clearDraft(mode, articleId) → removeItem.

ecosystem:       BlogAdmin = [
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/articles/ArticleRow.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/components/ArticleForm.tsx",
                   "@/app/blog/components/CoverImagePicker.tsx",
                   "@/app/blog/components/QuickCreateCategoryDialog.tsx",
                   "@/app/blog/components/QuickCreateTagDialog.tsx",
                   "@/app/blog/components/articleDraft.ts",
                 ]

relatedFiles:    ["@/app/blog/components/ArticleForm.tsx"]

imports:         []

exports:         ["DRAFT_TTL_MS", "draftKeyFor", "loadDraft",
                  "saveDraft", "clearDraft", "ArticleDraftPayload"]

useBy:           ["@/app/blog/components/ArticleForm.tsx"]

userStories:     ["us1100005", "us1100006"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : accès à window.sessionStorage.

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const PREFIX = "genesis:blog:article-draft";
const VERSION = 1;
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

/* ------------------------------------------------------------------ */
/*  Payload                                                            */
/* ------------------------------------------------------------------ */

export interface ArticleDraftPayload {
  readonly version: number;
  readonly savedAt: number;
  readonly mode: "create" | "edit";
  readonly articleId: string | null;
  readonly data: {
    readonly title: string;
    readonly summary: string;
    readonly coverImage: string;
    readonly themeId: string;
    readonly categoryId: string;
    readonly subCategoryId: string;
    readonly tagIds: readonly string[];
    readonly status: string;
    readonly visibility: string;
    readonly featured: boolean;
    readonly content: readonly unknown[];
  };
}

/* ------------------------------------------------------------------ */
/*  Clé                                                                */
/* ------------------------------------------------------------------ */

export function draftKeyFor(
  mode: "create" | "edit",
  articleId: string | null,
): string {
  return `${PREFIX}:${mode}:${articleId ?? "new"}`;
}

/* ------------------------------------------------------------------ */
/*  Garde-fou SSR                                                      */
/* ------------------------------------------------------------------ */

function hasStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__genesis_probe__";
    window.sessionStorage.setItem(k, "1");
    window.sessionStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export function loadDraft(
  mode: "create" | "edit",
  articleId: string | null,
): ArticleDraftPayload | null {
  if (!hasStorage()) return null;
  const key = draftKeyFor(mode, articleId);
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidPayload(parsed, mode, articleId)) return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Écriture                                                           */
/* ------------------------------------------------------------------ */

export function saveDraft(
  mode: "create" | "edit",
  articleId: string | null,
  data: ArticleDraftPayload["data"],
): void {
  if (!hasStorage()) return;
  const payload: ArticleDraftPayload = {
    version: VERSION,
    savedAt: Date.now(),
    mode,
    articleId,
    data,
  };
  try {
    window.sessionStorage.setItem(
      draftKeyFor(mode, articleId),
      JSON.stringify(payload),
    );
  } catch {
    // Quota dépassé ou navigation privée stricte : on ignore.
  }
}

/* ------------------------------------------------------------------ */
/*  Suppression                                                        */
/* ------------------------------------------------------------------ */

export function clearDraft(
  mode: "create" | "edit",
  articleId: string | null,
): void {
  if (!hasStorage()) return;
  try {
    window.sessionStorage.removeItem(draftKeyFor(mode, articleId));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Validation minimale                                                */
/* ------------------------------------------------------------------ */

function isValidPayload(
  value: unknown,
  mode: "create" | "edit",
  articleId: string | null,
): value is ArticleDraftPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.version !== VERSION) return false;
  if (typeof v.savedAt !== "number") return false;
  if (v.mode !== mode) return false;
  if (v.articleId !== articleId) return false;
  if (typeof v.data !== "object" || v.data === null) return false;
  return true;
}
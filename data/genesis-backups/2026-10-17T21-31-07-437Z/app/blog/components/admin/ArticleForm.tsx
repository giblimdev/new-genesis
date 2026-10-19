/*
path :           app/blog/components/admin/ArticleForm.tsx
tag :            ["blog", "component", "admin", "article", "form", "editor"]
projectId:       new-genesis
type :           component
generic:         false

role:            Formulaire complet d'article. Sections : métadonnées
                 (titre, résumé, couverture), taxonomie 3 niveaux
                 (thème → catégorie → sous-catégorie dépendants), tags
                 multi-sélection, publication (statut, visibilité,
                 featured), contenu (BlockEditor). En mode create,
                 appelle createArticleAction ; en mode edit, appelle
                 updateArticleAction. Le contenu est maintenu en state
                 par BlockEditor via onChange(blocks) et sérialisé en
                 JSON dans le FormData avant submit. Bouton Preview
                 (mode edit seulement) qui ouvre /blog/[slug]?preview=1
                 dans un nouvel onglet. Les listes themes/tags proviennent
                 des props (chargées côté serveur par la page). Les
                 selects catégorie et sous-catégorie sont filtrés en
                 fonction du parent courant ; les valeurs devenues
                 invalides sont effacées. Après succès, redirige vers
                 /blog/admin/articles.

                 UX :
                 - Brouillon persisté dans sessionStorage
                   (articleDraft.ts) à chaque changement (débounce
                   500 ms). Restauré au montage. Bandeau informatif
                   auto-dismissible après 8 s. Ignorer le brouillon
                   retire le sessionStorage (le formulaire garde la
                   saisie courante, mais n'est plus considéré comme
                   « restauré »).
                 - Couverture : CoverImagePicker (upload IMMÉDIAT).
                   Le chemin serveur retourné est stocké dans
                   coverImage → persisté dans le brouillon. Le rollback
                   (suppression du fichier) est déclenché au clic
                   « Annuler » si la couverture a été uploadée dans
                   cette session. Un cleanup périodique côté serveur
                   (cron) traite les orphelins de plus de 24 h.
                 - Boutons « + Nouvelle catégorie », « + Nouvelle
                   sous-catégorie », « + Nouveau tag » : ouvrent des
                   Dialogs de création rapide (QuickCreate*Dialog)
                   qui restent sur place et rafraîchissent le
                   formulaire.
                 - Bouton « Gérer la taxonomie » (lien secondaire)
                   vers /blog/admin/taxonomy?return=<url> pour le
                   CRUD lourd.

                 UI : chaque champ requis porte un astérisque rouge +
                 une icône HelpCircle avec info-bulle (au survol et
                 au focus clavier) expliquant la règle du champ. Le
                 label + hint sont gérés par FieldLabelWithHint.

flow:            useState(title, summary, coverImage, themeId,
                 categoryId, subCategoryId, tagIds: Set, status,
                 visibility, featured, content) + useState(hasDraft)
                 → chargement initial depuis loadDraft(mode, id) avec
                 fallback initial (edit) ou vide (create) → useEffect
                 de sauvegarde débounce 500 ms → soumission :
                 - construit un FormData final → content =
                   JSON.stringify(blocks) → createArticleAction ou
                   updateArticleAction
                 - si ok : clearDraft + toast succès + router.push
                   ("/blog/admin/articles") + refresh
                 - si erreur : toast erreur
                 Le rollback couverture est déclenché au clic
                 « Annuler » si coverImage a été uploadée dans cette
                 session (voir handleCancel).

ecosystem:       BlogUI = [
                   "@/app/blog/components/ArticleBody.tsx",
                   "@/app/blog/components/ArticleCard.tsx",
                   "@/app/blog/components/ArticleHeader.tsx",
                   "@/app/blog/components/CommentForm.tsx",
                   "@/app/blog/components/CommentTree.tsx",
                   "@/app/blog/components/ContentBlockRenderer.tsx",
                   "@/app/blog/components/DiscussionThread.tsx",
                   "@/app/blog/components/FavoriteButton.tsx",
                   "@/app/blog/components/GroupCard.tsx",
                   "@/app/blog/components/LikeButton.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/app/blog/components/NotificationList.tsx",
                   "@/app/blog/components/PostTree.tsx",
                   "@/app/blog/components/SearchFilters.tsx",
                   "@/app/blog/components/TableOfContents.tsx",
                   "@/app/blog/components/TaxonomyNav.tsx",
                   "@/app/blog/components/admin/ArticleForm.tsx",
                   "@/app/blog/components/admin/CoverImagePicker.tsx",
                   "@/app/blog/components/admin/QuickCreateCategoryDialog.tsx",
                   "@/app/blog/components/admin/QuickCreateTagDialog.tsx",
                   "@/app/blog/components/admin/TagForm.tsx",
                   "@/app/blog/components/admin/TaxonomyForm.tsx",
                   "@/app/blog/components/admin/articleDraft.ts",
                   "@/app/blog/components/block-editor/BlockEditor.tsx",
                   "@/app/blog/components/block-editor/BlockList.tsx",
                   "@/app/blog/components/block-editor/BlockToolbar.tsx",
                   "@/app/blog/components/block-editor/BlockTypeMenu.tsx",
                   "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/CodeBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/EmbedBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ParagraphBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/SectionBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/article.ts",
                  "@/app/blog/lib/uploads/actions.ts",
                  "@/app/blog/lib/types.ts",
                  "@/app/blog/components/block-editor/BlockEditor.tsx",
                  "@/app/blog/components/admin/CoverImagePicker.tsx",
                  "@/app/blog/components/admin/QuickCreateCategoryDialog.tsx",
                  "@/app/blog/components/admin/QuickCreateTagDialog.tsx",
                  "@/app/blog/components/admin/articleDraft.ts"]

imports:         ["react", "next/link", "next/navigation", "lucide-react", "sonner",
                  "@/app/blog/lib/actions/article",
                  "@/app/blog/lib/uploads/actions",
                  "@/app/blog/lib/types",
                  "@/app/blog/components/block-editor/BlockEditor",
                  "@/app/blog/components/admin/CoverImagePicker",
                  "@/app/blog/components/admin/QuickCreateCategoryDialog",
                  "@/app/blog/components/admin/QuickCreateTagDialog",
                  "@/app/blog/components/admin/articleDraft",
                  "@/components/ui/button",
                  "@/components/ui/checkbox",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/label",
                  "@/components/ui/native-select",
                  "@/components/ui/textarea",
                  "@/components/ui/tooltip"]

exports:         ["ArticleForm", "ArticleFormProps"]
useBy:           ["@/app/blog/admin/articles/new/page.tsx",
                  "@/app/blog/admin/articles/[id]/edit/page.tsx"]

userStories:     ["us1100005", "us1100006"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useEffect, useMemo, useTransition, router.push, toast, Tooltip.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  HelpCircle,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  createArticleAction,
  updateArticleAction,
} from "@/app/blog/lib/actions/article";
import { deleteCoverFileAction } from "@/app/blog/lib/uploads/actions";
import type {
  Article,
  ArticleStatus,
  ContentBlock,
  Tag,
  Theme,
  Visibility,
} from "@/app/blog/lib/types";
import { BlockEditor } from "@/app/blog/components/block-editor/BlockEditor";
import { CoverImagePicker } from "@/app/blog/components/admin/CoverImagePicker";
import { QuickCreateCategoryDialog } from "@/app/blog/components/admin/QuickCreateCategoryDialog";
import { QuickCreateTagDialog } from "@/app/blog/components/admin/QuickCreateTagDialog";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "@/app/blog/components/admin/articleDraft";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ArticleFormProps {
  readonly mode: "create" | "edit";
  readonly initial?: Article;
  readonly themes: readonly Theme[];
  readonly tags: readonly Tag[];
  readonly mediaManifest: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  FieldLabelWithHint                                                 */
/* ------------------------------------------------------------------ */

interface FieldLabelWithHintProps {
  readonly htmlFor: string;
  readonly children: React.ReactNode;
  readonly hint: string;
  readonly required?: boolean;
}

function FieldLabelWithHint({
  htmlFor,
  children,
  hint,
  required = true,
}: FieldLabelWithHintProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </Label>
      {required && (
        <span
          aria-hidden
          className="text-sm font-semibold leading-none text-destructive"
        >
          *
        </span>
      )}
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={hint}
          className="grid size-4 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="size-3.5" aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-balance">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeader                                                      */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-2">
      <div className="space-y-0.5">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function ArticleForm({
  mode,
  initial,
  themes,
  tags,
  mediaManifest,
}: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const articleId = initial?.id ?? null;

  /* 1. Chargement initial : restaure le brouillon s'il existe. */
  const draft = useMemo(
    () => loadDraft(mode, articleId),
    [mode, articleId],
  );

  const [title, setTitle] = useState(
    draft?.data.title ?? initial?.title ?? "",
  );
  const [summary, setSummary] = useState(
    draft?.data.summary ?? initial?.summary ?? "",
  );
  const [coverImage, setCoverImage] = useState(
    draft?.data.coverImage ?? initial?.coverImage ?? "",
  );
  const [themeId, setThemeId] = useState(
    draft?.data.themeId ?? initial?.themeId ?? themes[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    draft?.data.categoryId ?? initial?.categoryId ?? "",
  );
  const [subCategoryId, setSubCategoryId] = useState(
    draft?.data.subCategoryId ?? initial?.subCategoryId ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    () =>
      new Set(draft?.data.tagIds ?? initial?.tagIds ?? []),
  );
  const [status, setStatus] = useState<ArticleStatus>(
    (draft?.data.status as ArticleStatus | undefined) ??
      initial?.status ??
      "draft",
  );
  const [visibility, setVisibility] = useState<Visibility>(
    (draft?.data.visibility as Visibility | undefined) ??
      initial?.visibility ??
      "public",
  );
  const [featured, setFeatured] = useState(
    draft?.data.featured ?? initial?.featured ?? false,
  );
  const [content, setContent] = useState<readonly ContentBlock[]>(
    (draft?.data.content as readonly ContentBlock[] | undefined) ??
      initial?.content ??
      [],
  );

  /* 2. Bandeau « brouillon restauré » (auto-dismiss 8 s). */
  const [showDraftBanner, setShowDraftBanner] = useState(draft !== null);
  useEffect(() => {
    if (!showDraftBanner) return;
    const t = setTimeout(() => setShowDraftBanner(false), 8000);
    return () => clearTimeout(t);
  }, [showDraftBanner]);

  /* 3. Mémorise la couverture uploadée dans cette session pour
        permettre le rollback sur « Annuler ». */
  const [uploadedThisSession, setUploadedThisSession] = useState<
    string | null
  >(null);

  /* 4. Sauvegarde automatique du brouillon (débounce 500 ms). */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft(mode, articleId, {
        title,
        summary,
        coverImage,
        themeId,
        categoryId,
        subCategoryId,
        tagIds: Array.from(selectedTagIds),
        status,
        visibility,
        featured,
        content,
      });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    mode,
    articleId,
    title,
    summary,
    coverImage,
    themeId,
    categoryId,
    subCategoryId,
    selectedTagIds,
    status,
    visibility,
    featured,
    content,
  ]);

  /* 5. Quick-create dialogs. */
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  /* 6. Taxonomie dépendante (valeurs courantes). */
  const currentTheme = useMemo(
    () => themes.find((t) => t.id === themeId),
    [themes, themeId],
  );
  const categories = currentTheme?.categories ?? [];

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );
  const subCategories = currentCategory?.subCategories ?? [];

  function handleThemeChange(nextThemeId: string) {
    setThemeId(nextThemeId);
    setCategoryId("");
    setSubCategoryId("");
  }

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setSubCategoryId("");
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Couverture : upload immédiat + mémorisation session              */
  /* ------------------------------------------------------------------ */

  function handleCoverChange(nextPath: string) {
    setCoverImage(nextPath);
    if (nextPath !== "" && nextPath !== initial?.coverImage) {
      setUploadedThisSession(nextPath);
    }
    if (nextPath === "") {
      setUploadedThisSession(null);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Ignorer le brouillon                                             */
  /* ------------------------------------------------------------------ */

  function handleIgnoreDraft() {
    clearDraft(mode, articleId);
    setShowDraftBanner(false);
    toast.success("Brouillon ignoré.");
  }

  /* ------------------------------------------------------------------ */
  /*  Annuler (rollback couverture si uploadée dans cette session)    */
  /* ------------------------------------------------------------------ */

  function handleCancel() {
    startTransition(async () => {
      if (uploadedThisSession) {
        await deleteCoverFileAction(uploadedThisSession);
      }
      clearDraft(mode, articleId);
      router.push("/blog/admin/articles");
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Submit                                                            */
  /* ------------------------------------------------------------------ */

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("summary", summary.trim());
      if (coverImage.trim()) formData.set("coverImage", coverImage.trim());
      formData.set("themeId", themeId);
      if (categoryId) formData.set("categoryId", categoryId);
      if (subCategoryId) formData.set("subCategoryId", subCategoryId);
      for (const id of selectedTagIds) formData.append("tagIds", id);
      formData.set("status", status);
      formData.set("visibility", visibility);
      if (featured) formData.set("featured", "on");
      formData.set("content", JSON.stringify(content));

      const result =
        mode === "create"
          ? await createArticleAction(formData)
          : initial
            ? await updateArticleAction(initial.id, formData)
            : { ok: false as const, error: "Article introuvable." };

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      clearDraft(mode, articleId);
      toast.success(
        mode === "create" ? "Article créé." : "Article mis à jour.",
      );
      router.push("/blog/admin/articles");
      router.refresh();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Rendu                                                            */
  /* ------------------------------------------------------------------ */

  const taxonomyReturnUrl =
    mode === "edit" && articleId
      ? `/blog/admin/articles/${articleId}/edit`
      : `/blog/admin/articles/new`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bandeau brouillon restauré (auto-dismiss) */}
      {showDraftBanner && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-chart-3/40 bg-chart-3/5 px-3 py-2 text-xs text-chart-3">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="size-3.5" aria-hidden />
            Brouillon restauré.
          </span>
          <button
            type="button"
            onClick={handleIgnoreDraft}
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            Ignorer le brouillon
          </button>
        </div>
      )}

      {/* 1. Métadonnées */}
      <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <SectionHeader
          title="Métadonnées"
          description="Titre, résumé et image de couverture de l'article."
        />

        <Field>
          <FieldLabelWithHint
            htmlFor="article-title"
            hint="Titre affiché en tête d'article. 3 à 200 caractères."
          >
            Titre
          </FieldLabelWithHint>
          <Input
            id="article-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            placeholder="Ex. Concevoir une architecture Next.js robuste"
          />
          <div className="flex justify-end">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {title.length}/200
            </span>
          </div>
        </Field>

        <Field>
          <FieldLabelWithHint
            htmlFor="article-summary"
            hint="Résumé affiché sur les cartes et en métadonnées SEO. 20 à 500 caractères."
          >
            Résumé
          </FieldLabelWithHint>
          <Textarea
            id="article-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            required
            maxLength={500}
            placeholder="En une ou deux phrases, de quoi parle l'article ?"
          />
          <div className="flex justify-end">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {summary.length}/500
            </span>
          </div>
        </Field>

        <Field>
          <FieldLabelWithHint
            htmlFor="article-cover"
            hint="Déposez, collez (Ctrl+V) ou cliquez pour choisir une image. Enregistrée immédiatement dans public/blog/articles/. Optionnel."
            required={false}
          >
            Couverture
          </FieldLabelWithHint>
          <CoverImagePicker
            value={coverImage}
            onChange={handleCoverChange}
            disabled={isPending}
          />
        </Field>
      </section>

      {/* 2. Taxonomie */}
      <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <SectionHeader
          title="Taxonomie"
          description="Thème, catégorie et sous-catégorie dépendants, plus les tags."
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              render={
                <Link
                  href={`/blog/admin/taxonomy?return=${encodeURIComponent(taxonomyReturnUrl)}`}
                />
              }
            >
              Gérer la taxonomie
              <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabelWithHint
              htmlFor="article-theme"
              hint="Thème principal. Détermine la couleur d'accent et le classement dans le blog."
            >
              Thème
            </FieldLabelWithHint>
            <NativeSelect
              id="article-theme"
              value={themeId}
              onChange={(event) => handleThemeChange(event.target.value)}
              required
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {themes.map((theme) => (
                <NativeSelectOption key={theme.id} value={theme.id}>
                  {theme.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabelWithHint
              htmlFor="article-category"
              hint="Catégorie du thème sélectionné. Optionnel."
              required={false}
            >
              Catégorie
            </FieldLabelWithHint>
            <div className="flex gap-1.5">
              <NativeSelect
                id="article-category"
                value={categoryId}
                onChange={(event) => handleCategoryChange(event.target.value)}
                disabled={categories.length === 0}
                className="flex-1"
              >
                <NativeSelectOption value="">—</NativeSelectOption>
                {categories.map((cat) => (
                  <NativeSelectOption key={cat.id} value={cat.id}>
                    {cat.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setCategoryDialogOpen(true)}
                disabled={!themeId}
                aria-label="Créer une nouvelle catégorie"
                title="Créer une nouvelle catégorie"
              >
                <Plus className="size-3.5" aria-hidden />
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabelWithHint
              htmlFor="article-subcategory"
              hint="Sous-catégorie de la catégorie sélectionnée. Optionnel."
              required={false}
            >
              Sous-catégorie
            </FieldLabelWithHint>
            <div className="flex gap-1.5">
              <NativeSelect
                id="article-subcategory"
                value={subCategoryId}
                onChange={(event) => setSubCategoryId(event.target.value)}
                disabled={subCategories.length === 0}
                className="flex-1"
              >
                <NativeSelectOption value="">—</NativeSelectOption>
                {subCategories.map((sub) => (
                  <NativeSelectOption key={sub.id} value={sub.id}>
                    {sub.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setSubCategoryDialogOpen(true)}
                disabled={!categoryId}
                aria-label="Créer une nouvelle sous-catégorie"
                title="Créer une nouvelle sous-catégorie"
              >
                <Plus className="size-3.5" aria-hidden />
              </Button>
            </div>
          </Field>
        </div>

        <Field>
          <div className="flex items-center justify-between gap-2">
            <FieldLabelWithHint
              htmlFor="article-tags"
              hint="Plusieurs tags possibles. Ils aident au référencement interne et au filtrage."
              required={false}
            >
              Tags
              <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                {selectedTagIds.size}
              </span>
            </FieldLabelWithHint>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTagDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-3.5" aria-hidden />
              Nouveau tag
            </Button>
          </div>

          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucun tag pour l&apos;instant. Créez-en via « Nouveau tag ».
            </p>
          ) : (
            <div
              id="article-tags"
              role="group"
              aria-label="Sélection des tags"
              className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-3"
            >
              {tags.map((tag) => {
                const checked = selectedTagIds.has(tag.id);
                return (
                  <label
                    key={tag.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      checked
                        ? "border-chart-1/40 bg-chart-1/10 text-foreground"
                        : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleTag(tag.id)}
                      aria-label={`Tag ${tag.name}`}
                    />
                    <span>{tag.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>
      </section>

      {/* 3. Publication */}
      <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <SectionHeader
          title="Publication"
          description="Statut éditorial, visibilité et mise en avant."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabelWithHint
              htmlFor="article-status"
              hint="Brouillon (invisible), Publié (visible), Archivé (masqué du blog mais conservé)."
            >
              Statut
            </FieldLabelWithHint>
            <NativeSelect
              id="article-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ArticleStatus)
              }
            >
              <NativeSelectOption value="draft">Brouillon</NativeSelectOption>
              <NativeSelectOption value="published">
                Publié
              </NativeSelectOption>
              <NativeSelectOption value="archived">
                Archivé
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabelWithHint
              htmlFor="article-visibility"
              hint="Public (visible partout), Non listé (accessible par URL), Privé (visible uniquement par vous et les admins)."
            >
              Visibilité
            </FieldLabelWithHint>
            <NativeSelect
              id="article-visibility"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as Visibility)
              }
            >
              <NativeSelectOption value="public">Public</NativeSelectOption>
              <NativeSelectOption value="unlisted">
                Non listé
              </NativeSelectOption>
              <NativeSelectOption value="private">Privé</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabelWithHint
              htmlFor="article-featured"
              hint="Met l'article en avant sur la page d'accueil du blog. À réserver aux contenus phares."
              required={false}
            >
              À la une
            </FieldLabelWithHint>
            <label
              htmlFor="article-featured"
              className="flex h-8 items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 text-sm"
            >
              <Checkbox
                id="article-featured"
                checked={featured}
                onCheckedChange={(value) => setFeatured(value === true)}
              />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                Mis en avant
              </span>
            </label>
          </Field>
        </div>
      </section>

      {/* 4. Contenu */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <SectionHeader
          title="Contenu"
          description="Structurez l'article en blocs hiérarchiques (sections, paragraphes, médias, code, embeds). Profondeur maximale : 6."
        />
        <BlockEditor
          initialBlocks={content}
          rootId={initial?.id ?? "draft-root"}
          mediaManifest={mediaManifest}
          onChange={setContent}
        />
      </section>

      {/* Footer d'actions — sticky pour rester accessible */}
      <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-border/60 bg-card/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {mode === "edit" && initial && (
          <Button
            type="button"
            variant="outline"
            render={
              <Link
                href={`/blog/${initial.slug}?preview=1`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="gap-2"
          >
            <Eye className="size-4" aria-hidden />
            Aperçu
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isPending || !title.trim() || !summary.trim()}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "create" ? "Créer l'article" : "Enregistrer"}
        </Button>
      </div>

      {/* Dialogs de création rapide */}
      <QuickCreateCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        themeId={themeId}
        mode="category"
        onCreated={(id) => {
          setCategoryId(id);
          setSubCategoryId("");
          router.refresh();
        }}
      />
      <QuickCreateCategoryDialog
        open={subCategoryDialogOpen}
        onOpenChange={setSubCategoryDialogOpen}
        themeId={themeId}
        categoryId={categoryId}
        mode="subcategory"
        onCreated={(id) => {
          setSubCategoryId(id);
          router.refresh();
        }}
      />
      <QuickCreateTagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        onCreated={(id) => {
          setSelectedTagIds((prev) => new Set(prev).add(id));
          router.refresh();
        }}
      />
    </form>
  );
}
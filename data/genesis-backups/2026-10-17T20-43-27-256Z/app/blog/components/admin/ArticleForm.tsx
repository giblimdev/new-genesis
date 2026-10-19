/*
path :           app/blog/components/admin/ArticleForm.tsx
tag :            ["blog", "component", "admin", "article", "form", "editor"]
projectId:       new-genesis
type:            component
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

flow:            useState(title, summary, coverImage, themeId, categoryId,
                 subCategoryId, tagIds: Set, status, visibility,
                 featured, content) → useMemo(categories du thème
                 courant) → useMemo(subs de la catégorie courante) →
                 soumission : construit un FormData → content =
                 JSON.stringify(blocks) → createArticleAction(formData)
                 ou updateArticleAction(articleId, formData) → si ok :
                 toast succès + router.push("/blog/admin/articles") +
                 refresh → si erreur : toast erreur.

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
                   "@/app/blog/components/admin/TagForm.tsx",
                   "@/app/blog/components/admin/TaxonomyForm.tsx",
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
                  "@/app/blog/lib/types.ts",
                  "@/app/blog/components/block-editor/BlockEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/blog/lib/actions/article",
                  "@/app/blog/lib/types",
                  "@/app/blog/components/block-editor/BlockEditor",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea",
                  "@/components/ui/native-select",
                  "@/components/ui/checkbox"]
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
// "use client" justifié : useState, useMemo, router.push, toast.

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  createArticleAction,
  updateArticleAction,
} from "@/app/blog/lib/actions/article";
import type {
  Article,
  ArticleStatus,
  ContentBlock,
  Tag,
  Theme,
  Visibility,
} from "@/app/blog/lib/types";
import { BlockEditor } from "@/app/blog/components/block-editor/BlockEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

export interface ArticleFormProps {
  readonly mode: "create" | "edit";
  readonly initial?: Article;
  readonly themes: readonly Theme[];
  readonly tags: readonly Tag[];
  readonly mediaManifest: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Composant                                                         */
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

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [themeId, setThemeId] = useState(
    initial?.themeId ?? themes[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subCategoryId, setSubCategoryId] = useState(
    initial?.subCategoryId ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    () => new Set(initial?.tagIds ?? []),
  );
  const [status, setStatus] = useState<ArticleStatus>(
    initial?.status ?? "draft",
  );
  const [visibility, setVisibility] = useState<Visibility>(
    initial?.visibility ?? "public",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [content, setContent] = useState<readonly ContentBlock[]>(
    initial?.content ?? [],
  );

  /* ------------------------------------------------------------------ */
  /*  Taxonomie dépendante                                             */
  /* ------------------------------------------------------------------ */

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
  /*  Submit                                                           */
  /* ------------------------------------------------------------------ */

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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

    startTransition(async () => {
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
      toast.success(mode === "create" ? "Article créé." : "Article mis à jour.");
      router.push("/blog/admin/articles");
      router.refresh();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Rendu                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Métadonnées */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Métadonnées
        </h2>
        <Field>
          <FieldLabel htmlFor="article-title">Titre</FieldLabel>
          <Input
            id="article-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="article-summary">Résumé</FieldLabel>
          <Textarea
            id="article-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            required
            maxLength={500}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="article-cover">
            Couverture (chemin relatif dans /public/blog/)
          </FieldLabel>
          <Input
            id="article-cover"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            list="article-cover-manifest"
          />
          <datalist id="article-cover-manifest">
            {mediaManifest.map((file) => (
              <option key={file} value={file} />
            ))}
          </datalist>
        </Field>
      </section>

      {/* Taxonomie */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Taxonomie
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="article-theme">Thème</FieldLabel>
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
            <FieldLabel htmlFor="article-category">Catégorie</FieldLabel>
            <NativeSelect
              id="article-category"
              value={categoryId}
              onChange={(event) => handleCategoryChange(event.target.value)}
              disabled={categories.length === 0}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {categories.map((cat) => (
                <NativeSelectOption key={cat.id} value={cat.id}>
                  {cat.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="article-subcategory">
              Sous-catégorie
            </FieldLabel>
            <NativeSelect
              id="article-subcategory"
              value={subCategoryId}
              onChange={(event) => setSubCategoryId(event.target.value)}
              disabled={subCategories.length === 0}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {subCategories.map((sub) => (
                <NativeSelectOption key={sub.id} value={sub.id}>
                  {sub.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field>
          <FieldLabel>Tags ({selectedTagIds.size} sélectionné{selectedTagIds.size > 1 ? "s" : ""})</FieldLabel>
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucun tag pour l&apos;instant. Créez-en dans la page Taxonomie.
            </p>
          ) : (
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-3">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedTagIds.has(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          )}
        </Field>
      </section>

      {/* Publication */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Publication
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="article-status">Statut</FieldLabel>
            <NativeSelect
              id="article-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ArticleStatus)
              }
            >
              <NativeSelectOption value="draft">Brouillon</NativeSelectOption>
              <NativeSelectOption value="published">Publié</NativeSelectOption>
              <NativeSelectOption value="archived">Archivé</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="article-visibility">Visibilité</FieldLabel>
            <NativeSelect
              id="article-visibility"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as Visibility)
              }
            >
              <NativeSelectOption value="public">Public</NativeSelectOption>
              <NativeSelectOption value="unlisted">Non listé</NativeSelectOption>
              <NativeSelectOption value="private">Privé</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="article-featured">À la une</FieldLabel>
            <label className="flex h-8 items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 text-sm">
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

      {/* Contenu */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Contenu
        </h2>
        <p className="text-xs text-muted-foreground">
          Structurez votre article en blocs hiérarchiques (sections,
          paragraphes, médias, code, embeds). Profondeur maximale : 6.
        </p>
        <BlockEditor
          initialBlocks={content}
          rootId={initial?.id ?? "draft-root"}
          mediaManifest={mediaManifest}
          onChange={setContent}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2">
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
          onClick={() => router.push("/blog/admin/articles")}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || !title.trim()}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "create" ? "Créer l'article" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
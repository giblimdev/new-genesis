/*
path :           app/blog/articles/ArticleRow.tsx
tag :            ["blog", "admin", "article", "row", "client", "action"]
projectId:       new-genesis
type :           component
generic:         false

role:            Ligne d'article côté admin ET côté utilisateur. Affiche
                 titre (lien vers édition), slug + vues + temps de
                 lecture, badge statut et visibilité, puis les boutons
                 Éditer / Publier / Archiver / Supprimer. Chaque mutation
                 est un <form> dont l'action est passée en prop par le
                 Server Component parent (page.tsx). Les actions reçues
                 sont des wrappers "form" (retournent Promise<void>) —
                 pas les actions métier (qui retournent ActionResult,
                 type incompatible avec <form action={}>). Feedback de
                 chargement via useFormStatus (React 19). Suppression
                 protégée par un AlertDialog.

                 Le chemin d'édition est paramétrable via `editBasePath`
                 (défaut "/blog/articles" — route physique réelle).
                 Avant le correctif : le chemin était hardcodé en
                 "/blog/admin/articles" → 404. Le défaut corrige donc
                 implicitement l'ancienne page /blog/articles et la
                 nouvelle page /blog/user/articles.

                 ⚠️ Base UI : le bouton « Éditer » est un <Link> stylé
                 via buttonVariants(), PAS un <Button render={<Link/>}>.
                 Sinon Base UI logue « A component that acts as a button
                 expected a native <button> » (nativeButton = true par
                 défaut). Un lien de navigation doit rester un <a> pour
                 la sémantique et l'accessibilité (cf. convention du
                 projet, ex. app/admin/users/page.tsx).

flow:            Reçoit { article, publishAction, archiveAction,
                 deleteAction, editBasePath = "/blog/articles" } → rend
                 <li> avec :
                   - titre (Link vers `${editBasePath}/${id}/edit`)
                   - métadonnées (slug, Eye viewCount, Clock
                     readingTimeMin)
                   - StatusBadge + VisibilityBadge
                   - actions : Éditer (Link stylé buttonVariants),
                     Publier (form action={publishAction.bind(null,
                     article.id)} si status !== "published"), Archiver
                     (idem si status !== "archived"), Supprimer
                     (AlertDialog + form action={deleteAction.bind(
                     null, article.id)} + SubmitButton destructive).

ecosystem:       Blog = [
                   "@/app/blog/[slug]/page.tsx",
                   "@/app/blog/admin/articles/[id]/edit/page.tsx",
                   "@/app/blog/admin/articles/new/page.tsx",
                   "@/app/blog/admin/articles/page.tsx",
                   "@/app/blog/admin/setup/page.tsx",
                   "@/app/blog/admin/taxonomy/page.tsx",
                   "@/app/blog/articles/[id]/edit/page.tsx",
                   "@/app/blog/articles/ArticleRow.tsx",
                   "@/app/blog/articles/new/page.tsx",
                   "@/app/blog/articles/page.tsx",
                   "@/app/blog/community/[groupSlug]/[discussionId]/page.tsx",
                   "@/app/blog/community/[groupSlug]/page.tsx",
                   "@/app/blog/community/[groupSlug]/requests/page.tsx",
                   "@/app/blog/community/new/page.tsx",
                   "@/app/blog/community/page.tsx",
                   "@/app/blog/help/page.tsx",
                   "@/app/blog/notifications/page.tsx",
                   "@/app/blog/page.tsx",
                   "@/app/blog/search/page.tsx",
                   "@/app/blog/tag/[slug]/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/[subCategory]/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/page.tsx",
                   "@/app/blog/theme/[slug]/page.tsx",
                   "@/app/blog/user/articles/page.tsx",
                   "@/app/blog/user/favorites/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/article-form.ts",
                  "@/app/blog/lib/types.ts",
                  "@/app/blog/articles/page.tsx",
                  "@/app/blog/user/articles/page.tsx"]

imports:         ["react", "react-dom", "next/link", "lucide-react",
                  "@/app/blog/lib/types",
                  "@/components/ui/alert-dialog",
                  "@/components/ui/button"]

exports:         ["ArticleRow", "ArticleRowProps"]

useBy:           ["@/app/blog/articles/page.tsx",
                  "@/app/blog/user/articles/page.tsx"]

userStories:     ["us1100005", "us1100006",
                  "*en tant qu'auteur je veux gérer mes propres articles"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useFormStatus (React 19) + AlertDialog interactif.

import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  Archive,
  Clock,
  Eye,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";

import type { Article } from "@/app/blog/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

/**
 * Server Action compatible <form action={}> : retourne Promise<void>.
 * Les actions métier (publishArticleAction, …) retournent un
 * ActionResult et ne sont donc PAS assignables à `action={}`. Les
 * wrappers `*FormAction` de article-form.ts font la conversion.
 */
type ArticleFormAction = (articleId: string) => Promise<void>;

export interface ArticleRowProps {
  readonly article: Article;
  readonly publishAction: ArticleFormAction;
  readonly archiveAction: ArticleFormAction;
  readonly deleteAction: ArticleFormAction;
  /**
   * Base path pour les liens Éditer / titre.
   * Défaut : "/blog/articles" (route physique réelle).
   * Passer "/blog/admin/articles" uniquement si cette route est un jour
   * créée par un git mv de app/blog/articles → app/blog/admin/articles.
   */
  readonly editBasePath?: string;
}

/* ------------------------------------------------------------------ */
/*  Badges                                                             */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { readonly status: Article["status"] }) {
  const map = {
    draft: { label: "Brouillon", cls: "bg-muted text-muted-foreground" },
    published: { label: "Publié", cls: "bg-chart-4/15 text-chart-4" },
    archived: { label: "Archivé", cls: "bg-chart-5/15 text-chart-5" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function VisibilityBadge({
  visibility,
}: {
  readonly visibility: Article["visibility"];
}) {
  const map = {
    public: "Public",
    unlisted: "Non listé",
    private: "Privé",
  } as const;
  return (
    <span className="shrink-0 text-[11px] text-muted-foreground">
      {map[visibility]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SubmitButton — feedback de chargement (useFormStatus)              */
/* ------------------------------------------------------------------ */

function SubmitButton({
  icon,
  label,
  pendingLabel,
  variant = "outline",
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly pendingLabel: string;
  readonly variant?: "outline" | "ghost" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant={variant}
      disabled={pending}
      className="gap-1.5"
    >
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {pendingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Suppression — confirmation obligatoire                             */
/* ------------------------------------------------------------------ */

function DeleteArticleForm({
  articleId,
  articleTitle,
  deleteAction,
}: {
  readonly articleId: string;
  readonly articleTitle: string;
  readonly deleteAction: ArticleFormAction;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Supprimer l'article « ${articleTitle} »`}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Supprimer
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
          <AlertDialogDescription>
            « {articleTitle} » sera définitivement supprimé. Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <form action={deleteAction.bind(null, articleId)}>
            <SubmitButton
              icon={<Trash2 className="size-3.5" aria-hidden />}
              label="Supprimer"
              pendingLabel="Suppression…"
              variant="destructive"
            />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne article                                                      */
/* ------------------------------------------------------------------ */

export function ArticleRow({
  article,
  publishAction,
  archiveAction,
  deleteAction,
  editBasePath = "/blog/articles",
}: ArticleRowProps) {
  const editHref = `${editBasePath}/${article.id}/edit`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center">
      {/* Bloc titre + métadonnées */}
      <div className="min-w-0 flex-1">
        <Link
          href={editHref}
          className="block truncate text-sm font-semibold text-foreground hover:underline"
        >
          {article.title}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 truncate text-xs text-muted-foreground">
          <span className="font-mono">/{article.slug}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" aria-hidden />
            <span className="tabular-nums">{article.viewCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden />
            <span className="tabular-nums">{article.readingTimeMin} min</span>
          </span>
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <StatusBadge status={article.status} />
        <VisibilityBadge visibility={article.visibility} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 sm:shrink-0">
        {/* Bouton Éditer — <Link> stylé via buttonVariants() (PAS de
            <Button render={<Link/>}> : Base UI loguerait un warning). */}
        <Link
          href={editHref}
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-1.5`}
        >
          <Pencil className="size-3.5" aria-hidden />
          Éditer
        </Link>

        {article.status !== "published" && (
          <form action={publishAction.bind(null, article.id)}>
            <SubmitButton
              icon={<Send className="size-3.5" aria-hidden />}
              label="Publier"
              pendingLabel="Publication…"
              variant="outline"
            />
          </form>
        )}

        {article.status !== "archived" && (
          <form action={archiveAction.bind(null, article.id)}>
            <SubmitButton
              icon={<Archive className="size-3.5" aria-hidden />}
              label="Archiver"
              pendingLabel="Archivage…"
              variant="outline"
            />
          </form>
        )}

        <DeleteArticleForm
          articleId={article.id}
          articleTitle={article.title}
          deleteAction={deleteAction}
        />
      </div>
    </li>
  );
}
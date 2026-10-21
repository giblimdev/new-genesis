/*
path :           app/blog/help/page.tsx
tag :            ["blog", "help", "guide", "documentation", "mode-emploi"]
projectId:       new-genesis
type:            page
generic:         false

role:            Mode d'emploi du module Blog. Documente le blog tel qu'il
                 sera utilisé une fois le module livré : les 6 personas
                 utilisateurs (lecteur anonyme, lecteur connecté, auteur,
                 modérateur/éditeur, propriétaire de groupe, administrateur),
                 les concepts clés (taxonomie 3 niveaux, statut éditorial,
                 visibilité, likes, favoris, groupes, notifications) et les
                 limites assumées du MVP (soft delete, plafonds, recherche
                 en mémoire). Aligné sur les 15 features et 7 personas de
                 data/blog.json. Sert de point d'entrée pédagogique depuis
                 la nav ("Blog Help"). Server Component pur (aucune donnée
                 dynamique, aucun Suspense). Les routes citées sont celles
                 prévues par les US du JSON ; elles peuvent renvoyer 404
                 tant que le module n'est pas livré.

flow:            Server Component statique → rend hero + index des 6
                 personas (grille de cartes cliquables) + 6 sections
                 détaillées (par persona, avec parcours typique et routes
                 concernées) + glossaire des concepts + encart "Limites du
                 MVP" + lien vers genesis/help pour l'outillage dev.

ecosystem:       Blog = [
                   "@/app/blog/help/page.tsx",
                   "@/app/blog/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/page.tsx",
                  "@/app/genesis/help/page.tsx",
                  "@/app/layout.tsx"]

imports:         ["next/link", "lucide-react"]

exports:         ["default BlogHelpPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux comprendre comment fonctionnera le blog",
                  "*en tant que lecteur je veux savoir ce que je peux faire sans compte et avec un compte",
                  "*en tant qu'auteur je veux connaître le parcours de publication"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  FolderKanban,
  Heart,
  Info,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Tag,
  TriangleAlert,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PersonaDoc {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly canDo: readonly string[];
  readonly cannotDo: readonly string[];
  readonly routes: readonly { readonly path: string; readonly label: string }[];
}

interface ConceptDoc {
  readonly id: string;
  readonly title: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly summary: string;
  readonly details: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Personas — alignés sur data/blog.json                              */
/* ------------------------------------------------------------------ */

const PERSONAS: readonly PersonaDoc[] = [
  {
    id: "lecteur-anonyme",
    name: "Lecteur anonyme",
    tagline: "Visiteur sans compte",
    icon: User,
    accent: "chart-3",
    canDo: [
      "Lire les articles publiés et publics",
      "Naviguer par thème, catégorie, sous-catégorie et tag",
      "Utiliser la recherche plein texte (titre + résumé)",
      "Partager un article par lien",
      "Voir les compteurs de likes et le nombre de commentaires",
    ],
    cannotDo: [
      "Commenter, liker ou sauvegarder en favoris (compte requis)",
      "Rejoindre un groupe de discussion",
      "Recevoir des notifications",
    ],
    routes: [
      { path: "/blog", label: "Index public" },
      { path: "/blog/[slug]", label: "Lire un article" },
      { path: "/blog/theme/[slug]", label: "Listing par thème" },
      { path: "/blog/tag/[slug]", label: "Listing par tag" },
      { path: "/blog/search", label: "Recherche" },
    ],
  },
  {
    id: "lecteur-connecte",
    name: "Lecteur connecté",
    tagline: "Utilisateur authentifié",
    icon: User,
    accent: "chart-5",
    canDo: [
      "Tout ce que peut faire le lecteur anonyme",
      "Commenter un article et répondre à un commentaire (arbre jusqu'à 5 niveaux)",
      "Liker un article et un commentaire",
      "Sauvegarder un article en favori, non classé ou dans un dossier nommé",
      "Rejoindre un groupe public ; demander à rejoindre un groupe privé",
      "Recevoir des notifications in-app (réponse, invitation, approbation, nouvelle discussion)",
    ],
    cannotDo: [
      "Créer ou modifier un article (rôle Auteur requis)",
      "Modérer un commentaire (rôle Modérateur / Éditeur requis)",
      "Créer un groupe ? Non — un groupe peut être créé par tout membre connecté (rôle owner implicite)",
    ],
    routes: [
      { path: "/blog/[slug]", label: "Lire + commenter + liker + favori" },
      { path: "/blog/user/favorites", label: "Mes favoris + dossiers" },
      { path: "/blog/community", label: "Groupes" },
      { path: "/blog/notifications", label: "Notifications" },
    ],
  },
  {
    id: "auteur",
    name: "Auteur",
    tagline: "Créateur de contenu",
    icon: FileText,
    accent: "chart-1",
    canDo: [
      "Créer, éditer, lister et supprimer ses articles",
      "Classer un article dans la taxonomie (thème → catégorie → sous-catégorie) et choisir des tags",
      "Rédiger un résumé dédié et une couverture",
      "Attacher une galerie ordonnée de médias (image, vidéo, audio, document, embed) avec alt, caption, crédit",
      "Publier (draft → published) ou archiver (→ archived)",
      "Choisir la visibilité (public / private / unlisted)",
      "Prévisualiser un article en brouillon (?preview=1)",
      "Suivre le nombre de vues",
    ],
    cannotDo: [
      "Publier à la place d'un modérateur (mais l'auteur peut publier son propre article)",
      "Modifier la taxonomie globale (rôle Administrateur requis pour Thème / Catégorie / Sous-catégorie)",
    ],
    routes: [
      { path: "/blog/admin/articles/new", label: "Créer un article" },
      { path: "/blog/admin/articles/[id]/edit", label: "Éditer un article" },
      { path: "/blog/[slug]?preview=1", label: "Prévisualiser un brouillon" },
    ],
  },
  {
    id: "moderateur",
    name: "Modérateur / Éditeur",
    tagline: "Contrôle éditorial",
    icon: Shield,
    accent: "chart-4",
    canDo: [
      "Valider et publier des brouillons d'auteurs",
      "Archiver un article (sans le supprimer, sans perdre commentaires / likes / favoris)",
      "Modérer les commentaires d'article en soft delete (masquage non destructif)",
      "Gérer la taxonomie globale",
      "Intervenir dans les discussions de groupe (en tant que membre)",
    ],
    cannotDo: [
      "Supprimer définitivement un article (l'archivage est la voie normale)",
      "Promouvoir d'autres admins (rôle Administrateur requis)",
    ],
    routes: [
      { path: "/blog/admin/articles", label: "File d'articles à modérer" },
      { path: "/blog/[slug]", label: "Commentaires modérables" },
    ],
  },
  {
    id: "proprietaire-groupe",
    name: "Propriétaire de groupe",
    tagline: "Animateur de communauté",
    icon: Users,
    accent: "chart-2",
    canDo: [
      "Créer un groupe (nom, description, couverture, visibilité public / private / unlisted)",
      "Devenir automatiquement owner du groupe",
      "Inviter des membres et gérer les demandes d'adhésion (approuver / refuser)",
      "Attribuer le rôle moderator à un membre actif",
      "Bannir un membre (status=banned, ne peut plus poster)",
      "Ouvrir des discussions et modérer les fils (soft delete des réponses)",
      "Recevoir une notification pour chaque demande d'adhésion",
    ],
    cannotDo: [
      "Se retirer soi-même du groupe (owner non bannissable, transfert non prévu en v1)",
      "Créer un article éditorial via le groupe (les articles restent hors groupe)",
    ],
    routes: [
      { path: "/blog/community/new", label: "Créer un groupe" },
      { path: "/blog/community/[groupSlug]", label: "Page du groupe" },
      { path: "/blog/community/[groupSlug]/requests", label: "Demandes d'adhésion" },
      { path: "/blog/community/[groupSlug]/[discussionId]", label: "Discussion" },
    ],
  },
  {
    id: "administrateur",
    name: "Administrateur",
    tagline: "Supervision globale",
    icon: FolderKanban,
    accent: "chart-3",
    canDo: [
      "CRUD Thème / Catégorie / Sous-catégorie (taxonomie globale)",
      "CRUD Tags transverses",
      "Surveiller les signalements et les contenus modérés",
      "Promouvoir un utilisateur au rôle administrateur",
      "Exporter les données du blog",
      "Accéder à la page de bootstrap (/blog/admin/setup) pour promouvoir le premier admin",
    ],
    cannotDo: [
      "Bypasser les règles de modération (soft delete, owner non bannissable)",
    ],
    routes: [
      { path: "/blog/admin/setup", label: "Bootstrap admin" },
      { path: "/blog/admin/taxonomy", label: "Gérer la taxonomie" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Concepts clés                                                      */
/* ------------------------------------------------------------------ */

const CONCEPTS: readonly ConceptDoc[] = [
  {
    id: "taxonomie",
    title: "Taxonomie 3 niveaux + tags",
    icon: Layers,
    accent: "chart-1",
    summary:
      "Thème → Catégorie → Sous-catégorie (hiérarchie stricte) + tags libres (transverses).",
    details: [
      "Un article est rattaché à 1 thème, 0 ou 1 catégorie, 0 ou 1 sous-catégorie.",
      "Un article peut porter plusieurs tags (transverses, dédoublonnés case-insensitive).",
      "La suppression d'un thème échoue si des catégories y sont rattachées. La suppression d'une sous-catégorie laisse l'article avec un subCategoryId orphelin (affichage fallback).",
      "Les slugs sont uniques par niveau : générés via slugifyWithFallback + findFreeSlug.",
    ],
  },
  {
    id: "statut-editorial",
    title: "Statut éditorial",
    icon: ClipboardList,
    accent: "chart-2",
    summary:
      "draft (brouillon) → published (publié) → archived (archivé).",
    details: [
      "Un article draft n'apparaît pas dans les listings publics. Il est visible par son auteur et les admins (preview).",
      "Publier renseigne publishedAt (une seule fois). Un article published reste éditable sans perdre publishedAt.",
      "Archiver ne supprime pas : les commentaires, likes et favoris existants sont préservés.",
      "Un article archived n'apparaît plus dans les listings, mais reste accessible par URL directe si visibility=unlisted.",
    ],
  },
  {
    id: "visibilite",
    title: "Visibilité",
    icon: Eye,
    accent: "chart-5",
    summary: "public (référencé) / unlisted (non listé) / private (privé).",
    details: [
      "public : apparaît dans les listings et les pages taxonomiques, indexable.",
      "unlisted : accessible uniquement par URL directe (partage par lien), pas de listing.",
      "private : accessible à l'auteur et aux admins uniquement.",
      "Le statut et la visibilité sont indépendants : un article published+unlisted existe et est accessible par lien, mais invisible dans les listings.",
    ],
  },
  {
    id: "likes",
    title: "Likes",
    icon: Heart,
    accent: "chart-5",
    summary:
      "Compteur d'appréciations par article et par commentaire. Un like par utilisateur, par cible.",
    details: [
      "Un like est un userId dans un tableau likedBy[] de la cible (article ou commentaire).",
      "Toggle : 1er clic ajoute, 2e clic retire. L'unicité est garantie par construction (pas de doublon dans le tableau).",
      "Le compteur de likes est la longueur du tableau likedBy[]. Affiché sur l'article et à côté de chaque commentaire.",
      "Un utilisateur peut liker son propre commentaire (pas de restriction).",
    ],
  },
  {
    id: "favoris",
    title: "Favoris + dossiers",
    icon: Bookmark,
    accent: "chart-2",
    summary:
      "Sauvegarde d'articles pour plus tard, classés dans des dossiers nommés ou laissés non classés.",
    details: [
      "Un article sauvegardé vit soit dans unfiledFavorites[] (non classé), soit dans un dossier.favoriteFolders[].articleIds[].",
      "Un article ne peut figurer qu'à UN seul endroit dans vos favoris (déplacement d'id, jamais duplication).",
      "Supprimer un dossier remet ses articleIds dans les non-classés (aucun favori perdu).",
      "La page /blog/user/favorites liste les dossiers triés par order, et sous chacun les articles correspondants.",
    ],
  },
  {
    id: "commentaires",
    title: "Commentaires imbriqués",
    icon: MessageSquare,
    accent: "chart-3",
    summary:
      "Arbre de commentaires avec réponses imbriquées, profondeur max 5 niveaux.",
    details: [
      "Chaque commentaire peut recevoir des réponses (replies[] récursif), jusqu'à 5 niveaux d'imbrication.",
      "Suppression non destructive : un commentaire supprimé (deletedAt non null) affiche « Commentaire supprimé » à la place du contenu.",
      "Les réponses d'un commentaire supprimé restent visibles, avec mention « en réponse à un commentaire supprimé ».",
      "Le même modèle d'arbre est réutilisé sous les discussions de groupe (posts[]).",
    ],
  },
  {
    id: "groupes",
    title: "Groupes de discussion",
    icon: Users,
    accent: "chart-4",
    summary:
      "Espaces thématiques (public / private / unlisted) avec owner, membres, rôles et discussions.",
    details: [
      "Visibilité public : join immédiat. Private : demande à approuver par l'owner. Unlisted : accessible par lien direct uniquement.",
      "Rôles : owner (créateur, non bannissable), moderator (modération), member (participe).",
      "Statuts de membre : active (participe), pending (demande en attente), banned (bloqué).",
      "Un membre avec status=banned ne peut plus poster ni créer de discussion.",
      "Chaque groupe contient des discussions (fil + réponses imbriquées).",
    ],
  },
  {
    id: "notifications",
    title: "Notifications in-app",
    icon: Bell,
    accent: "chart-1",
    summary:
      "4 types : reply, group_invite, group_join_approved, group_new_discussion.",
    details: [
      "Cloche avec badge non-lu. Page /blog/notifications triée par createdAt DESC.",
      "Un utilisateur n'est jamais notifié de ses propres actions (anti-auto-notification).",
      "Les likes ne notifient pas (choix assumé pour éviter le bruit).",
      "Plafond 200 entrées par utilisateur, purge automatique au-delà de 90 jours.",
      "Notifs de type group_new_discussion : plafonnées à 200 destinataires par discussion, dédupliquées par membre.",
    ],
  },
  {
    id: "recherche",
    title: "Recherche + filtres",
    icon: Search,
    accent: "chart-2",
    summary:
      "Recherche plein texte (titre + résumé) et filtres combinables (thème, catégorie, sous-catégorie, tag, auteur, période, featured).",
    details: [
      "Recherche en mémoire sur title + summary, insensible à la casse et aux accents.",
      "Filtres combinables via query params (?theme=x&tag=y&author=z) → intersection des résultats.",
      "L'URL est partageable (state dans les query params, pas dans un store).",
      "Pagination 20 articles par page.",
      "Pas d'index inversé en v1 : la recherche reste un `includes` filtré en mémoire.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Limites du MVP                                                     */
/* ------------------------------------------------------------------ */

const LIMITS: readonly string[] = [
  "Les fichiers médias (images, vidéos, documents) vivent dans /public/blog/ et sont référencés par chemin relatif. Aucun upload serveur en v1.",
  "La recherche est en mémoire (title + summary). Pas de recherche full-text avancée, pas d'index inversé.",
  "Toutes les données vivent dans data/blog.json. Une seule mutation à la fois (mutex applicatif), adapté à une démo à charge faible.",
  "Pas de Markdown, pas de HTML arbitraire dans le contenu d'article. Contenu texte brut.",
  "Pas d'email, pas de push navigateur. Notifications in-app uniquement.",
  "Pas de préférences fines par type de notification en v1.",
  "Un owner de groupe ne peut pas se retirer ni transférer la propriété en v1 (le owner reste actif tant que le groupe existe).",
  "Le compteur de vues est incrémenté au plus une fois par session (cookie technique) — toléré en démo, non fiable par nature.",
  "Les fichiers .env, package.json, next.config.* sont refusés en lecture/écriture par les outils Genesis (sécurité).",
];

/* ------------------------------------------------------------------ */
/*  Carte de persona (index)                                           */
/* ------------------------------------------------------------------ */

function PersonaCard({ persona }: { readonly persona: PersonaDoc }) {
  const Icon = persona.icon;
  const accent = persona.accent;

  return (
    <a
      href={`#${persona.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      <header className="mb-3 flex items-center gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${accent})` }}
          >
            {persona.tagline}
          </p>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {persona.name}
          </h3>
        </div>
      </header>

      <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
        {persona.canDo[0]}
        {persona.canDo.length > 1 && "…"}
      </p>

      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground/70 transition-transform group-hover:translate-x-0.5">
        Voir le détail
        <ChevronRight className="size-3.5" aria-hidden />
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Section détaillée par persona                                      */
/* ------------------------------------------------------------------ */

function PersonaSection({ persona }: { readonly persona: PersonaDoc }) {
  const Icon = persona.icon;
  const accent = persona.accent;

  return (
    <section
      id={persona.id}
      aria-labelledby={`persona-${persona.id}`}
      className="scroll-mt-24"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
        style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, var(--${accent}), transparent)`,
          }}
        />

        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-border/60 p-6 sm:flex-row sm:items-center">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
            }}
          >
            <Icon className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: `var(--${accent})` }}
            >
              {persona.tagline}
            </p>
            <h2
              id={`persona-${persona.id}`}
              className="text-xl font-bold tracking-tight text-foreground"
            >
              {persona.name}
            </h2>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {/* Peut / ne peut pas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-chart-4/30 bg-chart-4/5 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-4">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Ce que je peux faire
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {persona.canDo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-1 shrink-0 text-chart-4">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-5">
                <Lock className="size-3.5" aria-hidden />
                Ce que je ne peux pas faire
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {persona.cannotDo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-1 shrink-0 text-chart-5">
                      ✗
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Routes */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="size-3.5" aria-hidden />
              Routes concernées
            </h3>
            <ul className="space-y-1.5">
              {persona.routes.map((route) => (
                <li
                  key={route.path}
                  className="flex flex-wrap items-baseline gap-2 text-sm"
                >
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/90"
                    style={{
                      background: `color-mix(in oklab, var(--${accent}) 12%, transparent)`,
                      color: `var(--${accent})`,
                    }}
                  >
                    {route.path}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {route.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Carte de concept                                                   */
/* ------------------------------------------------------------------ */

function ConceptCard({ concept }: { readonly concept: ConceptDoc }) {
  const Icon = concept.icon;
  const accent = concept.accent;

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <h3 className="min-w-0 flex-1 text-base font-bold tracking-tight text-foreground">
          {concept.title}
        </h3>
      </header>

      <p className="mb-3 text-sm font-medium text-foreground/80">
        {concept.summary}
      </p>

      <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        {concept.details.map((detail) => (
          <li key={detail} className="flex gap-2">
            <span aria-hidden className="mt-0.5 shrink-0">
              •
            </span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogHelpPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-5/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-chart-3/20 blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <BookOpen className="size-3.5 text-chart-2" aria-hidden />
            Mode d&apos;emploi · Blog
          </span>

          <h1 className="mt-4 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Le blog en 5 minutes
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Articles éditoriaux, taxonomie à 3 niveaux + tags, commentaires
            imbriqués, likes, favoris, groupes de discussion, notifications.
            Ce guide décrit ce que vous pouvez faire selon votre rôle, les
            concepts clés et les limites assumées du MVP.
          </p>
        </div>
      </header>

      {/* Sommaire : qui êtes-vous ? */}
      <section aria-labelledby="qui-etes-vous">
        <h2
          id="qui-etes-vous"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <Sparkles className="size-5 text-chart-1" aria-hidden />
          Qui êtes-vous ?
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </section>

      {/* Détail par persona */}
      {PERSONAS.map((persona) => (
        <PersonaSection key={persona.id} persona={persona} />
      ))}

      {/* Concepts clés */}
      <section aria-labelledby="concepts-cles">
        <h2
          id="concepts-cles"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <Lightbulb className="size-5 text-chart-3" aria-hidden />
          Concepts clés
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CONCEPTS.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </section>

      {/* Limites du MVP */}
      <section className="rounded-2xl border border-chart-3/40 bg-chart-3/5 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <TriangleAlert className="size-5 text-chart-3" aria-hidden />
          Limites assumées du MVP
        </h2>

        <ul className="space-y-2 text-sm text-foreground/80">
          {LIMITS.map((limit) => (
            <li key={limit} className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden />
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pour les développeurs */}
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Tag className="size-5 text-chart-2" aria-hidden />
          Pour les développeurs
        </h2>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Si vous cherchez le plan de développement du module Blog (epics,
          sprints, fichiers à créer) ou le mode d&apos;emploi des outils de
          développement Genesis (SelectFiles, CreateFiles, CopyToIA), ces
          contenus sont documentés ailleurs.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/genesis/help"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Outils Genesis
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Retour au blog
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
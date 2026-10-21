/*
path :           app/blog/help/page.tsx
tag :            ["blog", "help", "how-to", "tutorial", "guide", "mode-emploi"]
projectId:       new-genesis
type:            page
generic:         false

role:            Mode d'emploi du Blog — 26 tutoriels « comment faire X ».
                 Contrairement à une page de référence (personas + concepts
                 + routes), cette page est un GUIDE PRATIQUE : chaque
                 tutoriel est numéroté, affiche une suite d'étapes concrètes
                 (cliquer sur X, aller sur Y, remplir Z), et pointe vers la
                 page réelle où l'action se fait via un CTA « Faire
                 maintenant ». 5 audiences regroupent les tutoriels :
                 Tous (3), Compte (7), Communauté (6), Auteur (7), Admin (3).
                 Aucune donnée dynamique, aucun fetch : page statique.
                 Mobile first : grille 1 / 2 colonnes, étapes verticales.

flow:            Server Component → Hero + sommaire 5 ancres → pour chaque
                 audience : header coloré + grille de <TutorialCard />
                 (numéro, icône, badge, summary, étapes numérotées, tip ou
                 warning, CTA). Aucun état, aucun effet. Les étapes sont des
                 <ol> stylés ; le numéro de tutoriel est un badge en
                 pastille.

ecosystem:       Blog = [
                   "@/app/blog/[slug]/page.tsx",
                   "@/app/blog/articles/ArticleRow.tsx",
                   "@/app/blog/articles/[id]/edit/page.tsx",
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
                   "@/app/blog/setup/page.tsx",
                   "@/app/blog/tag/[slug]/page.tsx",
                   "@/app/blog/taxonomy/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/[subCategory]/page.tsx",
                   "@/app/blog/theme/[slug]/[category]/page.tsx",
                   "@/app/blog/theme/[slug]/page.tsx",
                   "@/app/blog/user/articles/page.tsx",
                   "@/app/blog/user/favorites/page.tsx",
                 ]

relatedFiles:    ["@/app/blog/page.tsx",
                  "@/app/page.tsx",
                  "@/app/layout.tsx"]

imports:         ["next", "next/link", "lucide-react"]

exports:         ["default BlogHelpPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un guide pas-à-pas pour faire chaque action du blog",
                  "*en tant que lecteur je veux savoir comment commenter, liker, sauvegarder",
                  "*en tant qu'auteur je veux savoir comment écrire et publier un article"]

status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookOpen,
  CheckCircle2,
  FileText,
  Heart,
  Key,
  Layers,
  Lightbulb,
  LogIn,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  TriangleAlert,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Mode d'emploi · Blog",
  description:
    "26 tutoriels pas-à-pas pour maîtriser le blog : lire, commenter, écrire, publier, gérer la communauté et la taxonomie.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Audience = "Tous" | "Compte" | "Communauté" | "Auteur" | "Admin";

interface Step {
  readonly text: string;
  readonly hint?: string;
}

interface Tutorial {
  readonly id: string;
  readonly num: number;
  readonly title: string;
  readonly audience: Audience;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly summary: string;
  readonly steps: readonly Step[];
  readonly link?: { readonly href: string; readonly label: string };
  readonly tip?: string;
  readonly warning?: string;
}

/* ------------------------------------------------------------------ */
/*  Config des audiences                                               */
/* ------------------------------------------------------------------ */

interface AudienceConfig {
  readonly id: Audience;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

const AUDIENCES: readonly AudienceConfig[] = [
  {
    id: "Tous",
    label: "Tous",
    description: "Actions accessibles sans compte.",
    icon: BookOpen,
    accent: "chart-1",
  },
  {
    id: "Compte",
    label: "Compte connecté",
    description: "Interagir avec les articles et la communauté.",
    icon: User,
    accent: "chart-2",
  },
  {
    id: "Communauté",
    label: "Communauté",
    description: "Groupes, discussions et modération.",
    icon: Users,
    accent: "chart-3",
  },
  {
    id: "Auteur",
    label: "Auteur",
    description: "Écrire, structurer et publier des articles.",
    icon: Pencil,
    accent: "chart-4",
  },
  {
    id: "Admin",
    label: "Administrateur",
    description: "Bootstrap, taxonomie et tags.",
    icon: ShieldCheck,
    accent: "chart-5",
  },
];

/* ------------------------------------------------------------------ */
/*  Les 26 tutoriels                                                   */
/* ------------------------------------------------------------------ */

const TUTORIALS: readonly Tutorial[] = [
  /* --------------------------- TOUS (3) --------------------------- */
  {
    id: "lire-un-article",
    num: 1,
    title: "Lire un article",
    audience: "Tous",
    icon: FileText,
    accent: "chart-1",
    summary: "Accéder à un article et lire son contenu structuré.",
    steps: [
      { text: "Aller sur /blog — la grille des articles s'affiche." },
      { text: "Cliquer sur une carte d'article pour ouvrir sa page." },
      {
        text: "Faire défiler pour lire le contenu (titres, images, code, embeds).",
      },
      {
        text: "Utiliser la table des matières (sommaire à droite sur desktop, déroulant sur mobile).",
        hint: "Cliquer sur une entrée = saut direct au titre correspondant.",
      },
    ],
    link: { href: "/blog", label: "Voir les articles" },
  },
  {
    id: "chercher-un-article",
    num: 2,
    title: "Chercher un article",
    audience: "Tous",
    icon: Search,
    accent: "chart-1",
    summary:
      "Trouver un article par mot-clé dans le titre, résumé ou paragraphes.",
    steps: [
      { text: "Aller sur /blog/search." },
      {
        text: "Saisir un mot-clé dans le champ (insensible à la casse et aux accents).",
      },
      { text: "Cliquer « Rechercher » ou appuyer sur Entrée." },
      {
        text: "Utiliser les URL ?tag=…&theme=…&author=…&from=…&to=… pour combiner des filtres.",
        hint: "L'URL est partageable : copier-coller pour envoyer à quelqu'un.",
      },
    ],
    link: { href: "/blog/search", label: "Lancer une recherche" },
  },
  {
    id: "naviguer-taxonomie",
    num: 3,
    title: "Naviguer par thème ou tag",
    audience: "Tous",
    icon: Layers,
    accent: "chart-1",
    summary:
      "Parcourir les articles par thème, catégorie, sous-catégorie ou tag.",
    steps: [
      { text: "Sur /blog, cliquer sur une pastille de thème en haut de page." },
      {
        text: "Sur la page thème, cliquer sur une catégorie puis une sous-catégorie pour affiner.",
      },
      {
        text: "Depuis un article, cliquer sur un tag pour voir tous les articles associés.",
        hint: "Chaque tag a sa propre page /blog/tag/<slug>.",
      },
    ],
    link: { href: "/blog", label: "Voir les thèmes" },
  },

  /* -------------------------- COMPTE (7) -------------------------- */
  {
    id: "creer-compte",
    num: 4,
    title: "Créer un compte",
    audience: "Compte",
    icon: UserPlus,
    accent: "chart-2",
    summary: "S'inscrire pour interagir (commenter, liker, sauvegarder).",
    steps: [
      { text: "Aller sur /core/auth/register." },
      {
        text: "Remplir nom, email, mot de passe (indicateur de force en direct).",
        hint: "8 caractères min, au moins une majuscule, une minuscule et un chiffre.",
      },
      { text: "Ajouter une photo de profil (optionnel, 2 Mo max)." },
      { text: "Cliquer « Créer mon compte »." },
    ],
    link: { href: "/core/auth/register", label: "Créer un compte" },
  },
  {
    id: "se-connecter",
    num: 5,
    title: "Se connecter",
    audience: "Compte",
    icon: LogIn,
    accent: "chart-2",
    summary: "Se connecter avec son email et mot de passe.",
    steps: [
      { text: "Aller sur /core/auth/login." },
      { text: "Saisir email et mot de passe." },
      {
        text: "Cliquer « Se connecter » — redirection automatique vers le blog.",
      },
    ],
    link: { href: "/core/auth/login", label: "Se connecter" },
  },
  {
    id: "commenter-article",
    num: 6,
    title: "Commenter un article",
    audience: "Compte",
    icon: MessageSquare,
    accent: "chart-2",
    summary: "Ajouter un commentaire racine en bas d'un article.",
    steps: [
      { text: "Ouvrir un article (cliquer sur une carte depuis /blog)." },
      { text: "Descendre jusqu'à la section « Commentaires »." },
      { text: "Saisir son commentaire dans la zone de texte." },
      {
        text: "Cliquer « Envoyer » — un toast confirme la publication.",
        hint: "Le commentaire apparaît immédiatement dans l'arbre.",
      },
    ],
    link: { href: "/blog", label: "Voir un article" },
  },
  {
    id: "repondre-commentaire",
    num: 7,
    title: "Répondre à un commentaire",
    audience: "Compte",
    icon: MessageSquare,
    accent: "chart-2",
    summary: "Répondre à un commentaire existant (imbrication max 5 niveaux).",
    steps: [
      { text: "Sous un commentaire, cliquer sur « Répondre »." },
      { text: "Un formulaire s'ouvre en dessous — saisir la réponse." },
      {
        text: "Cliquer « Envoyer » — la réponse s'imbrique sous le commentaire parent.",
      },
    ],
    tip: "Répondre à un commentaire notifie son auteur (notification « reply »).",
    link: { href: "/blog", label: "Voir un article" },
  },
  {
    id: "liker",
    num: 8,
    title: "Liker un article ou un commentaire",
    audience: "Compte",
    icon: Heart,
    accent: "chart-2",
    summary: "Ajouter ou retirer un like (bouton cœur).",
    steps: [
      {
        text: "Cliquer sur le bouton cœur (dans l'en-tête de l'article ou sous un commentaire).",
        hint: "Le compteur s'incrémente immédiatement (mise à jour optimiste).",
      },
      { text: "Re-cliquer sur le cœur pour retirer le like." },
    ],
    link: { href: "/blog", label: "Voir un article" },
  },
  {
    id: "sauvegarder-article",
    num: 9,
    title: "Sauvegarder un article en favori",
    audience: "Compte",
    icon: Bookmark,
    accent: "chart-2",
    summary: "Enregistrer un article pour le relire plus tard.",
    steps: [
      { text: "Ouvrir un article." },
      {
        text: "Cliquer sur le bouton « Sauvegarder » (icône bookmark) dans l'en-tête.",
      },
      {
        text: "L'article est ajouté aux favoris non classés.",
        hint: "Un toast confirme et le bouton devient « Sauvegardé ».",
      },
    ],
    link: { href: "/blog/user/favorites", label: "Voir mes favoris" },
  },
  {
    id: "organiser-favoris",
    num: 10,
    title: "Organiser ses favoris en dossiers",
    audience: "Compte",
    icon: Bookmark,
    accent: "chart-2",
    summary:
      "Créer, renommer ou supprimer des dossiers pour classer ses favoris.",
    steps: [
      { text: "Aller sur /blog/user/favorites." },
      { text: "Cliquer « Nouveau dossier » — saisir un nom, valider." },
      {
        text: "Pour renommer / supprimer un dossier, utiliser les boutons de son en-tête.",
        hint: "Supprimer un dossier remet ses articles en non classés — aucun favori perdu.",
      },
    ],
    tip: "Un article ne peut être que dans UN SEUL endroit à la fois.",
    link: { href: "/blog/user/favorites", label: "Gérer mes favoris" },
  },

  /* ------------------------ COMMUNAUTÉ (6) ------------------------ */
  {
    id: "rejoindre-groupe-public",
    num: 11,
    title: "Rejoindre un groupe public",
    audience: "Communauté",
    icon: Users,
    accent: "chart-3",
    summary: "Adhérer immédiatement à un groupe public.",
    steps: [
      { text: "Aller sur /blog/community — la liste des groupes s'affiche." },
      { text: "Cliquer sur un groupe public pour ouvrir sa page." },
      { text: "Cliquer sur « Rejoindre » — l'adhésion est immédiate." },
    ],
    link: { href: "/blog/community", label: "Voir les groupes" },
  },
  {
    id: "rejoindre-groupe-prive",
    num: 12,
    title: "Demander à rejoindre un groupe privé",
    audience: "Communauté",
    icon: Users,
    accent: "chart-3",
    summary: "Envoyer une demande d'adhésion à un groupe privé.",
    steps: [
      { text: "Ouvrir le groupe privé (accessible via un lien direct)." },
      { text: "Cliquer sur « Demander à rejoindre »." },
      {
        text: "Le propriétaire reçoit une notification et peut approuver / refuser.",
        hint: "Votre statut passe à « pending » jusqu'à réponse.",
      },
    ],
    link: { href: "/blog/community", label: "Voir les groupes" },
  },
  {
    id: "creer-groupe",
    num: 13,
    title: "Créer un groupe",
    audience: "Communauté",
    icon: Plus,
    accent: "chart-3",
    summary: "Créer un espace (public, privé ou non listé).",
    steps: [
      { text: "Aller sur /blog/community/new." },
      {
        text: "Remplir le nom, la description (optionnelle) et la visibilité.",
      },
      {
        text: "Cliquer « Créer le groupe » — vous en devenez owner automatiquement.",
        hint: "En tant qu'owner : vous ne pouvez pas être banni ni quitter le groupe.",
      },
    ],
    link: { href: "/blog/community/new", label: "Créer un groupe" },
  },
  {
    id: "gerer-demandes",
    num: 14,
    title: "Approuver ou refuser les demandes d'adhésion",
    audience: "Communauté",
    icon: CheckCircle2,
    accent: "chart-3",
    summary: "Gérer les demandes d'adhésion (owner ou modérateur uniquement).",
    steps: [
      { text: "Ouvrir la page du groupe dont vous êtes owner ou modérateur." },
      {
        text: "Cliquer sur « Demandes » (visible dans les actions du groupe).",
      },
      {
        text: "Pour chaque demande : « Approuver » (statut actif) ou « Refuser » (supprimée).",
        hint: "Le demandeur reçoit une notification à l'approbation.",
      },
    ],
    link: { href: "/blog/community", label: "Voir mes groupes" },
  },
  {
    id: "ouvrir-discussion",
    num: 15,
    title: "Ouvrir une discussion",
    audience: "Communauté",
    icon: MessageSquare,
    accent: "chart-3",
    summary:
      "Lancer un fil de discussion dans un groupe dont on est membre actif.",
    steps: [
      { text: "Ouvrir la page du groupe (vous devez être membre actif)." },
      { text: "Descendre jusqu'à la section « Ouvrir une discussion »." },
      { text: "Saisir un titre et un contenu." },
      {
        text: "Cliquer « Ouvrir la discussion » — tous les membres actifs sont notifiés.",
        hint: "La discussion apparaît en haut de la liste.",
      },
    ],
    link: { href: "/blog/community", label: "Voir les groupes" },
  },
  {
    id: "repondre-discussion",
    num: 16,
    title: "Répondre dans une discussion",
    audience: "Communauté",
    icon: MessageSquare,
    accent: "chart-3",
    summary: "Poster une réponse racine ou répondre à un post existant.",
    steps: [
      { text: "Ouvrir une discussion depuis la page du groupe." },
      {
        text: "Pour une réponse racine : utiliser le formulaire en bas.",
      },
      {
        text: "Pour répondre à un post : cliquer « Répondre » sous le post visé.",
        hint: "Réponses imbriquées max 5 niveaux.",
      },
      { text: "Cliquer « Envoyer » — la réponse apparaît immédiatement." },
    ],
    tip: "Répondre à un post notifie son auteur (notification « reply »).",
    link: { href: "/blog/community", label: "Voir les groupes" },
  },

  /* --------------------------- AUTEUR (7) ------------------------- */
  {
    id: "ecrire-article",
    num: 17,
    title: "Écrire un nouvel article",
    audience: "Auteur",
    icon: Pencil,
    accent: "chart-4",
    summary: "Créer un article complet avec métadonnées, taxonomie et contenu.",
    steps: [
      {
        text: "Aller sur /blog/articles/new (CTA visible si admin ou author).",
      },
      {
        text: "Remplir le titre (3-200 car.) et le résumé (20-500 car.).",
      },
      { text: "Ajouter une couverture (glisser-déposer ou Ctrl+V)." },
      {
        text: "Choisir le thème, puis catégorie et sous-catégorie (dépendants), et les tags.",
      },
      {
        text: "Structurer le contenu avec le BlockEditor (bouton « Ajouter un bloc »).",
        hint: "Le brouillon est sauvegardé en sessionStorage (24 h) automatiquement.",
      },
      {
        text: "Choisir le statut (Brouillon par défaut) puis « Créer l'article ».",
      },
    ],
    warning:
      "Le CTA « Nouvel article » n'est visible que pour les rôles admin et author. Un user standard ne le voit pas.",
    link: { href: "/blog/articles/new", label: "Écrire un article" },
  },
  {
    id: "ajouter-couverture",
    num: 18,
    title: "Ajouter une image de couverture",
    audience: "Auteur",
    icon: FileText,
    accent: "chart-4",
    summary: "Uploader une couverture (max 5 Mo, JPEG/PNG/WebP/GIF).",
    steps: [
      { text: "Dans le formulaire d'article, section « Métadonnées »." },
      {
        text: "Glisser une image dans la zone, cliquer pour choisir un fichier, ou coller avec Ctrl+V.",
      },
      {
        text: "L'upload est immédiat (dans public/blog/articles/<année>/).",
        hint: "Cliquer « Retirer » supprime le fichier du serveur.",
      },
    ],
    warning:
      "SVG refusé (vecteur XSS). Formats acceptés : JPEG, PNG, WebP, GIF. Taille max 5 Mo.",
    link: { href: "/blog/articles/new", label: "Écrire un article" },
  },
  {
    id: "structurer-contenu",
    num: 19,
    title: "Structurer le contenu en blocs",
    audience: "Auteur",
    icon: Layers,
    accent: "chart-4",
    summary: "Ajouter, éditer, déplacer et imbriquer les 8 types de blocs.",
    steps: [
      {
        text: "Section « Contenu » → cliquer « Ajouter un bloc à la racine ».",
      },
      {
        text: "Choisir un type : Section, Paragraphe, Image, Vidéo, Audio, Code, Embed, Document.",
      },
      { text: "Remplir le formulaire du bloc puis « Enregistrer »." },
      {
        text: "Utiliser la toolbar (Éditer / Monter / Descendre / Indenter / Désindenter / Supprimer).",
        hint: "Profondeur max 6 niveaux d'imbrication.",
      },
    ],
    tip: "Les blocs Section créent automatiquement la table des matières de l'article.",
    link: { href: "/blog/articles/new", label: "Écrire un article" },
  },
  {
    id: "classer-article",
    num: 20,
    title: "Classer un article (taxonomie + tags)",
    audience: "Auteur",
    icon: Tag,
    accent: "chart-4",
    summary:
      "Choisir le thème obligatoire, la catégorie et sous-catégorie optionnelles, et les tags.",
    steps: [
      { text: "Section « Taxonomie » du formulaire d'article." },
      {
        text: "Choisir un thème (obligatoire), puis une catégorie, puis une sous-catégorie.",
        hint: "Catégorie et sous-catégorie se débloquent après la précédente.",
      },
      {
        text: "Cocher les tags souhaités, ou cliquer « Nouveau tag » pour en créer un à la volée.",
      },
    ],
    tip: "Le bouton « Gérer la taxonomie » ouvre /blog/taxonomy sans perdre le brouillon.",
    link: { href: "/blog/articles/new", label: "Écrire un article" },
  },
  {
    id: "publier-article",
    num: 21,
    title: "Publier un article",
    audience: "Auteur",
    icon: Sparkles,
    accent: "chart-4",
    summary: "Faire passer un article de brouillon à publié.",
    steps: [
      { text: "Ouvrir l'article (via /blog/user/articles ou /blog/articles)." },
      { text: "Passer le statut à « Publié » puis Enregistrer." },
      {
        text: "Alternativement : cliquer « Publier » sur la ligne de l'article.",
        hint: "publishedAt est renseigné une seule fois, jamais réinitialisé.",
      },
    ],
    link: { href: "/blog/user/articles", label: "Gérer mes articles" },
  },
  {
    id: "previsualiser-brouillon",
    num: 22,
    title: "Prévisualiser un brouillon",
    audience: "Auteur",
    icon: FileText,
    accent: "chart-4",
    summary: "Voir un article en brouillon comme s'il était publié.",
    steps: [
      {
        text: "Depuis l'éditeur, cliquer « Aperçu » (ouvre dans un nouvel onglet).",
      },
      {
        text: "L'URL contient ?preview=1 — seul l'auteur (et les admins) peut voir un brouillon.",
      },
    ],
    tip: "Utile pour valider le rendu avant de passer le statut à « Publié ».",
    link: { href: "/blog/user/articles", label: "Mes articles" },
  },
  {
    id: "gerer-articles",
    num: 23,
    title: "Gérer mes articles",
    audience: "Auteur",
    icon: FileText,
    accent: "chart-4",
    summary:
      "Lister, éditer, publier, archiver, supprimer ses propres articles.",
    steps: [
      {
        text: "Aller sur /blog/user/articles — liste filtrée sur votre compte.",
      },
      {
        text: "Tri automatique : brouillons → publiés → archivés, puis updatedAt DESC.",
      },
      {
        text: "Chaque ligne a 4 actions : Éditer / Publier / Archiver / Supprimer.",
        hint: "Supprimer demande une confirmation (AlertDialog).",
      },
    ],
    link: { href: "/blog/user/articles", label: "Mes articles" },
  },

  /* --------------------------- ADMIN (3) -------------------------- */
  {
    id: "devenir-admin",
    num: 24,
    title: "Devenir le premier administrateur",
    audience: "Admin",
    icon: Key,
    accent: "chart-5",
    summary: "Bootstrap : si aucun admin n'existe, se promouvoir admin.",
    steps: [
      { text: "Se connecter avec un compte utilisateur." },
      { text: "Aller sur /blog/setup." },
      {
        text: "Cliquer « Devenir administrateur ».",
        hint: "Opération idempotente : une fois qu'un admin existe, le bouton disparaît.",
      },
    ],
    warning:
      "Variable ADMIN_EMAIL optionnelle : si définie, seuls les emails listés peuvent être promus par bootstrap.",
    link: { href: "/blog/setup", label: "Bootstrap admin" },
  },
  {
    id: "gerer-taxonomie",
    num: 25,
    title: "Gérer la taxonomie (thèmes / catégories / sous-catégories)",
    audience: "Admin",
    icon: Layers,
    accent: "chart-5",
    summary: "Créer, éditer, supprimer les 3 niveaux de la hiérarchie.",
    steps: [
      { text: "Aller sur /blog/taxonomy." },
      {
        text: "Pour créer un thème : « Nouveau thème » → nom, couleur, icône.",
      },
      {
        text: "Ouvrir un thème (accordéon) puis « Ajouter une catégorie ».",
      },
      {
        text: "Sous une catégorie, ajouter des sous-catégories.",
        hint: "Suppression refusée si l'entité a des enfants (garde-fou).",
      },
    ],
    warning:
      "Supprimer un thème avec catégories (ou une catégorie avec sous-catégories) est refusé côté serveur.",
    link: { href: "/blog/taxonomy", label: "Gérer la taxonomie" },
  },
  {
    id: "gerer-tags",
    num: 26,
    title: "Gérer les tags transverses",
    audience: "Admin",
    icon: Tag,
    accent: "chart-5",
    summary: "Créer, éditer, supprimer les tags appliqués aux articles.",
    steps: [
      {
        text: "Aller sur /blog/taxonomy, descendre jusqu'à la section « Tags ».",
      },
      {
        text: "« Nouveau tag » pour créer (nom + couleur optionnelle).",
        hint: "Slug auto-généré, unicité insensible à la casse.",
      },
      {
        text: "Pour un tag existant : icônes Éditer / Supprimer inline.",
        hint: "Supprimer un tag le retire aussi de tous les articles.",
      },
    ],
    link: { href: "/blog/taxonomy", label: "Gérer les tags" },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const AUDIENCE_BADGE_CLASS: Record<Audience, string> = {
  Tous: "bg-chart-1/15 text-chart-1",
  Compte: "bg-chart-2/15 text-chart-2",
  Communauté: "bg-chart-3/15 text-chart-3",
  Auteur: "bg-chart-4/15 text-chart-4",
  Admin: "bg-chart-5/15 text-chart-5",
};

/* ------------------------------------------------------------------ */
/*  Carte tutoriel                                                     */
/* ------------------------------------------------------------------ */

function TutorialCard({ tutorial }: { readonly tutorial: Tutorial }) {
  const Icon = tutorial.icon;
  const accent = tutorial.accent;

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      {/* En-tête : numéro + titre + badge */}
      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <span className="text-sm font-bold tabular-nums">
            {String(tutorial.num).padStart(2, "0")}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              {tutorial.title}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${AUDIENCE_BADGE_CLASS[tutorial.audience]}`}
            >
              {tutorial.audience}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {tutorial.summary}
          </p>
        </div>
        <Icon
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </header>

      {/* Étapes */}
      <ol className="mt-1 space-y-2">
        {tutorial.steps.map((step, index) => (
          <li key={step.text} className="flex gap-2.5 text-sm">
            <span
              aria-hidden
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
              }}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground/90">{step.text}</p>
              {step.hint && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Astuce */}
      {tutorial.tip && (
        <div className="mt-3 flex gap-2 rounded-lg border border-chart-4/30 bg-chart-4/5 p-2.5 text-xs">
          <Lightbulb
            className="mt-0.5 size-3.5 shrink-0 text-chart-4"
            aria-hidden
          />
          <p className="leading-relaxed text-foreground/80">
            <span className="font-semibold text-chart-4">Astuce.</span>{" "}
            {tutorial.tip}
          </p>
        </div>
      )}

      {/* Warning */}
      {tutorial.warning && (
        <div className="mt-2 flex gap-2 rounded-lg border border-chart-3/40 bg-chart-3/5 p-2.5 text-xs">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0 text-chart-3"
            aria-hidden
          />
          <p className="leading-relaxed text-foreground/80">
            <span className="font-semibold text-chart-3">Attention.</span>{" "}
            {tutorial.warning}
          </p>
        </div>
      )}

      {/* CTA */}
      {tutorial.link && (
        <Link
          href={tutorial.link.href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform hover:translate-x-0.5"
          style={{ color: `var(--${accent})` }}
        >
          Faire maintenant
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
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
            26 tutoriels pas-à-pas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Chaque action courante du blog, expliquée en étapes concrètes et
            cliquables. Trouvez votre tutoriel par audience ci-dessous.
          </p>
        </div>
      </header>

      {/* Sommaire — 5 audiences */}
      <nav
        aria-label="Sommaire par audience"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {AUDIENCES.map((config) => {
          const Icon = config.icon;
          const count = TUTORIALS.filter(
            (tutorial) => tutorial.audience === config.id,
          ).length;
          return (
            <a
              key={config.id}
              href={`#audience-${config.id}`}
              className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-muted/40"
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, var(--${config.accent}), color-mix(in oklab, var(--${config.accent}) 60%, black))`,
                }}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {config.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {count} tuto{count > 1 ? "s" : ""}
                </p>
              </div>
            </a>
          );
        })}
      </nav>

      {/* Sections par audience */}
      {AUDIENCES.map((config) => {
        const tutorials = TUTORIALS.filter(
          (tutorial) => tutorial.audience === config.id,
        );
        if (tutorials.length === 0) return null;

        const Icon = config.icon;

        return (
          <section
            key={config.id}
            id={`audience-${config.id}`}
            aria-labelledby={`audience-${config.id}-title`}
            className="scroll-mt-24 space-y-4"
          >
            <header className="flex items-start gap-3">
              <div
                className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, var(--${config.accent}), color-mix(in oklab, var(--${config.accent}) 60%, black))`,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: `var(--${config.accent})` }}
                >
                  {tutorials.length} tutoriel{tutorials.length > 1 ? "s" : ""}
                </p>
                <h2
                  id={`audience-${config.id}-title`}
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  {config.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Pied — liens utiles */}
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Bell className="size-5 text-chart-1" aria-hidden />
          Et après ?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Une question qui n&apos;est pas couverte ? Les outils Genesis
          (SelectFiles, CreateFiles, CopyToIA) ont leur propre guide. La
          recherche du blog accepte des filtres avancés via l&apos;URL.
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
          <Link
            href="/blog/search"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Recherche avancée
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

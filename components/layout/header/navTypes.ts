/*
path :           components/layout/header/navTypes.ts
tag :            ["navigation", "types", "config", "roles", "header"]
projectId:       new-genesis
type:            config
generic:         true

role:            Type NavItem partagé par toutes les navigations du header. Décrit
                 un item de menu : liens internes/externes, sous-menus récursifs,
                 description, ordre d'affichage, visibilité, état désactivé, et
                 restriction par rôle utilisateur. Utilisé par la source de
                 navigation (frontWorkSpace) et les composants de rendu
                 (MainNav, Header).
flow:            Module TypeScript pur → export des types NavItem, UserRole et
                 NavContext. Aucun état, aucun effet, aucune dépendance runtime.
ecosystem:       Layout = [
                   "@/components/layout/header/frontWorkSpace.ts",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/navTypes.ts",
                 ]
relatedFiles:    ["@/components/layout/header/frontWorkSpace.ts",
                  "@/components/layout/header/MainNav.tsx",
                  "@/components/layout/header/Header.tsx"]
imports:         []
exports:         ["NavItem", "UserRole", "NavContext"]
useBy:           ["@/components/layout/header/frontWorkSpace.ts",
                  "@/components/layout/header/MainNav.tsx",
                  "@/components/layout/header/Header.tsx"]

userStories:     ["*en tant que développeur je veux un type de navigation partagé",
                  "*en tant qu'utilisateur je veux voir un menu adapté à mon rôle"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Rôles utilisateur                                                  */
/* ------------------------------------------------------------------ */

/**
 * Rôles disponibles dans l'application.
 * Sert à filtrer les items de navigation selon l'utilisateur connecté.
 */
export type UserRole = "user" | "admin" | "editor" | "viewer";

/* ------------------------------------------------------------------ */
/*  NavItem                                                            */
/* ------------------------------------------------------------------ */

/**
 * Un item de navigation du header.
 * Récursif : un item peut contenir des enfants (sous-menu).
 */
export interface NavItem {
  /** Identifiant unique (clé React, référence stable). */
  readonly id: string;

  /** Libellé affiché à l'utilisateur. */
  readonly label: string;

  /** URL cible (optionnelle : un item sans href sert de groupe). */
  readonly href?: string;

  /** Description courte (sous-menus, aria, tooltip). */
  readonly description?: string;

  /** Sous-menu récursif. */
  readonly children?: readonly NavItem[];

  /** Ordre d'affichage (tri croissant). */
  readonly displayOrder: number;

  /** Visible ou non (défaut : `true`). */
  readonly visible?: boolean;

  /** Ouvrir dans un nouvel onglet (ajoute `target="_blank"` et `rel`). */
  readonly external: boolean;

  /** Désactivé : affiché mais non cliquable. */
  readonly disabled: boolean;

  /**
   * Rôles autorisés à voir cet item.
   * - `undefined` : visible pour tous (y compris anonymes).
   * - `[]` : jamais visible.
   * - `["admin"]` : visible uniquement par les admins.
   */
  readonly roles: readonly UserRole[] | undefined;
}

/* ------------------------------------------------------------------ */
/*  NavContext                                                         */
/* ------------------------------------------------------------------ */

/**
 * Contexte nécessaire au filtrage d'une navigation.
 * Passé aux helpers qui résolvent les items visibles.
 */
export interface NavContext {
  /** Rôle de l'utilisateur courant, ou `null` si anonyme. */
  readonly role: UserRole | null;
}
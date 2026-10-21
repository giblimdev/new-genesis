/*
path :           components/layout/header/nav/frontWorkSpace.ts
projectId:       new-genesis
type:            config
generic:         false

role:            Source unique de navigation de l'application. Exporte
                 mainNavData, consommé exclusivement par Header.tsx.
                 Branche les pages d'entrée Blog (/blog, /blog/search,
                 /blog/community, /blog/user/favorites, /blog/notifications,
                 /blog/help) sous l'entrée « Blog », et les pages Admin
                 (/admin, /admin/users) sous l'entrée « Admin ». Les
                 entrées Admin portent roles: ["admin"] — elles ne sont
                 affichées qu'aux utilisateurs ayant ce rôle (filtrage
                 effectué dans MainNav via la prop userRole).

flow:            Module TypeScript pur → export d'un tableau readonly
                 de NavItem. Aucun état, aucun effet.

ecosystem:       Layout = [
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/Header.tsx",
                 ]

relatedFiles:    ["@/components/layout/header/navTypes.ts",
                  "@/components/layout/header/Header.tsx"]

imports:         ["@/components/layout/header/navTypes"]

exports:         ["mainNavData"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant que développeur je veux naviguer dans l'app"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { NavItem } from "../navTypes";

export const mainNavData: readonly NavItem[] = [
  {
    id: "nav-home",
    label: "Accueil",
    href: "/",
    displayOrder: 10,
    visible: true,
    disabled: false,
    external: false,
    roles: undefined,
  },
  {
    id: "nav-blog",
    label: "Blog",
    href: "/blog",
    description: "Articles, recherche, communauté, favoris et notifications",
    displayOrder: 20,
    visible: true,
    disabled: false,
    external: false,
    roles: undefined,
    children: [
      {
        id: "nav-blog-index",
        label: "Articles",
        href: "/blog",
        displayOrder: 210,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-blog-search",
        label: "Rechercher",
        href: "/blog/search",
        displayOrder: 220,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-blog-community",
        label: "Communauté",
        href: "/blog/community",
        displayOrder: 230,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-blog-favorites",
        label: "Mes favoris",
        href: "/blog/user/favorites",
        displayOrder: 240,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-blog-notifications",
        label: "Notifications",
        href: "/blog/notifications",
        displayOrder: 250,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-blog-help",
        label: "Aide Blog",
        href: "/blog/help",
        displayOrder: 260,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
    ],
  },
  {
    id: "nav-core",
    label: "Conception",
    href: "",
    description: "Conception du projet",
    displayOrder: 30,
    visible: true,
    disabled: false,
    external: false,
    roles: undefined,
    children: [
      {
        id: "nav-core-business",
        label: "ScrumBusiness",
        href: "/core/scrum-business",
        displayOrder: 310,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-core-app",
        label: "ScrumApp",
        href: "/core/scrum-app",
        displayOrder: 320,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-core-genesis",
        label: "Scrum-Genesis",
        href: "/core/scrum-genesis",
        displayOrder: 330,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-core-help",
        label: "Aide Core",
        href: "/core/help",
        displayOrder: 340,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
    ],
  },
  {
    id: "nav-genesis",
    label: "DEV",
    href: "/genesis",
    description: "Outils de développement",
    displayOrder: 40,
    visible: true,
    disabled: false,
    external: false,
    roles: undefined,
    children: [
      {
        id: "nav-genesis-copy-to-ia",
        label: "Copy to IA",
        href: "/genesis/copy-to-ia",
        displayOrder: 410,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-genesis-create-files",
        label: "CreateFiles",
        href: "/genesis/create-files",
        displayOrder: 420,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-genesis-read-files",
        label: "SelectFiles",
        href: "/genesis/read-files",
        displayOrder: 430,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-genesis-help",
        label: "Genesis Help",
        href: "/genesis/help",
        displayOrder: 440,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
      {
        id: "nav-genesis-cmd",
        label: "Genesis CMD",
        href: "/genesis/cmd",
        displayOrder: 450,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined,
      },
    ],
  },
  {
    id: "nav-admin",
    label: "Admin",
    href: "/admin",
    description: "Administration de l'application",
    displayOrder: 50,
    visible: true,
    disabled: false,
    external: false,
    roles: ["admin"],
    children: [
      {
        id: "nav-admin-users",
        label: "Utilisateurs",
        href: "/admin/users",
        displayOrder: 510,
        visible: true,
        disabled: false,
        external: false,
        roles: ["admin"],
      },
    ],
  },
];

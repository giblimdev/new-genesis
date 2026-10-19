/*
path :           components/layout/header/nav/frontWorkSpace.ts
projectId:       <à fournir>
type:            config
generic:         false

role:            Source unique de navigation de l'application. Exporte mainNavData,
                 consommé exclusivement par Header.tsx (desktop + mobile). Aucun autre
                 fichier ne doit importer cette donnée.
flow:            Module TypeScript pur → export d'un tableau readonly de NavItem. Aucun
                 état, aucun effet, aucune dépendance runtime.
ecosystem:       Layout = [
                   "@/components/layout/header/navTypes.ts",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/Header.tsx",
                 ]
relatedFiles:    ["@/components/layout/header/navTypes.ts",
                  "@/components/layout/header/Header.tsx"]
imports:         ["@/components/layout/header/navTypes"]
exports:         ["mainNavData"]
useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant que développeur je veux naviguer dans l'app"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
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
    roles: undefined, // ["admin", "editor", "viewer"],
  },
  {
    id: "nav-blog",
    label: "Blog",
    href: "/blog",
    description: "blog de l'application, tutoriels et articles",
    displayOrder: 20,
    visible: true,
    disabled: false,
    external: false,    
    roles: undefined, // ["admin", "editor", "viewer"],
  },
    {
    id: "nav-srum",
    label: "conception",
    href: "",
    description: "Conception du projet",
    displayOrder: 30,
    visible: true,
    disabled: false,
    external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
    children: [
            {
        id: "nav-srum-business",
        label: "SrumBusiness",
        href: "/core/",
        description: "", 
        displayOrder: 10,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
{
        id: "nav-srum-app",
        label: "SrumApp",
        href: "/core/",
        description: "", 
        displayOrder: 20,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
      {
        id: "nav-srum-new-genesis",
        label: "ScrumGenesis",
        href: "/core/",
        description: "", 
        displayOrder: 30,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
      {
        id: "nav-srum-help",
        label: "Aide Srum",
        href: "/core/help",
        description: "Documentation et tutoriels Srum", 
        displayOrder: 40,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },]  
  },
  {
    id: "nav-new-genesis",
    label: "DEV",
    href: "/genesis",
    description: "développement de projet, Tools et Aide",
    displayOrder: 40,
    visible: true,
    disabled: false,
    roles: undefined, // ["admin", "editor", "viewer"],
    external: false,
    children: [
      {
        id: "nav-genesis-to-ia",
        label: "Copy to IA",
        href: "/genesis/copy-to-ia",
        description: "", 
        displayOrder: 10,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
      {
        id: "nav-genesis-creatfile",
        label: "CreatFile",
        href: "/genesis/create-files",
        description: "", 
        displayOrder: 20,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
      {
        id: "nav-genesis-select-file",
        label: "Select File",
        href: "/genesis/read-files",
        description: "", 
        displayOrder: 30,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
      {
        id: "nav-genesis-help",
        label: "Genesis Help",
        href: "/genesis/help",
        description: "", 
        displayOrder: 70,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
    ]
    
  },      {
        id: "nav-app-help",
        label: " Help",
        href: "/blog/help",
        description: "", 
        displayOrder: 50,
        visible: true,
        disabled: false,
        external: false,
        roles: undefined, // ["admin", "editor", "viewer"],
      },
];
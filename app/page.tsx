/*
path :           app/page.tsx
tag :            ["home", "page", "hub", "navigation"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'accueil de Genesis. Présente la marque et expose trois
                 cartes menant aux modules de l'application : Core (conception
                 Scrum), Genesis (outils de développement) et Blog (articles et
                 tutoriels). Server Component statique, aucune donnée dynamique.

flow:            Server Component → rend un hero (badge, titre, tagline) →
                 grille responsive 1 / 2 / 3 colonnes de ModuleCard → chaque
                 carte est un <Link> vers son module.

ecosystem:       Home = [
                   "@/app/page.tsx",
                 ]

relatedFiles:    ["@/app/layout.tsx",
                  "@/app/core/page.tsx",
                  "@/app/genesis/page.tsx",
                  "@/app/blog/page.tsx"]

imports:         ["next/link", "lucide-react", "next"]

exports:         ["default HomePage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux accéder aux trois modules de Genesis"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Genesis — l'atelier qui structure vos projets. Conception, planification, développement.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModuleEntry {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const MODULES: readonly ModuleEntry[] = [
  {
    href: "/core",
    title: "Core",
    description:
      "Conception Scrum : idées, features, personas, epics, user stories et sprints — trois flux parallèles (business, app, genesis).",
    icon: Layers,
    accent: "chart-1",
  },
  {
    href: "/genesis",
    title: "Genesis",
    description:
      "Outils de développement : SelectFiles, CreateFiles, CopyToIA. Lire le projet, sélectionner du contexte IA, injecter des scripts.",
    icon: Wrench,
    accent: "chart-2",
  },
  {
    href: "/blog",
    title: "Blog",
    description:
      "Articles, retours d'expérience et tutoriels autour de Genesis et du développement produit.",
    icon: BookOpen,
    accent: "chart-3",
  },
];

/* ------------------------------------------------------------------ */
/*  Carte module                                                       */
/* ------------------------------------------------------------------ */

function ModuleCard({ module }: { readonly module: ModuleEntry }) {
  const Icon = module.icon;
  const accent = module.accent;

  return (
    <Link
      href={module.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      <header className="mb-4 flex items-center gap-3">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {module.title}
        </h2>
      </header>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {module.description}
      </p>

      <span
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ color: `var(--${accent})` }}
      >
        Ouvrir
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-chart-1/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 size-96 rounded-full bg-chart-3/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-chart-2" aria-hidden />
            Genesis · Atelier de conception
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            L&apos;atelier qui structure vos projets
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            De l&apos;idée au produit. Conception Scrum, outils de développement
            et blog intégrés dans une seule application.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explorer les modules
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choisissez un point d&apos;entrée pour commencer.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MODULES.map((module) => (
              <ModuleCard key={module.href} module={module} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
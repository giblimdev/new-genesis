/*
path :           app/core/components/scrum/FlowSelector.tsx
tag :            ["scrum", "flow", "selector", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Sélecteur de flux Scrum sous forme de deux onglets cliquables
                 (ScrumApp / Scrum-Genesis). Navigue vers /core/help/{flow} au clic.
                 Affiche l'onglet actif selon le pathname courant.

flow:            Client Component → usePathname → détermine le flux actif → rend deux
                 <Link> stylés comme un segmented control. Aucun état local.

ecosystem:       ScrumUI = [
                   "@/app/core/components/scrum/EpicCard.tsx",
                   "@/app/core/components/scrum/EpicForm.tsx",
                   "@/app/core/components/scrum/EpicList.tsx",
                   "@/app/core/components/scrum/FeatureCard.tsx",
                   "@/app/core/components/scrum/FeatureForm.tsx",
                   "@/app/core/components/scrum/FeatureList.tsx",
                   "@/app/core/components/scrum/FlowSelector.tsx",
                   "@/app/core/components/scrum/GlobalJsonExport.tsx",
                   "@/app/core/components/scrum/IdeeCard.tsx",
                   "@/app/core/components/scrum/IdeeForm.tsx",
                   "@/app/core/components/scrum/IdeeList.tsx",
                   "@/app/core/components/scrum/PersonaCard.tsx",
                   "@/app/core/components/scrum/PersonaForm.tsx",
                   "@/app/core/components/scrum/PersonaList.tsx",
                   "@/app/core/components/scrum/ScrumNav.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/types.ts",
                  "@/app/core/page.tsx"]

imports:         ["next/link", "next/navigation", "lucide-react",
                  "@/app/core/lib/scrum/types"]

exports:         ["FlowSelector"]

useBy:           ["@/app/core/help/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux basculer entre ScrumApp et Scrum-Genesis"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : usePathname pour détecter le flux actif.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Wrench, type LucideIcon } from "lucide-react";

import type { ScrumFlow } from "@/app/core/lib/scrum/types";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

interface FlowEntry {
  readonly id: ScrumFlow;
  readonly label: string;
  readonly tagline: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

const FLOWS: readonly FlowEntry[] = [
  {
    id: "scrum-app",
    label: "ScrumApp",
    tagline: "L'app métier",
    icon: Package,
    accent: "chart-1",
  },
  {
    id: "scrum-genesis",
    label: "Scrum-Genesis",
    tagline: "L'outil lui-même",
    icon: Wrench,
    accent: "chart-3",
  },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function FlowSelector() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sélection du flux Scrum"
      className="inline-flex items-center gap-1 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm"
    >
      {FLOWS.map((flow) => {
        const href = `/core/${flow.id}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        const Icon = flow.icon;

        return (
          <Link
            key={flow.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="group relative flex min-w-[10rem] items-center gap-2.5 rounded-xl px-4 py-2.5 transition-colors"
            style={
              isActive
                ? ({
                    background: `linear-gradient(135deg, color-mix(in oklab, var(--${flow.accent}) 12%, var(--background)), color-mix(in oklab, var(--${flow.accent}) 4%, var(--background)))`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, var(--${flow.accent}), color-mix(in oklab, var(--${flow.accent}) 60%, black))`,
              }}
            >
              <Icon className="size-4" aria-hidden />
            </span>

            <span className="flex flex-col items-start leading-tight">
              <span
                className={`text-sm font-bold ${
                  isActive ? "text-foreground" : "text-foreground/70"
                }`}
              >
                {flow.label}
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  isActive ? "" : "text-muted-foreground"
                }`}
                style={isActive ? { color: `var(--${flow.accent})` } : undefined}
              >
                {flow.tagline}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
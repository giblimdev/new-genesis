/*
path :           app/genesis/components/cmd/DesignShowcase.tsx
tag :            ["genesis", "cmd", "design", "fonts", "colors", "showcase"]
projectId:       new-genesis
type:            component
generic:         false

role:            Section "Design System" de la page /genesis/cmd. Présente
                 les 3 polices du projet (Inter, Fraunces, JetBrains Mono —
                 chargées par app/layout.tsx et exposées via les CSS vars
                 --font-inter, --font-fraunces, --font-jetbrains-mono) et
                 les 5 couleurs d'accent chart-1..chart-5 définies dans
                 @theme Tailwind (globals.css). Chaque bloc affiche le nom
                 de la ressource, son usage et un aperçu visuel. Server
                 Component pur, aucune interaction.

flow:            Constantes FONTS + COLORS → rend 2 sections : polices
                 (grille 1/3 colonnes) et couleurs (grille 2/3/5 colonnes).
                 Les polices utilisent fontFamily: var(--font-*) pour un
                 rendu exact ; les couleurs utilisent background: var(--chart-*).

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/cmd/page.tsx",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/components/cmd/CommandList.tsx",
                   "@/app/genesis/components/cmd/DesignShowcase.tsx",
                   "@/app/genesis/components/cmd/StackCard.tsx",
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/help/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/cmd/page.tsx",
                  "@/app/layout.tsx"]

imports:         ["lucide-react"]

exports:         ["DesignShowcase"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux visualiser les polices et couleurs du design system"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Palette, Type } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Config — polices                                                   */
/* ------------------------------------------------------------------ */

interface FontEntry {
  readonly id: string;
  readonly label: string;
  readonly usage: string;
  readonly variable: string;
  readonly sample: string;
}

const FONTS: readonly FontEntry[] = [
  {
    id: "inter",
    label: "Inter",
    usage: "Texte courant (sans-serif)",
    variable: "--font-inter",
    sample: "L'atelier qui structure vos projets.",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    usage: "Titres (serif display)",
    variable: "--font-fraunces",
    sample: "Genesis",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    usage: "Code (monospace)",
    variable: "--font-jetbrains-mono",
    sample: "const answer = 42;",
  },
];

/* ------------------------------------------------------------------ */
/*  Config — couleurs                                                  */
/* ------------------------------------------------------------------ */

interface ColorEntry {
  readonly id: string;
  readonly label: string;
}

const COLORS: readonly ColorEntry[] = [
  { id: "chart-1", label: "Accent 1" },
  { id: "chart-2", label: "Accent 2" },
  { id: "chart-3", label: "Accent 3" },
  { id: "chart-4", label: "Accent 4" },
  { id: "chart-5", label: "Accent 5" },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function DesignShowcase() {
  return (
    <div className="space-y-6">
      {/* Polices */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <header className="mb-4 flex items-center gap-2">
          <Type className="size-4 text-chart-2" aria-hidden />
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Polices
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {FONTS.map((font) => (
            <article
              key={font.id}
              className="rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {font.usage}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {font.label}
              </p>
              <p
                className="mt-3 text-lg leading-tight text-foreground"
                style={{ fontFamily: `var(${font.variable})` }}
              >
                {font.sample}
              </p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                var({font.variable})
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Couleurs */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <header className="mb-4 flex items-center gap-2">
          <Palette className="size-4 text-chart-3" aria-hidden />
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Couleurs d&apos;accent
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {COLORS.map((color) => (
            <div key={color.id} className="space-y-1.5">
              <div
                className="aspect-square w-full rounded-lg shadow-sm ring-1 ring-border/60"
                style={{ background: `var(--${color.id})` }}
                aria-hidden
              />
              <p className="text-[11px] font-semibold text-foreground">
                {color.label}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                --{color.id}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

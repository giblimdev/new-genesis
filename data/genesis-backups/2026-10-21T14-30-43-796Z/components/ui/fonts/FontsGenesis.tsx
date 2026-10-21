/*
path :           components/ui/fonts/FontsGenesis.tsx
tag :            ["ui", "fonts", "typography", "gallery", "catalog", "client", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Galerie interactive des polices du projet (Inter, Fraunces,
                 JetBrains Mono). Un champ « Texte d'aperçu » éditable en
                 haut met à jour EN DIRECT l'aperçu de chaque police à 4
                 tailles (xs, sm, base, xl). Chaque police est présentée
                 dans une carte avec : son nom, sa tagline d'usage, un
                 aperçu multi-tailles, puis 3 lignes copiables :
                 - CSS variable   (ex. "--font-inter")
                 - Font-family    (ex. "var(--font-inter)")
                 - Import Next.js (ex. 'import { Inter } from "next/font/google";')
                 Cliquer sur l'icône Copier d'une ligne écrit la valeur dans
                 le presse-papier et déclenche un toast. Le catalogue est
                 exposé sous FONTS_GENESIS_DEFAULT_CATALOG et peut être
                 remplacé via la prop `catalog` (réutilisable pour d'autres
                 jeux de polices). Composant CLIENT (state sample + lastCopied
                 + clipboard + toast), réutilisable hors Genesis.

flow:            useState(sample, defaultSample) + useState(lastCopied) →
                 rend : titre + input « Texte d'aperçu » + une <FontCard />
                 par entrée du catalogue. FontCard → 3 <CopyRow /> (label +
                 code + bouton Copier avec feedback Check). handleCopy(key,
                 text) → navigator.clipboard.writeText(text) → toast +
                 setLastCopied(key) → reset 1,5 s. Si sample vide : fallback
                 sur font.sample (texte propre à chaque police).

ecosystem:       Fonts = [
                   "@/components/ui/fonts/FontsGenesis.tsx",
                 ]

relatedFiles:    ["@/lib/utils.ts",
                  "@/components/ui/sonner.tsx",
                  "@/app/layout.tsx",
                  "@/app/genesis/cmd/page.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/lib/utils"]

exports:         ["FontsGenesis", "FontsGenesisProps",
                  "FontEntry", "FONTS_GENESIS_DEFAULT_CATALOG"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux prévisualiser les polices du projet et copier leurs variables CSS"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (sample, lastCopied) + navigator.clipboard + toast.

import { useState } from "react";
import { Check, Copy, Type } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FontEntry {
  /** Identifiant stable (utilisé comme clé React et clé de copy). */
  readonly id: string;
  /** Nom affiché (avec espace, ex. "JetBrains Mono"). */
  readonly label: string;
  /** Usage de la police (ex. "Texte courant (sans-serif)"). */
  readonly tagline: string;
  /** Nom de la CSS variable globale (ex. "--font-inter"). */
  readonly cssVariable: string;
  /** Nom JS exporté par next/font/google (ex. "JetBrains_Mono"). */
  readonly importName: string;
  /** Ligne d'import Next.js copiable (ex. 'import { Inter } from "next/font/google";'). */
  readonly nextImport: string;
  /** Texte d'aperçu par défaut si l'utilisateur vide le champ. */
  readonly sample: string;
}

export interface FontsGenesisProps {
  /** Titre de la section (défaut : "Polices"). */
  readonly title?: string;
  /** Description optionnelle sous le titre. */
  readonly description?: string;
  /** Catalogue à utiliser. Défaut : FONTS_GENESIS_DEFAULT_CATALOG. */
  readonly catalog?: readonly FontEntry[];
  /** Texte d'aperçu initial (défaut : pangramme français + chiffres). */
  readonly defaultSample?: string;
  /** Classes additionnelles sur le <section>. */
  readonly className?: string;
}

/* ------------------------------------------------------------------ */
/*  Catalogue par défaut (3 polices du projet)                        */
/* ------------------------------------------------------------------ */

export const FONTS_GENESIS_DEFAULT_CATALOG: readonly FontEntry[] = [
  {
    id: "inter",
    label: "Inter",
    tagline: "Texte courant (sans-serif)",
    cssVariable: "--font-inter",
    importName: "Inter",
    nextImport: 'import { Inter } from "next/font/google";',
    sample: "L'atelier qui structure vos projets.",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    tagline: "Titres (serif display)",
    cssVariable: "--font-fraunces",
    importName: "Fraunces",
    nextImport: 'import { Fraunces } from "next/font/google";',
    sample: "Genesis",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    tagline: "Code (monospace)",
    cssVariable: "--font-jetbrains-mono",
    importName: "JetBrains_Mono",
    nextImport: 'import { JetBrains_Mono } from "next/font/google";',
    sample: "const answer = 42;",
  },
];

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export function FontsGenesis({
  title = "Polices",
  description,
  catalog = FONTS_GENESIS_DEFAULT_CATALOG,
  defaultSample = "Portez ce vieux whisky au juge blond qui fume. 0123456789",
  className,
}: FontsGenesisProps) {
  const [sample, setSample] = useState(defaultSample);
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  function handleCopy(key: string, text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setLastCopied(key);
        toast.success(
          text.length > 48 ? `Copié : ${text.slice(0, 48)}…` : `Copié : ${text}`,
        );
        window.setTimeout(
          () =>
            setLastCopied((current) => (current === key ? null : current)),
          1500,
        );
      })
      .catch(() => toast.error("Impossible de copier."));
  }

  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <Type className="size-4 text-chart-2" aria-hidden />
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      {/* Échantillon éditable */}
      <div className="space-y-1.5">
        <label
          htmlFor="font-sample"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Texte d&apos;aperçu
        </label>
        <input
          id="font-sample"
          type="text"
          value={sample}
          onChange={(event) => setSample(event.target.value)}
          placeholder="Tapez un texte pour prévisualiser…"
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/10 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {/* Cartes par police */}
      <div className="space-y-3">
        {catalog.map((font) => (
          <FontCard
            key={font.id}
            font={font}
            sample={sample || font.sample}
            lastCopied={lastCopied}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Carte d'une police                                                 */
/* ------------------------------------------------------------------ */

function FontCard({
  font,
  sample,
  lastCopied,
  onCopy,
}: {
  readonly font: FontEntry;
  readonly sample: string;
  readonly lastCopied: string | null;
  readonly onCopy: (key: string, text: string) => void;
}) {
  const family = `var(${font.cssVariable})`;

  return (
    <article className="rounded-xl border border-border/60 bg-muted/10 p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {font.tagline}
          </p>
          <h3 className="text-base font-bold text-foreground">{font.label}</h3>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          {font.importName}
        </p>
      </header>

      {/* Aperçu à 4 tailles */}
      <div className="mb-3 space-y-1 overflow-hidden rounded-lg bg-background/60 p-3">
        <p
          className="truncate text-xs leading-snug text-muted-foreground"
          style={{ fontFamily: family }}
          title={sample}
        >
          {sample}
        </p>
        <p
          className="truncate text-sm text-foreground"
          style={{ fontFamily: family }}
          title={sample}
        >
          {sample}
        </p>
        <p
          className="truncate text-base text-foreground"
          style={{ fontFamily: family }}
          title={sample}
        >
          {sample}
        </p>
        <p
          className="truncate text-xl text-foreground"
          style={{ fontFamily: family }}
          title={sample}
        >
          {sample}
        </p>
      </div>

      {/* Lignes copiables */}
      <div className="space-y-1.5">
        <CopyRow
          label="CSS variable"
          value={font.cssVariable}
          copied={lastCopied === `var:${font.id}`}
          onCopy={() => onCopy(`var:${font.id}`, font.cssVariable)}
        />
        <CopyRow
          label="Font-family"
          value={`var(${font.cssVariable})`}
          copied={lastCopied === `family:${font.id}`}
          onCopy={() => onCopy(`family:${font.id}`, `var(${font.cssVariable})`)}
        />
        <CopyRow
          label="Import Next.js"
          value={font.nextImport}
          copied={lastCopied === `import:${font.id}`}
          onCopy={() => onCopy(`import:${font.id}`, font.nextImport)}
        />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne copiable                                                     */
/* ------------------------------------------------------------------ */

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  readonly label: string;
  readonly value: string;
  readonly copied: boolean;
  readonly onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-background/40 px-2 py-1.5">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/90">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copier ${label}`}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          copied && "text-chart-4",
        )}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}
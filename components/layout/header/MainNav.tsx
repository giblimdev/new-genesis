/*
path :           components/layout/header/MainNav.tsx
projectId:       new-genesis
type :           component
generic:         true

role:            Navigation principale desktop. Reçoit les items + le
                 rôle de l'utilisateur courant par props. Filtre les
                 items selon `visible` ET `roles` (un item avec
                 roles: ["admin"] n'est rendu que si userRole vaut
                 "admin"). La lecture de usePathname() est isolée dans
                 NavActiveLink (sous Suspense) — obligatoire avec
                 Cache Components sur les routes dynamiques, sinon le
                 prérendu bloque.

flow:            Client Component → useMemo(filtre + tri des items
                 selon userRole) → NavItemRow (statique) → chaque lien
                 sous <Suspense><NavActiveLink /></Suspense> pour
                 l'état actif ; sous-menu si children.

ecosystem:       Layout = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/components/layout/footer/Footer.tsx",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/NavActiveLink.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                 ]

relatedFiles:    ["@/components/layout/header/navTypes.ts",
                  "@/components/layout/header/NavActiveLink.tsx",
                  "@/utils/path.ts",
                  "@/components/layout/header/Header.tsx"]

imports:         ["react", "next/link", "lucide-react",
                  "@/components/layout/header/navTypes",
                  "@/components/layout/header/NavActiveLink"]

exports:         ["default MainNav", "MainNavProps"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant que développeur je veux une nav desktop paramétrable"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useMemo + interactions au survol/clavier.

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";

import type { NavItem } from "./navTypes";
import { NavActiveLink } from "./NavActiveLink";

/* ------------------------------------------------------------------ */
/*  Helpers de style                                                   */
/* ------------------------------------------------------------------ */

const LINK_BASE =
  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const LINK_INACTIVE = `${LINK_BASE} text-muted-foreground hover:bg-muted hover:text-foreground`;

const LINK_ACTIVE = `${LINK_BASE} bg-primary/10 text-primary`;

const SUB_LINK_BASE =
  "flex items-start gap-2 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const SUB_LINK_INACTIVE = `${SUB_LINK_BASE} text-foreground hover:bg-muted`;

const SUB_LINK_ACTIVE = `${SUB_LINK_BASE} bg-primary/10 text-primary`;

/* ------------------------------------------------------------------ */
/*  Filtrage par rôle                                                  */
/* ------------------------------------------------------------------ */

function canSee(item: NavItem, userRole: string | null | undefined): boolean {
  /* 1. Filtre `visible` */
  if (item.visible === false) return false;
  /* 2. Aucune restriction de rôle → visible pour tous */
  if (!item.roles) return true;
  /* 3. Restriction de rôle → utilisateur connecté requis */
  if (!userRole) return false;
  /* 4. Vérifier que le rôle de l'utilisateur est autorisé */
  return item.roles.includes(userRole as never);
}

/* ------------------------------------------------------------------ */
/*  Fallback : lien neutre (prérendu)                                  */
/* ------------------------------------------------------------------ */

function NeutralLink({ item }: { readonly item: NavItem }) {
  if (!item.href) {
    return (
      <button type="button" className={LINK_INACTIVE} disabled={item.disabled}>
        {item.label}
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={LINK_INACTIVE}
    >
      {item.label}
      {item.external && (
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
      )}
    </Link>
  );
}

function NeutralSubLink({ child }: { readonly child: NavItem }) {
  return (
    <Link
      href={child.href!}
      target={child.external ? "_blank" : undefined}
      rel={child.external ? "noopener noreferrer" : undefined}
      className={SUB_LINK_INACTIVE}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{child.label}</span>
        {child.description && (
          <span className="text-xs text-muted-foreground">
            {child.description}
          </span>
        )}
      </span>
      {child.external && (
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-60" aria-hidden />
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-menu (statique — chaque lien actif sous Suspense)             */
/* ------------------------------------------------------------------ */

interface ChildrenListProps {
  readonly children: readonly NavItem[];
}

function ChildrenList({ children }: ChildrenListProps) {
  return (
    <ul
      role="menu"
      className="invisible absolute left-0 top-full z-50 mt-1 min-w-[220px] translate-y-1 rounded-lg border border-border bg-popover p-1.5 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
    >
      {children.map((child) => (
        <li key={child.id} role="none">
          {child.href ? (
            <Suspense fallback={<NeutralSubLink child={child} />}>
              <NavActiveLink
                href={child.href}
                external={child.external}
                classNameInactive={SUB_LINK_INACTIVE}
                classNameActive={SUB_LINK_ACTIVE}
                role="menuitem"
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium">{child.label}</span>
                  {child.description && (
                    <span className="text-xs text-muted-foreground">
                      {child.description}
                    </span>
                  )}
                </span>
                {child.external && (
                  <ExternalLink
                    className="mt-0.5 h-3 w-3 shrink-0 opacity-60"
                    aria-hidden
                  />
                )}
              </NavActiveLink>
            </Suspense>
          ) : (
            <span className="block rounded-md px-2.5 py-2 text-sm text-muted-foreground">
              {child.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne d'item (statique + slot Suspense pour le point actif)        */
/* ------------------------------------------------------------------ */

interface NavItemRowProps {
  readonly item: NavItem;
}

function NavItemRow({ item }: NavItemRowProps) {
  const sortedChildren = useMemo(() => {
    if (!item.children) return [];
    return [...item.children]
      .filter((child) => child.visible !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [item.children]);

  const hasChildren = sortedChildren.length > 0;

  return (
    <li className={hasChildren ? "group relative" : "relative"}>
      {item.href ? (
        <Suspense fallback={<NeutralLink item={item} />}>
          <NavActiveLink
            href={item.href}
            external={item.external}
            classNameInactive={LINK_INACTIVE}
            classNameActive={LINK_ACTIVE}
          >
            {item.label}
            {item.external && (
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
            )}
            {hasChildren && (
              <ChevronDown
                className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180"
                aria-hidden
              />
            )}
          </NavActiveLink>
        </Suspense>
      ) : (
        <button
          type="button"
          className={LINK_INACTIVE}
          disabled={item.disabled}
          aria-haspopup={hasChildren ? "menu" : undefined}
        >
          {item.label}
          {hasChildren && (
            <ChevronDown
              className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180"
              aria-hidden
            />
          )}
        </button>
      )}

      {hasChildren && <ChildrenList children={sortedChildren} />}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export type MainNavProps = {
  /** Items à afficher. Obligatoire : la source est décidée par l'appelant. */
  readonly items: readonly NavItem[];
  /** Rôle de l'utilisateur courant (null = anonyme). Filtrage `roles`. */
  readonly userRole?: string | null;
};

export default function MainNav({ items, userRole }: MainNavProps) {
  const sortedItems = useMemo(
    () =>
      [...items]
        .filter((item) => canSee(item, userRole))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [items, userRole],
  );

  return (
    <nav aria-label="Navigation principale" className="hidden md:block">
      <ul className="flex items-center gap-0.5">
        {sortedItems.map((item) => (
          <NavItemRow key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
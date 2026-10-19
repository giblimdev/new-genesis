/*
path :           components/layout/header/Header.tsx
tag :            ["layout", "header", "navigation", "slot", "ui"]
projectId:       new-genesis
type :           component
generic:         false

role:            En-tête global. Composant CLIENT (useState pour le
                 menu mobile). Il ne monte PLUS NotificationBell
                 directement (impossible : un Client Component ne peut
                 pas importer un Server Component async). À la place,
                 le layout serveur (app/layout.tsx) monte la cloche
                 sous Suspense et la passe dans la prop
                 `notificationSlot`. Header la place simplement dans la
                 zone droite.

flow:            Client Component → useState(mobileOpen) → rend
                 <header> sticky → zone droite : {notificationSlot}
                 + <UserMenu /> + burger mobile → panneau mobile.

ecosystem:       Layout = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/components/layout/footer/Footer.tsx",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                 ]

relatedFiles:    ["@/components/layout/header/Logo.tsx",
                  "@/components/layout/header/MainNav.tsx",
                  "@/components/layout/header/UserMenu.tsx",
                  "@/components/layout/header/nav/frontWorkSpace.ts",
                  "@/components/layout/header/navTypes.ts",
                  "@/app/blog/components/NotificationBell.tsx",
                  "@/app/layout.tsx"]

imports:         ["react", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/components/layout/header/Logo",
                  "@/components/layout/header/MainNav",
                  "@/components/layout/header/UserMenu",
                  "@/components/layout/header/nav/frontWorkSpace",
                  "@/components/layout/header/navTypes"]

exports:         ["default Header", "HeaderProps"]

useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant que développeur je veux un header avec menu desktop et mobile",
                  "us5100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState (mobileOpen) + interactions burger.

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/header/Logo";
import MainNav from "@/components/layout/header/MainNav";
import UserMenu from "@/components/layout/header/UserMenu";
import { mainNavData } from "@/components/layout/header/nav/frontWorkSpace";
import type { NavItem } from "@/components/layout/header/navTypes";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface HeaderProps {
  /**
   * Slot optionnel rendu côté serveur (Server Component async) — par
   * exemple <NotificationBell />. Monté sous Suspense par app/layout.tsx
   * pour éviter d'évaluer du code serveur dans le bundle client.
   */
  readonly notificationSlot?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Fallback de la nav                                                 */
/* ------------------------------------------------------------------ */

function MainNavFallback() {
  return <div className="hidden h-9 w-64 md:block" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/*  Groupe mobile (item avec children)                                 */
/* ------------------------------------------------------------------ */

interface MobileGroupProps {
  readonly item: NavItem;
  readonly onNavigate: () => void;
}

function MobileGroup({ item, onNavigate }: MobileGroupProps) {
  const children = (item.children ?? [])
    .filter((child) => child.visible !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex flex-col">
      <span className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {item.label}
      </span>
      <ul className="flex flex-col gap-0.5">
        {children.map((child) => (
          <li key={child.id}>
            {child.href ? (
              <Link
                href={child.href}
                onClick={onNavigate}
                target={child.external ? "_blank" : undefined}
                rel={child.external ? "noopener noreferrer" : undefined}
                className="flex flex-col gap-0.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium text-foreground">
                  {child.label}
                </span>
                {child.description && (
                  <span className="text-xs text-muted-foreground">
                    {child.description}
                  </span>
                )}
              </Link>
            ) : (
              <span className="block px-3 py-2 text-sm text-muted-foreground">
                {child.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export default function Header({ notificationSlot }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  const sortedItems = [...mainNavData]
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <MainNav items={sortedItems} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {notificationSlot}
          <UserMenu />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={toggleMobile}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-border/60 bg-background md:hidden"
        >
          <nav
            aria-label="Navigation mobile"
            className="mx-auto max-w-6xl px-4 py-4 sm:px-6"
          >
            <ul className="flex flex-col gap-1">
              {sortedItems.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <MobileGroup item={item} onNavigate={closeMobile} />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
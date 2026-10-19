/*
path :           app/layout.tsx
tag :            ["layout", "root", "fonts", "theme", "providers", "notification-slot", "user-role", "suspense", "io"]
projectId:       new-genesis
type :           layout
generic:         false

role:            Layout racine : html/body, polices, ThemeProvider,
                 TooltipProvider, Toaster, Header, Footer.

                 La lecture de la session (getSession + prisma.user.role)
                 est ISOLÉE dans un composant enfant `<HeaderWithRole>`
                 monté sous `<Suspense>`. La lecture du rôle Prisma est
                 elle-même isolée dans `<UserRoleReader>` sous un second
                 `<Suspense>`, car Prisma 7 lit `new Date()` de manière
                 synchrone (bug connu) — même derrière un `await io()`
                 placé après `getSession()`, le code de Prisma s'exécute
                 avant la résolution de la promesse de session et bloque
                 le prérendu.

flow:            RootLayout (sync) → html/body → ThemeProvider →
                 TooltipProvider →
                 <Suspense fallback={<HeaderFallback />}>
                   <HeaderWithRole />
                 </Suspense> →
                 {children} + Footer + Toaster.

                 HeaderWithRole → getSession() → si null : userRole null
                 → sinon : <Suspense fallback={<Header userRole={null} />}>
                   <UserRoleReader userId={session.user.id} />
                 </Suspense>.
                 UserRoleReader → await io() → prisma.user.findUnique
                 ({ role }) → userRole → <Header userRole={userRole}
                 notificationSlot={...} />.

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

relatedFiles:    ["@/app/globals.css",
                  "@/components/layout/footer/Footer.tsx",
                  "@/components/layout/header/Header.tsx",
                  "@/app/blog/components/NotificationBell.tsx",
                  "@/lib/auth/session.ts",
                  "@/lib/prisma.ts"]

imports:         ["next", "next/font/google", "next-themes", "react",
                  "next/cache",
                  "./globals.css",
                  "@/components/ui/tooltip",
                  "@/components/ui/sonner",
                  "@/components/layout/header/Header",
                  "@/components/layout/footer/Footer",
                  "@/app/blog/components/NotificationBell",
                  "@/lib/auth/session",
                  "@/lib/prisma"]

exports:         ["metadata", "default RootLayout"]

useBy:           []

userStories:     ["*en tant que développeur je veux un layout racine avec polices thémables",
                  "us5100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { io } from "next/cache";

import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import { NotificationBell } from "@/app/blog/components/NotificationBell";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Polices                                                            */
/* ------------------------------------------------------------------ */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: {
    default: "Genesis — Concevoir et développer votre projet numérique",
    template: "%s · Genesis",
  },
  description:
    "Genesis est l'atelier de conception et de développement pour toute l'équipe projet.",
  applicationName: "Genesis",
};

/* ------------------------------------------------------------------ */
/*  Fallbacks                                                          */
/* ------------------------------------------------------------------ */

function BellFallback() {
  return <div className="size-9" aria-hidden />;
}

function HeaderFallback() {
  return <Header userRole={null} />;
}

/* ------------------------------------------------------------------ */
/*  Lecture du rôle Prisma (isolée)                                   */
/* ------------------------------------------------------------------ */

async function UserRoleReader({ userId }: { readonly userId: string }) {
  /* io() force un point de suspension AVANT Prisma.
     Prisma 7 lit new Date() de manière synchrone dans son
     NowGenerator — sans ce point de suspension, Next.js
     bloque le prérendu. */
  await io();

  const role = (
    await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
  )?.role ?? "user";

  return (
    <Header
      userRole={role}
      notificationSlot={
        <Suspense fallback={<BellFallback />}>
          <NotificationBell />
        </Suspense>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Header avec rôle (Server Component async, sous Suspense)          */
/* ------------------------------------------------------------------ */

async function HeaderWithRole() {
  const session = await getSession();

  /* Anonyme : Header sans rôle, pas de cloche */
  if (!session?.user) {
    return <Header userRole={null} />;
  }

  /* Connecté : le rôle Prisma est lu dans un Suspense séparé,
     pour que Prisma ne bloque pas le prérendu de HeaderWithRole. */
  return (
    <Suspense fallback={<Header userRole={null} />}>
      <UserRoleReader userId={session.user.id} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense fallback={<HeaderFallback />}>
              <HeaderWithRole />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
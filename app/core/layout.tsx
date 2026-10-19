/*
path :           app/core/layout.tsx
tag :            ["help", "layout", "scrum"]
projectId:       new-genesis
type:            layout
generic:         false

role:            Layout commun au module Help. Fournit un conteneur avec fond
                 dégradé et une largeur maximale cohérente pour toutes les pages
                 du module (hub + sous-pages par flux).

flow:            Server Component → rend un wrapper <div> avec classes de fond et
                 centre le contenu dans un max-w-7xl.

ecosystem:       Help = [
                   "@/app/core/help/[flow]/epic/page.tsx",
                   "@/app/core/help/[flow]/feature/page.tsx",
                   "@/app/core/help/[flow]/global-json/page.tsx",
                   "@/app/core/help/[flow]/idee/page.tsx",
                   "@/app/core/help/[flow]/layout.tsx",
                   "@/app/core/help/[flow]/page.tsx",
                   "@/app/core/help/[flow]/persona/page.tsx",
                   "@/app/core/help/[flow]/sprint/page.tsx",
                   "@/app/core/help/[flow]/user-story/page.tsx",
                   "@/app/core/help/layout.tsx",
                   "@/app/core/help/page.tsx",
                 ]

relatedFiles:    ["@/app/core/help/page.tsx"]

imports:         []

exports:         ["default HelpLayout"]

useBy:           []

userStories:     ["*en tant que développeur je veux un layout commun au module Help"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
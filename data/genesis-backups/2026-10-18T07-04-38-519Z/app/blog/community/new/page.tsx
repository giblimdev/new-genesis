/*
path :           app/blog/community/new/page.tsx
tag :            ["blog", "page", "community", "create", "protected"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page de création d'un groupe. Sync page + Suspense ;
                 require session. Rend un formulaire client minimal
                 qui appelle createGroupAction(formData) et redirige
                 vers la page du groupe créé.

flow:            NewGroupPage → Suspense → NewGroupSection →
                 getBlogSession → si null : message login →
                 <NewGroupForm /> (Client Component).

ecosystem:       Blog = [
                   ... (identique à [slug]/page.tsx)
                 ]

relatedFiles:    ["@/app/blog/lib/actions/group.ts",
                  "@/app/blog/lib/session.ts"]

imports:         ["react", "next/link", "lucide-react",
                  "@/app/blog/lib/session",
                  "@/app/blog/components/NewGroupForm",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["default BlogCommunityNewPage"]

useBy:           []

userStories:     ["us3100001"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getBlogSession } from "@/app/blog/lib/session";
import { NewGroupForm } from "@/app/blog/components/NewGroupForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogCommunityNewPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-2">
          Communauté
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Créer un groupe
        </h1>
      </header>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <NewGroupSection />
      </Suspense>
    </div>
  );
}

async function NewGroupSection() {
  const session = await getBlogSession();
  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour créer un groupe.
        </p>
        <Button
          render={<Link href="/core/auth/login" />}
          className="mt-4 gap-2"
        >
          Se connecter
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }
  return <NewGroupForm />;
}
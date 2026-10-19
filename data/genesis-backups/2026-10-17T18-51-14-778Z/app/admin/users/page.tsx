/*
path :           app/admin/users/page.tsx
tag :            ["admin", "users", "page", "read", "update", "role"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page d'administration des utilisateurs. Affiche la
                 liste des utilisateurs (id, nom, email, rôle actuel,
                 date de création) et permet à un administrateur de
                 modifier le rôle d'un utilisateur (user / admin) via
                 une Server Action qui met à jour le champ `role` du
                 modèle Prisma User. Réservé aux administrateurs :
                 vérification via la session + le champ `role` de
                 l'utilisateur courant.

flow:            AdminUsersPage (sync) → Suspense → UsersSection async
                 → getBlogSession() → si null : login requis → si
                 session.user.role !== "admin" : accès refusé →
                 prisma.user.findMany (sélection id, name, email, role,
                 createdAt) → rend tableau responsive + composant
                 client RoleSelect par ligne → submit → Server Action
                 updateUserRoleAction(userId, role) → revalidatePath.

ecosystem:       Admin = [
                   "@/app/admin/users/page.tsx",
                 ]

relatedFiles:    ["@/lib/prisma.ts",
                  "@/lib/auth/session.ts",
                  "@/app/blog/lib/admin.ts"]

imports:         ["react", "next/navigation", "lucide-react",
                  "@/lib/prisma",
                  "@/lib/auth/session",
                  "@/components/ui/button",
                  "@/components/ui/skeleton",
                  "@/app/admin/users/RoleSelect"]

exports:         ["default AdminUsersPage"]

useBy:           []

userStories:     ["*en tant qu'administrateur je veux gérer les utilisateurs et leurs rôles"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSelect } from "@/app/admin/users/RoleSelect";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
            Administration
          </p>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Users className="size-5 text-chart-1" aria-hidden />
            Utilisateurs
          </h1>
        </div>
      </header>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersSection />
      </Suspense>
    </div>
  );
}

async function UsersSection() {
  const session = await getSession();
  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour accéder à la gestion des utilisateurs.
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

  /* Vérification du rôle admin : le champ role est exposé par Better Auth
     si le plugin admin est activé. On tolère aussi l'absence de champ. */
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "admin") {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <Shield className="mx-auto mb-2 size-8 text-destructive" aria-hidden />
        <p className="text-sm text-destructive">
          Accès réservé aux administrateurs.
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <table className="w-full">
        <thead className="border-b border-border/60 bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nom
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rôle
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Inscrit le
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border/40 last:border-b-0"
            >
              <td className="px-4 py-3 text-sm text-foreground">
                {user.name}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {user.email}
              </td>
              <td className="px-4 py-3">
                <RoleSelect
                  userId={user.id}
                  currentRole={user.role ?? "user"}
                />
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Aucun utilisateur en base.
        </p>
      )}
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
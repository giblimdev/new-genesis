/*
path :           app/admin/users/RoleSelect.tsx
tag :            ["admin", "users", "role", "select", "client", "update"]
projectId:       new-genesis
type :           component
generic:         false

role:            Sélecteur de rôle pour un utilisateur. Affiche un
                 <select> avec les valeurs "user" et "admin". Au
                 changement, appelle la Server Action
                 updateUserRoleAction(userId, role) puis affiche un
                 toast et rafraîchit la page (router.refresh). Désactivé
                 pendant la mutation. Affiche un badge de rôle actuel.

flow:            Props { userId, currentRole } → useState(role) →
                 onChange → startTransition → updateUserRoleAction →
                 succès : toast + router.refresh() → erreur : rollback
                 + toast.

ecosystem:       Admin = [
                   "@/app/admin/users/page.tsx",
                   "@/app/admin/users/RoleSelect.tsx",
                 ]

relatedFiles:    ["@/app/admin/users/actions.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/admin/users/actions",
                  "@/components/ui/native-select"]

exports:         ["RoleSelect", "RoleSelectProps"]

useBy:           ["@/app/admin/users/page.tsx"]

userStories:     ["*en tant qu'administrateur je veux changer le rôle d'un utilisateur"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useTransition, router.refresh, toast.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateUserRoleAction } from "@/app/admin/users/actions";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export interface RoleSelectProps {
  readonly userId: string;
  readonly currentRole: string;
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextRole: string) {
    const previous = role;
    setRole(nextRole);

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, nextRole);
      if (!result.ok) {
        setRole(previous);
        toast.error(result.error);
        return;
      }
      toast.success(`Rôle mis à jour : ${nextRole}.`);
      router.refresh();
    });
  }

  return (
    <NativeSelect
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="w-32"
      aria-label="Rôle de l'utilisateur"
    >
      <NativeSelectOption value="user">Utilisateur</NativeSelectOption>
      <NativeSelectOption value="admin">Administrateur</NativeSelectOption>
    </NativeSelect>
  );
}
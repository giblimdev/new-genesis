/*
path :           app/core/components/scrum/SprintForm.tsx
tag :            ["scrum", "sprint", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'un sprint Scrum. Utilise
                 react-hook-form + zodResolver(sprintInputSchema). Structure
                 3 zones : corps scrollable + footer sticky. Le champ goal est
                 une textarea capée (max-h-56). Les champs startDate/endDate
                 restent en grille sm:grid-cols-2.

flow:            useForm → handleSubmit → FormData → onSubmit(formData).
                 storyIds séparés par des virgules.

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
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/components/scrum/SprintList.tsx"]

imports:         ["react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["SprintForm", "SprintFormProps"]

useBy:           ["@/app/core/components/scrum/SprintList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer un sprint Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useForm, interactions utilisateur.

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import type { Sprint } from "@/app/core/lib/scrum/types";
import {
  sprintInputSchema,
  type SprintInput,
} from "@/app/core/lib/scrum/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface SprintFormProps {
  readonly defaultValues?: Sprint;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

export function SprintForm({
  defaultValues,
  onSubmit,
  pending = false,
}: SprintFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintInput>({
    resolver: zodResolver(sprintInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      goal: defaultValues?.goal ?? "",
      storyIds: defaultValues?.storyIds ? [...defaultValues.storyIds] : [],
      startDate: defaultValues?.startDate ?? "",
      endDate: defaultValues?.endDate ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: SprintInput) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("goal", values.goal);
    formData.set("storyIds", (values.storyIds ?? []).join(","));
    formData.set("startDate", values.startDate ?? "");
    formData.set("endDate", values.endDate ?? "");
    void onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex min-h-0 flex-1 flex-col gap-5"
      noValidate
    >
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <Field data-invalid={errors.name ? "" : undefined}>
          <FieldLabel htmlFor="sprint-name">Nom</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                id="sprint-name"
                placeholder="Ex: Sprint 1 — MVP"
                aria-invalid={errors.name ? true : undefined}
              />
            )}
          />
          {errors.name?.message && (
            <FieldError errors={[{ message: errors.name.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.goal ? "" : undefined}>
          <FieldLabel htmlFor="sprint-goal">Objectif</FieldLabel>
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <Textarea
                {...field}
                id="sprint-goal"
                rows={4}
                placeholder="Quel est l'objectif de ce sprint ?"
                aria-invalid={errors.goal ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.goal?.message && (
            <FieldError errors={[{ message: errors.goal.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.storyIds ? "" : undefined}>
          <FieldLabel htmlFor="sprint-stories">
            User stories (ids séparés par des virgules)
          </FieldLabel>
          <Controller
            control={control}
            name="storyIds"
            render={({ field }) => (
              <Input
                id="sprint-stories"
                value={(field.value ?? []).join(", ")}
                onChange={(e) =>
                  field.onChange(
                    e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  )
                }
                onBlur={field.onBlur}
                placeholder="Id 1, Id 2"
                aria-invalid={errors.storyIds ? true : undefined}
              />
            )}
          />
          {errors.storyIds?.message && (
            <FieldError errors={[{ message: errors.storyIds.message }]} />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field data-invalid={errors.startDate ? "" : undefined}>
            <FieldLabel htmlFor="sprint-start">Début (optionnel)</FieldLabel>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="sprint-start"
                  type="date"
                  aria-invalid={errors.startDate ? true : undefined}
                />
              )}
            />
            {errors.startDate?.message && (
              <FieldError errors={[{ message: errors.startDate.message }]} />
            )}
          </Field>

          <Field data-invalid={errors.endDate ? "" : undefined}>
            <FieldLabel htmlFor="sprint-end">Fin (optionnel)</FieldLabel>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="sprint-end"
                  type="date"
                  aria-invalid={errors.endDate ? true : undefined}
                />
              )}
            />
            {errors.endDate?.message && (
              <FieldError errors={[{ message: errors.endDate.message }]} />
            )}
          </Field>
        </div>
      </div>

      <div className="flex shrink-0 justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
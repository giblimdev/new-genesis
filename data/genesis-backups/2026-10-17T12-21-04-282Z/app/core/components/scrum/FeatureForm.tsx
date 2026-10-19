/*
path :           app/core/components/scrum/FeatureForm.tsx
tag :            ["scrum", "feature", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'une feature Scrum. Utilise
                 react-hook-form + zodResolver(featureInputSchema). Rend les champs
                 title, description, interest, personas. Soumet via onSubmit
                 (FormData).

flow:            useForm({ resolver: zodResolver(featureInputSchema) }) → handleSubmit
                 → construit un FormData → appelle onSubmit(formData). Personas saisis
                 en texte séparé par des virgules, converti en tableau.

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
                  "@/app/core/components/scrum/FeatureList.tsx"]

imports:         ["react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["FeatureForm", "FeatureFormProps"]

useBy:           ["@/app/core/components/scrum/FeatureList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer une feature Scrum"]

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

import type { Feature } from "@/app/core/lib/scrum/types";
import {
  featureInputSchema,
  type FeatureInput,
} from "@/app/core/lib/scrum/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface FeatureFormProps {
  readonly defaultValues?: Feature;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function FeatureForm({
  defaultValues,
  onSubmit,
  pending = false,
}: FeatureFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeatureInput>({
    resolver: zodResolver(featureInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      interest: defaultValues?.interest ?? "",
      personas: defaultValues?.personas ? [...defaultValues.personas] : [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: FeatureInput) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("interest", values.interest);
    formData.set("personas", (values.personas ?? []).join(","));
    void onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {/* Titre */}
      <Field data-invalid={errors.title ? "" : undefined}>
        <FieldLabel htmlFor="feature-title">Titre</FieldLabel>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              {...field}
              id="feature-title"
              placeholder="Ex: Notifications en temps réel"
              aria-invalid={errors.title ? true : undefined}
            />
          )}
        />
        {errors.title?.message && (
          <FieldError errors={[{ message: errors.title.message }]} />
        )}
      </Field>

      {/* Description */}
      <Field data-invalid={errors.description ? "" : undefined}>
        <FieldLabel htmlFor="feature-description">Description</FieldLabel>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              {...field}
              id="feature-description"
              rows={4}
              placeholder="Que fait cette feature ?"
              aria-invalid={errors.description ? true : undefined}
            />
          )}
        />
        {errors.description?.message && (
          <FieldError errors={[{ message: errors.description.message }]} />
        )}
      </Field>

      {/* Intérêt */}
      <Field data-invalid={errors.interest ? "" : undefined}>
        <FieldLabel htmlFor="feature-interest">Intérêt</FieldLabel>
        <Controller
          control={control}
          name="interest"
          render={({ field }) => (
            <Textarea
              {...field}
              id="feature-interest"
              rows={3}
              placeholder="Quelle valeur apporte-t-elle ? À qui ?"
              aria-invalid={errors.interest ? true : undefined}
            />
          )}
        />
        {errors.interest?.message && (
          <FieldError errors={[{ message: errors.interest.message }]} />
        )}
      </Field>

      {/* Personas */}
      <Field data-invalid={errors.personas ? "" : undefined}>
        <FieldLabel htmlFor="feature-personas">
          Personas (séparés par des virgules)
        </FieldLabel>
        <Controller
          control={control}
          name="personas"
          render={({ field }) => (
            <Input
              id="feature-personas"
              value={(field.value ?? []).join(", ")}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
              onBlur={field.onBlur}
              placeholder="Ex: Développeur, Manager"
              aria-invalid={errors.personas ? true : undefined}
            />
          )}
        />
        {errors.personas?.message && (
          <FieldError errors={[{ message: errors.personas.message }]} />
        )}
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
/*
path :           components/scrum/IdeeForm.tsx
tag :            ["scrum", "idee", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'une idée Scrum. Utilise
                 react-hook-form + zodResolver(ideeInputSchema). Rend les champs
                 title, problem, hypotheses, context. Soumet via onSubmit (FormData).

flow:            useForm({ resolver: zodResolver(ideeInputSchema) }) → handleSubmit →
                 construit un FormData → appelle onSubmit(formData). Affiche les
                 erreurs de validation sous chaque champ.

ecosystem:       ScrumUI = [
                   "@/components/scrum/EpicCard.tsx",
                   "@/components/scrum/EpicForm.tsx",
                   "@/components/scrum/EpicList.tsx",
                   "@/components/scrum/FeatureCard.tsx",
                   "@/components/scrum/FeatureForm.tsx",
                   "@/components/scrum/FeatureList.tsx",
                   "@/components/scrum/FlowSelector.tsx",
                   "@/components/scrum/GlobalJsonExport.tsx",
                   "@/components/scrum/IdeeCard.tsx",
                   "@/components/scrum/IdeeForm.tsx",
                   "@/components/scrum/IdeeList.tsx",
                   "@/components/scrum/PersonaCard.tsx",
                   "@/components/scrum/PersonaForm.tsx",
                   "@/components/scrum/PersonaList.tsx",
                   "@/components/scrum/ScrumNav.tsx",
                   "@/components/scrum/SprintCard.tsx",
                   "@/components/scrum/SprintForm.tsx",
                   "@/components/scrum/SprintList.tsx",
                   "@/components/scrum/UserStoryCard.tsx",
                   "@/components/scrum/UserStoryForm.tsx",
                   "@/components/scrum/UserStoryList.tsx",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/components/scrum/IdeeList.tsx"]

imports:         ["react", "react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["IdeeForm", "IdeeFormProps"]

useBy:           ["@/components/scrum/IdeeList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer une idée Scrum"]

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

import type { Idee } from "@/app/core/lib/scrum/types";
import {
  ideeInputSchema,
  type IdeeInput,
} from "@/app/core/lib/scrum/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface IdeeFormProps {
  readonly defaultValues?: Idee;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function IdeeForm({
  defaultValues,
  onSubmit,
  pending = false,
}: IdeeFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IdeeInput>({
    resolver: zodResolver(ideeInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      problem: defaultValues?.problem ?? "",
      hypotheses: defaultValues?.hypotheses ?? "",
      context: defaultValues?.context ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: IdeeInput) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("problem", values.problem);
    formData.set("hypotheses", values.hypotheses);
    formData.set("context", values.context ?? "");
    void onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {/* Titre */}
      <Field data-invalid={errors.title ? "" : undefined}>
        <FieldLabel htmlFor="idee-title">Titre</FieldLabel>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              {...field}
              id="idee-title"
              placeholder="Ex: Améliorer l'onboarding"
              aria-invalid={errors.title ? true : undefined}
            />
          )}
        />
        {errors.title?.message && (
          <FieldError errors={[{ message: errors.title.message }]} />
        )}
      </Field>

      {/* Problème */}
      <Field data-invalid={errors.problem ? "" : undefined}>
        <FieldLabel htmlFor="idee-problem">Problème</FieldLabel>
        <Controller
          control={control}
          name="problem"
          render={({ field }) => (
            <Textarea
              {...field}
              id="idee-problem"
              rows={4}
              placeholder="Quel problème cherche-t-on à résoudre ?"
              aria-invalid={errors.problem ? true : undefined}
            />
          )}
        />
        {errors.problem?.message && (
          <FieldError errors={[{ message: errors.problem.message }]} />
        )}
      </Field>

      {/* Hypothèses */}
      <Field data-invalid={errors.hypotheses ? "" : undefined}>
        <FieldLabel htmlFor="idee-hypotheses">Hypothèses</FieldLabel>
        <Controller
          control={control}
          name="hypotheses"
          render={({ field }) => (
            <Textarea
              {...field}
              id="idee-hypotheses"
              rows={4}
              placeholder="Quelles hypothèses sous-tendent ce problème ?"
              aria-invalid={errors.hypotheses ? true : undefined}
            />
          )}
        />
        {errors.hypotheses?.message && (
          <FieldError errors={[{ message: errors.hypotheses.message }]} />
        )}
      </Field>

      {/* Contexte (optionnel) */}
      <Field data-invalid={errors.context ? "" : undefined}>
        <FieldLabel htmlFor="idee-context">Contexte (optionnel)</FieldLabel>
        <Controller
          control={control}
          name="context"
          render={({ field }) => (
            <Textarea
              {...field}
              id="idee-context"
              rows={2}
              placeholder="Source, contexte, remarques…"
              aria-invalid={errors.context ? true : undefined}
            />
          )}
        />
        {errors.context?.message && (
          <FieldError errors={[{ message: errors.context.message }]} />
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
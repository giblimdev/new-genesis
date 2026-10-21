/*
path :           app/core/auth/register/RegisterForm.tsx
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire d'inscription : avatar (via <AvatarPicker />),
                 nom, email, mot de passe avec indicateur de force,
                 confirmation. L'image est lue par AvatarPicker via
                 FileReader.readAsDataURL() et transmise à BetterAuth
                 sous forme de data URL base64. Le composant avatar est
                 désormais MUTUALISÉ avec /user/profile (même UX, même
                 validation, même rendu).

flow:            Client Component → useForm + zodResolver(registerSchema)
                 → <Controller name="image"> rend <AvatarPicker> →
                 onSubmit appelle signUp.email() → si erreur
                 USER_ALREADY_EXISTS/422 : setError sur email ; si 429 :
                 formError ; sinon : formError → si succès : toast +
                 router.replace(callbackUrl) + router.refresh().

ecosystem:       Auth = [
                   "@/app/core/api/auth/[...all]/route.ts",
                   "@/app/core/auth/layout.tsx",
                   "@/app/core/auth/login/LoginForm.tsx",
                   "@/app/core/auth/login/page.tsx",
                   "@/app/core/auth/register/RegisterForm.tsx",
                   "@/app/core/auth/register/page.tsx",
                   "@/app/core/auth/welcome/page.tsx",
                   "@/components/auth/PasswordInput.tsx",
                   "@/components/auth/PasswordStrength.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/validations/auth.ts",
                 ]

relatedFiles:    ["@/app/core/auth/register/page.tsx",
                  "@/components/auth/PasswordInput.tsx",
                  "@/components/auth/PasswordStrength.tsx",
                  "@/components/user/AvatarPicker.tsx",
                  "@/lib/auth/auth-client.ts",
                  "@/lib/validations/auth.ts",
                  "@/components/ui/alert.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/field.tsx",
                  "@/components/ui/input.tsx"]

imports:         ["react", "next/link", "next/navigation",
                  "react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react", "sonner",
                  "@/components/ui/alert",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/auth/PasswordInput",
                  "@/components/auth/PasswordStrength",
                  "@/components/user/AvatarPicker",
                  "@/lib/auth/auth-client",
                  "@/lib/validations/auth"]

exports:         ["RegisterForm", "RegisterFormProps"]

useBy:           ["@/app/core/auth/register/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer un compte avec mon email",
                  "*en tant qu'utilisateur je veux choisir et prévisualiser mon avatar"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useEffect, useForm, useRouter, toast.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { AvatarPicker } from "@/components/user/AvatarPicker";
import { signUp } from "@/lib/auth/auth-client";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface RegisterFormProps {
  readonly callbackUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    trigger,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      image: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  /* Valeurs observées en direct (uniquement celles encore nécessaires) */
  const watchedName = useWatch({ control, name: "name" });
  const watchedPassword = useWatch({ control, name: "password" });
  const watchedConfirm = useWatch({ control, name: "confirmPassword" });

  /* Confirmation visuelle */
  const passwordsMatch =
    watchedConfirm.length > 0 && watchedPassword === watchedConfirm;

  /* Revalide la confirmation en direct quand l'un des deux change */
  useEffect(() => {
    if (watchedConfirm) {
      void trigger("confirmPassword");
    }
  }, [watchedPassword, watchedConfirm, trigger]);

  const isPending = isSubmitting || redirecting;

  /* ---------------------------------------------------------------- */
  /*  Submit                                                           */
  /* ---------------------------------------------------------------- */

  async function onSubmit(values: RegisterInput) {
    setFormError(null);

    try {
      const { error } = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        ...(values.image ? { image: values.image } : {}),
      });

      if (error) {
        if (
          error.code?.startsWith("USER_ALREADY_EXISTS") ||
          error.status === 422
        ) {
          setError("email", {
            message: "Un compte existe déjà avec cet email.",
          });
        } else if (error.status === 429) {
          setFormError("Trop de tentatives. Réessayez dans un instant.");
        } else {
          setFormError(error.message ?? "Inscription impossible. Réessayez.");
        }
        return;
      }

      setRedirecting(true);
      toast.success("Compte créé, bienvenue !");
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setFormError(
        "Impossible de joindre le serveur. Vérifiez votre connexion.",
      );
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Rendu                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-chart-1/5 sm:p-8">
      {/* En-tête */}
      <div className="mb-8 space-y-3">
        <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-2 text-white shadow-lg shadow-chart-2/30">
          <UserPlus className="size-5" aria-hidden />
        </span>
        <h1 className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Rejoignez Genesis
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte pour commencer à structurer vos projets.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" aria-hidden />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* ---------------------------------------------------------- */}
        {/*  AVATAR — composant mutualisé avec /user/profile            */}
        {/* ---------------------------------------------------------- */}
        <Field data-invalid={errors.image ? "" : undefined}>
          <FieldLabel>Photo de profil</FieldLabel>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <AvatarPicker
                value={field.value ?? ""}
                onChange={field.onChange}
                name={watchedName}
                disabled={isPending}
              />
            )}
          />
          {errors.image?.message && (
            <FieldError errors={[{ message: errors.image.message }]} />
          )}
        </Field>

        {/* ---------------------------------------------------------- */}
        {/*  NOM                                                        */}
        {/* ---------------------------------------------------------- */}
        <Field data-invalid={errors.name ? "" : undefined}>
          <FieldLabel htmlFor="register-name">Nom affiché</FieldLabel>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="register-name"
                  autoComplete="name"
                  placeholder="Votre nom ou pseudo"
                  className="h-11 pl-10"
                  aria-invalid={errors.name ? true : undefined}
                />
              )}
            />
          </div>
          {errors.name?.message && (
            <FieldError errors={[{ message: errors.name.message }]} />
          )}
        </Field>

        {/* ---------------------------------------------------------- */}
        {/*  EMAIL                                                      */}
        {/* ---------------------------------------------------------- */}
        <Field data-invalid={errors.email ? "" : undefined}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="register-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className="h-11 pl-10"
                  aria-invalid={errors.email ? true : undefined}
                />
              )}
            />
          </div>
          {errors.email?.message && (
            <FieldError errors={[{ message: errors.email.message }]} />
          )}
        </Field>

        {/* ---------------------------------------------------------- */}
        {/*  MOT DE PASSE + INDICATEUR                                  */}
        {/* ---------------------------------------------------------- */}
        <Field data-invalid={errors.password ? "" : undefined}>
          <FieldLabel htmlFor="register-password">Mot de passe</FieldLabel>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="register-password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                aria-invalid={errors.password ? true : undefined}
              />
            )}
          />
          <PasswordStrength value={watchedPassword} />
          {errors.password?.message && (
            <FieldError errors={[{ message: errors.password.message }]} />
          )}
        </Field>

        {/* ---------------------------------------------------------- */}
        {/*  CONFIRMATION                                               */}
        {/* ---------------------------------------------------------- */}
        <Field data-invalid={errors.confirmPassword ? "" : undefined}>
          <FieldLabel htmlFor="register-confirm">
            Confirmer le mot de passe
          </FieldLabel>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="register-confirm"
                autoComplete="new-password"
                placeholder="Saisissez-le à nouveau"
                aria-invalid={errors.confirmPassword ? true : undefined}
              />
            )}
          />

          {passwordsMatch && (
            <p className="flex items-center gap-1.5 text-xs text-chart-4">
              <Check className="size-3.5" aria-hidden />
              Les mots de passe correspondent
            </p>
          )}

          {errors.confirmPassword?.message && (
            <FieldError
              errors={[{ message: errors.confirmPassword.message }]}
            />
          )}
        </Field>

        {/* ---------------------------------------------------------- */}
        {/*  SUBMIT                                                     */}
        {/* ---------------------------------------------------------- */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full gap-2 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 text-base font-semibold text-white shadow-lg shadow-chart-2/25 transition hover:brightness-110 disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Création du compte…
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link
          href="/core/auth/login"
          className="font-semibold text-chart-1 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
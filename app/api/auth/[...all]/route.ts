/*
path :           app/core/api/auth/[...all]/route.ts
projectId:       new-genesis
type:            route
generic:         false

role:            Route catch-all pour Better Auth : gère /api/auth/*. Toutes les requêtes
                 HTTP du domaine Auth (login, register, session, OAuth, reset password)
                 sont déléguées au handler Better Auth via toNextJsHandler.
flow:            Requête GET ou POST sur /api/auth/* → toNextJsHandler(auth) → Better Auth
                 traite la requête selon sa configuration interne → réponse HTTP.
ecosystem:       Auth = [
                   "@/app/core/api/auth/[...all]/route.ts",
                   "@/app/core/auth/login/LoginForm.tsx",
                   "@/app/core/auth/login/page.tsx",
                   "@/app/core/auth/register/RegisterForm.tsx",
                   "@/app/core/auth/register/page.tsx",
                   "@/components/auth/PasswordInput.tsx",
                   "@/components/auth/PasswordStrength.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles:    ["@/lib/auth/auth.ts"]
imports:         ["@/lib/auth/auth",
                  "better-auth/next-js"]
exports:         ["GET", "POST"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux que l'authentification soit exposée côté HTTP"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

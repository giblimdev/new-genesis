/*
path :           lib/validations/auth.ts
tag :            ["auth", "validation", "zod", "password", "generic"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour l'authentification : inscription, connexion,
                 mot de passe oublié, réinitialisation, changement de mot de passe.
                 Source unique de vérité pour la validation des entrées.
                 Exporte aussi PASSWORD_RULES, PasswordStrength et
                 getPasswordStrength utilisés par PasswordStrength côté UI.

flow:            Module TypeScript pur → export des schémas Zod (register,
                 login, forgotPassword, resetPassword, changePassword), de
                 PASSWORD_RULES, de getPasswordStrength et des types inférés.
                 Aucun état, aucun effet.

ecosystem:       Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/app/auth/layout.tsx",
                   "@/app/auth/login/LoginForm.tsx",
                   "@/app/auth/login/page.tsx",
                   "@/app/auth/register/RegisterForm.tsx",
                   "@/app/auth/register/page.tsx",
                   "@/app/auth/welcome/page.tsx",
                   "@/components/auth/PasswordInput.tsx",
                   "@/components/auth/PasswordStrength.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/validations/auth.ts",
                 ]

relatedFiles:    ["@/app/auth/login/LoginForm.tsx",
                  "@/app/auth/register/RegisterForm.tsx",
                  "@/components/auth/PasswordStrength.tsx"]

imports:         ["zod"]

exports:         ["registerSchema", "RegisterInput",
                  "loginSchema", "LoginInput",
                  "forgotPasswordSchema", "ForgotPasswordInput",
                  "resetPasswordSchema", "ResetPasswordInput",
                  "changePasswordSchema", "ChangePasswordInput",
                  "PASSWORD_RULES", "PasswordRule",
                  "PasswordStrength", "getPasswordStrength"]

useBy:           ["@/app/auth/login/LoginForm.tsx",
                  "@/app/auth/register/RegisterForm.tsx",
                  "@/components/auth/PasswordStrength.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une validation d'authentification cohérente"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
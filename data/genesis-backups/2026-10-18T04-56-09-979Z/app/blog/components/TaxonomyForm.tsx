/*
path :           app/blog/components/TaxonomyForm.tsx
tag :            ["blog", "component", "admin", "taxonomy", "form", "tree"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur du CRUD taxonomie 3 niveaux (accordéon
                 thèmes → catégories → sous-catégories). Une Dialog
                 unifiée pour create/edit, AlertDialog pour delete.

flow:            Props { themes } → useState(editing, deleting) →
                 rend arbre + EntityDialog + AlertDialog suppression.

ecosystem:       BlogUI = [
                   "@/app/blog/components/ArticleBody.tsx",
                   "@/app/blog/components/ArticleCard.tsx",
                   "@/app/blog/components/ArticleForm.tsx",
                   "@/app/blog/components/ArticleHeader.tsx",
                   "@/app/blog/components/CommentForm.tsx",
                   "@/app/blog/components/CommentTree.tsx",
                   "@/app/blog/components/ContentBlockRenderer.tsx",
                   "@/app/blog/components/CoverImagePicker.tsx",
                   "@/app/blog/components/DiscussionThread.tsx",
                   "@/app/blog/components/FavoriteButton.tsx",
                   "@/app/blog/components/GroupCard.tsx",
                   "@/app/blog/components/LikeButton.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/app/blog/components/NotificationList.tsx",
                   "@/app/blog/components/PostTree.tsx",
                   "@/app/blog/components/QuickCreateCategoryDialog.tsx",
                   "@/app/blog/components/QuickCreateTagDialog.tsx",
                   "@/app/blog/components/SearchFilters.tsx",
                   "@/app/blog/components/TableOfContents.tsx",
                   "@/app/blog/components/TagForm.tsx",
                   "@/app/blog/components/TaxonomyForm.tsx",
                   "@/app/blog/components/TaxonomyNav.tsx",
                   "@/app/blog/components/articleDraft.ts",
                   "@/app/blog/components/block-editor/BlockEditor.tsx",
                   "@/app/blog/components/block-editor/BlockList.tsx",
                   "@/app/blog/components/block-editor/BlockToolbar.tsx",
                   "@/app/blog/components/block-editor/BlockTypeMenu.tsx",
                   "@/app/blog/components/block-editor/forms/AudioBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/CodeBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/DocumentBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/EmbedBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ImageBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/ParagraphBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/SectionBlockForm.tsx",
                   "@/app/blog/components/block-editor/forms/VideoBlockForm.tsx",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/taxonomy.ts",
                  "@/app/blog/lib/types.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/blog/lib/actions/taxonomy",
                  "@/app/blog/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/accordion",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea",
                  "@/components/ui/alert-dialog"]

exports:         ["TaxonomyForm", "TaxonomyFormProps"]

useBy:           ["@/app/blog/admin/taxonomy/page.tsx"]

userStories:     ["us1100001", "us1100002", "us1100003"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState, useTransition, router.refresh, dialogs.

// ... reste du fichier STRICTEMENT IDENTIQUE à la version déjà dans la pj.
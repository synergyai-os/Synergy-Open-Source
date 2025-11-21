# Design System Audit Report

**Date**: 2025-11-21

## Summary

- **Token Coverage**: 51% (157/309)
- **Hardcoded Values**: 1661 violations
- **Arbitrary Values**: 4 violations
- **Raw Scale Values**: 1124 violations
- **Inline Styles**: 29 violations
- **Total Files Scanned**: 309

## Violations by Module

### Other Module (1643 violations)

48. `src/lib/components/molecules/AssigneeSelector.svelte:48` - `style="background-color: {assignee.color}"` → Move to Tailwind utility classes using design tokens
34. `src/lib/components/molecules/ContextSelector.svelte:34` - `text-base` → Use text-body
20. `src/lib/components/molecules/PrioritySelector.svelte:20` - `text-yellow-500` → Use semantic color token (e.g., bg-primary, text-primary, bg-surface)
21. `src/lib/components/molecules/PrioritySelector.svelte:21` - `text-orange-500` → Replace with design token utility class
33. `src/lib/components/molecules/ProjectSelector.svelte:33` - `text-base` → Use text-body
35. `src/lib/components/molecules/ProjectSelector.svelte:35` - `style="background-color: {project.color}"` → Move to Tailwind utility classes using design tokens
58. `src/lib/components/organisms/Dialog.svelte:58` - `rounded-none` → Use semantic border radius token (e.g., rounded-button, rounded-card)
93. `src/lib/components/organisms/ThemeToggle.svelte:93` - `ml-2` → Replace with design token utility class
25. `src/routes/(authenticated)/+error.svelte:25` - `px-6` → Replace with design token utility class
25. `src/routes/(authenticated)/+error.svelte:25` - `py-16` → Replace with design token utility class

... and 1633 more violations

### Meetings Module (13 violations)

232. `src/routes/(authenticated)/meetings/+page.svelte:232` - `gap-2` → Use semantic spacing token (e.g., px-button, py-card)
233. `src/routes/(authenticated)/meetings/+page.svelte:233` - `text-sm` → Use text-small
236. `src/routes/(authenticated)/meetings/+page.svelte:236` - `px-3` → Replace with design token utility class
236. `src/routes/(authenticated)/meetings/+page.svelte:236` - `py-1` → Replace with design token utility class
236. `src/routes/(authenticated)/meetings/+page.svelte:236` - `text-sm` → Use text-small
236. `src/routes/(authenticated)/meetings/+page.svelte:236` - `rounded-md` → Use semantic border radius token (e.g., rounded-button, rounded-card)
246. `src/routes/(authenticated)/meetings/+page.svelte:246` - `gap-2` → Use semantic spacing token (e.g., px-button, py-card)
246. `src/routes/(authenticated)/meetings/+page.svelte:246` - `px-3` → Replace with design token utility class
246. `src/routes/(authenticated)/meetings/+page.svelte:246` - `py-1` → Replace with design token utility class
246. `src/routes/(authenticated)/meetings/+page.svelte:246` - `text-sm` → Use text-small

... and 3 more violations

### Flashcards Module (5 violations)

125. `src/lib/modules/flashcards/components/Flashcard.svelte:125` - `p-0` → Use semantic spacing token (e.g., px-button, py-card)
133. `src/lib/modules/flashcards/components/Flashcard.svelte:133` - `p-0` → Replace with design token utility class
193. `src/lib/modules/flashcards/components/Flashcard.svelte:193` - `p-0` → Use semantic spacing token (e.g., px-button, py-card)
201. `src/lib/modules/flashcards/components/Flashcard.svelte:201` - `p-0` → Replace with design token utility class
28. `src/lib/modules/flashcards/components/FlashcardCollectionCard.svelte:28` - `style="background-color: {collection.color};"` → Move to Tailwind utility classes using design tokens

## All Violations

| File | Line | Violation | Type | Suggestion |
|------|------|-----------|------|------------|
| `src/lib/components/molecules/AssigneeSelector.svelte` | 48 | `style="background-color: {assignee.color}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/components/molecules/ContextSelector.svelte` | 34 | `text-base` | raw-font-size | Use text-body |
| `src/lib/components/molecules/PrioritySelector.svelte` | 20 | `text-yellow-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/lib/components/molecules/PrioritySelector.svelte` | 21 | `text-orange-500` | unknown | Replace with design token utility class |
| `src/lib/components/molecules/ProjectSelector.svelte` | 33 | `text-base` | raw-font-size | Use text-body |
| `src/lib/components/molecules/ProjectSelector.svelte` | 35 | `style="background-color: {project.color}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/components/organisms/Dialog.svelte` | 58 | `rounded-none` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/components/organisms/ThemeToggle.svelte` | 93 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 25 | `px-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 25 | `py-16` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 27 | `mb-12` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 29 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 30 | `class="text-[1` | arbitrary-value | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 36 | `mb-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 36 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/+error.svelte` | 37 | `text-base` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 41 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 41 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/+error.svelte` | 42 | `text-base` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 46 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 46 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/+error.svelte` | 54 | `mb-8` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 54 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 54 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/+error.svelte` | 55 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 62 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 62 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/+error.svelte` | 64 | `p-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/+error.svelte` | 64 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 74 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/+error.svelte` | 77 | `px-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 77 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 77 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/+error.svelte` | 77 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/+error.svelte` | 84 | `px-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 84 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/+error.svelte` | 84 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/+error.svelte` | 84 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/+layout.svelte` | 760 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 60 | `px-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 60 | `py-12` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 61 | `space-y-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 63 | `bg-red-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/admin/+error.svelte` | 63 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 65 | `text-red-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/admin/+error.svelte` | 81 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/admin/+error.svelte` | 82 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 82 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 89 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 89 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 90 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/+error.svelte` | 91 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 91 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 103 | `p-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 103 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 104 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/+error.svelte` | 107 | `space-y-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 108 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 109 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 115 | `p-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 115 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 117 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/+error.svelte` | 118 | `mt-0` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 118 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 126 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/+error.svelte` | 126 | `pt-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+error.svelte` | 129 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/+layout.svelte` | 43 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/+layout.svelte` | 44 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+layout.svelte` | 44 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/+layout.svelte` | 45 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/+layout.svelte` | 50 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 217 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 218 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 218 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 229 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 230 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 230 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 231 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 232 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 232 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 236 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 236 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 237 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 239 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 239 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 240 | `style="color: var(--color-error, #ef4444);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 245 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 245 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 246 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 248 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 248 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 249 | `style="color: var(--color-success, #10b981);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 254 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 254 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 255 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 256 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 256 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 260 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 260 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 261 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 263 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 263 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 264 | `style="color: var(--color-error, #ef4444);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 276 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 276 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 277 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 280 | `p-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 280 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 283 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 284 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 284 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 290 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 290 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 290 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 302 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 308 | `px-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 308 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 308 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 308 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 311 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 314 | `px-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 314 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 314 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 314 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 322 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 322 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 322 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 322 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 330 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 330 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 330 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 330 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 343 | `py-12` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 347 | `py-12` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 348 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 349 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 349 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 358 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 361 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 361 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 365 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 366 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 369 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 369 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 369 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 375 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 375 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 375 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 384 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 384 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 389 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 389 | `gap-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 389 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 393 | `style="color: var(--color-success, #10b981);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 400 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 400 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 406 | `ml-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 406 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 409 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 409 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 409 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 409 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 439 | `p-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 439 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 447 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 448 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 448 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 452 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 453 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 460 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 460 | `px-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 460 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 460 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 460 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 465 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/doc-404s/+page.svelte` | 465 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 392 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 393 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 393 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 397 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 405 | `mb-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 405 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 412 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 412 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 414 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 415 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 415 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 424 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 424 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 426 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 427 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 427 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 428 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 428 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 439 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 439 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 441 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 442 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 442 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 448 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 448 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 448 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 449 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 451 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 451 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 452 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 452 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 456 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 457 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 458 | `ml-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 458 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 517 | `gap-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 519 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 529 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 541 | `py-12` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 542 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 542 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 547 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 554 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 557 | `gap-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 557 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 557 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 562 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 562 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 564 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 564 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 573 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 574 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 579 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 590 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 593 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 600 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 607 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 622 | `gap-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 624 | `py-12` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 625 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 625 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 628 | `py-12` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 629 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 629 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 633 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 634 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 634 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 635 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 636 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 636 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 639 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 639 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 642 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 642 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 643 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 644 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 644 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 648 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 648 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 653 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 653 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 654 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 655 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 655 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 660 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 660 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 663 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 663 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 664 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 665 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 665 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 668 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 668 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 673 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 673 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 674 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 674 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 675 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 675 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 678 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 700 | `mt-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 700 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 700 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 701 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 701 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 705 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 709 | `space-y-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 712 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 712 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 715 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 718 | `p-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 718 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 720 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 721 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 730 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 730 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 733 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 735 | `p-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 735 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 736 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 737 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 750 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 751 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 755 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 755 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 758 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 765 | `mt-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 765 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 769 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 769 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 773 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 773 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 777 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 777 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 786 | `p-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 786 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 807 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 807 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 807 | `pt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 808 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 809 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 811 | `p-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 811 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 812 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 813 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 813 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 819 | `p-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 819 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 820 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 821 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 821 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 827 | `p-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 827 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 828 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 829 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 829 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 832 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 832 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 836 | `p-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 836 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 837 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 838 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 838 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 845 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 860 | `gap-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 861 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 861 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 862 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 862 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 863 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 863 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 867 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 867 | `p-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 867 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 868 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 874 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 876 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 876 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 882 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 892 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 892 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 907 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 907 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 907 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 908 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 908 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 909 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 910 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 911 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 917 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 918 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 918 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 921 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 922 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 923 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 923 | `p-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 923 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 923 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 947 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 950 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 953 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 953 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 960 | `p-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 960 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 974 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 977 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 977 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 983 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 995 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 995 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 997 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 997 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1000 | `px-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1000 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1012 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1012 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1020 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1020 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1028 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1028 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1036 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1037 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1037 | `pb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1038 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1039 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1041 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1047 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1047 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1048 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1048 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1051 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1067 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1069 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1071 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1071 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1076 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1076 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1082 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1082 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1083 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1083 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1091 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1093 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1093 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1097 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1097 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1102 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1102 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1105 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1105 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1105 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1105 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1115 | `p-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1115 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1116 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1120 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1120 | `ml-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1120 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1120 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1126 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1126 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1134 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1134 | `pt-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1138 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1138 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1138 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1138 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1164 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1167 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1169 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1169 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1176 | `p-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1176 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1190 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1193 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1193 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1201 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1203 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1203 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1214 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1214 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1222 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1222 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1230 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1230 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1238 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1239 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1239 | `pb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1240 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1241 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1243 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1249 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1249 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1250 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1250 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1253 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1269 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1271 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1273 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1273 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1278 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1278 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1284 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1284 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1285 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1285 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1293 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1295 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1295 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1299 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1299 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1304 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1304 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1307 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1307 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1307 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1307 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1317 | `p-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1317 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1318 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1322 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1322 | `ml-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1322 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1322 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1328 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1328 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1336 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1336 | `pt-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1340 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1340 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1340 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/+page.svelte` | 1340 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 202 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 202 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 203 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 213 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 229 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 231 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 231 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 237 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 248 | `gap-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 250 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 251 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 251 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 252 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 254 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 255 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 255 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 260 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 261 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 261 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 267 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 268 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 268 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 273 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 274 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 274 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 282 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 283 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 283 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 293 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 294 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 294 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 302 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 302 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 309 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 310 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 310 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 311 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 311 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 317 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 317 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 320 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 320 | `px-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 320 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 320 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 320 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 354 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 380 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 380 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 380 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 391 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 402 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 418 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 418 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 436 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 442 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 442 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 449 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 450 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 450 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 451 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 451 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 459 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 464 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 465 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 465 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 466 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 466 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 469 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 485 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 487 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 492 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 493 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 493 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 494 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 494 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 496 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 498 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 499 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 499 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 502 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 502 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 505 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 506 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 506 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 509 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 509 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 514 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 515 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 515 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 518 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 518 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 521 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 522 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 522 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 525 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 525 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 530 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 530 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 530 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 531 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 531 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 532 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 539 | `gap-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 540 | `gap-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 540 | `style="height: 80px;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 545 | `style="height: {disabledHeight}%"` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 547 | `class="text-[1` | arbitrary-value | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 556 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 556 | `gap-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 556 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 557 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 561 | `gap-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 570 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/feature-flags/[flag]/+page.svelte` | 571 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 906 | `border-yellow-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 906 | `bg-yellow-500` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1036 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1038 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1039 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/+page.svelte` | 1039 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 44 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 47 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 47 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 54 | `mb-8` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 55 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 55 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 57 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 60 | `p-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 60 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 64 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `bg-red-100` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `text-red-800` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `bg-red-200` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 73 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 95 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 101 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 101 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 102 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 102 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 103 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 103 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` | 106 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 23 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 23 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 29 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 31 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 32 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/settings/+page.svelte` | 51 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 24 | `text-2xl` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 25 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 25 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 34 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 34 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 34 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 35 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 35 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 35 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 36 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 36 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 36 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 37 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 37 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 37 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 38 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 38 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 38 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 44 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 44 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 44 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 45 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 45 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 45 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 46 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 46 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 46 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 49 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 49 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 49 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 52 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 52 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/admin/users/+page.svelte` | 53 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/dashboard/+page.svelte` | 94 | `mb-8` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/dashboard/+page.svelte` | 95 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/dashboard/+page.svelte` | 95 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/dashboard/+page.svelte` | 103 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/dashboard/+page.svelte` | 103 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 16 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 17 | `space-y-8` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 20 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 20 | `text-3xl` | raw-font-size | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 27 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 29 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 29 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 30 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 33 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 112 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 117 | `space-y-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 117 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 126 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 128 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 128 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 129 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 132 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 132 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 136 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 136 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 136 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 191 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 191 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 201 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 203 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 203 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 204 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 207 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 207 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 208 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 230 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 236 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 236 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 243 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 245 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 245 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 246 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 249 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 249 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 288 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 297 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 299 | `mb-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 299 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 300 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 303 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 303 | `p-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 303 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 305 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 306 | `space-y-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 306 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 315 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 316 | `space-y-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 316 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 327 | `p-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 327 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 328 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 329 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 329 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 330 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/demo-control-panel/+page.svelte` | 330 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/+page.svelte` | 232 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/meetings/+page.svelte` | 233 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/meetings/+page.svelte` | 236 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/+page.svelte` | 236 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/+page.svelte` | 236 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/meetings/+page.svelte` | 236 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/meetings/+page.svelte` | 246 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/meetings/+page.svelte` | 246 | `px-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/+page.svelte` | 246 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/+page.svelte` | 246 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/meetings/+page.svelte` | 246 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/meetings/[id]/+page.svelte` | 212 | `rounded-full` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/meetings/[id]/+page.svelte` | 558 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 41 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 43 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 45 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 46 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 46 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 53 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 59 | `gap-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 60 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 62 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 62 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `bg-red-50` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `text-red-600` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `bg-red-900` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `text-red-400` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `p-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 73 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 79 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 79 | `pt-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 83 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/onboarding/+page.svelte` | 83 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/org/circles/+page.svelte` | 66 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/circles/+page.svelte` | 84 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/circles/+page.svelte` | 98 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/circles/[id]/+page.svelte` | 84 | `space-y-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/circles/[id]/+page.svelte` | 157 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/org/circles/[id]/+page.svelte` | 197 | `mt-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 150 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 173 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 187 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 249 | `mt-8` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 250 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 340 | `space-y-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/members/+page.svelte` | 343 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/onboarding/+page.svelte` | 30 | `mt-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/onboarding/+page.svelte` | 34 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/onboarding/+page.svelte` | 34 | `space-y-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/org/onboarding/+page.svelte` | 46 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/org/onboarding/+page.svelte` | 52 | `mt-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 118 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/study/+page.svelte` | 123 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 123 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/study/+page.svelte` | 135 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 150 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 156 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 156 | `text-6xl` | raw-font-size | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 157 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 157 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 163 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 163 | `text-6xl` | raw-font-size | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 164 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 164 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 165 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 171 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/study/+page.svelte` | 171 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/study/+page.svelte` | 180 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 181 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 181 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/study/+page.svelte` | 187 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/study/+page.svelte` | 189 | `rounded-full` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 190 | `style="width: {progressPercent}%"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/study/+page.svelte` | 217 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/study/+page.svelte` | 218 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 146 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 152 | `py-8` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 154 | `py-12` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 158 | `py-12` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 160 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 172 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 172 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/tags/+page.svelte` | 173 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 181 | `mb-8` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 182 | `mb-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 182 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/tags/+page.svelte` | 182 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 184 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 186 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 189 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/tags/+page.svelte` | 194 | `rounded-full` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 195 | `style="background-color: {tag.color}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/tags/+page.svelte` | 198 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 207 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 207 | `py-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 207 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 207 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/tags/+page.svelte` | 222 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 222 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 222 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 224 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 226 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 228 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/tags/+page.svelte` | 232 | `rounded-full` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/tags/+page.svelte` | 233 | `style="background-color: {tag.color}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/(authenticated)/tags/+page.svelte` | 236 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/tags/+page.svelte` | 248 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/tags/+page.svelte` | 248 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 108 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 109 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 109 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 110 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 116 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 116 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 116 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 119 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 119 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 120 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 124 | `text-green-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 124 | `text-green-400` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 127 | `text-orange-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 127 | `text-orange-400` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 130 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 140 | `mb-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 140 | `p-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 140 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 141 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 141 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 144 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 144 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 151 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 151 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 151 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 159 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 159 | `px-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 159 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 159 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 159 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `border-red-200` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `bg-red-50` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `border-red-800` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `bg-red-900` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 168 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 170 | `text-red-900` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 170 | `text-red-200` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 170 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 170 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 171 | `text-red-700` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 171 | `text-red-300` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 171 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 177 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 177 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 179 | `px-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 179 | `py-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 180 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 184 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 184 | `p-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 187 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 187 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 188 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 188 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 189 | `text-base` | raw-font-size | Use text-body |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 195 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 195 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 196 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 196 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 197 | `text-base` | raw-font-size | Use text-body |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 207 | `p-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 207 | `rounded-md` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 208 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 208 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 209 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 209 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 210 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 211 | `mt-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 216 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 217 | `mt-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 220 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 221 | `mt-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 226 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/claude/+page.svelte` | 227 | `mt-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 103 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 103 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 104 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 109 | `mb-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 109 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 109 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 112 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 113 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 127 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 127 | `p-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 127 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 128 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 129 | `gap-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 134 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 134 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 134 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 142 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 142 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 142 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 150 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 150 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 150 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 159 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 159 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 159 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 161 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 161 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 167 | `p-6` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 167 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 168 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 170 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 170 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 175 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 175 | `p-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 175 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 176 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 177 | `space-y-1` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test/readwise/+page.svelte` | 177 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 56 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 57 | `mb-6` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 57 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 60 | `text-red-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 62 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 63 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 63 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 64 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 64 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 65 | `text-gray-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 65 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 65 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 66 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 70 | `text-gray-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 70 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 74 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 74 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 75 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 75 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 76 | `text-gray-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 76 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 76 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 77 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 81 | `text-gray-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 81 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 85 | `p-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 85 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 86 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 86 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 87 | `text-gray-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 87 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 87 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 90 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 95 | `text-gray-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 95 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 99 | `bg-gray-100` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 99 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 99 | `p-4` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 99 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 100 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 101 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 102 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-flags/+page.svelte` | 103 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 56 | `p-8` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 57 | `space-y-12` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 61 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 63 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 64 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 68 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 71 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 78 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 80 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 81 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 85 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 88 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 95 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 97 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 98 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 100 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 103 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 110 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 112 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 113 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 128 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 131 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 138 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 140 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 141 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 144 | `gap-4` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/(authenticated)/test-refs/+page.svelte` | 170 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/dev-docs/+page.svelte` | 416 | `style="background: {group.color || '` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/forgot-password/+page.svelte` | 76 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/forgot-password/+page.svelte` | 77 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/forgot-password/+page.svelte` | 90 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/forgot-password/+page.svelte` | 93 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/forgot-password/+page.svelte` | 101 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/forgot-password/+page.svelte` | 127 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 115 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/invite/+page.svelte` | 116 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 116 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/invite/+page.svelte` | 117 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 123 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/invite/+page.svelte` | 124 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 128 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 129 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 129 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/routes/invite/+page.svelte` | 130 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 139 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/invite/+page.svelte` | 140 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 141 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 141 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/invite/+page.svelte` | 142 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 151 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 151 | `space-y-4` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 154 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 154 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/invite/+page.svelte` | 155 | `text-lg` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 160 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 160 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/invite/+page.svelte` | 161 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 166 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 166 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/invite/+page.svelte` | 167 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 173 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 173 | `p-3` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 173 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/invite/+page.svelte` | 174 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/invite/+page.svelte` | 180 | `space-y-3` | raw-spacing | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 195 | `space-y-3` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 196 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/invite/+page.svelte` | 199 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/invite/+page.svelte` | 204 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/invite/+page.svelte` | 204 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/invite/+page.svelte` | 212 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/invite/+page.svelte` | 212 | `rounded-md` | unknown | Replace with design token utility class |
| `src/routes/login/+page.svelte` | 158 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/login/+page.svelte` | 159 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/login/+page.svelte` | 178 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/login/+page.svelte` | 180 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/routes/login/+page.svelte` | 180 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/login/+page.svelte` | 194 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/login/+page.svelte` | 241 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/register/+page.svelte` | 161 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/register/+page.svelte` | 162 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/register/+page.svelte` | 178 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/register/+page.svelte` | 224 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/routes/register/+page.svelte` | 224 | `text-xs` | unknown | Replace with design token utility class |
| `src/routes/reset-password/+page.svelte` | 100 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/routes/reset-password/+page.svelte` | 101 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/reset-password/+page.svelte` | 112 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/reset-password/+page.svelte` | 115 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/reset-password/+page.svelte` | 121 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/reset-password/+page.svelte` | 158 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 529 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 579 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/settings/+page.svelte` | 584 | `rounded-full` | unknown | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 607 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 627 | `pr-10` | unknown | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 741 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/+page.svelte` | 763 | `pr-10` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 159 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 162 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 166 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 178 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 182 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 187 | `space-y-3` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 197 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 215 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 216 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 217 | `space-y-1` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 219 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 228 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 229 | `gap-3` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 258 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 258 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 265 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 266 | `space-y-4` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 268 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 282 | `mb-2` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 296 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 315 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 322 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 322 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 324 | `px-1` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 324 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 324 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 330 | `px-1` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 330 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 330 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/settings/permissions-test/+page.svelte` | 337 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 337 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 339 | `px-1` | raw-spacing | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 339 | `py-0` | unknown | Replace with design token utility class |
| `src/routes/settings/permissions-test/+page.svelte` | 339 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/routes/verify-email/+page.svelte` | 245 | `style="animation: gradient 15s ease infinite; background-size: 200% 200%;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/verify-email/+page.svelte` | 258 | `mb-6` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 258 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/verify-email/+page.svelte` | 277 | `text-3xl` | raw-font-size | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 278 | `text-base` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 287 | `border-green-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 287 | `bg-green-50` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 290 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/verify-email/+page.svelte` | 291 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 293 | `text-green-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 293 | `mt-0` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 306 | `text-green-700` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 306 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 313 | `bg-green-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 313 | `bg-green-700` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 323 | `border-green-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 323 | `bg-green-50` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 326 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/verify-email/+page.svelte` | 328 | `text-green-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/routes/verify-email/+page.svelte` | 340 | `text-green-700` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 340 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 351 | `gap-3` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/verify-email/+page.svelte` | 352 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 354 | `mt-0` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 367 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 382 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/routes/verify-email/+page.svelte` | 384 | `mt-0` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 396 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 401 | `mt-8` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 412 | `mt-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 412 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 419 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 421 | `gap-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 421 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 421 | `py-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 421 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/routes/verify-email/+page.svelte` | 435 | `text-sm` | raw-font-size | Use text-small |
| `src/routes/verify-email/+page.svelte` | 440 | `text-sm` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 445 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 454 | `mr-2` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 476 | `mt-6` | raw-spacing | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 476 | `pt-6` | unknown | Replace with design token utility class |
| `src/routes/verify-email/+page.svelte` | 477 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/ActivityCard.svelte` | 44 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 52 | `text-base` | raw-font-size | Use text-body |
| `src/lib/modules/core/components/ActivityCard.svelte` | 98 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 140 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 140 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/ActivityCard.svelte` | 143 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 151 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 154 | `style="width: {progressPercentage()}%"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/ActivityCard.svelte` | 158 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 159 | `style="width: 60%"` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 164 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 164 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/ActivityCard.svelte` | 171 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 175 | `text-xs` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/ActivityCard.svelte` | 175 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 187 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/ActivityCard.svelte` | 191 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/ActivityCard.svelte` | 191 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/AppTopBar.svelte` | 62 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 74 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 75 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 75 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 80 | `bg-red-600` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 80 | `bg-red-700` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 80 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 80 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 102 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 102 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 107 | `text-red-500` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 110 | `text-green-500` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 117 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CleanReadwiseButton.svelte` | 117 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/CreateMenu.svelte` | 32 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CreateMenu.svelte` | 32 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CreateMenu.svelte` | 47 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/CreateMenu.svelte` | 52 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CreateMenu.svelte` | 52 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/CreateMenu.svelte` | 73 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/CreateMenu.svelte` | 77 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CreateMenu.svelte` | 77 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/CreateMenu.svelte` | 99 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/CreateMenu.svelte` | 99 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 104 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 105 | `style="background: linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-border-base);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/Flashcard.svelte` | 126 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 126 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/lib/modules/core/components/Flashcard.svelte` | 126 | `text-3xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 126 | `rounded-sm` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 134 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 138 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/lib/modules/core/components/Flashcard.svelte` | 138 | `text-3xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 147 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/lib/modules/core/components/Flashcard.svelte` | 147 | `text-3xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 160 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Flashcard.svelte` | 162 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 166 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Flashcard.svelte` | 173 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 174 | `style="background: linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-accent-primary) 20%, var(--color-bg-elevated) 100%); border: 2px solid var(--color-accent-primary);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/Flashcard.svelte` | 195 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 195 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/lib/modules/core/components/Flashcard.svelte` | 195 | `text-2xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 195 | `rounded-sm` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 203 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/Flashcard.svelte` | 207 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/lib/modules/core/components/Flashcard.svelte` | 207 | `text-2xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 216 | `text-xl` | raw-font-size | Use text-h2 or text-h3 |
| `src/lib/modules/core/components/Flashcard.svelte` | 216 | `text-2xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 229 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Flashcard.svelte` | 231 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Flashcard.svelte` | 235 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/GlobalActivityTracker.svelte` | 135 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 495 | `p-0` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 496 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 496 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 502 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 505 | `px-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 505 | `py-3` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 508 | `mr-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 522 | `p-0` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 522 | `text-base` | raw-font-size | Use text-body |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 526 | `px-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 526 | `pb-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 529 | `pt-8` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 529 | `pb-6` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 529 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 535 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 535 | `pt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 535 | `pb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 535 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 541 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 541 | `py-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 541 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 546 | `text-xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 549 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 556 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 556 | `py-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 556 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 569 | `text-xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 572 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 580 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 580 | `py-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 580 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 593 | `text-xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 596 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 613 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 621 | `text-gray-300` | raw-color | Use semantic color token (e.g., bg-primary, text-primary, bg-surface) |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 699 | `text-xl` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 776 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 776 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/QuickCreateModal.svelte` | 812 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 27 | `style="width: 286px; flex-shrink: 0;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 40 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 43 | `space-y-0` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 46 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 74 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 96 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 118 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 140 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 163 | `my-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 165 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 168 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 171 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 193 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 215 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 238 | `my-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 240 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 243 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 246 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 268 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SettingsSidebar.svelte` | 290 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/SettingsSidebarHeader.svelte` | 34 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/ShareTagModal.svelte` | 93 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/ShareTagModal.svelte` | 93 | `style="background-color: {tag.color}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/ShareTagModal.svelte` | 143 | `mt-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 600 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 600 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 624 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 624 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 648 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 648 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 675 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 675 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 702 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 702 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 727 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 727 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 753 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 753 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 808 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 814 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 814 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 834 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 834 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 856 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 856 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 886 | `style="width: {displayWidth()}px; transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/Sidebar.svelte` | 994 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 994 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 1020 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1020 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1050 | `px-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1050 | `py-0` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1070 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1070 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 1096 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1096 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1122 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1122 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 1146 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1152 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1158 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1176 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1179 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1182 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1182 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/Sidebar.svelte` | 1202 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1202 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/Sidebar.svelte` | 1224 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/Sidebar.svelte` | 1224 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 138 | `gap-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 142 | `p-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/SidebarHeader.svelte` | 163 | `p-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/TagFilter.svelte` | 83 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagFilter.svelte` | 84 | `style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagFilter.svelte` | 128 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagFilter.svelte` | 149 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagFilter.svelte` | 150 | `style="background-color: {tag.color}20; color: {tag.color};"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 379 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 382 | `mb-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 387 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 387 | `gap-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 397 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 398 | `style="background-color: {tag.color || DEFAULT_TAG_COLOR}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 406 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 449 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 449 | `px-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 449 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 449 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 449 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 450 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 450 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 480 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 480 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 487 | `mb-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 497 | `pr-8` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 497 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 497 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 502 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 506 | `px-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 506 | `py-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 515 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 518 | `space-y-0` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 522 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 540 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 541 | `style="background-color: {tag.color || DEFAULT_TAG_COLOR}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 549 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 561 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 568 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 574 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 575 | `style="background-color: {tag.color || DEFAULT_TAG_COLOR}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 585 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 587 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 594 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 600 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 601 | `style="background-color: {tag.color || DEFAULT_TAG_COLOR}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 611 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 621 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 624 | `mt-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 624 | `pt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 625 | `mb-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 656 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 666 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/components/TagSelector.svelte` | 667 | `style="background-color: {color.hex}"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/TagSelector.svelte` | 675 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 675 | `pt-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/TagSelector.svelte` | 678 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/components/TagSelector.svelte` | 711 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/components/notes/AIContentDetector.svelte` | 63 | `style="left: {adjustedX()}px; top: {adjustedY()}px; width: {menuWidth}px;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/core/components/notes/NoteEditor.svelte` | 236 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/components/notes/NoteEditor.svelte` | 243 | `my-0` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 134 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 136 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 138 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 139 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 139 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 147 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 153 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 154 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 157 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 157 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 174 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 178 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 178 | `pt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 192 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 193 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 194 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 195 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 199 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 199 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 207 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/InviteMemberModal.svelte` | 207 | `pt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 38 | `rounded-lg` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 40 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 42 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 43 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 43 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 49 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 55 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 56 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 58 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 58 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 66 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 66 | `pt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 69 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 69 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 69 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 69 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 77 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 77 | `px-3` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 77 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 77 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 77 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 117 | `rounded-lg` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 119 | `space-y-6` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 121 | `text-lg` | raw-font-size | Use text-h3 or text-h4 |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 122 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 122 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 128 | `space-y-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 134 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 135 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 137 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 137 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 144 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 144 | `pt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 147 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 147 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 147 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 147 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 154 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 154 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 154 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationModals.svelte` | 154 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 219 | `p-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 219 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 225 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 234 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 240 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 271 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 271 | `py-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 272 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 276 | `gap-1` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 276 | `px-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 276 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 293 | `my-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 296 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 296 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 329 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 329 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 336 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 349 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 349 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 356 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 369 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 369 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 376 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 396 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 396 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 402 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 409 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 433 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 435 | `px-3` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 435 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 471 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 471 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 478 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 491 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 491 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 498 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 510 | `my-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 512 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 512 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 519 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 539 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 539 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 546 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 553 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 563 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 567 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 567 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 571 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 586 | `my-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 589 | `px-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 589 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 625 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 625 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 632 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 645 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 645 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 652 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 665 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 665 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 672 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 692 | `my-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 696 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 696 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 700 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 701 | `text-base` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 707 | `py-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 707 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 711 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 712 | `text-base` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 717 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 721 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 721 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 730 | `my-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 731 | `py-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 737 | `py-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 738 | `gap-2` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 740 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 745 | `gap-2` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 746 | `text-sm` | raw-font-size | Use text-small |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 752 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 752 | `gap-1` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 755 | `rounded-md` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/OrganizationSwitcher.svelte` | 762 | `rounded-md` | unknown | Replace with design token utility class |
| `src/lib/modules/core/organizations/components/WorkspaceSwitchOverlay.svelte` | 68 | `rounded-full` | raw-border-radius | Use semantic border radius token (e.g., rounded-button, rounded-card) |
| `src/lib/modules/core/organizations/components/WorkspaceSwitchOverlay.svelte` | 74 | `text-2xl` | raw-font-size | Use text-h1 or text-h2 |
| `src/lib/modules/core/organizations/components/WorkspaceSwitchOverlay.svelte` | 79 | `text-sm` | unknown | Replace with design token utility class |
| `src/lib/modules/docs/components/TableOfContents.svelte` | 103 | `style="transform: scale({$panelScale}); opacity: {$panelOpacity};"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/flashcards/components/Flashcard.svelte` | 125 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/flashcards/components/Flashcard.svelte` | 133 | `p-0` | unknown | Replace with design token utility class |
| `src/lib/modules/flashcards/components/Flashcard.svelte` | 193 | `p-0` | raw-spacing | Use semantic spacing token (e.g., px-button, py-card) |
| `src/lib/modules/flashcards/components/Flashcard.svelte` | 201 | `p-0` | unknown | Replace with design token utility class |
| `src/lib/modules/flashcards/components/FlashcardCollectionCard.svelte` | 28 | `style="background-color: {collection.color};"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 285 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 303 | `ml-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 321 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 339 | `ml-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 482 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 500 | `mt-3` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 514 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 540 | `mt-3` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 554 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 566 | `mt-3` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 609 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 631 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 653 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 675 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 697 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/OrgChart.svelte` | 501 | `my-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/OrgChart.svelte` | 561 | `style="pointer-events: all;"` | inline-style | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/org-chart/components/OrgChart.svelte` | 710 | `mb-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/OrgChart.svelte` | 723 | `mt-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 141 | `mt-4` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 143 | `mt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 152 | `mt-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 154 | `mt-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 188 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 227 | `ml-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 245 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 263 | `ml-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 281 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 299 | `ml-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 317 | `ml-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 334 | `mt-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 338 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 347 | `mb-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 356 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 374 | `mb-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 392 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 410 | `mb-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 428 | `mb-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 445 | `pt-6` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 446 | `mb-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 466 | `mt-3` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 483 | `mt-3` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 503 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 504 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 525 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 526 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 547 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 548 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 569 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 570 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 591 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 592 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 613 | `mt-4` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte` | 614 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleMembersPanel.svelte` | 65 | `mt-1` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleMembersPanel.svelte` | 102 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleMembersPanel.svelte` | 118 | `ml-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 111 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 184 | `space-y-2` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 195 | `class="size-[0` | arbitrary-value | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 213 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 213 | `text-xs` | raw-font-size | Use text-label or text-small |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 215 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 215 | `text-xs` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 220 | `ml-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 238 | `mb-3` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 268 | `space-y-2` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CircleRolesPanel.svelte` | 282 | `class="size-[0` | arbitrary-value | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CreateCircleModal.svelte` | 39 | `space-y-6` | unknown | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CreateCircleModal.svelte` | 42 | `mt-1` | raw-spacing | Replace with design token utility class |
| `src/lib/modules/org-chart/components/circles/CreateCircleModal.svelte` | 90 | `pt-2` | unknown | Replace with design token utility class |

## Token Coverage

- **Atomic Components**: 21/38 (55%)
- **Module Pages**: 136/271 (50%)

## Recommendations

1. Fix violations starting with highest priority modules
2. Replace hardcoded values with design token utilities
3. Re-run audit after fixes: `npm run audit:design-system`

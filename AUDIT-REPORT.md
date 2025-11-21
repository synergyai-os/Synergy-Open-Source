# Design System Audit Report

**Date**: 2025-11-21

## Summary

- **Token Coverage**: 100% (16/16)
- **Hardcoded Values**: 77 violations
- **Arbitrary Values**: 0 violations
- **Raw Scale Values**: 39 violations
- **Inline Styles**: 2 violations
- **Total Files Scanned**: 16

## Violations by Module

### Other Module (77 violations)

371. `src/lib/modules/core/components/Sidebar.svelte:371` - `style="width: 8px; z-index: 50;"` → Move to Tailwind utility classes using design tokens
372. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:286` - `ml-1` → Replace with design token utility class
373. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:304` - `ml-1` → Replace with design token utility class
374. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:322` - `ml-1` → Replace with design token utility class
375. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:340` - `ml-1` → Replace with design token utility class
376. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:497` - `mt-3` → Replace with design token utility class
377. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:515` - `mt-3` → Replace with design token utility class
378. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:529` - `mt-3` → Replace with design token utility class
379. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:555` - `mt-3` → Replace with design token utility class
380. `src/lib/modules/org-chart/components/CircleDetailPanel.svelte:569` - `mt-3` → Replace with design token utility class

... and 67 more violations

## All Violations

| File                                                            | Line | Violation                          | Type          | Suggestion                                           |
| --------------------------------------------------------------- | ---- | ---------------------------------- | ------------- | ---------------------------------------------------- | ------------ | ---------------------------------------------------- |
| `src/lib/modules/core/components/Sidebar.svelte`                | 371  | `style="width: 8px; z-index: 50;"` | inline-style  | Move to Tailwind utility classes using design tokens |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 286  | `ml-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 304  | `ml-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 322  | `ml-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 340  | `ml-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 497  | `mt-3`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 515  | `mt-3`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 529  | `mt-3`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 555  | `mt-3`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 569  | `mt-3`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 581  | `mt-3`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 624  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 646  | `mt-4`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 668  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 690  | `mt-4`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | 712  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 141  | `mt-4`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 143  | `mt-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 152  | `mt-2`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 154  | `mt-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 188  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 227  | `ml-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 245  | `ml-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 263  | `ml-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 281  | `ml-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 299  | `ml-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 317  | `ml-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 334  | `mt-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 338  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 347  | `mb-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 356  | `mb-2`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 374  | `mb-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 392  | `mb-2`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 410  | `mb-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 428  | `mb-2`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 445  | `pt-6`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 446  | `mb-3`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 466  | `mt-3`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 483  | `mt-3`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 503  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 504  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 525  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 526  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 547  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 548  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 569  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 570  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 591  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 592  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 613  | `mt-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/lib/modules/org-chart/components/RoleDetailPanel.svelte`   | 614  | `mt-1`                             | unknown       | Replace with design token utility class              |
| `src/routes/(authenticated)/+layout.svelte`                     | 760  | `mb-4`                             | raw-spacing   | Replace with design token utility class              |
| `src/routes/dev-docs/+page.svelte`                              | 416  | `style="background: {group.color   |               | '`                                                   | inline-style | Move to Tailwind utility classes using design tokens |
| `src/routes/forgot-password/+page.svelte`                       | 76   | `text-2xl`                         | raw-font-size | Use text-h1 or text-h2                               |
| `src/routes/forgot-password/+page.svelte`                       | 77   | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/forgot-password/+page.svelte`                       | 90   | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/forgot-password/+page.svelte`                       | 93   | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/forgot-password/+page.svelte`                       | 101  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/forgot-password/+page.svelte`                       | 127  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/login/+page.svelte`                                 | 158  | `text-2xl`                         | raw-font-size | Use text-h1 or text-h2                               |
| `src/routes/login/+page.svelte`                                 | 159  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/login/+page.svelte`                                 | 178  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/login/+page.svelte`                                 | 180  | `mt-2`                             | raw-spacing   | Replace with design token utility class              |
| `src/routes/login/+page.svelte`                                 | 180  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/login/+page.svelte`                                 | 194  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/login/+page.svelte`                                 | 241  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/register/+page.svelte`                              | 161  | `text-2xl`                         | raw-font-size | Use text-h1 or text-h2                               |
| `src/routes/register/+page.svelte`                              | 162  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/register/+page.svelte`                              | 178  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/register/+page.svelte`                              | 224  | `mt-1`                             | raw-spacing   | Replace with design token utility class              |
| `src/routes/register/+page.svelte`                              | 224  | `text-xs`                          | unknown       | Replace with design token utility class              |
| `src/routes/reset-password/+page.svelte`                        | 100  | `text-2xl`                         | raw-font-size | Use text-h1 or text-h2                               |
| `src/routes/reset-password/+page.svelte`                        | 101  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/reset-password/+page.svelte`                        | 112  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/reset-password/+page.svelte`                        | 115  | `text-sm`                          | unknown       | Replace with design token utility class              |
| `src/routes/reset-password/+page.svelte`                        | 121  | `text-sm`                          | raw-font-size | Use text-small                                       |
| `src/routes/reset-password/+page.svelte`                        | 158  | `text-sm`                          | unknown       | Replace with design token utility class              |

## Token Coverage

- **Atomic Components**: 0/0 (NaN%)
- **Module Pages**: 16/16 (100%)

## Recommendations

1. Fix violations starting with highest priority modules
2. Replace hardcoded values with design token utilities
3. Re-run audit after fixes: `npm run audit:design-system`

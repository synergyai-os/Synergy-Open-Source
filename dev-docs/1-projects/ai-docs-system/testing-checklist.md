# Testing Checklist - AI Documentation System

**Manual testing guide for Randy to validate each slice.**

---

## Pre-Testing Setup

- [ ] Dev server running (`npm run dev`)
- [ ] Browser open to `http://127.0.0.1:5173/dev-docs`
- [ ] Have this checklist open

---

## Slice 1: Link Resolution Tests

### Test 1: Links in /dev-docs/2-areas

1. Navigate to `http://127.0.0.1:5173/dev-docs/2-areas`
2. Test each link in "Product & Strategy" section:
   - [ ] "Product Vision & Plan" → `/dev-docs/2-areas/product-vision-and-plan` (not 404)
   - [ ] "Product Principles" → `/dev-docs/2-areas/product-principles` (not 404)
   - [ ] "Architecture" → `/dev-docs/2-areas/architecture` (not 404)
   - [ ] "Design Principles" → `/dev-docs/2-areas/design-principles` (not 404)
   - [ ] "Navigation Philosophy" → `/dev-docs/2-areas/navigation-philosophy` (not 404)
   - [ ] "Design Tokens" → `/dev-docs/2-areas/design-tokens` (not 404)
   - [ ] "Composables Analysis" → `/dev-docs/2-areas/composables-analysis` (not 404)

3. Test each link in "Patterns" section:
   - [ ] "Pattern Index" → `/dev-docs/2-areas/patterns/INDEX` (not 404)
   - [ ] "Svelte Reactivity" → `/dev-docs/2-areas/patterns/svelte-reactivity` (not 404)
   - [ ] "Convex Integration" → `/dev-docs/2-areas/patterns/convex-integration` (not 404)
   - [ ] "UI Patterns" → `/dev-docs/2-areas/patterns/ui-patterns` (not 404)
   - [ ] "Analytics" → `/dev-docs/2-areas/patterns/analytics` (not 404)

4. Test each link in "Value Streams" section:
   - [ ] "Overview" → `/dev-docs/2-areas/value-streams/README` (not 404)
   - [ ] "Documentation System" → `/dev-docs/2-areas/value-streams/documentation-system/START-HERE` (not 404)
   - [ ] "How to Document" → `/dev-docs/2-areas/value-streams/HOW-TO-DOCUMENT` (not 404)

5. Test "Future Architecture" link:
   - [ ] "Multi-Tenancy Migration" → `/dev-docs/2-areas/multi-tenancy-migration` (not 404)

### Test 2: Hash Fragment Links (Line Numbers)

1. Navigate to `http://127.0.0.1:5173/dev-docs/2-areas/patterns/INDEX`
2. Click a link with `#L10` (e.g., "auth-deployment.md#L10")
   - [ ] Link works (not 404)
   - [ ] Page scrolls to correct heading
   - [ ] Hash in URL is lowercase (`#l10` not `#L10`)

### Test 3: Parent Directory Links

1. Navigate to a project README (e.g., `/dev-docs/1-projects/team-access-permissions`)
2. Find links to parent directories (e.g., `../../rbac-architecture.md`)
   - [ ] Link works (not 404)
   - [ ] Resolves to correct path

### Test 4: Subdirectory Links

1. Navigate to `/dev-docs/2-areas`
2. Click subdirectory link (e.g., `patterns/INDEX.md`)
   - [ ] Link works (not 404)
   - [ ] Resolves to `/dev-docs/2-areas/patterns/INDEX`

### Test 5: External Links (Should Be Unchanged)

1. Find any external link (starts with `http://` or `https://`)
   - [ ] Opens in new tab (if target="\_blank")
   - [ ] Goes to correct external URL
   - [ ] Not modified by our renderer

---

## Slice 2: PARA Display Tests

### Test 1: Breadcrumbs

1. Navigate to `/dev-docs/1-projects`
   - [ ] Breadcrumb shows: "Dev Docs / **Projects**" (not "1 Projects")

2. Navigate to `/dev-docs/2-areas/architecture`
   - [ ] Breadcrumb shows: "Dev Docs / **Areas** / Architecture" (not "2 Areas")

3. Navigate to `/dev-docs/2-areas/patterns/INDEX`
   - [ ] Breadcrumb shows: "Dev Docs / Areas / Patterns / INDEX"
   - [ ] No "2-" visible anywhere

### Test 2: Page Titles

1. Navigate to `/dev-docs/1-projects`
   - [ ] Page title shows "Projects" (not "1-projects" or "1 Projects")

2. Navigate to `/dev-docs/2-areas`
   - [ ] Page title shows "Areas" (not "2-areas" or "2 Areas")

3. Navigate to `/dev-docs/3-resources`
   - [ ] Page title shows "Resources" (not "3-resources")

4. Navigate to `/dev-docs/4-archive`
   - [ ] Page title shows "Archive" (not "4-archive")

### Test 3: Navigation Menu

1. Open Documentation dropdown in navbar
   - [ ] Shows "**Projects**" (not "1-projects")
   - [ ] Shows "Patterns" (already clean)
   - [ ] Shows "Architecture" (already clean)
   - [ ] Shows "All Docs" (already clean)

2. Check any folder listings
   - [ ] All display names are clean (no "N-" prefix)

### Test 4: URLs Still Work

1. Type URLs directly:
   - [ ] `/dev-docs/1-projects` still works
   - [ ] `/dev-docs/2-areas` still works
   - [ ] `/dev-docs/3-resources` still works
   - [ ] `/dev-docs/4-archive` still works

2. Verify filesystem unchanged:
   - [ ] Run `ls dev-docs/` → shows `1-projects`, `2-areas`, etc.

---

## Slice 3: Link Checker Tests

### Test 1: Automated Validation

1. Create test file with broken link:

   ```bash
   echo "[Broken](nonexistent-file.md)" > dev-docs/test-broken.md
   git add dev-docs/test-broken.md
   git commit -m "Test: Add broken link"
   git push origin feature/ai-docs-system
   ```

2. Check GitHub Actions:
   - [ ] Workflow runs automatically
   - [ ] Build fails with clear error
   - [ ] Error message shows which file and link is broken

3. Fix the broken link:

   ```bash
   rm dev-docs/test-broken.md
   git add dev-docs/test-broken.md
   git commit -m "Test: Remove broken link"
   git push origin feature/ai-docs-system
   ```

4. Check GitHub Actions:
   - [ ] Workflow runs automatically
   - [ ] Build passes (green check)

### Test 2: Link Checker Performance

1. Check workflow execution time:
   - [ ] Completes in < 30 seconds
   - [ ] Output is readable
   - [ ] Only checks `.md` files in `dev-docs/`

### Test 3: Link Checker Config

1. Verify config handles our patterns:
   - [ ] Ignores external links (http/https)
   - [ ] Strips `.md` extension correctly
   - [ ] Handles hash fragments
   - [ ] Reports file and line number of broken links

---

## Final Validation

### Comprehensive Test

1. Pick 5 random docs from different directories
   - [ ] All internal links work
   - [ ] No 404 errors
   - [ ] No "N-" visible in UI
   - [ ] URLs still use PARA structure

2. Test navigation flow:
   - Start at homepage → Patterns → Specific pattern → Related doc
   - [ ] All transitions smooth
   - [ ] No broken links in chain
   - [ ] Clean display throughout

### Regression Test

1. Test features that should be unchanged:
   - [ ] Dark mode toggle works
   - [ ] Search (if implemented) works
   - [ ] Theme persists across navigation
   - [ ] External links open correctly

---

## Success Criteria

**All must pass**:

- [ ] All 20+ links in `/dev-docs/2-areas/README.md` work
- [ ] No "1-", "2-", "3-", "4-" visible in any UI
- [ ] Link checker catches broken links automatically
- [ ] No 404 errors anywhere in dev-docs
- [ ] Navigation feels natural and clean

**If any fail**: Create bug ticket and fix before marking slice complete.

---

## Notes Section

**Issues Found**:

```
[Randy: Add any issues you encounter during testing]
```

**Suggestions**:

```
[Randy: Add any UX improvements noticed during testing]
```

**Time Spent Testing**:

```
Slice 1: ___ minutes
Slice 2: ___ minutes
Slice 3: ___ minutes
Total: ___ minutes
```

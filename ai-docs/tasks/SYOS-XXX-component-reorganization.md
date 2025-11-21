# Component Folder Reorganization

**Goal**: Reorganize `src/lib/components/` to only contain atomic building blocks (atoms, molecules, organisms). Move feature-specific components to appropriate modules and remove deprecated UI folder.

---

## Problem Analysis

**Current State**:

- `@components` folder contains feature-specific folders (`ai-tools`, `control-panel`, `dashboard`, `my-mind`) mixed with atomic folders
- Deprecated `ui/` folder exists (barrel export, marked for removal)
- Unclear organization makes it hard to find components

**Pain Points**:

- Confusion about where components belong
- Feature components mixed with atomic building blocks
- Deprecated `ui/` folder still in use (75 files import from it)
- My Mind feature will disappear soon but components still exist

**User Impact**:

- Developers waste time searching for components
- Risk of placing components in wrong location
- Technical debt accumulates (deprecated patterns)

**Investigation**:

- ✅ Checked component architecture docs (`component-architecture.md`)
- ✅ Checked atomic design mapping (`atomic-design-svelte.md`)
- ✅ Verified TagSelector strategy (correctly in core module via API)
- ✅ Confirmed modules don't have atomic folders (correct pattern)
- ✅ Found 75 files importing from deprecated `ui/` folder
- ✅ Confirmed My Mind route exists (`/my-mind`)

---

## Approach Options

### Approach A: Incremental Migration (Keep UI folder temporarily)

**How it works**: Migrate files incrementally, keep `ui/` folder as backward compatibility layer until all imports updated.

**Pros**:

- Lower risk (can migrate gradually)
- No breaking changes during migration
- Can test incrementally

**Cons**:

- Longer migration period
- Deprecated code remains longer
- More complex (two import paths)

**Complexity**: Medium

**Dependencies**: None

---

### Approach B: Complete Migration (Remove UI folder immediately)

**How it works**: Migrate all 75 files from `ui/` imports to atomic imports, remove `ui/` folder in one PR.

**Pros**:

- Clean break (no deprecated code)
- Single migration effort
- Clearer codebase immediately

**Cons**:

- Larger PR (75 file changes)
- Higher risk if migration incomplete
- All-or-nothing approach

**Complexity**: Medium-High

**Dependencies**: None

---

### Approach C: Hybrid (Migrate in phases, remove UI after)

**How it works**: Migrate files in logical groups (atoms first, then molecules, then organisms), remove `ui/` folder after all migrations complete.

**Pros**:

- Balanced risk (phased but complete)
- Can validate each phase
- Clear completion criteria

**Cons**:

- More coordination needed
- Multiple PRs required
- Deprecated code exists during migration

**Complexity**: Medium

**Dependencies**: None

---

## Recommendation

**Selected**: Approach C (Hybrid - Migrate in phases, remove UI after)

**Reasoning**:

- Balanced approach: manageable PRs but complete migration
- Can validate each phase before proceeding
- Clear completion criteria (all imports migrated → remove UI folder)
- Follows incremental refactoring best practices

**Trade-offs accepted**:

- Multiple PRs required (but cleaner than one massive PR)
- Deprecated code exists temporarily (but removed after migration)

**Risk assessment**:

- Low-Medium: Well-defined phases reduce risk
- ESLint rule prevents future violations
- Can rollback individual phases if needed

---

## Current State

**Existing Code**:

**Feature Components in @components** (need to move):

- `src/lib/components/ai-tools/` - 2 components (MetricsForecast, ToolComparisonTable)
- `src/lib/components/control-panel/` - 4 components (ControlPanel.\*)
- `src/lib/components/dashboard/` - 1 component (ActionItemsList)
- `src/lib/components/my-mind/` - 4 components (MyMindGrid, MyMindHeader, MyMindItemDetail, cards/)

**Deprecated UI Folder**:

- `src/lib/components/ui/index.ts` - Barrel export (deprecated, re-exports from atoms/molecules/organisms)
- `src/lib/components/ui/types.ts` - Shared types (needs new location)
- `src/lib/components/ui/README.md` - Documentation

**Atomic Folders** (correct, keep):

- `src/lib/components/atoms/` - 20+ atomic components
- `src/lib/components/molecules/` - 20+ molecular components
- `src/lib/components/organisms/` - 15+ organism components

**Routes Using Feature Components**:

- `/my-mind` - Uses My Mind components (will be removed)
- `/dashboard` - Uses dashboard components
- `/demo-control-panel` - Uses control panel components
- `/dev-docs` - Uses AI tools components

**Dependencies**:

- ESLint rule created: `no-feature-components-in-components` ✅
- TagSelector correctly in core module (via API pattern) ✅
- Modules use flat component structure (correct) ✅

**Patterns**:

- Component Architecture: `dev-docs/2-areas/design/component-architecture.md`
- Atomic Design: `dev-docs/2-areas/architecture/atomic-design-svelte.md`
- Module Boundaries: `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md`

**Constraints**:

- Must not break existing functionality
- Must maintain backward compatibility during migration (for UI folder)
- Must follow module API pattern for shared components (TagSelector example)

---

## Technical Requirements

### Phase 1: Remove Deprecated UI Folder

**Components**:

- Migrate `ui/types.ts` → `components/types.ts` (or `atoms/types.ts`)

**File Updates**:

- Update 75 files importing from `$lib/components/ui` → `$lib/components/atoms|molecules|organisms`
- Update `ui/index.ts` imports to point to new location (if keeping temporarily)

**Removal**:

- Remove `src/lib/components/ui/` folder after migration complete

**Testing**:

- Verify all imports resolve correctly
- TypeScript compiles without errors
- Build succeeds
- No runtime errors

---

### Phase 2: Remove My Mind

**Files to Remove**:

- `src/lib/components/my-mind/MyMindGrid.svelte`
- `src/lib/components/my-mind/MyMindHeader.svelte`
- `src/lib/components/my-mind/MyMindItemDetail.svelte`
- `src/lib/components/my-mind/cards/*` (4 files)

**Routes to Update**:

- Remove or comment out `src/routes/(authenticated)/my-mind/+page.svelte`
- Add TODO comment: "My Mind feature - planned for future implementation"

**Documentation**:

- Add TODO in `dev-docs/2-areas/product/product-vision-and-plan.md` or similar

**Testing**:

- Verify route removal doesn't break navigation
- No broken imports
- Build succeeds

---

### Phase 3: Move Feature Components

**Dashboard**:

- Move `src/lib/components/dashboard/ActionItemsList.svelte` → `src/lib/modules/core/components/dashboard/ActionItemsList.svelte`
- Update imports in routes/components

**Control Panel**:

- Move `src/lib/components/control-panel/*` → `src/lib/modules/core/components/control-panel/*`
- Update imports in routes/components

**AI Tools** (keep for now, future module):

- Keep `src/lib/components/ai-tools/` temporarily
- Add TODO: "AI Tools will become its own module (future work)"
- Plan migration to `modules/ai-tools/` when ready

**Examples**:

- Remove `src/lib/components/examples/` folder (or move to `dev-docs/examples/`)

**Testing**:

- Verify all imports updated
- Components render correctly
- No broken functionality

---

### Phase 4: Documentation & Validation

**Documentation Updates**:

- Update `component-architecture.md` (remove UI folder references)
- Update `atomic-design-svelte.md` (remove UI folder references)
- Update `system-architecture.md` (remove UI folder references)
- Create migration guide (if needed)

**ESLint Validation**:

- Verify ESLint rule `no-feature-components-in-components` works
- Test with feature component in @components (should error)
- Test with atomic component in @components (should pass)

**Final Structure Validation**:

- Verify `@components` only contains: atoms, molecules, organisms
- Verify feature components in modules
- Verify no deprecated folders remain

---

## Success Criteria

### Functional

- ✅ All imports resolve correctly (no broken imports)
- ✅ TypeScript compiles without errors
- ✅ Build succeeds
- ✅ No runtime errors
- ✅ Components render correctly after migration

### Architecture

- ✅ `@components` only contains atomic folders (atoms, molecules, organisms)
- ✅ Feature components moved to appropriate modules
- ✅ Deprecated `ui/` folder removed
- ✅ My Mind components removed
- ✅ ESLint rule prevents future violations

### Code Quality

- ✅ All 75 UI imports migrated to atomic imports
- ✅ No deprecated code remains
- ✅ Documentation updated
- ✅ Clear component organization

### Performance

- ✅ No performance regressions
- ✅ Bundle size unchanged (or reduced)

---

## Implementation Checklist

### Phase 1: Remove Deprecated UI Folder

- [ ] **Step 1.1**: Decide location for `ui/types.ts` → `components/types.ts` or `atoms/types.ts`
- [ ] **Step 1.2**: Move `ui/types.ts` to new location
- [ ] **Step 1.3**: Update `ui/index.ts` to import from new location (temporary)
- [ ] **Step 1.4**: Migrate imports in atoms folder (if any use ui/types)
- [ ] **Step 1.5**: Migrate imports in molecules folder (if any use ui/types)
- [ ] **Step 1.6**: Migrate imports in organisms folder (if any use ui/types)
- [ ] **Step 1.7**: Migrate 75 files from `$lib/components/ui` → `$lib/components/atoms|molecules|organisms`
  - [ ] **Step 1.7.1**: Create migration script (`scripts/migrate-ui-imports.ts`)
  - [ ] **Step 1.7.2**: Test script on small subset (5-10 files)
  - [ ] **Step 1.7.3**: Migrate Group 1: Atoms imports (estimate: 25 files)
  - [ ] **Step 1.7.4**: Validate Group 1: TypeScript check (`npm run check`)
  - [ ] **Step 1.7.5**: Validate Group 1: Build verification (`npm run build`)
  - [ ] **Step 1.7.6**: Smoke test Group 1: Critical pages (see Smoke Test Paths)
  - [ ] **Step 1.7.7**: Migrate Group 2: Molecules imports (estimate: 25 files)
  - [ ] **Step 1.7.8**: Validate Group 2: TypeScript check + build + smoke test
  - [ ] **Step 1.7.9**: Migrate Group 3: Organisms imports (estimate: 25 files)
  - [ ] **Step 1.7.10**: Validate Group 3: TypeScript check + build + smoke test
- [ ] **Step 1.8**: Final validation: All imports resolve (TypeScript check)
- [ ] **Step 1.9**: Final validation: Build succeeds
- [ ] **Step 1.10**: Remove `ui/` folder
- [ ] **Step 1.11**: Update documentation (remove UI folder references)

### Phase 2: Remove My Mind

- [ ] **Step 2.1**: Remove `src/lib/components/my-mind/` folder
- [ ] **Step 2.2**: Remove or comment out `src/routes/(authenticated)/my-mind/+page.svelte`
- [ ] **Step 2.3**: Add TODO comment in route file: "My Mind feature - planned for future implementation"
- [ ] **Step 2.4**: Add TODO in product docs (if applicable)
- [ ] **Step 2.5**: Verify no broken imports
- [ ] **Step 2.6**: Verify build succeeds
- [ ] **Step 2.7**: Verify route removal doesn't break navigation

### Phase 3: Move Feature Components

- [ ] **Step 3.1**: Move `dashboard/ActionItemsList.svelte` → `modules/core/components/dashboard/ActionItemsList.svelte`
- [ ] **Step 3.2**: Update imports in routes/components using ActionItemsList
- [ ] **Step 3.3**: Move `control-panel/*` → `modules/core/components/control-panel/*`
- [ ] **Step 3.4**: Update imports in routes/components using control panel components
- [ ] **Step 3.5**: Add TODO comment in `ai-tools/` folder: "AI Tools will become its own module (future work)"
- [ ] **Step 3.6**: Remove `examples/` folder (or move to dev-docs)
- [ ] **Step 3.7**: Verify all imports updated
- [ ] **Step 3.8**: Verify components render correctly
- [ ] **Step 3.9**: Verify build succeeds

### Phase 4: Documentation & Validation

- [ ] **Step 4.1**: Update `component-architecture.md` (remove UI folder references)
- [ ] **Step 4.2**: Update `atomic-design-svelte.md` (remove UI folder references)
- [ ] **Step 4.3**: Update `system-architecture.md` (remove UI folder references)
- [ ] **Step 4.4**: Test ESLint rule `no-feature-components-in-components`
  - [ ] Create test file with feature component in @components (should error)
  - [ ] Create test file with atomic component in @components (should pass)
- [ ] **Step 4.5**: Verify final structure:
  - [ ] `@components` only contains: atoms, molecules, organisms
  - [ ] Feature components in modules
  - [ ] No deprecated folders remain
- [ ] **Step 4.6**: Run full CI checks (`npm run ci:local`)
- [ ] **Step 4.7**: Document migration completion

---

## Risk Mitigation

### Risk 1: Breaking Changes During UI Migration

**Mitigation**:

- Migrate incrementally (atoms → molecules → organisms)
- Test after each group
- Keep `ui/` folder until all migrations complete
- Can rollback individual groups if needed

### Risk 2: Missing Imports After Migration

**Mitigation**:

- Use TypeScript to catch import errors
- Run build verification after each phase
- Test components render correctly

### Risk 3: ESLint Rule False Positives

**Mitigation**:

- Test rule with known good/bad examples
- Adjust rule logic if needed
- Document exceptions (if any)

---

## Pre-Flight Checklist

**Before starting Phase 1:**

- [ ] **ESLint rule timing decided** - Keep rule disabled until Phase 3 complete (Option A recommended)
- [ ] **ESLint rule tested** - Create test files, verify rule works correctly
- [ ] **ai-tools inconsistency resolved** - Excluded from rule (already done ✅)
- [ ] **examples inconsistency resolved** - Removed from rule (already done ✅)
- [ ] **My Mind removal confirmed** - User approval for removing functionality
- [ ] **types.ts location decided** - `components/types.ts` vs `atoms/types.ts`
- [ ] **Migration script created** - Automation script for 75-file migration
- [ ] **Rollback strategy documented** - Recovery steps per phase (see below)
- [ ] **Smoke test paths identified** - Which pages to test after each phase

**Estimated planning time:** 30-60 minutes

---

## ESLint Rule Timing Strategy

**Decision**: **Option A - Disable rule until Phase 3 complete** ✅

**Rationale**:

- Clean, simple approach
- No build breaks during migration
- 4-6 hour migration window is manageable without rule protection
- Rule will be enabled after Phase 3 (when feature components moved)

**Implementation**:

- ESLint rule created but **NOT enabled** in `eslint.config.js` yet
- Enable rule after Phase 3 completes (all feature components moved)
- Rule will prevent future violations going forward

**Alternative (if needed)**:

- Option B: Enable rule with `eslint-disable` comments on existing feature files
- More complex, requires adding comments to ~20 files
- Only use if Option A doesn't work

---

## Automation Script for UI Migration

**Purpose**: Automate migration of 75 files from `$lib/components/ui` to atomic imports

**Script Location**: `scripts/migrate-ui-imports.ts`

**Script Logic**:

```typescript
// Pseudo-code (not actual implementation)
// 1. Find all files importing from $lib/components/ui
// 2. Analyze imports to determine target (atoms/molecules/organisms)
// 3. Replace imports with correct atomic imports
// 4. Verify TypeScript compiles
// 5. Generate report of changes
```

**Usage**:

```bash
# Dry run (preview changes)
npm run migrate-ui-imports --dry-run

# Execute migration
npm run migrate-ui-imports

# Verify changes
npm run check && npm run build
```

**Validation**:

- Script must be tested on small subset first (5-10 files)
- Verify TypeScript compiles after script runs
- Verify build succeeds
- Manual spot-check of migrated files

**Fallback**: If automation fails, manual migration per group (slower but safer)

---

## Per-Group Validation Strategy

**Phase 1.7 Enhancement**: Validate after EACH group, not just at end

**Updated Steps**:

```
Step 1.7.1: Migrate Group 1 (Atoms imports - ~25 files)
Step 1.7.2: Run TypeScript check (npm run check)
Step 1.7.3: Verify build (npm run build)
Step 1.7.4: Smoke test critical pages (see Smoke Test Paths below)
Step 1.7.5: If errors → Fix before proceeding
Step 1.7.6: Repeat for Group 2 (Molecules)
Step 1.7.7: Repeat for Group 3 (Organisms)
```

**Benefits**:

- Catch errors early (smaller rollback scope)
- Validate incrementally (not all-or-nothing)
- Clear progress tracking

---

## Smoke Test Paths

**Critical pages to test after each phase:**

**After Phase 1 (UI Migration)**:

- `/login` - Uses Button, FormInput (atoms)
- `/inbox` - Uses InboxCard, various molecules
- `/meetings` - Uses MeetingCard, various organisms
- `/dashboard` - Uses dashboard components

**After Phase 2 (My Mind Removal)**:

- Navigation still works (no broken links)
- `/my-mind` route removed or commented out

**After Phase 3 (Move Features)**:

- `/dashboard` - ActionItemsList renders correctly
- `/demo-control-panel` - Control panel components render correctly
- `/dev-docs` - AI tools components render correctly

**After Phase 4 (Documentation)**:

- Full CI checks pass (`npm run ci:local`)
- ESLint rule works correctly

**Testing Method**:

- Manual browser testing (visual verification)
- Automated E2E tests (if available)
- Component rendering tests (if available)

---

## Rollback Strategy

### Phase 1 Rollback (UI Migration)

**If migration fails or breaks build:**

```bash
# 1. Revert import changes
git revert <commit-hash>  # For Step 1.7 (import changes)

# 2. Restore types.ts if moved
git checkout HEAD~1 src/lib/components/ui/types.ts

# 3. Restore ui/index.ts if modified
git checkout HEAD~1 src/lib/components/ui/index.ts

# 4. Verify build succeeds
npm run check && npm run build

# 5. Test critical pages render correctly
```

**Partial Rollback (if only one group fails)**:

```bash
# Rollback specific group only
git checkout HEAD~1 -- <group-files>

# Fix issues, then retry migration for that group
```

---

### Phase 2 Rollback (My Mind)

**If removal breaks navigation:**

```bash
# 1. Restore My Mind folder
git checkout HEAD~1 src/lib/components/my-mind/

# 2. Restore route
git checkout HEAD~1 src/routes/(authenticated)/my-mind/+page.svelte

# 3. Verify My Mind page loads
# 4. Verify navigation works
```

---

### Phase 3 Rollback (Move Features)

**If component moves break rendering:**

```bash
# 1. Restore dashboard component
git checkout HEAD~1 src/lib/components/dashboard/

# 2. Restore control panel components
git checkout HEAD~1 src/lib/components/control-panel/

# 3. Update imports back to old paths
# (Manual find-replace or git revert)

# 4. Verify components render correctly
# 5. Verify build succeeds
```

---

### Phase 4 Rollback (Documentation)

**If documentation updates incorrect:**

```bash
# 1. Revert documentation changes
git revert <commit-hash>  # Docs only, low risk

# 2. Verify documentation still accurate
```

---

## Questions to Answer Before Starting

1. **Where should `ui/types.ts` move?**
   - Option A: `components/types.ts` (shared across all atomic levels)
   - Option B: `atoms/types.ts` (if types are atom-specific)
   - **Recommendation**: `components/types.ts` if shared, `atoms/types.ts` if atom-specific

2. **My Mind route removal strategy:**
   - Remove completely?
   - Or comment out with TODO?
   - **Recommendation**: Comment out with TODO (preserves history)

3. **AI Tools migration timing:**
   - Keep in `@components` for now?
   - Or move to `modules/core/components/ai-tools/` temporarily?
   - **Recommendation**: Keep in `@components` with TODO (future module)

---

## Estimated Effort

| Phase                     | Files Affected | Risk Level | Effort    | Priority |
| ------------------------- | -------------- | ---------- | --------- | -------- |
| Phase 1: Remove UI folder | 75 files       | Medium     | 2-3 hours | High     |
| Phase 2: Remove My Mind   | 5 files        | Low        | 30 min    | High     |
| Phase 3: Move features    | 5 files        | Low        | 1-2 hours | Medium   |
| Phase 4: Documentation    | Docs only      | Low        | 1 hour    | Medium   |

**Total Effort**: 4-6 hours

---

## Related Documentation

- [Component Architecture](dev-docs/2-areas/design/component-architecture.md)
- [Atomic Design + Svelte](dev-docs/2-areas/architecture/atomic-design-svelte.md)
- [System Architecture - Modularity](dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)
- [Modularity Refactoring Analysis](dev-docs/2-areas/architecture/modularity-refactoring-analysis.md)

---

**Status**: Ready for Review  
**Created**: 2025-01-XX  
**Owner**: TBD

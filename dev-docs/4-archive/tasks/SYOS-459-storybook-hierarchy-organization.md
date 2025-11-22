# Reorganize Storybook with Hierarchical Navigation

**Linear Ticket**: [SYOS-459](https://linear.app/younghumanclub/issue/SYOS-459)

**Goal**: Implement title-based hierarchy for all Storybook stories to create clear navigation structure that aligns with our modular architecture, making stories easy to find and understand.

---

## Problem Analysis

**Current State**: 
- 52 story files scattered across codebase (co-located with components)
- Flat navigation in Storybook UI - all stories at root level
- No clear separation between Design System components and Module components
- Stories mixed: core UI atoms + meetings module + org-chart module + other modules
- File organization is good (co-located), but Storybook UI navigation is chaotic

**Pain Points**:
- Hard to find specific component stories (scroll through flat list of 52 items)
- No visual separation between design system and feature modules
- Module ownership unclear in Storybook UI
- New developers struggle to navigate component documentation
- Storybook becomes less useful as more components are added

**User Impact**: 
- Slower development (can't find component examples quickly)
- Harder onboarding (unclear what components exist where)
- Module boundaries unclear (design system vs feature-specific components)
- Reduced value from Storybook investment (navigation friction)

**Investigation**:

- ✅ Searched codebase: 52 `.stories.svelte` files found
  - 26 in `src/lib/components/atoms/`
  - 6 in `src/lib/components/organisms/`
  - 9 in `src/lib/modules/meetings/components/`
  - 11 in `src/lib/modules/org-chart/components/`
  - 1 in `src/lib/modules/inbox/components/`

- ✅ Checked patterns: `ui-patterns.md#L4850` has `.svelte` story format pattern
  - Pattern exists for file format
  - No pattern for story organization/hierarchy

- ✅ Reviewed reference code: Storybook Context7 docs show title hierarchy pattern
  - Use `/` in titles to create folder structure
  - Example: `'Design System/Atoms/Button'` creates nested folders

- ✅ Identified modular architecture from `system-architecture.md`:
  - Core modules: Inbox, Meetings, Org Chart, Flashcards
  - Design system: Atoms, Molecules, Organisms (shared UI)
  - Clear separation needed in Storybook navigation

- ✅ Validated design system source: `design-system.json` exists
  - Tokens defined: spacing, colors, typography
  - Component architecture: 4-layer system (Tokens → Utilities → Patterns → Components)
  - Storybook should reflect this architecture

---

## Approach Options

### Approach A: Title-Based Hierarchy (Recommended)

**How it works**: 
- Keep files co-located with components (don't move files)
- Update story `title` metadata to use hierarchical naming
- Structure: `'Category/Subcategory/ComponentName'`
- Examples:
  - Design System: `'Design System/Atoms/Button'`
  - Modules: `'Modules/Meetings/ActionItemsList'`

**Pros**: 
- Zero file moves (preserves co-location)
- Immediate navigation improvement in Storybook UI
- Clear module boundaries (Design System vs Modules)
- Teams still own their story files
- Easy to implement (update 52 titles)
- Scalable (add modules without pollution)

**Cons**: 
- Requires updating all 52 story files
- Need to establish naming conventions
- Manual work (could script, but validation needed)

**Complexity**: Low  
**Dependencies**: None (just file edits)

**Estimated Time**: 2-3h
- 1h: Update 52 story titles
- 30min: Create MDX overview pages per category
- 30min: Test navigation, verify hierarchy
- 30min: Document pattern in `ui-patterns.md`

---

### Approach B: Move Files to Storybook-Specific Folder

**How it works**: 
- Create `src/stories/` folder structure mirroring hierarchy
- Move all `.stories.svelte` files to centralized location
- Example: `src/stories/design-system/atoms/Button.stories.svelte`

**Pros**: 
- Centralized story location (all in one place)
- Clear story-specific folder structure
- Easier to find all stories (don't search across modules)

**Cons**: 
- ❌ **Breaks co-location** - stories separated from components
- ❌ **Breaks module ownership** - teams no longer own their story files
- ❌ **More complex imports** - relative paths become longer
- ❌ **Harder to maintain** - story updates require navigating away from component
- ❌ **Goes against Svelte philosophy** - components should own their documentation

**Complexity**: Medium  
**Dependencies**: Update all imports, move 52 files

**Estimated Time**: 4-5h
- 2h: Move files, update imports
- 1h: Fix broken imports
- 1h: Update tooling (Storybook config)
- 1h: Test, verify, document

---

### Approach C: Separate Storybook Instances Per Module

**How it works**: 
- Create separate Storybook instances for each module
- Example: `.storybook/` (design system), `.storybook-meetings/`, `.storybook-org-chart/`
- Each module gets independent Storybook deployment

**Pros**: 
- Complete module isolation (no cross-module pollution)
- Per-module Storybook configurations (different themes, addons)
- Independent deployments (module teams control their docs)

**Cons**: 
- ❌ **High complexity** - multiple Storybook configs to maintain
- ❌ **Can't see full system** - design system separate from modules
- ❌ **More build time** - multiple Storybook builds
- ❌ **Harder onboarding** - "where is X component?" becomes complex

**Complexity**: High  
**Dependencies**: Multiple Storybook configs, deployment setup

**Estimated Time**: 8-10h
- 3h: Set up separate Storybook instances
- 2h: Configure each instance
- 2h: Update build/deploy scripts
- 1h: Test each instance
- 2h: Document new structure

---

## Recommendation

**Selected**: Approach A (Title-Based Hierarchy)

**Reasoning**:

- ✅ **Preserves co-location** - Teams still own their story files (modular ownership)
- ✅ **Low effort, high impact** - 2-3h work for immediate navigation improvement
- ✅ **Scalable** - Add modules without changing structure
- ✅ **Aligns with Svelte philosophy** - Components own their documentation
- ✅ **Maintains single Storybook** - See full system in one place (design system + modules)
- ✅ **Easy to implement** - Just update story titles (no file moves, no config changes)

**Trade-offs accepted**: 
- Manual work to update 52 titles (but one-time cost)
- Need to establish naming conventions (but this is necessary anyway)

**Risk assessment**: 
- **Low risk**: Simple metadata change (no code changes, no imports broken)
- **High confidence**: Context7 confirms this is standard Storybook pattern
- **Reversible**: Can change titles back if needed (no file moves)

---

## Current State

**Existing Code**:

**Storybook Configuration**:
- `.storybook/main.ts` - Configured, working
- `.storybook/manager.ts` - Theme/branding configured
- Story glob pattern: `../src/**/*.stories.svelte`

**Story Files** (52 total):

**Design System - Atoms** (26 stories):
- `Button.stories.svelte`, `Badge.stories.svelte`, `Card.stories.svelte`, `Chip.stories.svelte`
- `FormInput.stories.svelte`, `FormTextarea.stories.svelte`, `PinInput.stories.svelte`
- `Checkbox.stories.svelte`, `RadioGroup.stories.svelte`, `Switch.stories.svelte`, `Toggle.stories.svelte`
- `Slider.stories.svelte`, `Progress.stories.svelte`, `Meter.stories.svelte`
- `Text.stories.svelte`, `Heading.stories.svelte`, `Avatar.stories.svelte`, `Icon.stories.svelte`
- `Loading.stories.svelte`, `LoadingOverlay.stories.svelte`, `Tooltip.stories.svelte`
- `IconButton.stories.svelte`, `SplitButton.stories.svelte`, `StatusPill.stories.svelte`
- `KeyboardShortcut.stories.svelte`, `Label.stories.svelte`, `Separator.stories.svelte`
- `ScrollArea.stories.svelte`, `AspectRatio.stories.svelte`, `ToggleGroup.stories.svelte`

**Design System - Organisms** (1 story):
- `Dialog.stories.svelte`

**Modules - Meetings** (9 stories):
- `ActionItemsList.stories.svelte`, `AgendaItemView.stories.svelte`, `AttendeeSelector.stories.svelte`
- `CreateMeetingModal.stories.svelte`, `DecisionsList.stories.svelte`, `MeetingCard.stories.svelte`
- `SecretaryConfirmationDialog.stories.svelte`, `SecretarySelector.stories.svelte`
- `TodayMeetingCard.stories.svelte`

**Modules - Org Chart** (11 stories):
- `CategoryHeader.stories.svelte`, `CircleDetailHeader.stories.svelte`, `CircleDetailPanel.stories.svelte`
- `CircleMembersPanel.stories.svelte`, `CircleRolesPanel.stories.svelte`, `CreateCircleModal.stories.svelte`
- `OrgChart.stories.svelte`, `PanelBreadcrumbBar.stories.svelte`, `RoleCard.stories.svelte`
- `RoleDetailHeader.stories.svelte`, `RoleDetailPanel.stories.svelte`

**Modules - Inbox** (1 story):
- `InboxCard.stories.svelte`

**Current Title Format** (inconsistent):
- Some use flat names: `'Button'`, `'Badge'`
- Some use simple categories: `'Atoms/Button'`
- No module separation

**Dependencies**:

- Storybook 10.0.8 (already installed)
- `@storybook/addon-svelte-csf` (already installed)
- No additional dependencies needed

**Patterns**:

- ✅ Story format: `ui-patterns.md#L4850` - Use `.svelte` files with native snippets
- ❌ Story organization: No pattern documented yet (will create)

**Constraints**:

- Must preserve co-location (don't move files)
- Must maintain module ownership (teams own their stories)
- Must work with existing Storybook config (no breaking changes)
- Must be scalable (easy to add new modules/components)

---

## Technical Requirements

**Title Naming Convention**:

**Design System Components**:
```typescript
// Atoms (primitive, single-purpose)
title: 'Design System/Atoms/[ComponentName]'
// Examples: 'Design System/Atoms/Button', 'Design System/Atoms/Badge'

// Molecules (composed, multi-part)
title: 'Design System/Molecules/[ComponentName]'
// Examples: 'Design System/Molecules/Select', 'Design System/Molecules/DropdownMenu'

// Organisms (complex, feature-specific)
title: 'Design System/Organisms/[ComponentName]'
// Examples: 'Design System/Organisms/Dialog', 'Design System/Organisms/Calendar'
```

**Module Components**:
```typescript
title: 'Modules/[ModuleName]/[ComponentName]'
// Examples:
// - 'Modules/Meetings/ActionItemsList'
// - 'Modules/OrgChart/CircleDetailPanel'
// - 'Modules/Inbox/InboxCard'
// - 'Modules/Flashcards/FlashcardViewer'
```

**Overview Pages** (MDX):
```typescript
// Create overview pages for major categories
'Design System/Overview' // Design system intro
'Design System/Atoms/Overview' // Atoms intro
'Modules/Overview' // Module system intro
'Modules/Meetings/Overview' // Meetings module intro
'Modules/OrgChart/Overview' // Org Chart module intro
```

**Story File Updates**:

For each of 52 story files:

1. **Update meta title**:
```typescript
// Before:
export default {
  title: 'Button',
  component: Button
};

// After:
export default {
  title: 'Design System/Atoms/Button',
  component: Button
};
```

2. **Keep everything else the same** (no other changes needed)

**MDX Overview Pages**:

Create new MDX files for category overviews:

```
src/stories/
├── DesignSystem.mdx         # 'Design System/Overview'
├── DesignSystemAtoms.mdx    # 'Design System/Atoms/Overview'
├── Modules.mdx              # 'Modules/Overview'
├── ModulesMeetings.mdx      # 'Modules/Meetings/Overview'
└── ModulesOrgChart.mdx      # 'Modules/OrgChart/Overview'
```

**Testing**:

- Manual validation: Check Storybook UI shows folder structure
- Navigation test: Verify all stories accessible via new structure
- Verify no broken stories (all still render correctly)

---

## Success Criteria

**Functional**:

- ✅ All 52 story files updated with hierarchical titles
- ✅ Storybook UI shows folder structure (Design System, Modules)
- ✅ Clear separation between design system and modules
- ✅ All stories still render correctly (no breakage)
- ✅ Navigation improved (easy to find components)

**Organization**:

- ✅ Design System folder contains: Atoms, Molecules, Organisms
- ✅ Modules folder contains: Meetings, OrgChart, Inbox, (future modules)
- ✅ Overview pages provide context for each category
- ✅ Consistent naming convention across all stories

**Documentation**:

- ✅ Pattern documented in `ui-patterns.md` (new section)
- ✅ Naming convention documented with examples
- ✅ Overview pages explain category purpose
- ✅ Update `component-architecture.md` to mention Storybook

**Quality**:

- ✅ No broken stories (all render correctly)
- ✅ No file moves (co-location preserved)
- ✅ No import changes (no breaking changes)
- ✅ Scalable structure (easy to add new modules/components)

---

## Code Quality & Validation Strategy

**No Svelte code changes** (only metadata updates):
- Skip Svelte MCP validation (not changing `.svelte` code, only story metadata)
- Run `npm run storybook` to verify no errors
- Manual navigation test in Storybook UI

**Validation timing**:
- After each batch of updates: Start Storybook, verify navigation
- Before commit: Full Storybook smoke test (all stories render)

**Quality gates**:
- All stories must render correctly (no breakage)
- Navigation must show folder structure (verify hierarchy works)
- Naming convention must be consistent (check all titles follow pattern)

---

## Implementation Checklist

### Phase 1: Setup & Planning (30min)

- [ ] Create `src/stories/` folder for overview MDX files
- [ ] Document naming convention (this task doc serves as reference)
- [ ] Prepare list of all 52 story files to update

### Phase 2: Update Design System Stories (45min)

**Atoms** (26 files):
- [ ] Update `Button.stories.svelte` → `'Design System/Atoms/Button'`
- [ ] Update `Badge.stories.svelte` → `'Design System/Atoms/Badge'`
- [ ] Update `Card.stories.svelte` → `'Design System/Atoms/Card'`
- [ ] Update `Chip.stories.svelte` → `'Design System/Atoms/Chip'`
- [ ] Update `FormInput.stories.svelte` → `'Design System/Atoms/FormInput'`
- [ ] Update `FormTextarea.stories.svelte` → `'Design System/Atoms/FormTextarea'`
- [ ] Update `PinInput.stories.svelte` → `'Design System/Atoms/PinInput'`
- [ ] Update `Checkbox.stories.svelte` → `'Design System/Atoms/Checkbox'`
- [ ] Update `RadioGroup.stories.svelte` → `'Design System/Atoms/RadioGroup'`
- [ ] Update `Switch.stories.svelte` → `'Design System/Atoms/Switch'`
- [ ] Update `Toggle.stories.svelte` → `'Design System/Atoms/Toggle'`
- [ ] Update `ToggleGroup.stories.svelte` → `'Design System/Atoms/ToggleGroup'`
- [ ] Update `Slider.stories.svelte` → `'Design System/Atoms/Slider'`
- [ ] Update `Progress.stories.svelte` → `'Design System/Atoms/Progress'`
- [ ] Update `Meter.stories.svelte` → `'Design System/Atoms/Meter'`
- [ ] Update `Text.stories.svelte` → `'Design System/Atoms/Text'`
- [ ] Update `Heading.stories.svelte` → `'Design System/Atoms/Heading'`
- [ ] Update `Avatar.stories.svelte` → `'Design System/Atoms/Avatar'`
- [ ] Update `Icon.stories.svelte` → `'Design System/Atoms/Icon'`
- [ ] Update `Loading.stories.svelte` → `'Design System/Atoms/Loading'`
- [ ] Update `LoadingOverlay.stories.svelte` → `'Design System/Atoms/LoadingOverlay'`
- [ ] Update `Tooltip.stories.svelte` → `'Design System/Atoms/Tooltip'`
- [ ] Update `IconButton.stories.svelte` → `'Design System/Atoms/IconButton'`
- [ ] Update `SplitButton.stories.svelte` → `'Design System/Atoms/SplitButton'`
- [ ] Update `StatusPill.stories.svelte` → `'Design System/Atoms/StatusPill'`
- [ ] Update `KeyboardShortcut.stories.svelte` → `'Design System/Atoms/KeyboardShortcut'`
- [ ] Update `Label.stories.svelte` → `'Design System/Atoms/Label'`
- [ ] Update `Separator.stories.svelte` → `'Design System/Atoms/Separator'`
- [ ] Update `ScrollArea.stories.svelte` → `'Design System/Atoms/ScrollArea'`
- [ ] Update `AspectRatio.stories.svelte` → `'Design System/Atoms/AspectRatio'`

**Organisms** (1 file):
- [ ] Update `Dialog.stories.svelte` → `'Design System/Organisms/Dialog'`

### Phase 3: Update Module Stories (30min)

**Meetings Module** (9 files):
- [ ] Update `ActionItemsList.stories.svelte` → `'Modules/Meetings/ActionItemsList'`
- [ ] Update `AgendaItemView.stories.svelte` → `'Modules/Meetings/AgendaItemView'`
- [ ] Update `AttendeeSelector.stories.svelte` → `'Modules/Meetings/AttendeeSelector'`
- [ ] Update `CreateMeetingModal.stories.svelte` → `'Modules/Meetings/CreateMeetingModal'`
- [ ] Update `DecisionsList.stories.svelte` → `'Modules/Meetings/DecisionsList'`
- [ ] Update `MeetingCard.stories.svelte` → `'Modules/Meetings/MeetingCard'`
- [ ] Update `SecretaryConfirmationDialog.stories.svelte` → `'Modules/Meetings/SecretaryConfirmationDialog'`
- [ ] Update `SecretarySelector.stories.svelte` → `'Modules/Meetings/SecretarySelector'`
- [ ] Update `TodayMeetingCard.stories.svelte` → `'Modules/Meetings/TodayMeetingCard'`

**Org Chart Module** (11 files):
- [ ] Update `CategoryHeader.stories.svelte` → `'Modules/OrgChart/CategoryHeader'`
- [ ] Update `CircleDetailHeader.stories.svelte` → `'Modules/OrgChart/CircleDetailHeader'`
- [ ] Update `CircleDetailPanel.stories.svelte` → `'Modules/OrgChart/CircleDetailPanel'`
- [ ] Update `CircleMembersPanel.stories.svelte` → `'Modules/OrgChart/CircleMembersPanel'`
- [ ] Update `CircleRolesPanel.stories.svelte` → `'Modules/OrgChart/CircleRolesPanel'`
- [ ] Update `CreateCircleModal.stories.svelte` → `'Modules/OrgChart/CreateCircleModal'`
- [ ] Update `OrgChart.stories.svelte` → `'Modules/OrgChart/OrgChart'`
- [ ] Update `PanelBreadcrumbBar.stories.svelte` → `'Modules/OrgChart/PanelBreadcrumbs'`
- [ ] Update `RoleCard.stories.svelte` → `'Modules/OrgChart/RoleCard'`
- [ ] Update `RoleDetailHeader.stories.svelte` → `'Modules/OrgChart/RoleDetailHeader'`
- [ ] Update `RoleDetailPanel.stories.svelte` → `'Modules/OrgChart/RoleDetailPanel'`

**Inbox Module** (1 file):
- [ ] Update `InboxCard.stories.svelte` → `'Modules/Inbox/InboxCard'`

### Phase 4: Create Overview Pages (30min)

- [ ] Create `src/stories/DesignSystem.mdx` - Design system overview
- [ ] Create `src/stories/DesignSystemAtoms.mdx` - Atoms category intro
- [ ] Create `src/stories/Modules.mdx` - Module system overview
- [ ] Create `src/stories/ModulesMeetings.mdx` - Meetings module intro
- [ ] Create `src/stories/ModulesOrgChart.mdx` - Org Chart module intro

### Phase 5: Documentation Updates (30min)

- [ ] Add Storybook organization pattern to `dev-docs/2-areas/patterns/ui-patterns.md`
- [ ] Update `dev-docs/2-areas/design/component-architecture.md` to mention Storybook
- [ ] Update symptom table in `dev-docs/2-areas/patterns/INDEX.md` if needed

### Phase 6: Validation & Testing (30min)

- [ ] Start Storybook: `npm run storybook`
- [ ] Verify folder structure appears correctly
- [ ] Navigate through all categories (Design System, Modules)
- [ ] Spot check 10+ stories (verify they render correctly)
- [ ] Check overview pages display correctly
- [ ] Take screenshots of new navigation structure

---

## Design System Validation

**Source**: `design-system.json` (token definitions)  
**Implementation**: `src/app.css` (design tokens)

**Validation Steps**:

1. **Check story titles match component architecture**:
   - Design System categories: Atoms, Molecules, Organisms ✅
   - Module categories: Per module (Meetings, OrgChart, etc.) ✅

2. **Verify no token usage changes** (only metadata updates):
   - No code changes to components ✅
   - No changes to token usage ✅
   - Stories still use same components (just different navigation)

**Findings**:
- ✅ No design system changes needed (only metadata updates)
- ✅ Component architecture alignment verified
- ✅ Token usage unchanged (no component code changes)

---

## Notes

- **No file moves** - Preserve co-location (teams own story files)
- **No breaking changes** - Only metadata updates (title field)
- **Scalable** - Easy to add new modules/components (follow naming convention)
- **Reversible** - Can change titles back if needed (low risk)
- **Pattern documentation** - Add to `ui-patterns.md` for future reference
- **MDX overview pages** - Provide context for each category (onboarding)
- **Context7 validated** - Title hierarchy is standard Storybook pattern

---

**Estimated Time**: 2-3 hours total  
**Risk Level**: Low (simple metadata change, no code changes)  
**Impact**: High (immediate navigation improvement, scalable structure)


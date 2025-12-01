# RoleCard Component Implementation Plan

**Goal**: Implement comprehensive RoleCard component with all states, views, and child components for org chart module.

**Focus**: Storybook-first development for isolated testing and iteration.

**Storybook Path**: `Modules/OrgChart/RoleCard`

---

## Prerequisites

- [x] Understand scope vs purpose distinction (scope is member-level, not role-level)
- [x] Understand CircleDetailPanel shows both Roles AND Sub-Circles
- [x] Understand Circle Lead is must-have role (default, configurable)
- [x] Review Holaspirit reference images for UI patterns
- [x] Create essentials.md documentation
- [ ] Review current RoleCard implementation
- [ ] Review roleCardRecipe implementation

---

## Phase 1: Core States & Recipe Updates

### 1.1 Recipe System Updates

- [ ] Update `roleCardRecipe` with `selected` variant
  - [ ] Add `variant: { default: '', selected: 'bg-selected' }`
  - [ ] Update `defaultVariants` to include `variant: 'default'`
  - [ ] Test recipe in Storybook
- [ ] Update `roleCardRecipe` with `expanded` variant (if needed for styling)
  - [ ] Add `expanded: { true: '', false: '' }` if styling differs
  - [ ] Test recipe in Storybook

### 1.2 Component Props & Structure

- [ ] Add `selected?: boolean` prop to RoleCard
- [ ] Add `expanded?: boolean` prop to RoleCard
- [ ] Add `onToggleExpand?: () => void` prop to RoleCard
- [ ] Add `class?: string` prop support (already exists, verify)
- [ ] Update component to use recipe variants
- [ ] Test all prop combinations in Storybook

---

## Phase 2: Members Integration

### 2.1 RoleMemberItem Component (New)

- [ ] Create `RoleMemberItem.svelte` component
  - [ ] Props: `userId`, `name?`, `email`, `avatarImage?`, `scope?`, `onMenuClick?`, `menuItems?`
  - [ ] Display: Avatar + Name + Email + Scope (if provided)
  - [ ] Actions: Menu icon with context menu
  - [ ] Use design system tokens (no hardcoded values)
- [ ] Create `RoleMemberItem.stories.svelte`
  - [ ] Story: `Default` - Basic member item
  - [ ] Story: `WithScope` - Member with scope text
  - [ ] Story: `WithMenu` - Member with menu actions
  - [ ] Story: `WithAvatar` - Member with custom avatar image
  - [ ] Story: `Selected` - Selected state (if applicable)
- [ ] Export from appropriate location
- [ ] Validate with design system checks

### 2.2 RoleCard Members Support

- [ ] Add `members?: Array<{ userId, name?, email, avatarImage?, scope? }>` prop
- [ ] Add `onAddMember?: () => void` prop
- [ ] Add `onRemoveMember?: (userId: string) => void` prop
- [ ] Add `memberMenuItems?: (userId: string) => Array<...>` prop
- [ ] Update component structure to support expandable content
  - [ ] Change from `<button>` to `<div>` container
  - [ ] Add nested `<button>` for header (clickable)
  - [ ] Add chevron icon for expand/collapse
  - [ ] Add conditional expanded content section
  - [ ] Add divider between header and members list
  - [ ] Render members using RoleMemberItem component
- [ ] Add "Add member" button in expanded state
- [ ] Test expand/collapse behavior in Storybook

---

## Phase 3: Storybook Stories

### 3.1 Existing Stories (Update)

- [ ] Update `Default` story - verify it works
- [ ] Update `WithPurpose` story - verify it works
- [ ] Update `WithFillers` story - verify it works
- [ ] Update `WithEdit` story - verify it works
- [ ] Update `WithMenu` story - verify it works
- [ ] Update `WithAllActions` story - verify it works

### 3.2 New Stories

- [ ] Create `Selected` story - Selected state (highlighted background)
- [ ] Create `Expandable` story - Expandable card (collapsed state)
- [ ] Create `Expanded` story - Expanded card with members list
- [ ] Create `WithInlineMembers` story - Inline members view (no expansion)
- [ ] Create `WithActivity` story - With activity/refresh indicator
- [ ] Create `WithScope` story - Members with scope text displayed

### 3.3 Story Coverage

- [ ] All visual states covered (unselected, selected, hover)
- [ ] All content states covered (with/without purpose, with/without members, with scope)
- [ ] All expansion states covered (collapsed, expanded)
- [ ] All action combinations covered (edit, add member, menu)

---

## Phase 4: Advanced Features

### 4.1 Activity Indicator

- [ ] Add `showActivity?: boolean` prop
- [ ] Add `onActivityClick?: () => void` prop
- [ ] Add activity/refresh icon button
- [ ] Position icon appropriately (right side of header)
- [ ] Test in Storybook

### 4.2 Inline Members View

- [ ] Add `showMembersInline?: boolean` prop
- [ ] When true, show members without expansion UI
- [ ] Display divider between role header and members
- [ ] Render members using RoleMemberItem component
- [ ] Test in Storybook

### 4.3 Member-Level Actions

- [ ] Implement member menu actions
  - [ ] "Edit scope" action
  - [ ] "Leave" action (remove from role)
  - [ ] Other member-specific actions
- [ ] Test menu interactions in Storybook

---

## Phase 5: Design System Compliance

### 5.1 Token Usage

- [ ] Verify all spacing uses semantic tokens (`gap-button`, `mb-header`, etc.)
- [ ] Verify all colors use semantic tokens (`bg-surface`, `text-primary`, etc.)
- [ ] Verify all typography uses semantic tokens (`text-button`, `text-label`, etc.)
- [ ] Run `npm run validate:design-system` - must pass
- [ ] Run `npm run validate:tokens` - must pass

### 5.2 Recipe System

- [ ] Verify recipe handles all styling (no hardcoded classes)
- [ ] Verify recipe uses only design token utilities
- [ ] Verify recipe variants are properly typed
- [ ] Run `npm run recipes:validate` - must pass

### 5.3 Component Structure

- [ ] Verify component follows atomic design principles
- [ ] Verify component uses shared components (Avatar, Button, Icon, etc.)
- [ ] Verify no cross-module imports
- [ ] Run `npm run check` - must pass

---

## Phase 6: Integration & Testing

### 6.1 Integration Points

- [ ] Update CircleDetailPanel to use new RoleCard props
- [ ] Update CircleRolesPanel to use new RoleCard props
- [ ] Verify RoleCard works in all usage contexts
- [ ] Test expand/collapse behavior in real contexts

### 6.2 Visual Regression

- [ ] Test all states in browser (not just Storybook)
- [ ] Verify hover states work correctly
- [ ] Verify selected states are visually distinct
- [ ] Verify expand/collapse animations (if added)
- [ ] Verify responsive behavior

### 6.3 Accessibility

- [ ] Verify keyboard navigation works
- [ ] Verify ARIA labels are correct
- [ ] Verify focus states are visible
- [ ] Test with screen reader (if possible)

---

## Phase 7: Documentation & Cleanup

### 7.1 Documentation

- [ ] Update ROLE_CARD_SPEC.md with final implementation details
- [ ] Update ROLE_CARD_STATES.md with completed states
- [ ] Add JSDoc comments to component props
- [ ] Document any design system exceptions

### 7.2 Cleanup

- [ ] Remove any temporary code or comments
- [ ] Remove any unused imports
- [ ] Verify no console.log statements remain
- [ ] Run final linting check

---

## Validation Checklist

Before marking complete, verify ALL of these:

### Automated Checks

- [ ] `npm run validate:design-system` - ✅ All checks pass
- [ ] `npm run validate:tokens` - ✅ No hardcoded Tailwind
- [ ] `npm run validate:utilities` - ✅ All utilities exist
- [ ] `npm run recipes:validate` - ✅ Recipes use semantic tokens
- [ ] `npm run check` - ✅ No TypeScript/Svelte errors
- [ ] Svelte MCP autofixer - ✅ No issues reported

### Manual Checks

- [ ] All Storybook stories render correctly
- [ ] All states are visually distinct
- [ ] All interactions work as expected
- [ ] Component works in CircleDetailPanel context
- [ ] Component works in CircleRolesPanel context
- [ ] Design system compliance verified

---

## Notes

- **Scope Field**: ⚠️ Defined in version history snapshots but **missing from `userCircleRoles` table** - needs to be added before Phase 2
- **Core Roles**: ✅ Supported via `roleTemplates` table with `isCore`/`isRequired` flags
- **Circle Lead Requirement**: ✅ In schema via `workspaceOrgSettings.requireCircleLeadRole`
- **Sub-Circles**: Displayed in same view as Roles in CircleDetailPanel (not part of RoleCard component)
- **Version History**: ✅ Fully implemented via `orgVersionHistory` table - tracks all changes to circles, roles, assignments, members, items

---

## Schema Gap: Add Scope Field

Before implementing Phase 2 (Members Integration with scope display), add the `scope` field to `userCircleRoles`:

```typescript
// convex/schema.ts - userCircleRoles table
userCircleRoles: defineTable({
	userId: v.id('users'),
	circleRoleId: v.id('circleRoles'),
	scope: v.optional(v.string()), // ← ADD THIS
	assignedAt: v.number()
	// ... rest of fields
});
```

---

---

## Implementation Plan (Detailed)

### Current State ✅

- ✅ Basic RoleCard component exists with core props
- ✅ Basic Storybook stories (Default, WithPurpose, WithFillers, WithEdit, WithMenu, WithAllActions)
- ✅ Recipe with proper list-item padding (`px-input py-stack-item`)
- ✅ Component used in CircleDetailPanel
- ✅ Design tokens verified: `bg-selected` exists (`oklch(55% 0.15 195 / 0.1)`)

### Phase 1.1: Selected State (Priority: High)

**Goal**: Add selected state styling to highlight active/focused role cards.

**Steps**:

1. **Update `roleCardRecipe`** (`src/lib/design-system/recipes/roleCard.recipe.ts`)
   - Add `variant` prop with `default` and `selected` options
   - `selected: 'bg-selected'` (matches InboxCard pattern)
   - `default: ''` (current styling)
   - Update `defaultVariants` to include `variant: 'default'`
   - Reference: `inboxCardRecipe` uses `selected: { true: 'bg-selected', false: '' }`

2. **Update RoleCard Component** (`src/lib/modules/org-chart/components/RoleCard.svelte`)
   - Add `selected?: boolean` prop to Props type
   - Pass `selected` to recipe: `roleCardRecipe({ variant: selected ? 'selected' : 'default' })`
   - Update `buttonClasses` derived to include variant

3. **Create Selected Story** (`src/lib/modules/org-chart/components/RoleCard.stories.svelte`)
   - Add `Selected` story with `selected: true`
   - Show visual difference between selected and unselected states

**Files to Modify**:

- `src/lib/design-system/recipes/roleCard.recipe.ts`
- `src/lib/modules/org-chart/components/RoleCard.svelte`
- `src/lib/modules/org-chart/components/RoleCard.stories.svelte`

**Estimated Time**: 30 minutes

---

### Phase 1.2: Expandable Structure (Priority: High)

**Goal**: Refactor component to support expandable content (members list).

**Steps**:

1. **Refactor Component Structure**
   - Change root element from `<button>` to `<div>` container
   - Add nested `<button>` for header (clickable, handles `onClick`)
   - Apply recipe classes to header button
   - Add conditional expanded content section below header

2. **Add Expand/Collapse Props**
   - Add `expanded?: boolean` prop
   - Add `onToggleExpand?: () => void` prop
   - Add chevron icon (use Icon component with `chevron-down` or `chevron-up`)
   - Position chevron on left or right side of header
   - Handle click on header: if `onToggleExpand` exists, call it; otherwise call `onClick`

3. **Add Expanded Content Section**
   - Conditional rendering: `{#if expanded}`
   - Add divider between header and content (use `border-t border-default` or semantic divider)
   - Placeholder for members list (will be implemented in Phase 2)

4. **Create Expandable Stories**
   - `Expandable` story: collapsed state (`expanded: false`)
   - `Expanded` story: expanded state (`expanded: true`)
   - Show chevron rotation/state change

**Files to Modify**:

- `src/lib/modules/org-chart/components/RoleCard.svelte`
- `src/lib/modules/org-chart/components/RoleCard.stories.svelte`

**Design Decisions**:

- Chevron position: Right side (after actions) or left side (before avatar)?
- Chevron rotation: Use CSS transform or conditional icon type?
- Divider styling: Use semantic token (`border-default`)

**Estimated Time**: 1-2 hours

---

### Phase 2.1: RoleMemberItem Component (Priority: Medium)

**Goal**: Create reusable component for displaying individual members in role cards.

**Steps**:

1. **Create RoleMemberItem Component** (`src/lib/modules/org-chart/components/RoleMemberItem.svelte`)
   - Props:
     - `userId: string` (required)
     - `name?: string`
     - `email: string` (required)
     - `avatarImage?: string`
     - `scope?: string` (member-level scope text)
     - `menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>`
     - `onClick?: () => void`
   - Structure:
     - Avatar (use Avatar component, initials from name or email)
     - Name + Email (or scope if provided)
     - ActionMenu (if menuItems provided)
   - Use design tokens: `px-input py-stack-item`, `gap-button`, etc.

2. **Create RoleMemberItem Stories** (`src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte`)
   - `Default`: Basic member item
   - `WithScope`: Member with scope text displayed
   - `WithMenu`: Member with menu actions
   - `WithAvatar`: Member with custom avatar image

3. **Export Component**
   - Add to appropriate index file if needed
   - Verify imports work correctly

**Files to Create**:

- `src/lib/modules/org-chart/components/RoleMemberItem.svelte`
- `src/lib/modules/org-chart/components/RoleMemberItem.stories.svelte`

**Design Decisions**:

- Should RoleMemberItem be clickable? (probably yes, to view member profile)
- Layout: Avatar + Name/Email + Menu (similar to RoleCard header)
- Scope display: Show below name/email or inline?

**Estimated Time**: 1-2 hours

---

### Phase 2.2: Members Integration (Priority: Medium)

**Goal**: Add members list rendering to RoleCard expanded state.

**Steps**:

1. **Add Members Props to RoleCard**
   - `members?: Array<{ userId: string; name?: string; email: string; avatarImage?: string; scope?: string }>`
   - `onAddMember?: () => void`
   - `onRemoveMember?: (userId: string) => void`
   - `memberMenuItems?: (userId: string) => Array<{ label: string; onclick: () => void; danger?: boolean }>`

2. **Render Members List**
   - In expanded content section
   - Map over `members` array
   - Render `RoleMemberItem` for each member
   - Pass appropriate props to RoleMemberItem
   - Use `gap-fieldGroup` for spacing between members

3. **Add "Add Member" Button**
   - Show in expanded state (below members list or above)
   - Use Button component with icon
   - Call `onAddMember` when clicked
   - Style appropriately (ghost variant, small size)

4. **Update Stories**
   - `Expanded` story: Show with members list
   - `WithMembers` story: Show expanded card with multiple members
   - `WithScope` story: Show members with scope text

**Files to Modify**:

- `src/lib/modules/org-chart/components/RoleCard.svelte`
- `src/lib/modules/org-chart/components/RoleCard.stories.svelte`

**Design Decisions**:

- Empty state: Show "No members" message or just "Add member" button?
- Member count: Show count in header when collapsed?
- Add member button position: Top or bottom of list?

**Estimated Time**: 2-3 hours

---

### Phase 3: Advanced Features (Priority: Low)

**Goal**: Add activity indicator and inline members view.

**Steps**:

1. **Activity Indicator**
   - Add `showActivity?: boolean` prop
   - Add `onActivityClick?: () => void` prop
   - Add refresh/activity icon button
   - Position in header (right side, before actions)

2. **Inline Members View**
   - Add `showMembersInline?: boolean` prop
   - When true, show members without expansion UI
   - Display divider between role header and members
   - Render members using RoleMemberItem component

3. **Create Stories**
   - `WithActivity`: Show activity indicator
   - `WithInlineMembers`: Show inline members view

**Estimated Time**: 1-2 hours

---

### Phase 4: Design System Validation (Priority: High)

**Goal**: Ensure all changes comply with design system rules.

**Steps**:

1. **Run Validation Commands**
   - `npm run validate:design-system`
   - `npm run validate:tokens`
   - `npm run recipes:validate`
   - `npm run check`

2. **Manual Review**
   - Verify all spacing uses semantic tokens
   - Verify all colors use semantic tokens
   - Verify all typography uses semantic tokens
   - Check for hardcoded values

3. **Fix Any Issues**
   - Address linter errors
   - Fix design system violations
   - Update documentation

**Estimated Time**: 30 minutes - 1 hour

---

### Phase 5: Integration & Testing (Priority: High)

**Goal**: Integrate updated RoleCard into existing usage contexts.

**Steps**:

1. **Update CircleDetailPanel**
   - Test with new props (selected, expanded)
   - Verify existing functionality still works
   - Test expand/collapse behavior

2. **Update CircleRolesPanel** (if exists)
   - Similar integration testing

3. **Visual Regression Testing**
   - Test all states in browser
   - Verify hover states
   - Verify selected states
   - Verify expand/collapse animations
   - Test responsive behavior

4. **Accessibility Testing**
   - Keyboard navigation
   - ARIA labels
   - Focus states
   - Screen reader testing (if possible)

**Estimated Time**: 1-2 hours

---

## Execution Order

**Recommended Sequence**:

1. ✅ **Phase 1.1** (Selected State) - Quick win, low risk
2. ✅ **Phase 1.2** (Expandable Structure) - Foundation for members
3. ✅ **Phase 2.1** (RoleMemberItem) - Reusable component
4. ✅ **Phase 2.2** (Members Integration) - Complete expandable feature
5. ✅ **Phase 4** (Design System Validation) - Ensure compliance
6. ✅ **Phase 5** (Integration & Testing) - Real-world testing
7. ⏳ **Phase 3** (Advanced Features) - Nice-to-have features

---

**Status**: 📋 Detailed Plan Created  
**Last Updated**: 2025-12-01
**Next Step**: Begin Phase 1.1 (Selected State)

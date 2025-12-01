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

- **Scope Field**: Currently not in schema - will be added in future schema update
- **Core Roles**: Currently not supported - will be added in future enhancement
- **Circle Lead Requirement**: Conceptually enforced but not in schema constraints yet
- **Sub-Circles**: Displayed in same view as Roles in CircleDetailPanel (not part of RoleCard component)
- **Version History**: Full traceability system planned for future - will track all changes to roles, circles, domains, purpose, etc. Enables AI analysis and visual timeline views (not in current scope)

---

**Status**: ⏳ Planning Phase  
**Last Updated**: 2025-01-27

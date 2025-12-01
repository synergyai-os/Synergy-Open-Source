# RoleCard Component - States & Views Specification

Based on Holaspirit reference and current implementation analysis.

---

## Component States

### 1. **Visual States**

#### 1.1 Selection State

- **Unselected** (default): White/neutral background
- **Selected/Active**: Highlighted background (peach/light background) - indicates active/focused role
- **Hover**: Subtle background change (already implemented via `hover:bg-subtle`)

#### 1.2 Content States

- **With Purpose**: Shows role name + role purpose/description text (role-level)
- **Without Purpose**: Shows role name + filler count ("0 fillers", "3 fillers")
- **With Scope**: Shows member scope text (member-level, per-user assignment)
  - **IMPORTANT**: Scope is per-user, not per-role
  - Multiple users can have the same role with different scopes
  - Example: 2 people can be "Circle Lead" where one handles "technical strategy" and the other handles "matching people with roles"
- **With Members**: Shows assigned members below role (expandable)
- **Without Members**: Shows only role info, no members section

#### 1.3 Expansion State

- **Collapsed**: Shows only role header (name, purpose/filler count, actions)
- **Expanded**: Shows role header + assigned members list below

---

## Component Views/Variations

### View 1: **Simple Role Card** (Current Implementation)

**Use Case**: List view in CircleDetailPanel, simple role display

- Role name (with avatar initials)
- Purpose OR filler count
- Edit button (optional)
- Action menu (optional)
- **No members shown**

**Current Props**:

```typescript
{
  name: string;
  purpose?: string;
  fillerCount?: number;
  onClick: () => void;
  onEdit?: () => void;
  menuItems?: Array<...>;
}
```

---

### View 2: **Role Card with Expandable Members** (New)

**Use Case**: CircleRolesPanel, showing who fills the role

- Role header (name, purpose/filler count)
- Expand/collapse indicator (chevron icon)
- **Expanded state shows**:
  - List of assigned members (avatar + name + email)
  - Each member has menu icon
  - "Add member" button/form
- Actions: Edit, Add member, Menu

**Required Props Addition**:

```typescript
{
  // ... existing props
  expanded?: boolean;
  onToggleExpand?: () => void;
  members?: Array<{
    userId: string;
    name?: string;
    email: string;
    avatarImage?: string;
  }>;
  onAddMember?: () => void;
  onRemoveMember?: (userId: string) => void;
  memberMenuItems?: (userId: string) => Array<...>;
}
```

---

### View 3: **Role Card with Inline Members** (New)

**Use Case**: Showing role with assigned members in a single card (like first image)

- **Top Section**: Role info (name, actions)
- **Divider**: Thin horizontal line
- **Bottom Section**: Assigned members list
  - Each member: Avatar + Name + Menu icon
  - Member actions are per-member (not per-role)

**Required Props Addition**:

```typescript
{
  // ... existing props
  showMembersInline?: boolean;
  members?: Array<...>; // Same as View 2
  onMemberClick?: (userId: string) => void;
  onMemberMenuClick?: (userId: string, action: string) => void;
}
```

---

### View 4: **Selected Role Card** (New)

**Use Case**: Highlighting active/selected role (like "Randy Hereman" in second image)

- Same as View 1 or View 2
- **Additional**: Selected state styling (highlighted background)

**Required Props Addition**:

```typescript
{
  // ... existing props
  selected?: boolean;
}
```

---

### View 5: **Role Card with Activity Indicator** (New)

**Use Case**: Showing role with recent activity (like refresh icon in second image)

- Same as View 1 or View 2
- **Additional**: Activity/refresh icon button

**Required Props Addition**:

```typescript
{
  // ... existing props
  showActivity?: boolean;
  onActivityClick?: () => void;
}
```

---

## Action Buttons/Icons

### Role-Level Actions (Top Section)

1. **Edit** (pencil icon) - Opens edit modal/panel
2. **Add Member** (person + plus icon) - Opens add member modal
3. **More Menu** (vertical ellipsis) - Context menu with:
   - Copy URL
   - Export to PDF
   - Export to spreadsheet
   - Convert role to circle
   - Move role
   - Notifications
   - Settings
   - Delete role (danger)

### Member-Level Actions (Bottom Section)

1. **More Menu** (vertical ellipsis) - Per-member context menu:
   - View profile
   - Remove from role
   - Change scope (if applicable)
   - Other member-specific actions

---

## Recipe Variants Needed

### `roleCardRecipe` Variants:

```typescript
{
  variant: {
    default: '', // Unselected
    selected: 'bg-selected', // Highlighted background
  },
  expanded: {
    true: '', // Expanded state styling
    false: ''
  },
  showMembers: {
    true: '', // Has members section
    false: ''
  }
}
```

---

## Component Structure

### Current Structure:

```
<button> (RoleCard)
  ├── Avatar (role initials)
  ├── Content
  │   ├── Role Name
  │   └── Purpose OR Filler Count
  └── Actions
      ├── Edit Button (optional)
      └── ActionMenu (optional)
```

### Proposed Structure (Expandable):

```
<div> (RoleCard container)
  ├── <button> (Role Header - clickable)
  │   ├── Chevron Icon (expand/collapse)
  │   ├── Avatar (role initials)
  │   ├── Content
  │   │   ├── Role Name
  │   │   └── Purpose OR Filler Count
  │   └── Actions
  │       ├── Edit Button
  │       ├── Add Member Button
  │       └── ActionMenu
  └── <div> (Expanded Content - conditional)
      ├── Divider (if members shown)
      └── Members List
          └── <div> (Member Item)
              ├── Avatar
              ├── Name + Email
              └── Member Menu
```

---

## Implementation Plan

### Phase 1: Core States

1. ✅ Basic role card (current implementation)
2. Add `selected` prop + variant
3. Add `expanded` prop + expand/collapse UI

### Phase 2: Members Integration

4. Add `members` prop + member list rendering
5. Add member actions (remove, menu)
6. Add "Add member" button/form

### Phase 3: Advanced Features

7. Add activity indicator
8. Add inline members view option
9. Add member-level actions menu

### Phase 4: Polish

10. Add animations (expand/collapse)
11. Add loading states
12. Add empty states

---

## Questions to Resolve

1. **Component Structure**: Should RoleCard be a `<button>` (current) or `<div>` with nested `<button>` for header?
   - **Recommendation**: Change to `<div>` with nested `<button>` for header to support expandable content

2. **Member Component**: Should we create a separate `RoleMemberItem` component or inline in RoleCard?
   - **Recommendation**: Create `RoleMemberItem` component for reusability

3. **Expansion Behavior**: Click entire card or separate expand button?
   - **Recommendation**: Click header expands, separate actions don't trigger expansion

4. **Selected State**: How is selection managed? Parent component or internal state?
   - **Recommendation**: Controlled via `selected` prop (parent manages selection)

5. **Add Member Flow**: Inline form or modal?
   - **Recommendation**: Modal (like image 6) - cleaner UX, matches design

---

## Next Steps

1. **Confirm component structure** (button vs div)
2. **Create RoleMemberItem component** (if separate)
3. **Update roleCardRecipe** with new variants
4. **Implement expandable state**
5. **Add members list rendering**
6. **Add selected state styling**
7. **Test all states and views**

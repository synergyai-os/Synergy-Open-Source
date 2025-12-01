# RoleCard Component - States & Views Summary

**Focus**: RoleCard + child components for Storybook development  
**Storybook Path**: `Modules/OrgChart/RoleCard`

---

## Key Clarifications

### Scope vs Purpose

- **Purpose**: Role-level description (what the role does)
- **Scope**: Member-level text (per-user assignment within role)
  - Multiple users can have the same role with different scopes
  - Example: 2 "Circle Lead" roles:
    - User 1 scope: "Technical strategy"
    - User 2 scope: "Matching people with roles"

---

## Component States

### 1. Visual States

- ✅ **Unselected** (default) - White/neutral background
- ⏳ **Selected** - Highlighted background (peach/light)
- ✅ **Hover** - Subtle background change (already implemented)

### 2. Content States

- ✅ **With Purpose** - Shows role name + purpose text
- ✅ **Without Purpose** - Shows role name + filler count
- ⏳ **With Scope** - Shows member scope text (member-level)
- ⏳ **With Members** - Shows assigned members list
- ✅ **Without Members** - Shows only role info

### 3. Expansion States

- ✅ **Collapsed** - Shows only role header
- ⏳ **Expanded** - Shows role header + members list

---

## Component Views

### View 1: Simple Role Card ✅ (Current)

**Storybook Story**: `Default`, `WithPurpose`, `WithFillers`

- Role name + avatar initials
- Purpose OR filler count
- Edit button (optional)
- Action menu (optional)
- **No members shown**

### View 2: Selected Role Card ⏳ (New)

**Storybook Story**: `Selected`

- Same as View 1
- **Additional**: Selected state styling

### View 3: Expandable Role Card ⏳ (New)

**Storybook Story**: `Expandable`, `Expanded`

- Role header (same as View 1)
- Expand/collapse chevron icon
- **Expanded**: Members list with avatars
- "Add member" button

### View 4: Role Card with Inline Members ⏳ (New)

**Storybook Story**: `WithInlineMembers`

- Top section: Role info + actions
- Divider line
- Bottom section: Assigned members list
- Each member has own menu

### View 5: Role Card with Activity ⏳ (New)

**Storybook Story**: `WithActivity`

- Same as View 1 or 2
- Activity/refresh icon button

---

## Child Components Needed

### 1. RoleMemberItem ⏳ (New)

**Purpose**: Display individual member in role card  
**Props**:

```typescript
{
  userId: string;
  name?: string;
  email: string;
  avatarImage?: string;
  scope?: string; // Member-level scope text
  onMenuClick?: (action: string) => void;
  menuItems?: Array<{ label: string; onclick: () => void; danger?: boolean }>;
}
```

**Storybook Path**: `Modules/OrgChart/RoleMemberItem`

---

## Storybook Stories to Create

### RoleCard Stories (`Modules/OrgChart/RoleCard`)

1. ✅ `Default` - Basic role card
2. ✅ `WithPurpose` - Role with purpose text
3. ✅ `WithFillers` - Role with filler count
4. ✅ `WithEdit` - Role with edit button
5. ✅ `WithMenu` - Role with action menu
6. ✅ `WithAllActions` - Role with all actions
7. ⏳ `Selected` - Selected state (highlighted)
8. ⏳ `Expandable` - Expandable card (collapsed)
9. ⏳ `Expanded` - Expanded card with members
10. ⏳ `WithInlineMembers` - Inline members view
11. ⏳ `WithActivity` - With activity indicator

### RoleMemberItem Stories (`Modules/OrgChart/RoleMemberItem`)

1. ⏳ `Default` - Basic member item
2. ⏳ `WithScope` - Member with scope text
3. ⏳ `WithMenu` - Member with menu actions
4. ⏳ `WithAvatar` - Member with custom avatar

---

## Implementation Priority

### Phase 1: Core States (Storybook First)

1. ✅ Basic role card (done)
2. ⏳ Add `selected` prop + variant
3. ⏳ Add `expanded` prop + expand/collapse UI
4. ⏳ Create RoleMemberItem component
5. ⏳ Add members list rendering

### Phase 2: Advanced Features

6. ⏳ Add scope display (member-level)
7. ⏳ Add inline members view
8. ⏳ Add activity indicator
9. ⏳ Add member-level actions menu

### Phase 3: Polish

10. ⏳ Add animations (expand/collapse)
11. ⏳ Add loading states
12. ⏳ Add empty states

---

## Next Steps

1. **Update roleCardRecipe** with `selected` and `expanded` variants
2. **Create RoleMemberItem component** with scope support
3. **Update RoleCard** to support expandable state
4. **Add Storybook stories** for all states
5. **Test in isolation** before integrating

---

**Legend**: ✅ Done | ⏳ To Do

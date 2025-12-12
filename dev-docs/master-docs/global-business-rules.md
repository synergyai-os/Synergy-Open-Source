# Global Business Rules

**Last Updated**: 2025-12-02

This document defines global business rules that apply across the entire SynergyOS application. These rules govern how the system behaves and should be consistently enforced throughout the codebase.

---

## Date and Time Conventions

### Date Format: Day/Month/Year (DD/MM/YYYY)

**Rule**: SynergyOS uses **day/month/year** format, not month/day/year.

**Rationale**: This aligns with international standards (ISO 8601 alternative) and is common in many regions outside the US.

**Current State**:
- Multiple locations use `toLocaleDateString('en-US', ...)` which defaults to month/day/year format
- Bits UI DatePicker components use `@internationalized/date` library but may not have explicit locale configuration
- Date formatting utilities in `src/lib/utils/date.ts` default to `'en-US'` locale

**Files Requiring Updates**:
- `src/lib/utils/date.ts` - `formatDate()` function uses `'en-US'` locale
- `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts` - Uses `'en-US'` locale for date formatting
- `src/lib/modules/projects/composables/useTaskForm.svelte.ts` - Uses `'en-US'` locale
- `src/lib/modules/core/components/dashboard/ActionItemsList.svelte` - Uses `'en-US'` locale
- `src/lib/modules/meetings/components/MeetingCard.svelte` - Uses `'en-US'` locale
- `src/lib/modules/meetings/components/TodayMeetingCard.svelte` - Uses `'en-US'` locale
- `src/routes/(authenticated)/org/members/+page.svelte` - Uses `'en-US'` locale

**Implementation Notes**:
- Use locale `'en-GB'` or a custom locale configuration that enforces day/month/year format
- Bits UI DatePicker components should be configured with appropriate locale via `@internationalized/date`
- Consider creating a centralized locale configuration constant

---

### First Day of Week: Monday

**Rule**: The first day of the week is **Monday**, not Sunday.

**Rationale**: Aligns with ISO 8601 standard and common international conventions.

**Current State**:
- `DAY_NAMES` constant in `src/lib/modules/meetings/utils.ts` starts with `['Sun', 'Mon', ...]` (Sunday-first)
- JavaScript's `Date.getDay()` returns 0 for Sunday, 1 for Monday (Sunday-first)
- Bits UI DatePicker calendar grid uses `weekdays` which may default to Sunday-first
- Recurrence field displays days starting with Sunday

**Files Requiring Updates**:
- `src/lib/modules/meetings/utils.ts` - `DAY_NAMES` array should start with Monday
- `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts` - Day-of-week calculations assume Sunday-first
- `src/lib/modules/meetings/components/RecurrenceField.svelte` - Day toggle group displays Sunday-first
- Bits UI DatePicker components - Need locale configuration to set Monday as first day
- `src/lib/utils/calendar.ts` - ICS generation uses `['SU', 'MO', ...]` array (Sunday-first)

**Implementation Notes**:
- Configure `@internationalized/date` calendar locale to use Monday as first day
- Update `DAY_NAMES` to start with Monday: `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`
- Update day-of-week index mappings (0 = Monday, 6 = Sunday)
- Ensure Bits UI DatePicker calendar grid displays Monday-first
- Update ICS calendar export to use correct day order if needed

---

## Circle Lead Role Requirement

### Lead Role Requirement Varies by Circle Type

**Rule**: Lead role requirement depends on circle type. Not all circles require a Lead.

**Rationale**: Different organizational models have different leadership needs. Hierarchy circles need clear authority; empowered teams operate as peers; guilds are coordination-only spaces.

**Circle Type → Lead Requirement**:

| Circle Type | Lead Required | Lead Authority | Lead Label (Default) |
|-------------|---------------|----------------|---------------------|
| `hierarchy` | ✅ YES | Authority (makes decisions) | "Manager" |
| `empowered_team` | ❌ NO | Facilitative (coordinates, no authority) | "Coordinator" |
| `guild` | ❌ NO | Convening (schedules only) | "Steward" |
| `hybrid` | ✅ YES | Authority (default) | "Lead" |

**Key Points**:
- **Default Name**: Varies by circle type (see table above)
- **Customizable Labels**: Workspace admin can customize labels per circle type (Phase 4+)
- **Authority Computed at Runtime**: Authority level derived from `circle.circleType`, not stored on role
- **Identification**: Lead role is identified by `templateId` → `template.isRequired === true`
- **Only One Lead Template**: Only one template per workspace can have `isRequired: true` (enforced)
- **Display**: Lead role displays authority badge based on circle type (👔 Authority, 🤝 Facilitative, 🌱 Convening)

**Design Reference**: See `ai-docs/tasks/SYOS-670-circle-lead-authority-design.md` for full specification.

### Lead Role Template: Live Sync Pattern

**Critical Design Decision**: Lead Role Template uses **live sync** (not blueprint pattern).

**Why**: The Lead role is a standard organizational role, not a circle-specific accountability. All Lead roles across all circles must remain consistent to enforce uniform communication and responsibilities.

**How It Works**:

1. **Template Changes → Propagate to ALL Existing Roles**:
   - When workspace admin updates Lead template name → ALL Lead roles across ALL circles update their name
   - When workspace admin updates Lead template description → ALL Lead roles update their purpose
   - This ensures consistent communication across the entire workspace

2. **Direct Role Edits Are Blocked**:
   - Users CANNOT directly edit Lead roles (name or purpose)
   - Only workspace admin can edit Lead roles via the template
   - Attempting to edit a Lead role directly throws error: "Circle roles created from Lead template cannot be edited directly. Edit the role template instead."

3. **Template-Based Identification**:
   - Lead Role = role where `role.templateId` → `template.isRequired === true`
   - Only roles created from templates can be Lead roles
   - Existing roles without `templateId` are NOT Lead roles

4. **Authority Computed at Runtime** (NEW - SYOS-670):
   - Lead authority is NOT stored on the role or template
   - Authority derived from `circle.circleType` using constant lookup
   - Enables circles to change type without data migration

### Lead Authority by Circle Type (NEW - SYOS-670)

**Rule**: Lead authority adapts to circle type using hard-coded defaults.

**Implementation** (`src/lib/infrastructure/organizational-model/constants.ts`):

```typescript
// System values (never change)
export const CIRCLE_TYPE_LEAD_AUTHORITY = {
  hierarchy: 'authority',      // Lead makes decisions
  empowered_team: 'facilitative', // Lead coordinates, team decides via consent
  guild: 'convening',          // Lead schedules only, no authority
  hybrid: 'authority'          // Default to authority
};

// Simple constant lookup (no database queries)
export function getLeadAuthorityLevel(circleType) {
  return CIRCLE_TYPE_LEAD_AUTHORITY[circleType ?? 'hierarchy'];
}
```

**Authority Levels**:

| Level | Permissions | UI Badge |
|-------|-------------|----------|
| `authority` | Approve proposals, assign roles | 👔 Authority Role |
| `facilitative` | Facilitate meetings, no approval | 🤝 Facilitative Role |
| `convening` | Schedule meetings only | 🌱 Convening Role |

**Consent vs Manager Decides**:
- **hierarchy** circles: Lead approves proposals directly (`manager_decides`)
- **empowered_team** circles: Team approves via consent ("no valid objections")
- **guild** circles: No approval here - decisions made in home circles

**Current State**:
- ✅ System-level template exists: "Circle Lead" with `isCore: true` and `isRequired: true`
- ✅ Core roles auto-created when circles are created (for hierarchy/hybrid only)
- ✅ Protection against archiving required roles (if `template.isRequired === true`)
- ✅ `circleType` and `decisionModel` fields exist in schema
- ❌ **Missing**: Authority level constants and helpers (SYOS-670 Phase 1)
- ❌ **Missing**: Authority-aware permission checks (SYOS-670 Phase 1)
- ❌ **Missing**: UI authority badges (SYOS-670 Phase 1)
- ❌ **Missing**: Lead optionality by circle type (SYOS-670 Phase 3)

**Enforcement Requirements**:

1. **Backend Validation** (`convex/circleRoles.ts`):
   - **Block direct edits**: In `circleRoles.update()`, check if role is Lead role → throw error if user tries to edit
   - **Prevent archiving last Lead**: In `archiveRoleHelper()`, check if it's the last Lead role in circle → throw error (for hierarchy/hybrid only)
   - **Conditional Lead creation**: On circle creation, only create Lead for `hierarchy` and `hybrid` types

2. **Authority Resolution** (`convex/core/authority/rules.ts`):
   - **Simple constant lookup**: `calculateAuthorityLevel(circle.circleType)` - no database queries
   - **Permission check**: `hasApprovalAuthority()` uses authority level to determine approval rights
   - **Quick edit access** lives in RBAC (`convex/rbac/orgChart.ts`) and composes authority where needed

3. **UI Display** (`src/lib/modules/org-chart/components/RoleDetailPanel.svelte`):
   - Display authority badge based on circle type
   - Show contextual description of Lead authority
   - Disable edit button for Lead roles (only workspace admin can edit via template)

**Implementation Notes**:
- Lead role identification: Query role's `templateId`, then check `template.isRequired === true`
- Authority is NOT stored anywhere - computed from `circle.circleType` at runtime
- Workspace-level templates can override system templates (workspace admin can create their own Lead role template)
- Labels are customizable per workspace (Phase 4+), values are fixed

**Design Reference**: See `ai-docs/tasks/SYOS-670-circle-lead-authority-design.md` for full specification.

---

## CircleRole → RBAC Auto-Assignment

### Organizational Roles Grant RBAC Permissions

**Rule**: When a user fills an organizational role (CircleRole), they automatically receive the RBAC permissions mapped to that role template.

**Rationale**: Certain organizational roles require specific capabilities. Circle Lead needs to assign users to roles; this shouldn't require manual RBAC configuration.

### Key Behaviors

1. **Auto-Assignment is Always Enabled**
   - This is a DEFAULT BEHAVIOR of the CircleRole itself
   - NOT tied to Quick Edit Mode (these are independent features)
   - Quick Edit Mode = Org Designer can edit structure without governance
   - Circle Lead assignment = Can assign members to roles in their circle (always ON)

2. **Circle-Scoped Permissions**
   - Auto-assigned RBAC permissions are scoped to the specific circle
   - Circle Lead of Marketing can assign roles **in Marketing only**, not in Sales
   - `circleId` field on `userRoles` enforces this scope

3. **Source Tracking for Cleanup**
   - `sourceCircleRoleId` field tracks which CircleRole granted the RBAC permission
   - When user removed from CircleRole → Only that specific auto-assignment is revoked
   - Prevents over-revoking if user has multiple roles in same circle

### Permission Inheritance (Higher Scope Wins)

**Rule**: Broader permission scope always wins over narrower scope.

**Scope Priority**: System (no scope) > Workspace > Circle

**Examples**:
- User has system-level `users.change-roles` → Can assign roles anywhere
- User has workspace-level `users.change-roles` → Can assign roles in any circle within that workspace
- User has circle-level `users.change-roles` (Circle Lead) → Can assign roles only in that specific circle

**Conflict Resolution**: If user has both workspace-scope (`all`) and circle-scope (`own`) for same permission, workspace-scope wins.

### Default Role Template Mappings

| Organizational Role | RBAC Permission | Scope |
|---------------------|-----------------|-------|
| Circle Lead | `users.change-roles` | `own` (within circle) |
| Org Designer | `circles.quick-edit` | `all` (workspace-wide) |

**Note**: Additional mappings can be configured by System Admin via admin UI.

### Implementation Requirements

1. **Schema Changes** (`convex/schema.ts`):
   - `roleTemplates.rbacPermissions`: Array of `{ permissionSlug, scope }` mappings
   - `userRoles.sourceCircleRoleId`: Links auto-assigned roles to their source

2. **Backend Logic** (`convex/circleRoles.ts`):
   - On user assigned to CircleRole → Check template for `rbacPermissions` → Auto-create `userRoles`
   - On user removed from CircleRole → Query by `sourceCircleRoleId` → Revoke only those roles

3. **Validation Test Case**:
   - ✅ Circle Lead assigns user to role in their circle → Success
   - ❌ Non-Circle Lead tries to assign → Permission denied
   - ✅ Org Designer assigns (workspace-level permission) → Success

**Implementation Ticket**: [SYOS-649](https://linear.app/younghumanclub/issue/SYOS-649)

**Reference**: `src/lib/infrastructure/rbac/docs/essentials.md` for full RBAC documentation

---

## Internationalization Considerations

### Workspace vs User-Level Preferences

**Question**: Should locale preferences be configurable per workspace/user, or fixed globally?

**Current Infrastructure**:
- ✅ `workspaceSettings` table exists in schema (admin-controlled)
- ✅ `userSettings` table exists in schema (user-controlled)
- ✅ Settings API pattern already established (`convex/settings.ts`, `convex/workspaceSettings.ts`)
- ✅ Settings UI pattern exists (`src/routes/settings/+page.svelte`)

**Options**:

#### Option 1: Fixed Global Default (Recommended for MVP)
- **Complexity**: Low
- **Effort**: ~2-4 hours
- **Scope**: Update all date/time components to use fixed locale (`'en-GB'` or custom)
- **Pros**: Simple, fast to implement, consistent UX
- **Cons**: No flexibility for international companies
- **Decision**: Pick one default (day/month/year, Monday-first) and enforce it

#### Option 2: Workspace-Level Preference
- **Complexity**: Medium
- **Effort**: ~1-2 days
- **Scope**:
  - Add `locale` field to `workspaceSettings` schema
  - Create settings UI for workspace admins
  - Create locale context/composable to provide locale to components
  - Update all date/time components to accept locale prop
  - Update date formatting utilities to accept locale parameter
- **Pros**: Workspace-level control (good for companies)
- **Cons**: More complex, requires context propagation

#### Option 3: User-Level Preference (with Workspace Override)
- **Complexity**: High
- **Effort**: ~3-5 days
- **Scope**:
  - Add `locale` field to both `userSettings` and `workspaceSettings`
  - Implement preference hierarchy: workspace → user → default
  - Create locale context/composable with preference resolution
  - Update all date/time components
  - Add user settings UI
  - Handle preference conflicts (workspace vs user)
- **Pros**: Maximum flexibility for international companies
- **Cons**: Most complex, requires careful UX design

**Recommendation**: **Option 1 (Fixed Global Default)** for now, with clear documentation that this can be made configurable later if needed.

**Rationale**:
1. Your upcoming client "might desire" but doesn't "require" this
2. Fixed default is much faster to implement correctly
3. Can be upgraded to Option 2 or 3 later without breaking changes
4. Focus development effort on core product features
5. Most users will accept a consistent default if it's well-documented

---

## Related Components and Libraries

### Date/Time Components
- `src/lib/components/atoms/DateInput.svelte` - Uses Bits UI DatePicker
- `src/lib/components/atoms/TimeInput.svelte` - Uses Bits UI TimeField
- `src/lib/components/molecules/DateTimeField.svelte` - Composes DateInput and TimeInput
- `src/lib/components/molecules/DatePicker.svelte` - Wrapper around Bits UI DatePicker
- `src/lib/components/organisms/Calendar.svelte` - Uses Bits UI Calendar

### Date Utilities
- `src/lib/utils/date.ts` - Date formatting utilities
- `src/lib/utils/calendar.ts` - ICS calendar generation

### Libraries Used
- `@internationalized/date` (v3.10.0) - Date handling and locale support
- `bits-ui` (v2.14.1) - UI components including DatePicker

---

## Enforcement

These rules should be:
1. **Documented** in component documentation
2. **Enforced** through code review
3. **Tested** in unit and integration tests
4. **Validated** through automated checks where possible

---

## Future Considerations

- Consider creating a centralized locale configuration module
- Evaluate user preference settings for date/time formats (if multi-region support is needed)
- Document locale configuration patterns for new date/time components
- If internationalization becomes a requirement, implement workspace-level preferences first (Option 2), then add user-level if needed (Option 3)

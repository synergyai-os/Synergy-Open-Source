# Global Business Rules

**Last Updated**: 2025-01-27

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

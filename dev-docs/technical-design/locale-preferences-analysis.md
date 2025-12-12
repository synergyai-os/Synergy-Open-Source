# Locale Preferences Implementation Analysis

**Date**: 2025-01-27  
**Context**: Evaluating whether to implement configurable locale preferences vs. fixed global defaults

---

## Executive Summary

**Recommendation**: **Start with fixed global defaults** (day/month/year, Monday-first). Make it configurable later if client demand requires it.

**Reasoning**: 
- Low complexity, fast implementation (~2-4 hours)
- Can be upgraded to workspace/user preferences later without breaking changes
- Focus development effort on core product features
- Client "might desire" but doesn't "require" this feature

---

## Current State

### Existing Infrastructure ✅

1. **Schema Support**
   - `workspaceSettings` table exists (admin-controlled)
   - `userSettings` table exists (user-controlled)
   - Settings API pattern established (`convex/settings.ts`, `convex/workspaceSettings.ts`)

2. **Date/Time Libraries**
   - `@internationalized/date` (v3.10.0) - Supports locale configuration
   - `bits-ui` (v2.14.1) - DatePicker components accept locale props

3. **Current Issues**
   - Multiple files hardcode `'en-US'` locale (month/day/year format)
   - `DAY_NAMES` array starts with Sunday
   - No centralized locale configuration

---

## Implementation Options

### Option 1: Fixed Global Default ⭐ **RECOMMENDED**

**Complexity**: Low  
**Effort**: ~2-4 hours  
**Risk**: Low

**Implementation Steps**:
1. Create `src/lib/utils/locale.ts` with default locale constants
2. Update all `toLocaleDateString('en-US', ...)` calls to use `'en-GB'` or custom locale
3. Configure Bits UI DatePicker components with locale prop
4. Update `DAY_NAMES` array to start with Monday
5. Update day-of-week index mappings
6. Update date formatting utilities

**Files to Update** (~10-15 files):
- `src/lib/utils/date.ts`
- `src/lib/utils/calendar.ts`
- `src/lib/modules/meetings/utils.ts`
- `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts`
- `src/lib/modules/projects/composables/useTaskForm.svelte.ts`
- `src/lib/components/atoms/DateInput.svelte`
- `src/lib/components/molecules/DateTimeField.svelte`
- Various component files using date formatting

**Pros**:
- ✅ Fast to implement
- ✅ Consistent UX across all users
- ✅ No database schema changes
- ✅ No settings UI needed
- ✅ Can be upgraded later without breaking changes

**Cons**:
- ❌ No flexibility for international companies
- ❌ May need to change later if client demands it

---

### Option 2: Workspace-Level Preference

**Complexity**: Medium  
**Effort**: ~1-2 days  
**Risk**: Medium

**Implementation Steps**:
1. Add `locale` field to `workspaceSettings` schema
2. Create Convex queries/mutations for locale settings
3. Create locale context/composable (`useLocale.svelte.ts`)
4. Update settings UI to allow workspace admins to configure locale
5. Update all date/time components to use locale from context
6. Update date formatting utilities to accept locale parameter
7. Handle locale propagation through component tree

**Schema Changes**:
```typescript
workspaceSettings: defineTable({
  workspaceId: v.id('workspaces'),
  locale: v.optional(v.string()), // e.g., 'en-GB', 'en-US'
  // ... existing fields
})
```

**New Files**:
- `src/lib/utils/locale.ts` - Locale constants and utilities
- `src/lib/composables/useLocale.svelte.ts` - Locale context composable
- Settings UI updates for locale selection

**Files to Update** (~15-20 files):
- All files from Option 1, plus:
- `convex/schema.ts`
- `convex/workspaceSettings.ts`
- `src/routes/settings/+page.svelte`
- All components using date/time (need locale prop)

**Pros**:
- ✅ Workspace-level control (good for companies)
- ✅ Can satisfy international company needs
- ✅ Uses existing settings infrastructure

**Cons**:
- ❌ More complex implementation
- ❌ Requires context propagation
- ❌ Requires settings UI work
- ❌ More testing needed

---

### Option 3: User-Level Preference (with Workspace Override)

**Complexity**: High  
**Effort**: ~3-5 days  
**Risk**: High

**Implementation Steps**:
1. Add `locale` field to both `userSettings` and `workspaceSettings`
2. Implement preference hierarchy: workspace → user → default
3. Create locale context/composable with preference resolution
4. Update all date/time components
5. Add user settings UI
6. Handle preference conflicts and edge cases
7. Add preference inheritance logic

**Schema Changes**:
```typescript
userSettings: defineTable({
  userId: v.id('users'),
  locale: v.optional(v.string()), // User preference
  // ... existing fields
})

workspaceSettings: defineTable({
  workspaceId: v.id('workspaces'),
  locale: v.optional(v.string()), // Workspace default
  // ... existing fields
})
```

**Preference Resolution Logic**:
```typescript
function resolveLocale(workspaceLocale?: string, userLocale?: string): string {
  return workspaceLocale || userLocale || DEFAULT_LOCALE;
}
```

**New Files**:
- All from Option 2, plus:
- Preference resolution utilities
- User settings UI updates

**Files to Update** (~20-25 files):
- All files from Option 2, plus:
- `convex/settings.ts`
- User settings UI components

**Pros**:
- ✅ Maximum flexibility
- ✅ Best for international companies with diverse teams
- ✅ User can override workspace default

**Cons**:
- ❌ Most complex implementation
- ❌ Requires careful UX design
- ❌ More edge cases to handle
- ❌ More testing and documentation

---

## Complexity Breakdown

### Option 1: Fixed Global Default
- **Backend Changes**: 0 files
- **Frontend Changes**: ~10-15 files
- **Schema Changes**: 0
- **UI Changes**: 0
- **Testing**: Low (verify formatting works)
- **Documentation**: Update global-business-rules.md

### Option 2: Workspace-Level
- **Backend Changes**: 2 files (`schema.ts`, `workspaceSettings.ts`)
- **Frontend Changes**: ~15-20 files
- **Schema Changes**: 1 field
- **UI Changes**: Settings page updates
- **Testing**: Medium (test workspace settings, locale propagation)
- **Documentation**: Update docs + add settings UI docs

### Option 3: User-Level with Override
- **Backend Changes**: 3 files (`schema.ts`, `settings.ts`, `workspaceSettings.ts`)
- **Frontend Changes**: ~20-25 files
- **Schema Changes**: 2 fields
- **UI Changes**: Settings page updates (both user and workspace)
- **Testing**: High (test preference hierarchy, edge cases)
- **Documentation**: Extensive docs needed

---

## Migration Path

If starting with Option 1, upgrading later is straightforward:

1. **Option 1 → Option 2**:
   - Add locale field to `workspaceSettings` schema
   - Create locale context/composable
   - Update components to use context (backward compatible with default)
   - Add settings UI

2. **Option 2 → Option 3**:
   - Add locale field to `userSettings` schema
   - Update preference resolution logic
   - Add user settings UI

**Key Insight**: Option 1 code can be written in a way that makes Option 2/3 upgrades easy (e.g., use a locale constant that can later come from context).

---

## Recommendation

**Start with Option 1 (Fixed Global Default)** because:

1. **Client doesn't require it** - "might desire" is not "must have"
2. **Fast to implement correctly** - Can be done in 2-4 hours vs. 1-5 days
3. **Focus on core features** - Better use of development time
4. **Upgradeable later** - Can add preferences without breaking changes
5. **Consistent UX** - All users see the same format (less confusion)

**When to upgrade to Option 2**:
- Client explicitly requests it
- Multiple international clients sign up
- Product-market fit is established and this becomes a blocker

---

## Implementation Notes for Option 1

### Locale Configuration File

```typescript
// src/lib/utils/locale.ts
export const DEFAULT_LOCALE = 'en-GB'; // Day/month/year, Monday-first
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};
```

### Bits UI DatePicker Configuration

```svelte
<script lang="ts">
  import { getLocalTimeZone } from '@internationalized/date';
  import { DEFAULT_LOCALE } from '$lib/utils/locale';
  
  // DatePicker.Root accepts locale prop
  <DatePicker.Root locale={DEFAULT_LOCALE} ...>
</script>
```

### Day-of-Week Updates

```typescript
// src/lib/modules/meetings/utils.ts
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// Map JavaScript's getDay() (0=Sunday) to our system (0=Monday)
export function getDayOfWeekIndex(date: Date): number {
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ...
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday, 6=Sunday
}
```

---

## Testing Considerations

### Option 1 Testing
- Verify date formatting shows day/month/year
- Verify calendar shows Monday-first
- Verify day-of-week calculations work correctly
- Verify ICS exports use correct format

### Option 2/3 Testing
- Test locale preference persistence
- Test locale propagation through components
- Test preference hierarchy (workspace → user → default)
- Test settings UI
- Test edge cases (missing preferences, invalid locales)

---

## Conclusion

**Start simple, upgrade when needed.** Option 1 provides the fastest path to correctness while maintaining the ability to add preferences later if client demand requires it.


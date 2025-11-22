# Refactor Meetings Module Components: Separation of Concerns

**Linear Ticket**: [SYOS-464](https://linear.app/younghumanclub/issue/SYOS-464)

**Goal**: Refactor meetings module components to follow separation of concerns principle - components render UI only, composables handle data/logic. Improve testability, enable Storybook, and reduce component complexity.

---

## Problem Analysis

**Current State**: 4 of 9 components in meetings module violate separation of concerns:

1. **ActionItemsList.svelte** (464 lines) - Contains 3 `useQuery` calls, form state, business logic
2. **DecisionsList.svelte** (473 lines) - Contains 1 `useQuery` call, form state, business logic
3. **CreateMeetingModal.svelte** (727 lines) - Contains 1 `useQuery` call, extensive form state, complex logic
4. **AttendeeSelector.svelte** (406 lines) - Contains 2 `useQuery` calls, search state, selection logic

**Total affected code**: ~2,070 lines across 4 components

**Pain Points**:

- **Cannot render in Storybook**: Components require Convex queries, SvelteKit stores
- **Cannot unit test**: Data fetching, business logic, UI rendering tightly coupled
- **High complexity**: Single components exceed 400-700 lines (violates SRP)
- **Not reusable**: Form logic embedded in components, can't reuse elsewhere
- **Violates documented patterns**: New standards require composables for data/logic

**User Impact**:

- **Developers**: Hard to test, debug, and maintain large components
- **Design system**: Components can't be showcased in Storybook
- **Code quality**: Technical debt accumulates, slows feature development

**Investigation**:

- ✅ Reviewed all 9 components in meetings module
- ✅ Identified 4 with violations, 5 that follow patterns correctly
- ✅ Checked existing composables: `useAgendaNotes`, `useMeetings`, `useMeetingSession`, `useMeetingPresence`
- ✅ Verified pattern compliance: `AgendaItemView.svelte` uses `useAgendaNotes` correctly
- ✅ Reviewed separation of concerns documentation: `dev-docs/2-areas/design/component-architecture.md#L377`

---

## Approach Options

### Approach A: Incremental Refactoring (One Component at a Time)

**How it works**: Refactor each component individually, extract composables, verify tests pass, merge PR.

**Pros**:

- Low risk - each PR is small, reviewable
- Can validate approach early (refactor ActionItemsList first)
- Allows pause/resume between components
- Easier to rollback if issues arise
- Can ship value incrementally

**Cons**:

- Takes longer overall (4 separate PRs)
- Potential for inconsistent patterns between refactorings
- More overhead (4 PRs, 4 reviews, 4 merges)

**Complexity**: Medium (per component), Low (overall risk)

**Dependencies**: None between components (can refactor independently)

**Example workflow**:

1. PR 1: Refactor ActionItemsList → useActionItems + useActionItemsForm
2. PR 2: Refactor DecisionsList → useDecisions + useDecisionsForm
3. PR 3: Refactor CreateMeetingModal → useMeetingForm
4. PR 4: Refactor AttendeeSelector → useAttendeeSelection

---

### Approach B: Batch Refactoring (All Components at Once)

**How it works**: Refactor all 4 components + create all composables in single large PR.

**Pros**:

- Ensures consistent patterns across all refactorings
- Single PR review (fewer context switches)
- Faster overall completion (no PR overhead between)
- Can optimize shared logic (e.g., useFormState utility)

**Cons**:

- High risk - large PR, harder to review (~2,000 line changes)
- All-or-nothing - can't ship partial value
- Harder to rollback if issues found
- Long development cycle without merge
- Difficult to parallelize (one person working)

**Complexity**: High (large PR), High (review complexity)

**Dependencies**: All refactorings coupled in single PR

---

### Approach C: Pattern Extraction + Incremental Application

**How it works**: First PR extracts reusable patterns (e.g., `useFormState`, `useComboboxSearch`), then apply to components incrementally.

**Pros**:

- Maximizes code reuse (DRY principle)
- Establishes patterns before application
- Reduces duplication (4 components share form patterns)
- Creates utilities useful beyond meetings module

**Cons**:

- Upfront pattern design (might over-engineer)
- Risk of premature abstraction (YAGNI)
- More complex first PR (pattern extraction)
- Might discover pattern gaps mid-refactoring

**Complexity**: High (pattern design), Medium (application)

**Dependencies**: Pattern utilities must be created first

---

## Recommendation

**Selected**: Approach A (Incremental Refactoring)

**Reasoning**:

1. **Low risk**: Each PR is small (~200-500 line changes), easy to review, easy to rollback
2. **Fast feedback**: Can validate approach with ActionItemsList first, adjust if needed
3. **Ship value early**: Each refactored component improves testability immediately
4. **Matches existing patterns**: `useAgendaNotes`, `useMeetings` already exist - follow same structure
5. **No over-engineering**: Extract patterns only when duplication becomes clear (DRY after 3x)

**Trade-offs accepted**:

- Takes longer overall (4 PRs vs 1 PR) - **acceptable** because risk is lower
- Potential pattern inconsistency - **mitigated** by reviewing patterns in first refactoring
- More PR overhead - **acceptable** because each PR ships value independently

**Risk assessment**: Low

- If first refactoring (ActionItemsList) reveals issues, can adjust approach before remaining 3
- Each component works independently - no cross-component dependencies
- Existing components (`AgendaItemView`) prove pattern works

**Order of refactoring** (easiest to hardest):

1. **ActionItemsList** (464 lines) - Medium complexity, similar to DecisionsList
2. **DecisionsList** (473 lines) - Similar pattern to ActionItemsList (validate consistency)
3. **AttendeeSelector** (406 lines) - Reusable component, high value
4. **CreateMeetingModal** (727 lines) - Most complex (recurrence logic, date validation)

---

## Current State

**Existing Code**:

**Components with violations** (need refactoring):

- `src/lib/modules/meetings/components/ActionItemsList.svelte` (464 lines)
- `src/lib/modules/meetings/components/DecisionsList.svelte` (473 lines)
- `src/lib/modules/meetings/components/CreateMeetingModal.svelte` (727 lines)
- `src/lib/modules/meetings/components/AttendeeSelector.svelte` (406 lines)

**Components following patterns** (no changes needed):

- `src/lib/modules/meetings/components/AgendaItemView.svelte` (213 lines) ✅
- `src/lib/modules/meetings/components/SecretarySelector.svelte` (181 lines) ✅
- `src/lib/modules/meetings/components/MeetingCard.svelte` (207 lines) ✅
- `src/lib/modules/meetings/components/TodayMeetingCard.svelte` (157 lines) ✅
- `src/lib/modules/meetings/components/SecretaryConfirmationDialog.svelte` (130 lines) ✅

**Existing composables** (good patterns to follow):

- `src/lib/modules/meetings/composables/useAgendaNotes.svelte.ts` ✅ **REFERENCE THIS**
- `src/lib/modules/meetings/composables/useMeetings.svelte.ts` ✅
- `src/lib/modules/meetings/composables/useMeetingSession.svelte.ts` ✅
- `src/lib/modules/meetings/composables/useMeetingPresence.svelte.ts` ✅

**Dependencies**:

- `convex-svelte` (`useQuery`, `useConvexClient`) - already installed
- `svelte` (`$state`, `$derived`, `$effect`) - Svelte 5 runes
- `bits-ui` (Dialog, Combobox, ToggleGroup) - already installed
- Existing design tokens - already defined

**Patterns**:

- **Composable pattern**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L7`
- **Separation of concerns**: `dev-docs/2-areas/design/component-architecture.md#L377`
- **Existing composable example**: `src/lib/modules/meetings/composables/useAgendaNotes.svelte.ts` (lines 1-91)

**Constraints**:

- Must maintain existing functionality (no behavior changes)
- Must work with existing Convex backend (no schema changes)
- Must use existing design tokens (no hardcoded values)
- Must follow Svelte 5 patterns (`$state`, `$derived`, getters)

---

## Technical Requirements

### Refactoring 1: ActionItemsList.svelte

**New composables to create**:

1. **`useActionItems.svelte.ts`** - Data fetching composable

   ```typescript
   export function useActionItems(params: {
     agendaItemId: () => Id<'meetingAgendaItems'>;
     sessionId: () => string;
     organizationId: () => Id<'organizations'>;
     circleId: () => Id<'circles'> | undefined;
   }) {
     // Query action items
     const actionItemsQuery = useQuery(...);
     // Query members (for dropdown)
     const membersQuery = useQuery(...);
     // Query roles (for dropdown)
     const rolesQuery = useQuery(...);

     // Derived data
     const actionItems = $derived(actionItemsQuery?.data ?? []);
     const members = $derived(membersQuery?.data ?? []);
     const roles = $derived(rolesQuery?.data ?? []);
     const isLoading = $derived(actionItemsQuery?.isLoading ?? true);

     return {
       get actionItems() { return actionItems; },
       get members() { return members; },
       get roles() { return roles; },
       get isLoading() { return isLoading; }
     };
   }
   ```

2. **`useActionItemsForm.svelte.ts`** - Form state + business logic

   ```typescript
   export function useActionItemsForm(params: {
   	agendaItemId: () => Id<'meetingAgendaItems'>;
   	meetingId: () => Id<'meetings'>;
   	sessionId: () => string;
   	circleId: () => Id<'circles'> | undefined;
   }) {
   	const convexClient = useConvexClient();

   	// Form state
   	const state = $state({
   		isAdding: false,
   		editingId: null as Id<'meetingActionItems'> | null,
   		description: '',
   		type: 'next-step' as 'next-step' | 'project',
   		assigneeType: 'user' as 'user' | 'role',
   		assigneeUserId: null as Id<'users'> | null,
   		assigneeRoleId: null as Id<'circleRoles'> | null,
   		dueDate: null as number | null
   	});

   	// Business logic
   	async function handleCreate() {
   		/* ... */
   	}
   	async function handleUpdate(id: Id<'meetingActionItems'>) {
   		/* ... */
   	}
   	async function handleToggleStatus(id: Id<'meetingActionItems'>) {
   		/* ... */
   	}
   	async function handleDelete(id: Id<'meetingActionItems'>) {
   		/* ... */
   	}
   	function resetForm() {
   		/* ... */
   	}

   	return {
   		get isAdding() {
   			return state.isAdding;
   		},
   		get description() {
   			return state.description;
   		},
   		// ... all getters
   		handleCreate,
   		handleUpdate,
   		handleToggleStatus,
   		handleDelete,
   		resetForm
   	};
   }
   ```

3. **Update `ActionItemsList.svelte`** - UI only (~150 lines)

   ```svelte
   <script>
   	import { useActionItems } from '../composables/useActionItems.svelte';
   	import { useActionItemsForm } from '../composables/useActionItemsForm.svelte';

   	// Use composables for data/logic
   	const data = useActionItems({ agendaItemId, sessionId, organizationId, circleId });
   	const form = useActionItemsForm({ agendaItemId, meetingId, sessionId, circleId });
   </script>

   <!-- Just markup - no logic! -->
   {#if data.isLoading}
   	<p>Loading...</p>
   {:else}
   	{#each data.actionItems as item (item._id)}
   		<ActionItem {item} onToggle={form.handleToggleStatus} onDelete={form.handleDelete} />
   	{/each}
   {/if}
   ```

**Before/After**:

- Before: 464 lines (1 file)
- After: ~150 lines component + ~150 lines useActionItems + ~200 lines useActionItemsForm (3 files)
- Net: ~36 lines added, but separated concerns, improved testability

---

### Refactoring 2: DecisionsList.svelte

**New composables to create**:

1. **`useDecisions.svelte.ts`** - Data fetching
2. **`useDecisionsForm.svelte.ts`** - Form state + business logic
3. **Update `DecisionsList.svelte`** - UI only (~150 lines)

**Similar pattern to ActionItemsList** (validate consistency)

---

### Refactoring 3: AttendeeSelector.svelte

**New composables to create**:

1. **`useAttendeeSelection.svelte.ts`** - Data fetching + selection logic

   ```typescript
   export function useAttendeeSelection(params: {
     organizationId: () => Id<'organizations'>;
     sessionId: () => string;
     selectedAttendees: () => Attendee[];
     onAttendeesChange: (attendees: Attendee[]) => void;
   }) {
     // Query users + circles
     const usersQuery = useQuery(...);
     const circlesQuery = useQuery(...);

     // Combine available attendees
     const availableAttendees = $derived.by(() => { /* ... */ });

     // Search state
     const searchState = $state({ value: '', isOpen: false });

     // Filtered attendees
     const filteredAttendees = $derived(() => { /* filter logic */ });

     // Selection logic
     function toggleAttendee(attendee: Attendee) { /* ... */ }
     function removeAttendee(attendee: Attendee) { /* ... */ }
     function isSelected(attendee: Attendee): boolean { /* ... */ }

     return {
       get availableAttendees() { return availableAttendees; },
       get filteredAttendees() { return filteredAttendees(); },
       get searchValue() { return searchState.value; },
       set searchValue(value: string) { searchState.value = value; },
       get isOpen() { return searchState.isOpen; },
       set isOpen(value: boolean) { searchState.isOpen = value; },
       toggleAttendee,
       removeAttendee,
       isSelected
     };
   }
   ```

2. **Update `AttendeeSelector.svelte`** - UI only (~150 lines)

---

### Refactoring 4: CreateMeetingModal.svelte

**New composables to create**:

1. **`useMeetingForm.svelte.ts`** - Form state + complex logic (recurrence, validation)

   ```typescript
   export function useMeetingForm(params: {
     organizationId: () => string;
     sessionId: () => string;
     circles: () => Array<{ _id: Id<'circles'>; name: string }>;
     onSuccess: () => void;
   }) {
     const convexClient = useConvexClient();

     // Form state (extensive)
     const state = $state({
       title: '',
       selectedTemplateId: '' as Id<'meetingTemplates'> | '',
       circleId: '' as Id<'circles'> | '',
       startDate: '',
       startTime: '',
       duration: 60,
       visibility: 'public' as 'public' | 'circle' | 'private',
       recurrenceEnabled: false,
       recurrence: { /* ... */ },
       selectedAttendees: [] as Attendee[]
     });

     // Query templates
     const templatesQuery = useQuery(...);
     const templates = $derived(templatesQuery?.data ?? []);

     // Complex logic: recurrence preview, date parsing, validation
     const upcomingMeetings = $derived.by(() => { /* 100+ lines of logic */ });
     const weeklyScheduleMessage = $derived.by(() => { /* ... */ });
     const dailyScheduleMessage = $derived.by(() => { /* ... */ });

     // Submit logic
     async function handleSubmit() { /* create meeting + add attendees */ }
     function resetForm() { /* ... */ }

     return {
       // State getters
       get title() { return state.title; },
       set title(value: string) { state.title = value; },
       // ... all form fields

       // Derived data
       get templates() { return templates; },
       get upcomingMeetings() { return upcomingMeetings; },
       get weeklyScheduleMessage() { return weeklyScheduleMessage; },

       // Actions
       handleSubmit,
       resetForm
     };
   }
   ```

2. **Update `CreateMeetingModal.svelte`** - UI only (~200 lines)

**Note**: This is the most complex refactoring - save for last after validating pattern with simpler components.

---

## Success Criteria

### Functional Requirements

**For each refactored component:**

- ✅ **All existing functionality works** (no behavior changes)
- ✅ **Component renders in Storybook** (with mocked composables)
- ✅ **Composables are unit testable** (independent of UI)
- ✅ **Component focuses on UI only** (no `useQuery`, no business logic)
- ✅ **Composables use `.svelte.ts` extension** (Svelte 5 requirement)
- ✅ **Single `$state` object with getters** (follows documented pattern)

### Performance Requirements

- ✅ **No performance regression** (same number of queries, same render performance)
- ✅ **No additional re-renders** (composables don't break reactivity)

### UX Requirements

- ✅ **No visual changes** (same UI, same interactions)
- ✅ **No loading state regressions** (maintain loading indicators)
- ✅ **Error handling maintained** (same error messages, same validation)

### Quality Requirements

- ✅ **ESLint passes** (no linting errors)
- ✅ **TypeScript passes** (no type errors)
- ✅ **Svelte MCP validation passes** (no anti-patterns)
- ✅ **Follows documented patterns** (matches `useAgendaNotes` structure)

---

## Code Quality & Validation Strategy

### Svelte-specific validation (for `.svelte` files):

1. **Run `svelte-check`** (type checking)

   ```bash
   npm run check
   ```

2. **Run ESLint** (syntax rules)

   ```bash
   npm run lint
   ```

3. **Run `svelte-autofixer` via Svelte MCP** (best practices) ⭐

   ```typescript
   (await mcp_svelte_svelte) -
   	autofixer({
   		code: fileContent,
   		filename: 'Component.svelte',
   		desired_svelte_version: 5,
   		async: false
   	});
   ```

4. **Check Context7 for latest Svelte 5 patterns** (if <95% confident)

5. **Match against INDEX.md patterns**

### Validation timing:

- **During refactoring**: Run after each component/composable created
- **Before commit**: Run `/svelte-validate` on changed files
- **During code review**: Include validation findings in PR

### Quality gates:

- **Critical issues**: Must fix before merge (ESLint errors, type errors, anti-patterns)
- **Best practice suggestions**: Should fix (Svelte MCP suggestions)
- **Pattern matches**: Document existing solutions used

### Testing strategy:

**Composables** (unit tests):

```typescript
// src/lib/modules/meetings/composables/useActionItems.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { useActionItems } from './useActionItems.svelte';

describe('useActionItems', () => {
	it('should fetch action items', () => {
		// Test data fetching logic independently
	});

	it('should derive loading state', () => {
		// Test derived state
	});
});
```

**Components** (Storybook):

```typescript
// src/lib/modules/meetings/components/ActionItemsList.stories.svelte
<script>
  import ActionItemsList from './ActionItemsList.svelte';

  // Mock composables for Storybook
  const mockData = {
    actionItems: [...],
    members: [...],
    roles: [...],
    isLoading: false
  };

  const mockForm = {
    isAdding: false,
    description: '',
    handleCreate: () => console.log('create'),
    // ... all form methods
  };
</script>

<ActionItemsList data={mockData} form={mockForm} />
```

**Integration tests** (existing):

- No changes needed - tests pass through UI, composables are implementation detail

---

## Implementation Checklist

### Phase 1: Refactor ActionItemsList (First PR)

- [ ] **Create `useActionItems.svelte.ts`**
  - [ ] Extract 3 `useQuery` calls from component
  - [ ] Add derived state for `actionItems`, `members`, `roles`, `isLoading`
  - [ ] Return getters (follow `useAgendaNotes` pattern)
  - [ ] Add TypeScript types
  - [ ] Run `svelte-check` and ESLint

- [ ] **Create `useActionItemsForm.svelte.ts`**
  - [ ] Extract form state from component (lines 40-56)
  - [ ] Extract business logic (create, update, delete, toggle) (lines 104-175)
  - [ ] Add validation logic (description required, assignee required)
  - [ ] Return getters + action methods
  - [ ] Add TypeScript types
  - [ ] Run `svelte-check` and ESLint

- [ ] **Refactor `ActionItemsList.svelte`**
  - [ ] Import composables
  - [ ] Replace `useQuery` calls with `useActionItems`
  - [ ] Replace form state/logic with `useActionItemsForm`
  - [ ] Keep only UI markup (~150 lines)
  - [ ] Run `svelte-check`, ESLint, and Svelte MCP autofixer
  - [ ] Verify in browser (no behavior changes)

- [ ] **Create Storybook story**
  - [ ] Create `ActionItemsList.stories.svelte`
  - [ ] Mock composables with test data
  - [ ] Verify component renders in Storybook

- [ ] **Write unit tests** (optional - if time permits)
  - [ ] Test `useActionItems` composable
  - [ ] Test `useActionItemsForm` composable

- [ ] **Validate & commit**
  - [ ] Run `npm run ci:local` (all checks pass)
  - [ ] Test in dev environment (verify functionality)
  - [ ] Commit with message: `refactor(meetings): extract ActionItemsList to composables (SYOS-XXX)`
  - [ ] Open PR with before/after comparison

---

### Phase 2: Refactor DecisionsList (Second PR)

- [ ] **Create `useDecisions.svelte.ts`**
  - [ ] Extract `useQuery` call from component
  - [ ] Add derived state for `decisions`, `isLoading`
  - [ ] Return getters (follow `useActionItems` pattern)
  - [ ] Add TypeScript types

- [ ] **Create `useDecisionsForm.svelte.ts`**
  - [ ] Extract form state from component
  - [ ] Extract business logic (create, update, delete)
  - [ ] Add validation logic
  - [ ] Return getters + action methods
  - [ ] Add TypeScript types

- [ ] **Refactor `DecisionsList.svelte`**
  - [ ] Import composables
  - [ ] Replace `useQuery` call with `useDecisions`
  - [ ] Replace form state/logic with `useDecisionsForm`
  - [ ] Keep only UI markup (~150 lines)
  - [ ] Run validation tools

- [ ] **Create Storybook story**
  - [ ] Create `DecisionsList.stories.svelte`
  - [ ] Mock composables with test data
  - [ ] Verify component renders in Storybook

- [ ] **Validate & commit**
  - [ ] Run `npm run ci:local`
  - [ ] Test in dev environment
  - [ ] Commit: `refactor(meetings): extract DecisionsList to composables (SYOS-XXX)`
  - [ ] Open PR

---

### Phase 3: Refactor AttendeeSelector (Third PR)

- [ ] **Create `useAttendeeSelection.svelte.ts`**
  - [ ] Extract 2 `useQuery` calls from component
  - [ ] Extract search state and filtering logic
  - [ ] Extract selection logic (toggle, remove, isSelected)
  - [ ] Add derived state for `availableAttendees`, `filteredAttendees`
  - [ ] Return getters + action methods
  - [ ] Add TypeScript types

- [ ] **Refactor `AttendeeSelector.svelte`**
  - [ ] Import composable
  - [ ] Replace `useQuery` calls with `useAttendeeSelection`
  - [ ] Replace search/selection logic
  - [ ] Keep only UI markup (~150 lines)
  - [ ] Run validation tools

- [ ] **Create Storybook story**
  - [ ] Create `AttendeeSelector.stories.svelte`
  - [ ] Mock composable with test data
  - [ ] Verify component renders in Storybook

- [ ] **Validate & commit**
  - [ ] Run `npm run ci:local`
  - [ ] Test in dev environment
  - [ ] Commit: `refactor(meetings): extract AttendeeSelector to composable (SYOS-XXX)`
  - [ ] Open PR

---

### Phase 4: Refactor CreateMeetingModal (Fourth PR - Most Complex)

- [ ] **Create `useMeetingForm.svelte.ts`**
  - [ ] Extract `useQuery` call (templates)
  - [ ] Extract extensive form state (lines 34-51)
  - [ ] Extract recurrence logic (~200 lines):
    - [ ] `upcomingMeetings` calculation
    - [ ] `weeklyScheduleMessage` formatting
    - [ ] `dailyScheduleMessage` formatting
    - [ ] Date parsing (`parseDateTime`)
  - [ ] Extract submit logic (create meeting + add attendees)
  - [ ] Extract validation logic (title, date, time required)
  - [ ] Return getters + action methods
  - [ ] Add TypeScript types (complex types for recurrence)

- [ ] **Refactor `CreateMeetingModal.svelte`**
  - [ ] Import composable
  - [ ] Replace `useQuery` call with `useMeetingForm`
  - [ ] Replace form state/logic
  - [ ] Keep only UI markup (~200 lines - complex form)
  - [ ] Run validation tools

- [ ] **Create Storybook story**
  - [ ] Create `CreateMeetingModal.stories.svelte`
  - [ ] Mock composable with test data
  - [ ] Verify modal renders in Storybook

- [ ] **Validate & commit**
  - [ ] Run `npm run ci:local`
  - [ ] Test in dev environment (test all recurrence patterns)
  - [ ] Commit: `refactor(meetings): extract CreateMeetingModal to composable (SYOS-XXX)`
  - [ ] Open PR

---

### Final: Documentation & Cleanup

- [ ] **Update documentation**
  - [ ] Add composables to `meetings/README.md`
  - [ ] Update module structure diagram
  - [ ] Document composable usage patterns

- [ ] **Add pattern to INDEX.md** (if not already added)
  - [ ] Symptom: "Component contains useQuery/business logic"
  - [ ] Solution: "Extract to composables"
  - [ ] Link to `component-architecture.md#L377`

- [ ] **Celebrate** 🎉
  - [ ] 4 components refactored (~2,070 lines)
  - [ ] All components testable + Storybook-ready
  - [ ] Technical debt reduced
  - [ ] Pattern validated across meetings module

---

## Component Analysis Summary

### Violations Found (4 components)

| Component                 | Lines | Violations                                      | Composables Needed                 |
| ------------------------- | ----- | ----------------------------------------------- | ---------------------------------- |
| ActionItemsList.svelte    | 464   | 3 useQuery, form state, business logic          | useActionItems, useActionItemsForm |
| DecisionsList.svelte      | 473   | 1 useQuery, form state, business logic          | useDecisions, useDecisionsForm     |
| CreateMeetingModal.svelte | 727   | 1 useQuery, extensive form state, complex logic | useMeetingForm                     |
| AttendeeSelector.svelte   | 406   | 2 useQuery, search state, selection logic       | useAttendeeSelection               |

**Total**: ~2,070 lines across 4 components

---

### Compliant Components (5 components - no changes needed)

| Component                          | Lines | Status        | Notes                                    |
| ---------------------------------- | ----- | ------------- | ---------------------------------------- |
| AgendaItemView.svelte              | 213   | ✅ Good       | Uses useAgendaNotes composable correctly |
| SecretarySelector.svelte           | 181   | ✅ Acceptable | No useQuery, minimal state               |
| MeetingCard.svelte                 | 207   | ✅ Good       | Pure presentation component              |
| TodayMeetingCard.svelte            | 157   | ✅ Good       | Pure presentation component              |
| SecretaryConfirmationDialog.svelte | 130   | ✅ Acceptable | No useQuery, minimal state               |

**Total**: ~888 lines across 5 components

---

## Estimated Effort

**Per component refactoring**:

- Create composables: 2-4 hours
- Refactor component: 1-2 hours
- Validation + testing: 1-2 hours
- PR review + fixes: 1 hour

**Total per PR**: ~6-9 hours

**Overall timeline** (incremental approach):

- Week 1: ActionItemsList (validate pattern)
- Week 2: DecisionsList (validate consistency)
- Week 3: AttendeeSelector (reusable component)
- Week 4: CreateMeetingModal (most complex)

**Total**: ~4 weeks (one PR per week)

---

## Risk Assessment

### Low Risks ✅

- **Pattern is proven**: `useAgendaNotes` exists, works, and follows same structure
- **No schema changes**: Only refactoring component internals
- **Incremental approach**: Can stop/adjust after first refactoring
- **No functionality changes**: Same UI, same behavior

### Medium Risks ⚠️

- **Reactivity edge cases**: Composables might break reactivity if not careful
  - **Mitigation**: Use function parameters for reactive values, follow `useAgendaNotes` pattern
- **Storybook mocking complexity**: Mocking composables might be complex
  - **Mitigation**: Keep composable APIs simple, provide mock helpers
- **Testing overhead**: Need to write unit tests for composables
  - **Mitigation**: Start with integration tests (existing), add unit tests incrementally

### High Risks (None)

No high risks identified - pattern is proven, approach is incremental, changes are reversible.

---

## Related Documentation

- **Separation of Concerns**: `dev-docs/2-areas/design/component-architecture.md#L377`
- **Composable Pattern**: `dev-docs/2-areas/patterns/svelte-reactivity.md#L7`
- **Existing Composable**: `src/lib/modules/meetings/composables/useAgendaNotes.svelte.ts`
- **Code Review Standard**: `.cursor/commands/code-review.md` (now includes separation of concerns check)
- **Pattern Index**: `dev-docs/2-areas/patterns/INDEX.md`

---

**Created**: 2025-11-22  
**Priority**: High (technical debt, blocks Storybook, reduces testability)  
**Scope**: Meetings module only (4 components + 4-5 new composables)  
**Approach**: Incremental refactoring (one component per PR)

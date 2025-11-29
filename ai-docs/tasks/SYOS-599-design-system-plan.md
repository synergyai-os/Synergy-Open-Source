# SYOS-599: Meeting Stepper Design System Refactor Plan

**Issue**: [SYOS-599](https://linear.app/younghumanclub/issue/SYOS-599) - Meeting Creation Stepper: 3-Step Wizard with Quick Meeting Flow

**Command**: `/match-design-system`

**Status**: Planning Phase

**Last Updated**: 2025-01-27

---

## 🎯 Objective

Refactor meeting creation flow to use a 3-step stepper wizard while ensuring **100% design system compliance**:

- ✅ All components use semantic tokens (no hardcoded Tailwind)
- ✅ Recipe system for variant management
- ✅ Proper atomic design hierarchy
- ✅ `npm run validate:design-system` passes
- ✅ Storybook stories for all components

---

## 📋 Component Breakdown

### New Components to Create

| Component                     | Type     | Location                                                               | Recipe Needed              | Storybook   |
| ----------------------------- | -------- | ---------------------------------------------------------------------- | -------------------------- | ----------- |
| **Stepper**                   | Molecule | `src/lib/components/molecules/Stepper.svelte`                          | ✅ `stepperRecipe`         | ✅ Required |
| **MeetingTypeSelector**       | Molecule | `src/lib/modules/meetings/components/MeetingTypeSelector.svelte`       | ✅ `meetingTypeCardRecipe` | ✅ Required |
| **QuickMeetingButton**        | Molecule | `src/lib/modules/meetings/components/QuickMeetingButton.svelte`        | ❌ Uses Button atom        | ✅ Required |
| **MeetingConfirmationDialog** | Organism | `src/lib/modules/meetings/components/MeetingConfirmationDialog.svelte` | ❌ Uses Dialog organism    | ✅ Required |

### Components to Refactor

| Component              | Current State    | Changes Needed                                                                      |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| **CreateMeetingModal** | Single-page form | Refactor to 3-step stepper, integrate new components                                |
| **useMeetingForm**     | Basic form state | Add: `meetingType`, step validation, smart defaults, name generation, quick meeting |

---

## 🏗️ Phase 1: Foundation Components (Stepper)

### 1.1 Create Stepper Recipe

**File**: `src/lib/design-system/recipes/stepper.recipe.ts`

**Requirements**:

- ✅ Use semantic tokens only (`gap-header`, `text-primary`, `bg-surface`, etc.)
- ✅ Variants: `default`, `compact`
- ✅ States: `current`, `completed`, `pending`, `error`
- ✅ Cross-reference with `design-tokens-semantic.json` for spacing tokens

**Recipe Structure**:

```typescript
export const stepperRecipe = cva(
	// Base classes
	'flex items-center gap-header',
	{
		variants: {
			variant: {
				default: '...',
				compact: '...'
			}
		}
	}
);

export const stepperStepRecipe = cva(
	// Step indicator styling
	'flex items-center justify-center rounded-full border-2 transition-colors',
	{
		variants: {
			state: {
				current: 'bg-interactive-primary border-interactive-primary text-inverse',
				completed: 'bg-interactive-primary border-interactive-primary text-inverse',
				pending: 'bg-surface border-default text-secondary',
				error: 'bg-status-error border-status-error text-inverse'
			},
			size: {
				md: 'size-icon-md', // 20px
				lg: 'size-icon-lg' // 24px
			}
		}
	}
);
```

**Validation**:

- [ ] Check `design-tokens-semantic.json` for `spacing.header.gap` → `gap-header`
- [ ] Verify utilities exist: `grep "^@utility gap-header" src/styles/utilities/*.css`
- [ ] Run `npm run validate:tokens src/lib/design-system/recipes/stepper.recipe.ts`

### 1.2 Create Stepper Component

**File**: `src/lib/components/molecules/Stepper.svelte`

**Classification**: **Molecule** (composes Icon + Text atoms)

**Props**:

```typescript
interface StepperProps {
	steps: Array<{ id: string; label: string }>;
	currentStep: number;
	onStepChange?: (stepIndex: number) => void;
	canNavigateToStep?: (stepIndex: number) => boolean;
	variant?: 'default' | 'compact';
	className?: string;
}
```

**Implementation**:

- ✅ Use `Icon` atom for step indicators (checkmark for completed, number for current/pending)
- ✅ Use `Text` atom for step labels
- ✅ Use `stepperRecipe` and `stepperStepRecipe` for styling
- ✅ Handle click events for step navigation
- ✅ Disabled state for future steps (if `canNavigateToStep` returns false)

**Design System Compliance**:

- ✅ No hardcoded Tailwind (`gap-2`, `text-gray-500`, etc.)
- ✅ All spacing uses semantic tokens (`gap-header`, `mb-header`)
- ✅ All colors use semantic tokens (`text-primary`, `bg-interactive-primary`)
- ✅ Recipe handles all styling variants

**Storybook**:

- [ ] Create `src/lib/components/molecules/Stepper.stories.svelte`
- [ ] Title: `'Design System/Molecules/Stepper'`
- [ ] Stories: Default, Compact, With Navigation, Error State

---

## 🏗️ Phase 2: Meeting Type Selector

### 2.1 Create MeetingTypeCard Recipe

**File**: `src/lib/design-system/recipes/meetingTypeCard.recipe.ts`

**Requirements**:

- ✅ Card-based selection UI (grid of cards)
- ✅ States: `default`, `selected`, `hover`
- ✅ Use semantic tokens (`bg-surface`, `border-default`, `border-focus`, `rounded-card`)

**Recipe Structure**:

```typescript
export const meetingTypeCardRecipe = cva(
	// Base classes
	'rounded-card border-2 bg-surface transition-all cursor-pointer',
	{
		variants: {
			state: {
				default: 'border-default hover:border-focus hover:shadow-card',
				selected: 'border-interactive-primary bg-selected shadow-card',
				disabled: 'border-default opacity-60 cursor-not-allowed'
			}
		}
	}
);
```

**Validation**:

- [ ] Check `design-tokens-semantic.json` for card tokens
- [ ] Verify `bg-selected` utility exists (for selected state)
- [ ] Run `npm run validate:tokens`

### 2.2 Create MeetingTypeSelector Component

**File**: `src/lib/modules/meetings/components/MeetingTypeSelector.svelte`

**Classification**: **Module Component** (domain-specific, has business logic)

**Props**:

```typescript
interface MeetingTypeSelectorProps {
	value: MeetingType | null;
	onChange: (type: MeetingType) => void;
	organizationId: Id<'organizations'>;
	sessionId: string;
	className?: string;
}
```

**Meeting Types** (from technical design):

- `standup`, `retrospective`, `planning`, `1-on-1`, `client`, `governance`, `weekly-tactical`, `general`

**Implementation**:

- ✅ Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- ✅ Each card: Icon + Name + Description
- ✅ Uses `Card` atom with `meetingTypeCardRecipe` for styling
- ✅ Uses `Text` atom for labels/descriptions
- ✅ Uses `Icon` atom for type icons
- ✅ Selected state highlights card
- ✅ Required field (no "None" option)

**Design System Compliance**:

- ✅ Uses `Card` atom (not hardcoded div)
- ✅ Uses `Text` atom for all text content
- ✅ Uses `Icon` atom for icons
- ✅ Recipe handles card styling
- ✅ Semantic spacing tokens (`gap-form`, `gap-fieldGroup`)

**Storybook**:

- [ ] Create `src/lib/modules/meetings/components/MeetingTypeSelector.stories.svelte`
- [ ] Title: `'Modules/Meetings/MeetingTypeSelector'`
- [ ] Stories: Default, Selected, All Types

---

## 🏗️ Phase 3: Quick Meeting Button

### 3.1 Create QuickMeetingButton Component

**File**: `src/lib/modules/meetings/components/QuickMeetingButton.svelte`

**Classification**: **Module Component** (domain-specific, has business logic)

**Props**:

```typescript
interface QuickMeetingButtonProps {
	organizationId: Id<'organizations'>;
	sessionId: string;
	userId: Id<'users'>;
	onSuccess: (meetingId: Id<'meetings'>, link: string) => void;
	className?: string;
}
```

**Implementation**:

- ✅ Uses `Button` atom (no recipe needed - Button has its own)
- ✅ Loading state during creation
- ✅ Error handling with toast
- ✅ Calls `createQuickMeeting()` function (from composable)

**Design System Compliance**:

- ✅ Uses `Button` atom with proper variant (`primary`)
- ✅ No custom styling (Button handles it)
- ✅ Semantic spacing if needed (`mb-header`, `gap-button`)

**Storybook**:

- [ ] Create `src/lib/modules/meetings/components/QuickMeetingButton.stories.svelte`
- [ ] Title: `'Modules/Meetings/QuickMeetingButton'`
- [ ] Stories: Default, Loading, Error

---

## 🏗️ Phase 4: Meeting Confirmation Dialog

### 4.1 Create MeetingConfirmationDialog Component

**File**: `src/lib/modules/meetings/components/MeetingConfirmationDialog.svelte`

**Classification**: **Organism** (complex section, composes Dialog + multiple molecules/atoms)

**Props**:

```typescript
interface MeetingConfirmationDialogProps {
	open: boolean;
	meetingId: Id<'meetings'>;
	meetingLink: string;
	title: string;
	startTime: number; // timestamp
	onCopyLink: (link: string) => void;
	onStartMeeting: (meetingId: Id<'meetings'>) => void;
	onEditDetails: (meetingId: Id<'meetings'>) => void;
	onClose: () => void;
}
```

**Implementation**:

- ✅ Uses `Dialog` organism (`Dialog.Root`, `Dialog.Content`, etc.)
- ✅ Uses `Button` atom for actions (Copy Link, Start Meeting, Edit Details)
- ✅ Uses `Text` atom for meeting details
- ✅ Uses `Icon` atom for icons
- ✅ Format start time for display

**Design System Compliance**:

- ✅ Uses `Dialog` organism (not custom modal)
- ✅ Uses `Button` atom for all buttons
- ✅ Uses `Text` atom for all text
- ✅ Semantic spacing tokens (`gap-form`, `mb-header`)

**Storybook**:

- [ ] Create `src/lib/modules/meetings/components/MeetingConfirmationDialog.stories.svelte`
- [ ] Title: `'Modules/Meetings/MeetingConfirmationDialog'`
- [ ] Stories: Default, All Actions

---

## 🏗️ Phase 5: Update useMeetingForm Composable

### 5.1 Add meetingType Field

**File**: `src/lib/modules/meetings/composables/useMeetingForm.svelte.ts`

**Changes**:

- ✅ Add `meetingType: MeetingType | null` to state
- ✅ Add getter/setter for `meetingType`
- ✅ Update `handleSubmit` to include `meetingType` in mutation

**MeetingType Type**:

```typescript
type MeetingType =
	| 'standup'
	| 'retrospective'
	| 'planning'
	| '1-on-1'
	| 'client'
	| 'governance'
	| 'weekly-tactical'
	| 'general';
```

### 5.2 Add Step Validation

**Functions to Add**:

- ✅ `validateStep1()` - Meeting type + attendees required
- ✅ `validateStep2()` - Date/time + duration required, recurrence validation
- ✅ `validateStep3()` - Title required
- ✅ `validateStep(stepIndex: number)` - Wrapper function

**State to Add**:

- ✅ `currentStep: 0 | 1 | 2`
- ✅ `stepErrors: { 0: string[], 1: string[], 2: string[] }`
- ✅ `visitedSteps: Set<number>`

**Navigation Functions**:

- ✅ `nextStep()` - Validate current step, then advance
- ✅ `previousStep()` - Always allow going back
- ✅ `goToStep(stepIndex: number)` - Navigate to specific step

### 5.3 Add Smart Defaults

**Functions to Add**:

- ✅ `TYPE_DEFAULTS` constant (from technical design)
- ✅ `applyTypeDefaults(type: MeetingType)` - Apply defaults when type selected
- ✅ `inferPrivacyFromAttendees()` - Smart privacy inference

**Effects to Add**:

- ✅ `$effect` for type selection → apply defaults
- ✅ `$effect` for attendee change → infer privacy

### 5.4 Add Name Auto-Generation

**Functions to Add**:

- ✅ `generateMeetingName(type: MeetingType, attendees: Attendee[])` - Generate name from type + attendees
- ✅ `titleManuallyEdited: boolean` flag in state

**Effects to Add**:

- ✅ `$effect` for type change → regenerate name (if not manually edited)
- ✅ `$effect` for attendee change → regenerate name (if not manually edited)

### 5.5 Add Quick Meeting Creation

**Functions to Add**:

- ✅ `createQuickMeeting()` - Create meeting with defaults (today, next hour, 30 min, general type, private)
- ✅ Returns `{ meetingId, meetingLink }`

**Defaults**:

- Date: Today
- Time: Next hour (rounded)
- Duration: 30 minutes
- Type: `general`
- Privacy: `private`
- Attendees: Just creator (no circle)

---

## 🏗️ Phase 6: Refactor CreateMeetingModal

### 6.1 Update CreateMeetingModal Structure

**File**: `src/lib/modules/meetings/components/CreateMeetingModal.svelte`

**Changes**:

- ✅ Replace single-page form with 3-step stepper
- ✅ Integrate `Stepper` molecule
- ✅ Integrate `MeetingTypeSelector` molecule
- ✅ Integrate `QuickMeetingButton` molecule
- ✅ Integrate `MeetingConfirmationDialog` organism

**Step Structure**:

- **Step 1**: Attendees + Meeting Type + Privacy
- **Step 2**: Date/Time + Duration + Recurrence
- **Step 3**: Meeting Name + Summary + Submit

**Layout**:

- ✅ Stepper at top (shows current step)
- ✅ Step content in middle
- ✅ Navigation buttons at bottom (Back/Next/Submit)

**Design System Compliance**:

- ✅ Uses `Stepper` molecule
- ✅ Uses `MeetingTypeSelector` molecule
- ✅ Uses `QuickMeetingButton` molecule
- ✅ Uses `MeetingConfirmationDialog` organism
- ✅ Uses `Button` atom for navigation
- ✅ Uses `Text` atom for labels
- ✅ Semantic spacing tokens throughout

---

## ✅ Validation Checklist

### Before Marking Complete

**Automated Checks**:

- [ ] `npm run validate:design-system` - ✅ All checks pass
- [ ] `npm run check` - ✅ No TypeScript/Svelte errors

**Manual Checks**:

- [ ] All recipes use ONLY semantic token utilities (no Tailwind defaults)
- [ ] All recipes cross-referenced with `design-tokens-semantic.json`
- [ ] All utilities verified to exist (`grep "^@utility" src/styles/utilities/*.css`)
- [ ] All components use `$derived` with array syntax for classes
- [ ] Svelte MCP autofixer reports no issues
- [ ] All Storybook stories created/updated
- [ ] Visual regression checked (Storybook/browser)

**Component-Specific Checks**:

- [ ] Stepper: Recipe uses semantic tokens, Storybook created
- [ ] MeetingTypeSelector: Uses Card/Text/Icon atoms, Recipe created, Storybook created
- [ ] QuickMeetingButton: Uses Button atom, Storybook created
- [ ] MeetingConfirmationDialog: Uses Dialog organism, Storybook created
- [ ] CreateMeetingModal: Refactored to stepper, all new components integrated

**Workaround Documentation** (if any hardcoded values):

- [ ] Entry added to `ai-docs/tasks/missing-styles.md`
- [ ] Inline `// WORKAROUND` comment added
- [ ] Follow-up task created to fix token

---

## 📝 Notes

### Design System Patterns to Follow

1. **Molecules Use Atoms**:
   - Stepper uses `Icon` + `Text` atoms
   - MeetingTypeSelector uses `Card` + `Text` + `Icon` atoms

2. **Module Components Use Shared Components**:
   - MeetingTypeSelector uses `Card` atom (not custom div)
   - QuickMeetingButton uses `Button` atom
   - MeetingConfirmationDialog uses `Dialog` organism + `Button` atom

3. **Recipes Handle Styling, Components Handle Content**:
   - `stepperRecipe` → CSS classes
   - `getTypeIcon()` → emoji string (stays in component)

4. **Semantic Spacing Tokens**:
   - `gap-header` (12px) - Header element gaps
   - `gap-form` (20px) - Form field gaps
   - `gap-fieldGroup` (8px) - Tight element gaps
   - `mb-header` (32px) - Header bottom margin
   - `mb-alert` (24px) - Alert bottom margin

5. **No Hardcoded Tailwind**:
   - ❌ `gap-2`, `px-4`, `mb-8`, `text-gray-500`
   - ✅ `gap-button`, `px-button`, `mb-header`, `text-secondary`

### Backend Dependencies

**Note**: Backend changes (adding `meetingType` field) are out of scope for this design system refactor. Focus on frontend components only.

---

## 🚀 Implementation Order

1. **Phase 1**: Stepper component (foundation)
2. **Phase 2**: MeetingTypeSelector (needed for Step 1)
3. **Phase 3**: QuickMeetingButton (can be done in parallel)
4. **Phase 4**: MeetingConfirmationDialog (needed for quick meeting)
5. **Phase 5**: Update useMeetingForm (needed for all steps)
6. **Phase 6**: Refactor CreateMeetingModal (brings it all together)

---

**Ready to proceed?** Confirm this plan before starting implementation.

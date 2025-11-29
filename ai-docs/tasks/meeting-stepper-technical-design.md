# Meeting Stepper - Technical Design Document

## Overview

Implement 3-step stepper wizard for meeting creation with step validation, smart defaults, and Quick Meeting flow.

---

## Step Validation Algorithm

### Validation Rules Per Step

**Step 1: Attendees & Type**

```typescript
function validateStep1(form: MeetingFormState): ValidationResult {
	const errors: string[] = [];

	// Meeting Type is required
	if (!form.meetingType) {
		errors.push('Please select a meeting type');
	}

	// At least one attendee required
	if (form.selectedAttendees.length === 0) {
		errors.push('Please add at least one attendee');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
```

**Step 2: Date & Time**

```typescript
function validateStep2(form: MeetingFormState): ValidationResult {
	const errors: string[] = [];

	// Date required
	if (!form.startDate) {
		errors.push('Please select a date');
	}

	// Time required
	if (!form.startTime) {
		errors.push('Please select a time');
	}

	// Duration must be positive
	if (form.duration <= 0) {
		errors.push('Duration must be greater than 0');
	}

	// If recurrence enabled, validate recurrence settings
	if (form.recurrenceEnabled) {
		if (form.recurrenceFrequency === 'weekly' && form.recurrenceDaysOfWeek.length === 0) {
			errors.push('Please select at least one day for weekly recurrence');
		}
		if (form.recurrenceFrequency === 'daily' && form.recurrenceDaysOfWeek.length === 0) {
			errors.push('Please select at least one day for daily recurrence');
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
```

**Step 3: Finalize**

```typescript
function validateStep3(form: MeetingFormState): ValidationResult {
	const errors: string[] = [];

	// Title required (can be pre-filled but must exist)
	if (!form.title.trim()) {
		errors.push('Meeting title is required');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
```

### Validation Flow

**When User Clicks "Next":**

```typescript
function handleNext() {
	const currentStep = form.currentStep;
	const validation = validateStep(currentStep);

	if (!validation.isValid) {
		// Show errors inline
		form.stepErrors[currentStep] = validation.errors;
		// Prevent navigation
		return;
	}

	// Clear errors for current step
	form.stepErrors[currentStep] = [];

	// Allow navigation
	form.currentStep = currentStep + 1;
}
```

**When User Clicks "Back":**

```typescript
function handleBack() {
	// Always allow going back (no validation)
	form.currentStep = form.currentStep - 1;
	// Clear errors for step we're leaving
	form.stepErrors[form.currentStep + 1] = [];
}
```

**Error Display:**

- Show errors inline below relevant fields
- Use `toast.error()` for first error (user-friendly)
- Highlight invalid fields with error state

---

## Meeting Type → Template Mapping Algorithm

### Exact Logic

```typescript
async function resolveTemplateId(
	meetingType: MeetingType,
	organizationId: Id<'organizations'>,
	sessionId: string
): Promise<Id<'meetingTemplates'> | undefined> {
	// Only Governance and Weekly Tactical use templates
	if (meetingType !== 'governance' && meetingType !== 'weekly-tactical') {
		return undefined;
	}

	// Fetch templates for organization
	const templates = await convexClient.query(api.meetingTemplates.list, {
		sessionId,
		organizationId
	});

	// Find matching template by name
	if (meetingType === 'governance') {
		const governanceTemplate = templates.find((t) => t.name === 'Governance');
		return governanceTemplate?._id;
	}

	if (meetingType === 'weekly-tactical') {
		const tacticalTemplate = templates.find((t) => t.name === 'Weekly Tactical');
		return tacticalTemplate?._id;
	}

	return undefined;
}
```

### Edge Cases

**Case 1: Multiple Templates with Same Name**

- Use first match (templates are org-scoped, duplicates unlikely)
- Log warning in dev mode

**Case 2: Custom Template Created**

- User creates "Custom Governance" template
- Mapping only looks for exact name "Governance"
- Custom templates won't auto-link (by design)
- User can manually select template if needed

**Case 3: Template Deleted After Selection**

- If templateId exists but template deleted → still valid
- Meeting created without template (graceful degradation)

---

## Smart Defaults Algorithm

### Based on Meeting Type

```typescript
const TYPE_DEFAULTS: Record<MeetingType, TypeDefaults> = {
	standup: {
		duration: 15,
		recurrence: { frequency: 'daily', interval: 1 },
		privacy: 'circle',
		suggestedAttendees: [] // Will be inferred from circle
	},
	retrospective: {
		duration: 60,
		recurrence: null,
		privacy: 'circle',
		suggestedAttendees: []
	},
	planning: {
		duration: 90,
		recurrence: null,
		privacy: 'circle',
		suggestedAttendees: []
	},
	'1-on-1': {
		duration: 30,
		recurrence: null,
		privacy: 'private',
		suggestedAttendees: []
	},
	client: {
		duration: 60,
		recurrence: null,
		privacy: 'private',
		suggestedAttendees: []
	},
	governance: {
		duration: 90,
		recurrence: { frequency: 'weekly', interval: 1 },
		privacy: 'circle',
		suggestedAttendees: []
	},
	'weekly-tactical': {
		duration: 60,
		recurrence: { frequency: 'weekly', interval: 1 },
		privacy: 'circle',
		suggestedAttendees: []
	},
	general: {
		duration: 60,
		recurrence: null,
		privacy: 'public',
		suggestedAttendees: []
	}
};
```

### Apply Defaults Function

```typescript
function applyTypeDefaults(form: MeetingFormState, type: MeetingType) {
	const defaults = TYPE_DEFAULTS[type];

	// Only apply if user hasn't manually changed
	if (!form.durationManuallySet) {
		form.duration = defaults.duration;
	}

	if (!form.recurrenceManuallySet) {
		form.recurrenceEnabled = defaults.recurrence !== null;
		if (defaults.recurrence) {
			form.recurrenceFrequency = defaults.recurrence.frequency;
			form.recurrenceInterval = defaults.recurrence.interval;
		}
	}

	// Privacy: Smart inference from attendees
	if (!form.privacyManuallySet) {
		form.visibility = inferPrivacyFromAttendees(form.selectedAttendees, defaults.privacy);
	}
}
```

### Privacy Inference Algorithm

```typescript
function inferPrivacyFromAttendees(
	attendees: Attendee[],
	typeDefault: 'public' | 'circle' | 'private'
): 'public' | 'circle' | 'private' {
	if (attendees.length === 0) {
		return typeDefault;
	}

	// Check if all attendees are from same circle
	const circleIds = new Set(attendees.filter((a) => a.type === 'circle').map((a) => a.id));

	if (circleIds.size === 1) {
		return 'circle'; // All from same circle
	}

	// Check if any external attendees (users without circles)
	const hasExternalUsers = attendees.some((a) => a.type === 'user' && !a.circleId);

	if (hasExternalUsers) {
		return 'private'; // External users = private
	}

	return typeDefault; // Fallback to type default
}
```

### When Defaults Apply

**On Type Selection:**

```typescript
$effect(() => {
	if (form.meetingType) {
		applyTypeDefaults(form, form.meetingType);
	}
});
```

**On Attendee Change:**

```typescript
$effect(() => {
	if (form.selectedAttendees.length > 0 && !form.privacyManuallySet) {
		form.visibility = inferPrivacyFromAttendees(
			form.selectedAttendees,
			TYPE_DEFAULTS[form.meetingType]?.privacy || 'public'
		);
	}
});
```

---

## Quick Meeting Flow Algorithm

### Exact Sequence

```typescript
async function createQuickMeeting(
	organizationId: Id<'organizations'>,
	sessionId: string,
	userId: Id<'users'>
): Promise<{ meetingId: Id<'meetings'>; meetingLink: string }> {
	// 1. Calculate defaults
	const now = new Date();
	const nextHour = new Date(now);
	nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Round to next hour

	const startDate = nextHour.toISOString().split('T')[0];
	const startTime = nextHour.toTimeString().slice(0, 5);
	const startTimestamp = nextHour.getTime();

	// 2. Create meeting with defaults
	const result = await convexClient.mutation(api.meetings.create, {
		sessionId,
		organizationId,
		meetingType: 'general', // Default type
		title: 'Quick Meeting', // Default title
		startTime: startTimestamp,
		duration: 30, // 30 minutes default
		visibility: 'private', // Private by default (just creator)
		recurrence: undefined, // No recurrence
		templateId: undefined, // No template
		circleId: undefined // No circle
	});

	// 3. Add creator as attendee (already done in backend, but ensure)
	// Backend auto-adds creator, so this is redundant but safe

	// 4. Generate meeting link
	const meetingLink = `${window.location.origin}/meetings/${result.meetingId}`;

	return {
		meetingId: result.meetingId,
		meetingLink
	};
}
```

### Error Handling

```typescript
async function handleQuickMeeting() {
	try {
		setLoading(true);
		setError(null);

		const result = await createQuickMeeting(organizationId, sessionId, userId);

		// Show confirmation dialog
		setConfirmationDialog({
			open: true,
			meetingId: result.meetingId,
			meetingLink: result.meetingLink,
			title: 'Quick Meeting',
			startTime: result.startTime
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to create quick meeting';

		setError(message);
		toast.error(message);

		// Don't show confirmation on error
	} finally {
		setLoading(false);
	}
}
```

### Confirmation Dialog Actions

**Copy Link:**

```typescript
async function copyMeetingLink(link: string) {
	try {
		await navigator.clipboard.writeText(link);
		toast.success('Meeting link copied to clipboard');
	} catch (error) {
		toast.error('Failed to copy link');
	}
}
```

**Start Meeting:**

```typescript
function startMeeting(meetingId: Id<'meetings'>) {
	// Navigate to meeting page
	goto(`/meetings/${meetingId}`);
	// Meeting page will handle starting the session
}
```

**Edit Details:**

```typescript
function editMeetingDetails(meetingId: Id<'meetings'>) {
	// Close confirmation dialog
	setConfirmationDialog({ open: false });

	// Open full modal with meeting data pre-filled
	setEditModal({
		open: true,
		meetingId,
		mode: 'edit' // Edit mode vs create mode
	});
}
```

---

## Name Auto-Generation Algorithm

### Exact Algorithm

```typescript
function generateMeetingName(
	meetingType: MeetingType,
	attendees: Attendee[],
	customTitle?: string
): string {
	// If user provided custom title, use it
	if (customTitle?.trim()) {
		return customTitle.trim();
	}

	// Generate based on type + attendees
	const typeLabels: Record<MeetingType, string> = {
		standup: 'Standup',
		retrospective: 'Retrospective',
		planning: 'Planning',
		'1-on-1': '1-on-1',
		client: 'Client Meeting',
		governance: 'Governance',
		'weekly-tactical': 'Weekly Tactical',
		general: 'Meeting'
	};

	const typeLabel = typeLabels[meetingType];

	// Format attendees
	if (attendees.length === 0) {
		return typeLabel; // Just type name
	}

	if (attendees.length === 1) {
		const attendee = attendees[0];
		return `${typeLabel} with ${attendee.name}`;
	}

	if (attendees.length === 2) {
		return `${typeLabel} with ${attendees[0].name} and ${attendees[1].name}`;
	}

	if (attendees.length <= 5) {
		const names = attendees
			.slice(0, -1)
			.map((a) => a.name)
			.join(', ');
		const lastName = attendees[attendees.length - 1].name;
		return `${typeLabel} with ${names}, and ${lastName}`;
	}

	// More than 5 attendees: Use first 3 + count
	const firstNames = attendees
		.slice(0, 3)
		.map((a) => a.name)
		.join(', ');
	const remainingCount = attendees.length - 3;
	return `${typeLabel} with ${firstNames}, and ${remainingCount} others`;
}
```

### Examples

```typescript
// Standup with 1 person
generateMeetingName('standup', [{ name: 'Sarah', type: 'user' }])
// → "Standup with Sarah"

// Planning with 2 people
generateMeetingName('planning', [
  { name: 'Engineering', type: 'circle' },
  { name: 'Product', type: 'circle' }
])
// → "Planning with Engineering and Product"

// Retrospective with 5 people
generateMeetingName('retrospective', [
  { name: 'Alex', type: 'user' },
  { name: 'Jordan', type: 'user' },
  { name: 'Taylor', type: 'user' },
  { name: 'Morgan', type: 'user' },
  { name: 'Casey', type: 'user' }
])
// → "Retrospective with Alex, Jordan, Taylor, Morgan, and Casey"

// General meeting with 10 people
generateMeetingName('general', [...10 attendees...])
// → "Meeting with Person1, Person2, Person3, and 7 others"
```

### When Name Updates

**On Type Change:**

```typescript
$effect(() => {
	if (form.meetingType && form.selectedAttendees.length > 0) {
		// Only auto-generate if user hasn't manually edited
		if (!form.titleManuallyEdited) {
			form.title = generateMeetingName(form.meetingType, form.selectedAttendees);
		}
	}
});
```

**On Attendee Change:**

```typescript
$effect(() => {
	if (form.meetingType && form.selectedAttendees.length > 0) {
		if (!form.titleManuallyEdited) {
			form.title = generateMeetingName(form.meetingType, form.selectedAttendees);
		}
	}
});
```

**User Edits Title:**

```typescript
function handleTitleChange(newTitle: string) {
	form.title = newTitle;
	form.titleManuallyEdited = true; // Mark as manually edited
	// Don't auto-generate anymore
}
```

---

## Step Navigation State Management

### State Structure

```typescript
interface StepperState {
	currentStep: 0 | 1 | 2;
	stepErrors: {
		0: string[]; // Step 1 errors
		1: string[]; // Step 2 errors
		2: string[]; // Step 3 errors
	};
	visitedSteps: Set<number>; // Track which steps user visited
	canGoNext: boolean; // Computed: current step is valid
	canGoBack: boolean; // Computed: not on first step
}
```

### Navigation Functions

```typescript
function goToStep(stepIndex: number) {
	// Validate current step before leaving
	if (stepIndex > form.currentStep) {
		const validation = validateStep(form.currentStep);
		if (!validation.isValid) {
			form.stepErrors[form.currentStep] = validation.errors;
			return; // Block navigation
		}
	}

	// Clear errors for step we're leaving
	form.stepErrors[form.currentStep] = [];

	// Navigate
	form.currentStep = stepIndex;
	form.visitedSteps.add(stepIndex);
}

function nextStep() {
	if (form.currentStep < 2) {
		goToStep(form.currentStep + 1);
	}
}

function previousStep() {
	if (form.currentStep > 0) {
		goToStep(form.currentStep - 1);
	}
}
```

### Computed Properties

```typescript
const canGoNext = $derived(() => {
	const validation = validateStep(form.currentStep);
	return validation.isValid;
});

const canGoBack = $derived(() => {
	return form.currentStep > 0;
});

const isLastStep = $derived(() => {
	return form.currentStep === 2;
});
```

---

## Edge Cases & Solutions

### Edge Case 1: User Changes Type Mid-Flow

**Problem:** User selects "Standup" → goes to Step 2 → goes back → changes to "Planning"

**Solution:**

```typescript
$effect(() => {
	if (form.meetingTypeChanged) {
		// Reset duration if not manually set
		if (!form.durationManuallySet) {
			applyTypeDefaults(form, form.meetingType);
		}

		// Reset recurrence if not manually set
		if (!form.recurrenceManuallySet) {
			applyTypeDefaults(form, form.meetingType);
		}

		// Regenerate name if not manually edited
		if (!form.titleManuallyEdited) {
			form.title = generateMeetingName(form.meetingType, form.selectedAttendees);
		}
	}
});
```

### Edge Case 2: Custom Template Created

**Problem:** User creates "Custom Sprint Planning" template, but type selector doesn't show it

**Solution:**

- Custom templates don't auto-map to types (by design)
- User can select "Planning" type → manually choose custom template if needed
- Or: Add "Custom" option to type selector that shows template dropdown

### Edge Case 3: Quick Meeting Fails

**Problem:** Network error during quick meeting creation

**Solution:**

```typescript
try {
  await createQuickMeeting(...);
} catch (error) {
  // Show error toast
  toast.error('Failed to create meeting. Please try again.');

  // Don't show confirmation dialog
  // User can retry or use full form
}
```

### Edge Case 4: User Goes Back and Changes Attendees

**Problem:** User adds attendees in Step 1 → goes to Step 2 → goes back → removes all attendees

**Solution:**

```typescript
// Validation runs on "Next" click
// If user removes all attendees and tries to go forward, validation blocks
// Error shows: "Please add at least one attendee"
```

### Edge Case 5: Recurrence Enabled But No Days Selected

**Problem:** User enables recurrence → selects "weekly" → forgets to select days

**Solution:**

```typescript
// Validation in Step 2 checks this
if (form.recurrenceEnabled && form.recurrenceFrequency === 'weekly') {
	if (form.recurrenceDaysOfWeek.length === 0) {
		errors.push('Please select at least one day for weekly recurrence');
	}
}
```

---

## Component Architecture

### Stepper Component (Molecule)

**Props:**

```typescript
interface StepperProps {
	steps: Array<{ id: string; label: string }>;
	currentStep: number;
	onStepChange: (stepIndex: number) => void;
	canNavigateToStep?: (stepIndex: number) => boolean;
}
```

**Implementation:**

- Visual step indicators (circles with numbers)
- Progress line connecting steps
- Click handlers for step navigation
- Disabled state for future steps (if validation fails)

### MeetingTypeSelector Component (Molecule)

**Props:**

```typescript
interface MeetingTypeSelectorProps {
	value: MeetingType | null;
	onChange: (type: MeetingType) => void;
	organizationId: Id<'organizations'>;
	sessionId: string;
}
```

**Implementation:**

- Grid of type cards
- Each card: Icon + Name + Description
- Selected state highlighting
- Required field (no "None" option)

### QuickMeetingButton Component (Molecule)

**Props:**

```typescript
interface QuickMeetingButtonProps {
	organizationId: Id<'organizations'>;
	sessionId: string;
	userId: Id<'users'>;
	onSuccess: (meetingId: Id<'meetings'>, link: string) => void;
}
```

**Implementation:**

- Single button: "Quick Meeting"
- Loading state during creation
- Error handling with toast
- Calls `createQuickMeeting()` on click

### MeetingConfirmationDialog Component (Organism)

**Props:**

```typescript
interface MeetingConfirmationDialogProps {
	open: boolean;
	meetingId: Id<'meetings'>;
	meetingLink: string;
	title: string;
	startTime: number;
	onCopyLink: (link: string) => void;
	onStartMeeting: (meetingId: Id<'meetings'>) => void;
	onEditDetails: (meetingId: Id<'meetings'>) => void;
	onClose: () => void;
}
```

**Implementation:**

- Dialog overlay
- Meeting details display
- "Copy Link" button
- "Start Meeting" button (primary CTA)
- "Edit Details" button (secondary)
- Close button

---

## Success Criteria

### Functional Requirements

- [ ] Stepper shows 3 steps with labels
- [ ] Step navigation works (next/back)
- [ ] Step validation blocks invalid navigation
- [ ] Errors show inline below fields
- [ ] Meeting type selection works
- [ ] Smart defaults apply on type selection
- [ ] Name auto-generates from type + attendees
- [ ] Quick meeting creates instantly
- [ ] Confirmation dialog shows correct details
- [ ] Copy link works
- [ ] Start meeting navigates correctly
- [ ] Edit details opens full modal

### Technical Requirements

- [ ] All components use design system tokens
- [ ] No hardcoded Tailwind classes
- [ ] Storybook stories created
- [ ] TypeScript types correct
- [ ] Error handling comprehensive
- [ ] Loading states handled
- [ ] Accessibility (keyboard navigation, ARIA)

---

## Next Steps

1. Create Stepper component
2. Create MeetingTypeSelector component
3. Update useMeetingForm with step logic
4. Implement validation functions
5. Implement smart defaults
6. Implement name generation
7. Create QuickMeetingButton
8. Create MeetingConfirmationDialog
9. Refactor CreateMeetingModal
10. Write tests
11. Add Storybook stories

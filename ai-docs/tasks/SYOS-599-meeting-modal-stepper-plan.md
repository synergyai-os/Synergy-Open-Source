# Meeting Modal Stepper Implementation Plan

**Linear Ticket**: [SYOS-599](https://linear.app/younghumanclub/issue/SYOS-599)

## Overview

Refactor `CreateMeetingModal` from single-page form to 3-step stepper wizard with Quick Meeting flow.

## Goals

1. ✅ Reduce cognitive load (progressive disclosure)
2. ✅ Match user mental model (attendee-first flow)
3. ✅ Add Quick Meeting for common cases
4. ✅ Replace optional "template" with required "Meeting Type"
5. ✅ Follow design system patterns (`/match-design-system`)

---

## Step Flow Design

### Option 1: Attendee-First (✅ Selected)

**Step 1: Who & What Type**

- Attendees (with availability preview)
- Meeting Type (required, replaces template)
- Privacy (smart defaults based on type/attendees)

**Step 2: When & How Often**

- Date/Time (with availability conflicts highlighted)
- Duration (suggested by type, editable)
- Recurrence (if needed)

**Step 3: Finalize**

- Meeting Name (pre-filled suggestion based on type + attendees)
- Summary preview
- Submit

---

## Meeting Type System

### Types (Replaces Template Concept)

- **Standup** - Quick daily sync (15 min default)
- **Retrospective** - Team reflection (60 min default)
- **Planning** - Sprint/quarter planning (90 min default)
- **1-on-1** - Individual check-ins (30 min default)
- **Client Meeting** - External stakeholder (60 min default)
- **Governance** - Holacracy governance (uses template if exists)
- **Weekly Tactical** - Operational sync (uses template if exists)
- **General** - Ad-hoc meeting (60 min default)

### Type Properties

Each type has:

- Default duration
- Suggested attendees (circles/roles)
- Privacy defaults
- Recurrence suggestions
- Template mapping (if Governance/Weekly Tactical)

---

## Quick Meeting Flow

### One-Click Meeting

- Button: "Quick Meeting"
- Pre-fills:
  - Name: "Quick Meeting" (editable later)
  - Type: "General"
  - Date: Today
  - Time: Next available hour
  - Duration: 30 min
  - Attendees: Current user's circle (if exists)
  - Privacy: Based on circle
- Shows confirmation dialog with:
  - Meeting details
  - Copy link button
  - "Start Meeting" CTA
  - "Edit Details" option

---

## Component Architecture

### New Components

1. **Stepper** (Molecule)
   - Location: `src/lib/components/molecules/Stepper.svelte`
   - Props: `steps`, `currentStep`, `onStepChange`
   - Visual: Step indicators with labels, progress line
   - Design system compliant

2. **MeetingTypeSelector** (Molecule)
   - Location: `src/lib/modules/meetings/components/MeetingTypeSelector.svelte`
   - Props: `value`, `onChange`, `workspaceId`, `sessionId`
   - Shows type cards with icons, descriptions
   - Required field (no "None" option)

3. **QuickMeetingButton** (Molecule)
   - Location: `src/lib/modules/meetings/components/QuickMeetingButton.svelte`
   - Props: `workspaceId`, `sessionId`, `circles`
   - One-click meeting creation

4. **MeetingConfirmationDialog** (Organism)
   - Location: `src/lib/modules/meetings/components/MeetingConfirmationDialog.svelte`
   - Shows after Quick Meeting creation
   - Copy link, Start Meeting, Edit Details

### Updated Components

1. **CreateMeetingModal** (Module Component)
   - Refactor to use Stepper
   - 3-step flow implementation
   - Quick Meeting integration

2. **useMeetingForm** (Composable)
   - Add `meetingType` field (required)
   - Add step validation (`validateStep(stepIndex)`)
   - Add `createQuickMeeting()` method
   - Keep `templateId` for backward compatibility (linked to type)

---

## Data Model Changes

### Frontend State

```typescript
// Add to useMeetingForm state
meetingType: 'standup' |
	'retrospective' |
	'planning' |
	'1-on-1' |
	'client' |
	'governance' |
	'weekly-tactical' |
	'general';
currentStep: 0 | 1 | 2;
```

### Backend Changes (REQUIRED for Reporting)

- **Add `meetingType` field** to `meetings` table (required, enum)
- **Add index** `by_meeting_type` for reporting queries
- **Update `meetings.create` mutation** to accept `meetingType`
- **Create `meetings.listByType` query** for analytics
- Keep `templateId` optional (for Governance/Weekly Tactical types)
- Meeting Type maps to template when applicable (Governance/Weekly Tactical)

**See:** `meeting-stepper-backend-design.md` for complete backend design

---

## Implementation Steps

### Phase 1: Foundation

1. ✅ Create Stepper component (molecule)
2. ✅ Define Meeting Type enum/types
3. ✅ Create MeetingTypeSelector component

### Phase 2: Form Logic

4. ✅ Update useMeetingForm composable
   - Add `meetingType` field
   - Add step validation
   - Add smart defaults based on type
   - Add `createQuickMeeting()` method

### Phase 3: UI Refactor

5. ✅ Refactor CreateMeetingModal
   - Implement 3-step stepper
   - Step 1: Attendees + Type + Privacy
   - Step 2: Date/Time + Recurrence
   - Step 3: Name + Summary + Submit

### Phase 4: Quick Meeting

6. ✅ Create QuickMeetingButton component
7. ✅ Create MeetingConfirmationDialog component
8. ✅ Integrate Quick Meeting flow

### Phase 5: Polish

9. ✅ Add Storybook stories
10. ✅ Run design system validation
11. ✅ Test all flows

---

## Design System Compliance

### Stepper Component

- Use semantic spacing tokens (`gap-header`, `gap-form`)
- Recipe for stepper styling (if needed)
- Use Text component for labels
- Use Button for navigation

### MeetingTypeSelector

- Use Card atoms for type cards
- Use semantic tokens for spacing
- Icons from Icon component
- Text component for descriptions

### All Components

- ✅ No hardcoded Tailwind (`gap-2`, `px-4`, etc.)
- ✅ Use semantic tokens only
- ✅ Follow atomic design hierarchy
- ✅ Validate with `npm run validate:design-system`

---

## Validation Rules

### Step 1 Validation

- ✅ At least one attendee selected
- ✅ Meeting Type selected (required)

### Step 2 Validation

- ✅ Date selected
- ✅ Time selected
- ✅ Duration > 0

### Step 3 Validation

- ✅ Title not empty (can be pre-filled)

---

## Smart Defaults

### Based on Meeting Type

```typescript
const typeDefaults = {
	standup: { duration: 15, recurrence: 'daily', privacy: 'circle' },
	retrospective: { duration: 60, recurrence: null, privacy: 'circle' },
	planning: { duration: 90, recurrence: null, privacy: 'circle' },
	'1-on-1': { duration: 30, recurrence: null, privacy: 'private' },
	client: { duration: 60, recurrence: null, privacy: 'private' },
	governance: { duration: 90, recurrence: 'weekly', privacy: 'circle' },
	'weekly-tactical': { duration: 60, recurrence: 'weekly', privacy: 'circle' },
	general: { duration: 60, recurrence: null, privacy: 'public' }
};
```

### Based on Attendees

- If all attendees from same circle → Privacy: 'circle'
- If external attendees → Privacy: 'private'
- Otherwise → Privacy: 'public'

---

## User Experience Flow

### Detailed Meeting Flow

1. User clicks "Add Meeting"
2. Modal opens → Step 1
3. User selects attendees + type
4. Privacy auto-sets based on type/attendees
5. Click "Next" → Step 2
6. User sets date/time
7. Optionally enables recurrence
8. Click "Next" → Step 3
9. Title pre-filled (editable)
10. Summary shows all details
11. Click "Schedule" → Meeting created

### Quick Meeting Flow (CORRECTED)

1. User clicks "Quick Meeting" button
2. Meeting created instantly with defaults:
   - **No circle** - just current user as attendee
   - Type: "General"
   - Date: Today
   - Time: Next available hour
   - Duration: 30 min
   - Privacy: "Private"
   - Title: "Quick Meeting" (editable later)
3. Confirmation dialog shows:
   - Meeting details
   - **Copy link button** (primary action)
   - **"Start Meeting" CTA** (primary action)
   - "Edit Details" option (secondary)
4. User can copy link or start meeting
5. Or edit details (opens full modal with pre-filled data)
6. Meeting is scheduled even if not started immediately

---

## Edge Cases

### No Templates Available

- Meeting Type selector still works
- Governance/Weekly Tactical types show "No template available" message
- User can still create meeting without template

### No Circles Available

- Attendee selector shows users only
- Privacy defaults to 'public' or 'private'

### Quick Meeting with No Circle

- Attendees: Current user only
- Privacy: 'private'

---

## Testing Checklist

- [ ] Stepper navigation works (next/back)
- [ ] Step validation prevents invalid progress
- [ ] Meeting Type selection works
- [ ] Smart defaults apply correctly
- [ ] Quick Meeting creates meeting instantly
- [ ] Confirmation dialog shows correct details
- [ ] Copy link works
- [ ] Edit details opens full modal
- [ ] All design system validations pass
- [ ] Storybook stories render correctly

---

## Migration Notes

### Backward Compatibility

- Existing meetings keep `templateId` (no breaking changes)
- New meetings can use Meeting Type (maps to template when applicable)
- Both systems coexist during transition

### Future Enhancements

- Availability checking (highlight conflicts in Step 2)
- Recurrence preview (show next 5 meetings)
- Template suggestions based on type
- Meeting name AI suggestions

---

## Questions to Resolve

1. **Meeting Type vs Template**: Keep templates for Governance/Weekly Tactical, or fully replace?
   - ✅ **Decision**: Keep templates for Governance/Weekly Tactical (they have steps), use types for others

2. **Quick Meeting Defaults**: What should default duration be?
   - ✅ **Decision**: 30 minutes (quick but not rushed)

3. **Step Navigation**: Allow skipping steps or force sequential?
   - ✅ **Decision**: Allow going back, but validate before going forward (prevents incomplete data while allowing edits)

4. **Meeting Name**: Auto-generate or require manual entry?
   - ✅ **Decision**: Pre-fill suggestion, allow editing (best of both worlds)

---

## Design Documents

1. **Backend Design**: `meeting-stepper-backend-design.md`
   - Schema changes
   - Mutation updates
   - Query additions
   - Index strategy

2. **Technical Design**: `meeting-stepper-technical-design.md`
   - Step validation algorithms
   - Meeting type → template mapping
   - Smart defaults logic
   - Quick meeting flow
   - Name generation algorithm
   - Edge cases & solutions

## Implementation Timeline

### Phase 1: Backend (2-3 days)

- [ ] Update schema with `meetingType` field
- [ ] Add index for reporting
- [ ] Update `meetings.create` mutation
      -` mutation
- [ ] Create `listByType` query
- [ ] Write backend tests
- [ ] Update API contract

### Phase 2: Foundation Components (3-4 days)

- [ ] Create Stepper component (molecule)
- [ ] Create MeetingTypeSelector component (molecule)
- [ ] Add Storybook stories
- [ ] Design system validation

### Phase 3: Form Logic (2-3 days)

- [ ] Update useMeetingForm composable
- [ ] Add step validation functions
- [ ] Add smart defaults logic
- [ ] Add name generation algorithm
- [ ] Add meeting type → template mapping
- [ ] Write unit tests

### Phase 4: Quick Meeting (2 days)

- [ ] Create QuickMeetingButton component
- [ ] Create MeetingConfirmationDialog component
- [ ] Implement quick meeting flow
- [ ] Add Storybook stories

### Phase 5: UI Refactor (3-4 days)

- [ ] Refactor CreateMeetingModal to use stepper
- [ ] Implement 3-step flow
- [ ] Add error handling
- [ ] Add loading states
- [ ] Integrate Quick Meeting button

### Phase 6: Testing & Polish (2-3 days)

- [ ] E2E tests for full flow
- [ ] E2E tests for quick meeting
- [ ] Manual testing checklist
- [ ] Design system validation
- [ ] Accessibility audit
- [ ] Performance testing

**Total Estimate: 14-19 days** (with 15% buffer for unknowns)

## Next Steps

1. ✅ Review and approve design documents
2. Start with Backend (Phase 1)
3. Build foundation components (Phase 2)
4. Implement form logic (Phase 3)
5. Add Quick Meeting (Phase 4)
6. Refactor UI (Phase 5)
7. Test & polish (Phase 6)

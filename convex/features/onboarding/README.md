# Onboarding Feature

Tracks onboarding progress for users in their workspaces. State is tracked at the **personId** level (workspace-scoped, not user-scoped).

## Purpose

Enable workspace-specific onboarding flows that:

- Track user progress through required setup steps
- Support multiple workspaces per user (each with separate progress)
- Allow flexible onboarding flows (design phase vs active phase)
- Provide analytics on onboarding completion rates

## Key Design Decisions

### Why personId, not userId?

Same user can have different progress in different workspaces:

- User creates new workspace → starts fresh onboarding
- User joins existing workspace → different onboarding path
- Matches identity model: workspace-scoped tracking

### Why feature, not core?

Onboarding is user experience, not organizational truth:

- Can evolve independently of core domains
- Different workspaces could have different flows
- Not part of governance model

## Tables

### onboardingProgress

Tracks onboarding state per person per workspace.

**Fields:**

- `personId` - Workspace-scoped identity (Id<'people'>)
- `workspaceId` - Which workspace (Id<'workspaces'>)
- `status` - 'not_started' | 'in_progress' | 'completed'
- `currentStep` - Current step name (string)
- `completedSteps` - Array of completed step names (string[])
- `startedAt` - When onboarding started (optional number)
- `completedAt` - When onboarding completed (optional number)
- `metadata` - Flow-specific data (optional any)

**Indexes:**

- `by_person_workspace` - Primary lookup for person in workspace
- `by_person` - All progress for a person across workspaces
- `by_workspace` - All progress in a workspace
- `by_workspace_status` - Filter by status in workspace

## Queries

### findOnboardingProgress

Find onboarding progress for authenticated user in workspace.

```typescript
const progress = await ctx.db.query(api.features.onboarding.findOnboardingProgress, {
	sessionId: session.sessionId,
	workspaceId: workspace._id
});
// Returns OnboardingProgressDoc | null
```

### listOnboardingProgress

List all onboarding progress in workspace (admin query).

```typescript
const allProgress = await ctx.db.query(api.features.onboarding.listOnboardingProgress, {
	sessionId: session.sessionId,
	workspaceId: workspace._id,
	status: 'in_progress' // optional filter
});
```

## Mutations

### updateOnboardingStep

Mark a step as completed (or uncompleted).

```typescript
await ctx.db.mutation(api.features.onboarding.updateOnboardingStep, {
	sessionId: session.sessionId,
	workspaceId: workspace._id,
	step: 'root_circle_created',
	completed: true
});
```

Automatically transitions status to 'in_progress' if not started.

### completeOnboarding

Mark onboarding as completed.

```typescript
await ctx.db.mutation(api.features.onboarding.completeOnboarding, {
	sessionId: session.sessionId,
	workspaceId: workspace._id
});
```

Validates that all required steps are completed before allowing completion.

### resetOnboarding

Reset onboarding to not_started state (testing/re-onboarding).

```typescript
await ctx.db.mutation(api.features.onboarding.resetOnboarding, {
	sessionId: session.sessionId,
	workspaceId: workspace._id
});
```

## Onboarding Steps (Initial)

| Step                  | Description              | Required |
| --------------------- | ------------------------ | -------- |
| `workspace_created`   | Workspace exists         | Yes      |
| `root_circle_created` | Root circle with name    | Yes      |
| `governance_chosen`   | Circle type selected     | Yes      |
| `first_role_created`  | At least one custom role | No       |
| `profile_completed`   | Person has name          | No       |

Steps are defined in `rules.ts` and can be extended per workspace needs.

## Access Control

**Current:** Only the person can update their own onboarding progress.

**Future:** Workspace admins can help users through onboarding.

## Status Transitions

```
not_started → in_progress → completed
```

- `not_started` → `in_progress`: Automatic on first step update
- `in_progress` → `completed`: Requires all required steps done
- `completed` → `completed`: Idempotent (no-op)
- Cannot go backwards (except via reset)

## Usage Example

```typescript
// Check if user has started onboarding
const progress = await findOnboardingProgress({ sessionId, workspaceId });

if (!progress || progress.status === 'not_started') {
	// Redirect to onboarding flow
	goto(resolveRoute('/onboarding'));
} else if (progress.status === 'in_progress') {
	// Resume at current step
	goto(resolveRoute(`/onboarding/${progress.currentStep}`));
} else {
	// Onboarding complete, show workspace
	goto(resolveRoute(`/w/${workspaceId}`));
}

// Update step progress
await updateOnboardingStep({
	sessionId,
	workspaceId,
	step: 'governance_chosen',
	completed: true
});

// Complete onboarding
if (areRequiredStepsCompleted(progress.completedSteps)) {
	await completeOnboarding({ sessionId, workspaceId });
}
```

## Future Enhancements

- Workspace-specific onboarding flows (design vs active phase)
- Custom steps per workspace
- Onboarding templates
- Progress analytics dashboard
- Guided tours with step hints
- Admin-assisted onboarding
- Skip optional steps
- Time-to-complete metrics

## Related

- Parent: SYOS-889 - [EPIC] Onboarding System
- Next: SYOS-891 - Onboarding Routes & Guards
- Next: SYOS-892 - Design Phase UX

## Architecture Compliance

✅ **Identity Model:** Uses personId (workspace-scoped)  
✅ **Auth Pattern:** sessionId → userId → personId  
✅ **Audit Fields:** All use personId (XDOM-01)  
✅ **Layer:** Feature (not core)  
✅ **Handlers:** ≤20 lines  
✅ **Business Logic:** Extracted to rules.ts  
✅ **No Classes:** Functions only

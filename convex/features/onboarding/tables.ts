import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Onboarding status values
 */
export const onboardingStatus = v.union(
	v.literal('not_started'),
	v.literal('in_progress'),
	v.literal('completed')
);

/**
 * onboardingProgress - Tracks onboarding state per person per workspace
 *
 * This table stores onboarding progress for users in their workspaces.
 * State is tracked at the personId level (workspace-scoped, not user-scoped).
 * Same user can have different onboarding progress in different workspaces.
 *
 * Key concepts:
 * - Workspace-scoped: Each person has separate onboarding state per workspace
 * - Step-based: Tracks current step and completed steps
 * - Status-driven: not_started → in_progress → completed
 * - Metadata: Stores flow-specific data (flexible for different onboarding flows)
 *
 * @see SYOS-890: Onboarding state model design
 * @see XDOM-01: All audit fields use personId, not userId
 */
export const onboardingProgressTable = defineTable({
	// Workspace scoping
	personId: v.id('people'), // Workspace-scoped identity
	workspaceId: v.id('workspaces'),

	// Status tracking
	status: onboardingStatus,
	currentStep: v.string(), // e.g., 'workspace_setup', 'first_circle', 'first_role'
	completedSteps: v.array(v.string()), // Array of completed step names

	// Timestamps
	startedAt: v.optional(v.number()), // When onboarding started (status = in_progress)
	completedAt: v.optional(v.number()), // When onboarding completed (status = completed)

	// Flow-specific data
	metadata: v.optional(v.any()), // JSON data for flow customization

	// Audit fields (using personId per XDOM-01 invariant)
	createdAt: v.number(),
	createdByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people'))
})
	// Primary lookup: get progress for specific person in workspace
	.index('by_person_workspace', ['personId', 'workspaceId'])
	// Get all progress records for a person (across workspaces)
	.index('by_person', ['personId'])
	// Get all progress records in a workspace (for admin/analytics)
	.index('by_workspace', ['workspaceId'])
	// Query by status in workspace (e.g., find incomplete onboardings)
	.index('by_workspace_status', ['workspaceId', 'status']);

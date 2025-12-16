/**
 * Onboarding Schema Types
 *
 * Type definitions and aliases for the onboarding feature.
 *
 * @see tables.ts for table definitions
 * @see README.md for feature documentation
 */

import type { Doc, Id } from '../../_generated/dataModel';

// ============================================================================
// Document Types
// ============================================================================

/**
 * An onboarding progress document.
 * Tracks onboarding state for a person in a workspace.
 */
export type OnboardingProgressDoc = Doc<'onboardingProgress'>;

// ============================================================================
// ID Types
// ============================================================================

export type OnboardingProgressId = Id<'onboardingProgress'>;

// ============================================================================
// Status Types
// ============================================================================

/**
 * Onboarding status values.
 * Must match the union in tables.ts.
 */
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

// ============================================================================
// Step Types
// ============================================================================

/**
 * Known onboarding steps (initial set).
 * Can be extended as onboarding flows evolve.
 */
export type OnboardingStep =
	| 'workspace_created'
	| 'terminology_customized'
	| 'root_circle_created'
	| 'governance_chosen'
	| 'team_invited'
	| 'first_role_created'
	| 'profile_completed'
	| 'setup_completed';

/**
 * Step metadata for validation and UI.
 */
export interface OnboardingStepInfo {
	step: OnboardingStep;
	description: string;
	required: boolean;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Input for updating onboarding step progress.
 */
export interface UpdateOnboardingStepInput {
	personId: Id<'people'>;
	workspaceId: Id<'workspaces'>;
	step: string;
	completed: boolean;
}

/**
 * Input for completing onboarding.
 */
export interface CompleteOnboardingInput {
	personId: Id<'people'>;
	workspaceId: Id<'workspaces'>;
}

/**
 * Onboarding Business Rules
 *
 * Pure helpers + validation functions for onboarding feature.
 * Follows architecture.md pattern: business logic extracted from handlers.
 */

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { OnboardingStatus, OnboardingStepInfo } from './schema';

type AnyCtx = QueryCtx | MutationCtx;

// ============================================================================
// Onboarding Steps Definition
// ============================================================================

/**
 * Known onboarding steps with metadata.
 * These are the initial steps - can be extended per workspace needs.
 */
export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
	{
		step: 'workspace_created',
		description: 'Workspace exists',
		required: true
	},
	{
		step: 'terminology_customized',
		description: 'Terminology customized',
		required: true
	},
	{
		step: 'root_circle_created',
		description: 'Root circle with name',
		required: true
	},
	{
		step: 'governance_chosen',
		description: 'Circle type selected',
		required: true
	},
	{
		step: 'team_invited',
		description: 'Team members invited',
		required: false
	},
	{
		step: 'first_role_created',
		description: 'At least one custom role',
		required: false
	},
	{
		step: 'profile_completed',
		description: 'Person has name',
		required: false
	}
];

/**
 * Get list of required steps.
 */
export function getRequiredSteps(): string[] {
	return ONBOARDING_STEPS.filter((s) => s.required).map((s) => s.step);
}

/**
 * Check if step name is valid.
 */
export function isValidStep(step: string): boolean {
	return ONBOARDING_STEPS.some((s) => s.step === step);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate step name is known/allowed.
 * Throws if invalid.
 */
export function validateStep(step: string): void {
	if (!step || step.trim().length === 0) {
		throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Step name cannot be empty');
	}

	// Allow any step name for flexibility - workspaces may add custom steps
	// This is intentionally permissive to support evolving onboarding flows
}

/**
 * Validate status transition is allowed.
 * Throws if invalid.
 */
export function validateStatusTransition(from: OnboardingStatus, to: OnboardingStatus): void {
	// Valid transitions:
	// not_started → in_progress
	// in_progress → completed
	// completed → completed (idempotent)

	if (from === 'not_started' && to !== 'in_progress' && to !== 'not_started') {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			'Can only transition from not_started to in_progress'
		);
	}

	if (from === 'in_progress' && to === 'not_started') {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			'Cannot transition from in_progress back to not_started'
		);
	}

	// Allow in_progress → in_progress (step updates)
	// Allow completed → completed (idempotent completion)
}

/**
 * Check if all required steps are completed.
 */
export function areRequiredStepsCompleted(completedSteps: string[]): boolean {
	const required = getRequiredSteps();
	return required.every((step) => completedSteps.includes(step));
}

// ============================================================================
// Progress Calculation
// ============================================================================

/**
 * Calculate onboarding progress percentage.
 * Based on completed steps vs total known steps.
 */
export function calculateProgress(completedSteps: string[]): number {
	if (ONBOARDING_STEPS.length === 0) return 0;
	const completed = completedSteps.filter((step) => isValidStep(step)).length;
	return Math.round((completed / ONBOARDING_STEPS.length) * 100);
}

/**
 * Get next recommended step based on completed steps.
 * Returns null if all steps completed.
 */
export function getNextStep(completedSteps: string[]): string | null {
	const nextStep = ONBOARDING_STEPS.find((step) => !completedSteps.includes(step.step));
	return nextStep ? nextStep.step : null;
}

// ============================================================================
// Route Mapping
// ============================================================================

/**
 * Mapping of onboarding routes to their corresponding steps.
 * Defines the order of onboarding flow.
 */
export const ONBOARDING_ROUTE_STEPS = {
	workspace: 'workspace_created',
	terminology: 'terminology_customized',
	circle: 'root_circle_created', // Also requires 'governance_chosen'
	invite: 'team_invited',
	complete: 'setup_completed'
} as const;

/**
 * Ordered list of onboarding routes in sequence.
 */
export const ONBOARDING_ROUTE_ORDER = [
	'workspace',
	'terminology',
	'circle',
	'invite',
	'complete'
] as const;

/**
 * Get the route path for a given step.
 * Returns null if step doesn't map to a route.
 */
export function getRouteForStep(step: string): string | null {
	const entry = Object.entries(ONBOARDING_ROUTE_STEPS).find(([_, s]) => s === step);
	if (!entry) return null;
	const routeKey = entry[0];
	return routeKey === 'workspace' ? '/onboarding' : `/onboarding/${routeKey}`;
}

/**
 * Get the step name for a given route path.
 * Returns null if route doesn't map to a step.
 */
export function getStepForRoute(route: string): string | null {
	// Normalize route: remove leading/trailing slashes
	const normalized = route.replace(/^\/onboarding\/?/, '').replace(/\/$/, '') || 'workspace';
	const step = ONBOARDING_ROUTE_STEPS[normalized as keyof typeof ONBOARDING_ROUTE_STEPS];
	return step || null;
}

/**
 * Get the route index in the onboarding flow.
 * Returns -1 if route is not in the flow.
 */
export function getRouteIndex(route: string): number {
	const normalized = route.replace(/^\/onboarding\/?/, '').replace(/\/$/, '') || 'workspace';
	return ONBOARDING_ROUTE_ORDER.indexOf(normalized as typeof ONBOARDING_ROUTE_ORDER[number]);
}

// ============================================================================
// Access Control
// ============================================================================

/**
 * Check if person can update onboarding progress.
 * For now: only the person themselves can update their own onboarding.
 * Future: workspace admins could help users through onboarding.
 */
export async function canUpdateProgress(
	ctx: AnyCtx,
	actorPersonId: Id<'people'>,
	targetPersonId: Id<'people'>
): Promise<void> {
	// Person can update their own onboarding
	if (actorPersonId === targetPersonId) {
		return;
	}

	// Future: Check if actor is workspace admin
	// For now, only allow self-updates
	throw createError(
		ErrorCodes.AUTHZ_INSUFFICIENT_PERMISSION,
		'Can only update your own onboarding progress'
	);
}

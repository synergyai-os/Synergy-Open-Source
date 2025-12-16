/**
 * Onboarding Queries
 *
 * Read operations for onboarding progress.
 * Follows architecture.md pattern: thin handlers delegating to helpers.
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Find onboarding progress for a person in a workspace.
 *
 * Returns the onboarding progress record or null if not started.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID to check progress in
 * @returns OnboardingProgress record or null
 */
export const findOnboardingProgress = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		// Auth: sessionId → userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get person context: userId → personId
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Query for progress record
		const progress = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		return progress ?? null;
	}
});

/**
 * List all onboarding progress records for a workspace.
 * Admin-only query for analytics/monitoring.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID to list progress for
 * @returns Array of OnboardingProgress records
 */
export const listOnboardingProgress = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		status: v.optional(
			v.union(v.literal('not_started'), v.literal('in_progress'), v.literal('completed'))
		)
	},
	handler: async (ctx, args) => {
		// Auth: sessionId → userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get person context (validates person exists in workspace)
		const _person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// TODO: Add workspace admin check when needed
		// For now, allow workspace members to query (future: restrict to admins)

		// Query by status if provided
		if (args.status) {
			return await ctx.db
				.query('onboardingProgress')
				.withIndex('by_workspace_status', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('status', args.status)
				)
				.collect();
		}

		// Otherwise return all progress in workspace
		return await ctx.db
			.query('onboardingProgress')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();
	}
});

/**
 * Find onboarding state for authenticated user.
 *
 * Used by route guards to determine where to redirect user.
 * Returns workspace list and onboarding status for current workspace (if provided).
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Optional workspace ID to check onboarding status for
 * @returns Onboarding state object
 */
export const findOnboardingState = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		// Auth: sessionId → userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get all workspaces for this user
		const people = await ctx.db
			.query('people')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('status'), 'active'))
			.collect();

		const workspaceIds = people.map((p) => p.workspaceId);

		// Get workspace details
		const workspaces = await Promise.all(
			workspaceIds.map(async (id) => {
				const workspace = await ctx.db.get(id);
				return workspace;
			})
		);

		const validWorkspaces = workspaces.filter((w) => w !== null && !w.archivedAt);

		// If no workspace specified, return basic state
		if (!args.workspaceId) {
			return {
				hasWorkspaces: validWorkspaces.length > 0,
				workspaceSetupComplete: null,
				userOnboardingComplete: null
			};
		}

		// Get workspace setup status
		const workspace = validWorkspaces.find((w) => w._id === args.workspaceId);
		if (!workspace) {
			return {
				hasWorkspaces: validWorkspaces.length > 0,
				workspaceSetupComplete: null,
				userOnboardingComplete: null
			};
		}

		// Get person onboarding status
		const person = people.find((p) => p.workspaceId === args.workspaceId);
		if (!person) {
			return {
				hasWorkspaces: validWorkspaces.length > 0,
				workspaceSetupComplete: !!workspace.setupCompletedAt,
				userOnboardingComplete: null
			};
		}

		return {
			hasWorkspaces: validWorkspaces.length > 0,
			workspaceSetupComplete: !!workspace.setupCompletedAt,
			userOnboardingComplete: !!person.onboardingCompletedAt
		};
	}
});

/**
 * Find the next onboarding step and route for a user.
 *
 * Determines where the user should be in the onboarding flow by checking:
 * 1. Onboarding progress record (completed steps)
 * 2. Actual workspace state (e.g., does root circle exist?)
 *
 * Returns the next step name and route path, or null if onboarding is complete.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID to check progress in
 * @returns Next step info with route path
 */
export const findNextOnboardingStep = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		// Auth: sessionId → userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get person context: userId → personId
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Get workspace
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) {
			throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
		}

		// If workspace setup is complete, onboarding is done
		if (workspace.setupCompletedAt) {
			return {
				nextStep: null,
				nextRoute: null,
				completedSteps: [],
				isComplete: true
			};
		}

		// Get onboarding progress
		const progress = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		const progressCompletedSteps = progress?.completedSteps || [];

		// Check actual workspace state to determine what's really done
		// This is more reliable than just checking completedSteps

		// 1. Check if workspace exists (always true if we got here)
		const hasWorkspace = true;

		// 2. Check if terminology is customized (check if displayNames are set)
		const hasTerminology = !!workspace.displayNames;

		// 3. Check if root circle exists
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();
		const rootCircle = circles.find((c) => !c.parentCircleId);
		const hasRootCircle = !!rootCircle;
		const hasGovernance = hasRootCircle && !!rootCircle.circleType;

		// Determine actual completed steps based on state
		const actualCompletedSteps: string[] = [];
		if (hasWorkspace) actualCompletedSteps.push('workspace_created');
		if (hasTerminology) actualCompletedSteps.push('terminology_customized');
		if (hasRootCircle) actualCompletedSteps.push('root_circle_created');
		if (hasGovernance) actualCompletedSteps.push('governance_chosen');

		// Merge with progress record for optional steps that might be marked complete
		// but don't have actual state to check (like team_invited)
		const allCompletedSteps = new Set([...actualCompletedSteps, ...progressCompletedSteps]);

		// Find next incomplete step based on route order
		const routeOrder = ['workspace', 'terminology', 'circle', 'invite', 'complete'] as const;

		for (const routeKey of routeOrder) {
			let stepName: string;
			if (routeKey === 'workspace') {
				stepName = 'workspace_created';
			} else if (routeKey === 'terminology') {
				stepName = 'terminology_customized';
			} else if (routeKey === 'circle') {
				// Circle route requires both root_circle_created and governance_chosen
				if (!allCompletedSteps.has('root_circle_created')) {
					return {
						nextStep: 'root_circle_created',
						nextRoute: '/onboarding/circle',
						completedSteps: Array.from(allCompletedSteps),
						isComplete: false
					};
				}
				if (!allCompletedSteps.has('governance_chosen')) {
					return {
						nextStep: 'governance_chosen',
						nextRoute: '/onboarding/circle',
						completedSteps: Array.from(allCompletedSteps),
						isComplete: false
					};
				}
				continue; // Both steps done, check next route
			} else if (routeKey === 'invite') {
				stepName = 'team_invited';
			} else {
				// complete route
				return {
					nextStep: 'setup_completed',
					nextRoute: '/onboarding/complete',
					completedSteps: Array.from(allCompletedSteps),
					isComplete: false
				};
			}

			if (!allCompletedSteps.has(stepName)) {
				const nextRoute = routeKey === 'workspace' ? '/onboarding' : `/onboarding/${routeKey}`;
				return {
					nextStep: stepName,
					nextRoute,
					completedSteps: Array.from(allCompletedSteps),
					isComplete: false
				};
			}
		}

		// All steps completed, go to complete page
		return {
			nextStep: 'setup_completed',
			nextRoute: '/onboarding/complete',
			completedSteps: Array.from(allCompletedSteps),
			isComplete: false
		};
	}
});

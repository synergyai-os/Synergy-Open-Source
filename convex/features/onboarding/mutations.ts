/**
 * Onboarding Mutations
 *
 * Write operations for onboarding progress.
 * Follows architecture.md pattern: thin handlers (≤20 lines) delegating to helpers.
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import {
	validateStep,
	validateStatusTransition,
	areRequiredStepsCompleted,
	canUpdateProgress
} from './rules';

/**
 * Update onboarding step progress.
 *
 * Marks a step as completed (or uncompleted) and updates current step.
 * Automatically transitions status to 'in_progress' if not started.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID
 * @param step - Step name to update
 * @param completed - Whether step is completed
 * @returns Updated onboarding progress ID
 */
export const updateOnboardingStep = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		step: v.string(),
		completed: v.boolean()
	},
	handler: async (ctx, args): Promise<Id<'onboardingProgress'>> => {
		// Auth: sessionId → userId → personId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Validate step name
		validateStep(args.step);

		// Check access
		await canUpdateProgress(ctx, person._id, person._id);

		// Find existing progress
		const existing = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		const now = Date.now();

		if (!existing) {
			// Create new progress record starting with in_progress
			const completedSteps = args.completed ? [args.step] : [];
			return await ctx.db.insert('onboardingProgress', {
				personId: person._id,
				workspaceId: args.workspaceId,
				status: 'in_progress',
				currentStep: args.step,
				completedSteps,
				startedAt: now,
				completedAt: undefined,
				metadata: undefined,
				createdAt: now,
				createdByPersonId: person._id,
				updatedAt: now,
				updatedByPersonId: undefined
			});
		}

		// Update existing progress
		let completedSteps = [...existing.completedSteps];

		if (args.completed) {
			// Add step if not already completed
			if (!completedSteps.includes(args.step)) {
				completedSteps.push(args.step);
			}
		} else {
			// Remove step if uncompleting
			completedSteps = completedSteps.filter((s) => s !== args.step);
		}

		// Update record
		await ctx.db.patch(existing._id, {
			currentStep: args.step,
			completedSteps,
			updatedAt: now,
			updatedByPersonId: person._id,
			// Start timestamp if transitioning from not_started
			...(existing.status === 'not_started' && { status: 'in_progress', startedAt: now })
		});

		return existing._id;
	}
});

/**
 * Complete onboarding.
 *
 * Marks onboarding as completed. Should only be called when all required steps are done.
 * Validates that required steps are completed before allowing completion.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID
 * @returns Updated onboarding progress ID
 */
export const completeOnboarding = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<Id<'onboardingProgress'>> => {
		// Auth: sessionId → userId → personId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Check access
		await canUpdateProgress(ctx, person._id, person._id);

		// Find existing progress
		const existing = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		if (!existing) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'Cannot complete onboarding that has not been started'
			);
		}

		// Validate required steps are completed
		if (!areRequiredStepsCompleted(existing.completedSteps)) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'Cannot complete onboarding: required steps not finished'
			);
		}

		// Validate status transition
		validateStatusTransition(existing.status, 'completed');

		const now = Date.now();

		// Mark as completed
		await ctx.db.patch(existing._id, {
			status: 'completed',
			completedAt: now,
			updatedAt: now,
			updatedByPersonId: person._id
		});

		return existing._id;
	}
});

/**
 * Reset onboarding progress.
 *
 * Resets onboarding to not_started state. Useful for testing or re-onboarding.
 * Admin-only operation (future: add admin check).
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID
 * @returns void
 */
export const resetOnboarding = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<void> => {
		// Auth: sessionId → userId → personId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Check access (only allow self-reset for now)
		await canUpdateProgress(ctx, person._id, person._id);

		// Find existing progress
		const existing = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		if (!existing) {
			// Nothing to reset
			return;
		}

		// Reset to initial state
		const now = Date.now();
		await ctx.db.patch(existing._id, {
			status: 'not_started',
			currentStep: '',
			completedSteps: [],
			startedAt: undefined,
			completedAt: undefined,
			metadata: undefined,
			updatedAt: now,
			updatedByPersonId: person._id
		});
	}
});

/**
 * Complete workspace setup.
 *
 * Marks workspace setup as completed by setting setupCompletedAt timestamp.
 * Only workspace owner/admin can complete workspace setup.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID
 * @returns void
 */
export const completeWorkspaceSetup = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<void> => {
		// Auth: sessionId → userId → personId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Check access: must be workspace owner or admin
		if (person.workspaceRole !== 'owner' && person.workspaceRole !== 'admin') {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Must be workspace owner or admin to complete setup'
			);
		}

		// Get workspace
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) {
			throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
		}

		// Already completed - idempotent
		if (workspace.setupCompletedAt) {
			// If workspace setup already completed, ensure person onboarding is also marked complete
			if (!person.onboardingCompletedAt) {
				const now = Date.now();
				await ctx.db.patch(person._id, {
					onboardingCompletedAt: now
				});
			}
			return;
		}

		// Mark setup as completed
		const now = Date.now();
		await ctx.db.patch(args.workspaceId, {
			setupCompletedAt: now,
			updatedAt: now
		});

		// Also mark person onboarding as completed (workspace setup completion
		// means the user has completed the full onboarding flow)
		if (!person.onboardingCompletedAt) {
			await ctx.db.patch(person._id, {
				onboardingCompletedAt: now
			});
		}
	}
});

/**
 * Complete user onboarding.
 *
 * Marks user onboarding as completed by setting onboardingCompletedAt timestamp
 * on the person record. Also marks onboardingProgress as completed.
 *
 * @param sessionId - Session ID for authentication
 * @param workspaceId - Workspace ID
 * @returns void
 */
export const completeUserOnboarding = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<void> => {
		// Auth: sessionId → userId → personId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// Already completed - idempotent
		if (person.onboardingCompletedAt) {
			return;
		}

		const now = Date.now();

		// Mark person onboarding as completed
		await ctx.db.patch(person._id, {
			onboardingCompletedAt: now
		});

		// Also complete onboardingProgress if exists
		const progress = await ctx.db
			.query('onboardingProgress')
			.withIndex('by_person_workspace', (q) =>
				q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
			)
			.first();

		if (progress && progress.status !== 'completed') {
			await ctx.db.patch(progress._id, {
				status: 'completed',
				completedAt: now,
				updatedAt: now,
				updatedByPersonId: person._id
			});
		}
	}
});

import { recordCreateHistory, recordUpdateHistory } from '../history';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureUniqueCircleSlug,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './circleAccess';
import { createCoreRolesForCircle, transformLeadRoleOnCircleTypeChange } from './autoCreateRoles';
import { slugifyName } from './slug';
import { validateCircleName, validateCircleNameUpdate } from './validation';
import { CIRCLE_TYPES, DECISION_MODELS, type CircleType, type DecisionModel } from './constants';
import { createSystemCustomFieldDefinitions } from '../../admin/seed/customFieldDefinitions';
import { seedWorkspaceResources } from '../../admin/seed/workspaceSeed';

export async function createCircleInternal(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		name: string;
		purpose?: string;
		parentCircleId?: Id<'circles'>;
		circleType?: CircleType;
		decisionModel?: DecisionModel;
	}
) {
	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId
	);

	await ensureWorkspaceMembership(ctx, args.workspaceId, actorPersonId);

	const nameValidationError = validateCircleName(args.name);
	if (nameValidationError) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
	}

	const trimmedName = args.name.trim();

	if (args.parentCircleId === undefined) {
		const allCircles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		const existingRoot = allCircles.find((circle) => circle.parentCircleId === undefined);

		if (existingRoot) {
			throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Workspace already has a root circle');
		}
	}

	if (args.parentCircleId) {
		const parentCircle = await ctx.db.get(args.parentCircleId);
		if (!parentCircle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Parent circle not found');
		}
		if (parentCircle.workspaceId !== args.workspaceId) {
			throw createError(
				ErrorCodes.CIRCLE_INVALID_PARENT,
				'Parent circle must belong to the same workspace'
			);
		}
	}

	// If this is a root circle (first circle in workspace), seed customFieldDefinitions FIRST
	// (needed before we can create customFieldValues)
	if (args.parentCircleId === undefined) {
		await createSystemCustomFieldDefinitions(ctx, args.workspaceId, actorPersonId);
	}

	const slugBase = slugifyName(trimmedName);
	const slug = await ensureUniqueCircleSlug(ctx, args.workspaceId, slugBase);
	const now = Date.now();

	const circleType = args.circleType ?? CIRCLE_TYPES.HIERARCHY;
	const decisionModel = args.decisionModel ?? DECISION_MODELS.MANAGER_DECIDES;

	// Create lean circle (no descriptive fields per SYOS-961)
	const circleId = await ctx.db.insert('circles', {
		workspaceId: args.workspaceId,
		name: trimmedName,
		slug,
		parentCircleId: args.parentCircleId,
		circleType,
		decisionModel,
		status: 'active',
		createdAt: now,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const newCircle = await ctx.db.get(circleId);
	if (newCircle) {
		await recordCreateHistory(ctx, 'circle', newCircle);
	}

	// Create customFieldValue for purpose if provided (SYOS-961)
	if (args.purpose) {
		const purposeDefinition = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace_system_key', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('systemKey', 'purpose')
			)
			.first();

		if (purposeDefinition) {
			await ctx.db.insert('customFieldValues', {
				workspaceId: args.workspaceId,
				definitionId: purposeDefinition._id,
				entityType: 'circle',
				entityId: circleId,
				value: args.purpose,
				searchText: args.purpose,
				createdByPersonId: actorPersonId,
				createdAt: now,
				updatedAt: now,
				updatedByPersonId: actorPersonId
			});
		}
	}

	await createCoreRolesForCircle(ctx, circleId, args.workspaceId, actorPersonId, circleType);

	// If this is a root circle, seed meeting templates (workspace-scoped)
	if (args.parentCircleId === undefined) {
		await seedWorkspaceResources(ctx, args.workspaceId, actorPersonId);
	}

	return {
		circleId,
		slug
	};
}

export async function updateCircleInternal(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		name?: string;
		purpose?: string;
		parentCircleId?: Id<'circles'>;
	}
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	const updates: Partial<Doc<'circles'>> = {
		updatedAt: Date.now(),
		updatedByPersonId: actorPersonId
	};

	if (args.name !== undefined) {
		const nameValidationError = validateCircleNameUpdate(args.name);
		if (nameValidationError) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
		}

		const trimmedName = args.name.trim();
		updates.name = trimmedName;

		const slugBase = slugifyName(trimmedName);
		updates.slug = await ensureUniqueCircleSlug(ctx, circle.workspaceId, slugBase);
	}

	// Update purpose as customFieldValue (SYOS-961)
	if (args.purpose !== undefined) {
		const purposeDefinition = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace_system_key', (q) =>
				q.eq('workspaceId', circle.workspaceId).eq('systemKey', 'purpose')
			)
			.first();

		if (purposeDefinition) {
			// Check if customFieldValue already exists
			const existingValue = await ctx.db
				.query('customFieldValues')
				.withIndex('by_definition_entity', (q) =>
					q.eq('definitionId', purposeDefinition._id).eq('entityId', args.circleId)
				)
				.first();

			const now = Date.now();

			if (existingValue) {
				// Update existing value
				await ctx.db.patch(existingValue._id, {
					value: args.purpose,
					searchText: args.purpose,
					updatedAt: now,
					updatedByPersonId: actorPersonId
				});
			} else {
				// Create new value
				await ctx.db.insert('customFieldValues', {
					workspaceId: circle.workspaceId,
					definitionId: purposeDefinition._id,
					entityType: 'circle',
					entityId: args.circleId,
					value: args.purpose,
					searchText: args.purpose,
					createdByPersonId: actorPersonId,
					createdAt: now,
					updatedAt: now,
					updatedByPersonId: actorPersonId
				});
			}
		}
	}

	if (args.parentCircleId !== undefined) {
		if (args.parentCircleId) {
			const parentCircle = await ctx.db.get(args.parentCircleId);
			if (!parentCircle) {
				throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Parent circle not found');
			}
			if (parentCircle.workspaceId !== circle.workspaceId) {
				throw createError(
					ErrorCodes.CIRCLE_INVALID_PARENT,
					'Parent circle must belong to the same workspace'
				);
			}
			if (args.parentCircleId === args.circleId) {
				throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Circle cannot be its own parent');
			}
		}
		updates.parentCircleId = args.parentCircleId;
	}

	await ctx.db.patch(args.circleId, updates);

	const updatedCircle = await ctx.db.get(args.circleId);
	if (updatedCircle) {
		await recordUpdateHistory(ctx, 'circle', circle, updatedCircle);
	}

	return { success: true };
}

export async function updateInlineCircle(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		updates: {
			name?: string;
			purpose?: string;
			circleType?: CircleType;
			decisionModel?: DecisionModel;
		};
	}
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	// Get workspace and check phase
	const workspace = await ctx.db.get(circle.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
	}

	// Phase check - design only
	if (workspace.phase !== 'design') {
		throw createError(
			ErrorCodes.INVALID_OPERATION,
			'Direct edits only allowed in design phase. Use proposals in active phase.'
		);
	}

	// Simple workspace membership check
	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	const beforeDoc = { ...circle };

	const updateData: Partial<Doc<'circles'>> = {
		updatedAt: Date.now(),
		updatedByPersonId: actorPersonId
	};

	if (args.updates.name !== undefined) {
		const nameValidationError = validateCircleNameUpdate(args.updates.name);
		if (nameValidationError) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
		}

		const trimmedName = args.updates.name.trim();
		updateData.name = trimmedName;

		const slugBase = slugifyName(trimmedName);
		updateData.slug = await ensureUniqueCircleSlug(ctx, circle.workspaceId, slugBase);
	}

	// Update purpose as customFieldValue (SYOS-961)
	if (args.updates.purpose !== undefined) {
		const purposeDefinition = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace_system_key', (q) =>
				q.eq('workspaceId', circle.workspaceId).eq('systemKey', 'purpose')
			)
			.first();

		if (purposeDefinition) {
			// Check if customFieldValue already exists
			const existingValue = await ctx.db
				.query('customFieldValues')
				.withIndex('by_definition_entity', (q) =>
					q.eq('definitionId', purposeDefinition._id).eq('entityId', args.circleId)
				)
				.first();

			const now = Date.now();

			if (existingValue) {
				// Update existing value
				await ctx.db.patch(existingValue._id, {
					value: args.updates.purpose,
					searchText: args.updates.purpose,
					updatedAt: now,
					updatedByPersonId: actorPersonId
				});
			} else {
				// Create new value
				await ctx.db.insert('customFieldValues', {
					workspaceId: circle.workspaceId,
					definitionId: purposeDefinition._id,
					entityType: 'circle',
					entityId: args.circleId,
					value: args.updates.purpose,
					searchText: args.updates.purpose,
					createdByPersonId: actorPersonId,
					createdAt: now,
					updatedAt: now,
					updatedByPersonId: actorPersonId
				});
			}
		}
	}

	// Handle circle type change (GOV-01: transform lead role)
	if (args.updates.circleType !== undefined && args.updates.circleType !== beforeDoc.circleType) {
		const newCircleType = args.updates.circleType;
		const isFirstTimeSettingCircleType = beforeDoc.circleType === undefined;

		// If this is the first time setting circle type on a non-root circle,
		// seed custom field definitions if not already seeded for the workspace.
		// Root circles are seeded when created (in createCircleInternal).
		if (isFirstTimeSettingCircleType && beforeDoc.parentCircleId !== undefined) {
			await createSystemCustomFieldDefinitions(ctx, beforeDoc.workspaceId, actorPersonId);
		}

		// CRITICAL FIX: If circleType was undefined, we're setting it for the first time.
		// The function checks for leadRole existence FIRST, so it will create roles if missing.
		// However, we must pass a valid CircleType for the oldCircleType parameter.
		// Use CIRCLE_TYPES.HIERARCHY as default only for the type signature - the function's logic
		// (checking leadRole first) ensures roles are created even if types match.
		const oldCircleType: CircleType = beforeDoc.circleType ?? CIRCLE_TYPES.HIERARCHY;

		// Transform lead role to match new circle type (or create if first time)
		// Note: transformLeadRoleOnCircleTypeChange checks for leadRole existence FIRST,
		// so even if oldCircleType === newCircleType, it will create roles if missing.
		await transformLeadRoleOnCircleTypeChange(
			ctx,
			args.circleId,
			oldCircleType,
			newCircleType,
			actorPersonId
		);

		updateData.circleType = args.updates.circleType;
	}

	if (args.updates.decisionModel !== undefined) {
		updateData.decisionModel = args.updates.decisionModel;
	}

	await ctx.db.patch(args.circleId, updateData);

	const afterDoc = await ctx.db.get(args.circleId);
	if (afterDoc) {
		await recordUpdateHistory(ctx, 'circle', beforeDoc, afterDoc);
	}

	return { success: true };
}

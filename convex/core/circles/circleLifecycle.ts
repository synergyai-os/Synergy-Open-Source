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
import { LEAD_AUTHORITY, type LeadAuthority } from './constants';
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
		leadAuthority?: LeadAuthority;
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

	const leadAuthority = args.leadAuthority ?? LEAD_AUTHORITY.DECIDES;

	// Create circle with governance fields in schema (DR-011)
	const circleId = await ctx.db.insert('circles', {
		workspaceId: args.workspaceId,
		name: trimmedName,
		slug,
		purpose: args.purpose ?? '', // GOVERNANCE FIELD - required
		parentCircleId: args.parentCircleId,
		leadAuthority,
		status: 'active',
		createdAt: now,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const newCircle = await ctx.db.get(circleId);
	if (newCircle) {
		await recordCreateHistory(ctx, 'circle', newCircle);
	}

	await createCoreRolesForCircle(ctx, circleId, args.workspaceId, actorPersonId, leadAuthority);

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

	// Update purpose directly on schema (DR-011: governance fields in core schema)
	if (args.purpose !== undefined) {
		updates.purpose = args.purpose;
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
			leadAuthority?: LeadAuthority;
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

	// Update purpose directly on schema (DR-011: governance fields in core schema)
	if (args.updates.purpose !== undefined) {
		updateData.purpose = args.updates.purpose;
	}

	// Handle lead authority change (GOV-01: transform lead role)
	if (
		args.updates.leadAuthority !== undefined &&
		args.updates.leadAuthority !== beforeDoc.leadAuthority
	) {
		const newLeadAuthority = args.updates.leadAuthority;
		const isFirstTimeSettingLeadAuthority = beforeDoc.leadAuthority === undefined;

		// If this is the first time setting lead authority on a non-root circle,
		// seed custom field definitions if not already seeded for the workspace.
		// Root circles are seeded when created (in createCircleInternal).
		if (isFirstTimeSettingLeadAuthority && beforeDoc.parentCircleId !== undefined) {
			await createSystemCustomFieldDefinitions(ctx, beforeDoc.workspaceId, actorPersonId);
		}

		// CRITICAL FIX: If leadAuthority was undefined, we're setting it for the first time.
		// The function checks for leadRole existence FIRST, so it will create roles if missing.
		// However, we must pass a valid LeadAuthority for the oldLeadAuthority parameter.
		// Use LEAD_AUTHORITY.DECIDES as default only for the type signature - the function's logic
		// (checking leadRole first) ensures roles are created even if types match.
		const oldLeadAuthority: LeadAuthority = beforeDoc.leadAuthority ?? LEAD_AUTHORITY.DECIDES;

		// Transform lead role to match new lead authority (or create if first time)
		// Note: transformLeadRoleOnCircleTypeChange checks for leadRole existence FIRST,
		// so even if oldLeadAuthority === newLeadAuthority, it will create roles if missing.
		await transformLeadRoleOnCircleTypeChange(
			ctx,
			args.circleId,
			oldLeadAuthority,
			newLeadAuthority,
			actorPersonId
		);

		updateData.leadAuthority = args.updates.leadAuthority;
	}

	await ctx.db.patch(args.circleId, updateData);

	const afterDoc = await ctx.db.get(args.circleId);
	if (afterDoc) {
		await recordUpdateHistory(ctx, 'circle', beforeDoc, afterDoc);
	}

	return { success: true };
}

/**
 * Circle Core Roles Auto-Creation
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 * Auto-creates roles based on circle type per governance-design.md §5.3, §7.1
 */

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory } from '../history';
import { CIRCLE_TYPES, type CircleType } from './constants';
import { validateRolePurpose, validateRoleDecisionRights } from '../roles/rules';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Get system template by roleType and circleType
 *
 * Uses appliesTo field for exact match on circle type.
 * Each circle type has its own dedicated templates with appropriate authority models.
 *
 * @throws ERR_TEMPLATE_NOT_FOUND if template doesn't exist
 */
async function getSystemTemplateByRoleType(
	ctx: MutationCtx,
	roleType: 'circle_lead' | 'structural',
	circleType: CircleType
): Promise<{
	_id: Id<'roleTemplates'>;
	name: string;
	roleType: 'circle_lead' | 'structural' | 'custom';
	defaultPurpose: string;
	defaultDecisionRights: string[];
}> {
	const template = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) =>
			q.and(
				q.eq(q.field('roleType'), roleType),
				q.eq(q.field('appliesTo'), circleType),
				q.eq(q.field('archivedAt'), undefined)
			)
		)
		.first();

	if (!template) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`System role template with roleType "${roleType}" for circle type "${circleType}" not found. Run seed to create templates.`
		);
	}

	return template;
}

/**
 * Create a single role from template
 */
async function createRoleFromTemplate(
	ctx: MutationCtx,
	{
		circleId,
		workspaceId,
		personId,
		roleType,
		circleType
	}: {
		circleId: Id<'circles'>;
		workspaceId: Id<'workspaces'>;
		personId: Id<'people'>;
		roleType: 'circle_lead' | 'structural';
		circleType: CircleType;
	}
): Promise<Id<'circleRoles'>> {
	const template = await getSystemTemplateByRoleType(ctx, roleType, circleType);

	// Validate template data (GOV-02, GOV-03)
	validateRolePurpose(template.defaultPurpose);
	validateRoleDecisionRights(template.defaultDecisionRights);

	const now = Date.now();

	const roleId = await ctx.db.insert('circleRoles', {
		circleId,
		workspaceId,
		name: template.name,
		roleType: template.roleType,
		purpose: template.defaultPurpose,
		decisionRights: template.defaultDecisionRights,
		templateId: template._id,
		status: 'active',
		isHiring: false,
		createdAt: now,
		updatedAt: now,
		updatedByPersonId: personId
	});

	// Capture version history for role creation
	const newRole = await ctx.db.get(roleId);
	if (newRole) {
		await recordCreateHistory(ctx, 'circleRole', newRole);
	}

	return roleId;
}

/**
 * Create core roles for a circle based on its type
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 *
 * Circle type → Auto-created roles mapping (governance-design.md §5.3):
 * - hierarchy       → Circle Lead only
 * - empowered_team  → Circle Lead + Facilitator
 * - guild           → Steward only (roleType: 'circle_lead', convening authority)
 * - hybrid          → Circle Lead + Facilitator
 *
 * **Resilient**: If lead role already exists, logs and skips creation (idempotent).
 *
 * @param ctx - Mutation context
 * @param circleId - The circle to create roles for
 * @param workspaceId - Workspace ID
 * @param personId - Person creating the circle (for audit trail)
 * @param circleType - Circle governance type
 */
export async function createCoreRolesForCircle(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>,
	circleType: CircleType = CIRCLE_TYPES.HIERARCHY
): Promise<void> {
	// Check if circle already has a lead role (idempotent behavior)
	const existingLeadRole = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_roleType', (q) =>
			q.eq('circleId', circleId).eq('roleType', 'circle_lead')
		)
		.first();

	if (existingLeadRole) {
		// Circle already has a lead role - skip creation (idempotent)
		console.log(
			`[createCoreRolesForCircle] Circle ${circleId} already has lead role ${existingLeadRole._id}, skipping creation`
		);
		return;
	}

	console.log(
		`[createCoreRolesForCircle] Creating core roles for circle ${circleId} with type ${circleType}`
	);

	// GOV-01: Create lead role based on circle type
	// Always create the lead role (uses appliesTo to find correct template)
	try {
		const leadRoleId = await createRoleFromTemplate(ctx, {
			circleId,
			workspaceId,
			personId,
			roleType: 'circle_lead',
			circleType
		});
		console.log(
			`[createCoreRolesForCircle] Created lead role ${leadRoleId} for circle ${circleId}`
		);
	} catch (error) {
		console.error(
			`[createCoreRolesForCircle] Failed to create lead role for circle ${circleId}:`,
			error
		);
		throw error;
	}

	// Create structural roles based on circle type
	switch (circleType) {
		case CIRCLE_TYPES.EMPOWERED_TEAM:
		case CIRCLE_TYPES.HYBRID:
			// Empowered Team & Hybrid: Add Facilitator
			try {
				const facilitatorRoleId = await createRoleFromTemplate(ctx, {
					circleId,
					workspaceId,
					personId,
					roleType: 'structural',
					circleType
				});
				console.log(
					`[createCoreRolesForCircle] Created facilitator role ${facilitatorRoleId} for circle ${circleId}`
				);
			} catch (error) {
				console.error(
					`[createCoreRolesForCircle] Failed to create facilitator role for circle ${circleId}:`,
					error
				);
				throw error;
			}
			break;

		case CIRCLE_TYPES.HIERARCHY:
		case CIRCLE_TYPES.GUILD:
		default:
			// Hierarchy & Guild: Lead role only (no additional structural roles)
			break;
	}
}

/**
 * Transform lead role when circle type changes
 *
 * Implements governance-design.md §5.4: Transform lead role, don't delete + create
 *
 * Transformations:
 * - Any → guild: Circle Lead becomes Steward
 * - guild → Any: Steward becomes Circle Lead
 *
 * **Resilient**: If no lead role exists, creates one instead of erroring (SYOS-897 fix).
 *
 * @param ctx - Mutation context
 * @param circleId - The circle being updated
 * @param oldCircleType - Previous circle type
 * @param newCircleType - New circle type
 * @param personId - Person making the change (for audit trail)
 */
export async function transformLeadRoleOnCircleTypeChange(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	oldCircleType: CircleType,
	newCircleType: CircleType,
	personId: Id<'people'>
): Promise<void> {
	console.log(
		`[transformLeadRoleOnCircleTypeChange] Circle ${circleId}: ${oldCircleType} → ${newCircleType}`
	);

	// Get current lead role (GOV-01: exactly one should exist)
	const leadRole = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_roleType', (q) =>
			q.eq('circleId', circleId).eq('roleType', 'circle_lead')
		)
		.first();

	if (!leadRole) {
		// SYOS-897 fix: Lead role missing - create core roles instead of erroring
		console.warn(
			`[transformLeadRoleOnCircleTypeChange] GOV-01 violation: Circle ${circleId} has no lead role. Creating core roles for type ${newCircleType}...`
		);
		const circle = await ctx.db.get(circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		await createCoreRolesForCircle(ctx, circleId, circle.workspaceId, personId, newCircleType);
		console.log(
			`[transformLeadRoleOnCircleTypeChange] Created core roles for circle ${circleId} with type ${newCircleType}`
		);
		return;
	}

	// Determine if lead role transformation is needed
	if (newCircleType === oldCircleType) {
		// No change in circle type - just handle Facilitator changes
		await handleFacilitatorRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
		return;
	}

	// Both guild or both non-guild - no lead transformation needed
	const bothGuild = newCircleType === CIRCLE_TYPES.GUILD && oldCircleType === CIRCLE_TYPES.GUILD;
	const neitherGuild = newCircleType !== CIRCLE_TYPES.GUILD && oldCircleType !== CIRCLE_TYPES.GUILD;

	if (bothGuild || neitherGuild) {
		// No lead role transformation needed
		// But check if we need to add/remove Facilitator
		await handleFacilitatorRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
		return;
	}

	// Get target template using appliesTo field (correct approach per SYOS-895)
	const targetTemplate = await getSystemTemplateByRoleType(ctx, 'circle_lead', newCircleType);

	// Transform lead role in-place (don't delete + create)
	const now = Date.now();
	await ctx.db.patch(leadRole._id, {
		name: targetTemplate.name,
		purpose: targetTemplate.defaultPurpose,
		decisionRights: targetTemplate.defaultDecisionRights,
		templateId: targetTemplate._id,
		updatedAt: now,
		updatedByPersonId: personId
	});

	// Handle Facilitator role changes
	await handleFacilitatorRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
}

/**
 * Add or remove Facilitator role when circle type changes
 */
async function handleFacilitatorRoleChange(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	oldCircleType: CircleType,
	newCircleType: CircleType,
	personId: Id<'people'>
): Promise<void> {
	const needsFacilitator =
		newCircleType === CIRCLE_TYPES.EMPOWERED_TEAM || newCircleType === CIRCLE_TYPES.HYBRID;
	const hadFacilitator =
		oldCircleType === CIRCLE_TYPES.EMPOWERED_TEAM || oldCircleType === CIRCLE_TYPES.HYBRID;

	if (needsFacilitator && !hadFacilitator) {
		// Add Facilitator role - check by roleType + template lookup instead of name
		// Get the Facilitator template for this circle type
		const facilitatorTemplate = await getSystemTemplateByRoleType(ctx, 'structural', newCircleType);

		// Check if a role with this template already exists
		const existingFacilitator = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', circleId).eq('archivedAt', undefined)
			)
			.filter((q) => q.eq(q.field('templateId'), facilitatorTemplate._id))
			.first();

		if (!existingFacilitator) {
			const circle = await ctx.db.get(circleId);
			if (circle) {
				await createRoleFromTemplate(ctx, {
					circleId,
					workspaceId: circle.workspaceId,
					personId,
					roleType: 'structural',
					circleType: newCircleType
				});
			}
		}
	}
	// Note: We don't remove Facilitator when moving to hierarchy/guild
	// Governance-design.md §5.4: "Keep Facilitator (now optional)"
}

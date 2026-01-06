/**
 * Circle Core Roles Auto-Creation
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 * Auto-creates roles based on circle type per governance-design.md §5.3, §7.1
 *
 * DR-011: Governance fields (purpose, decisionRights) are stored directly
 * on the circleRoles schema, not in customFieldValues.
 *
 * Note: Convex mutations are atomic. If any operation fails mid-way, all changes
 * roll back automatically, ensuring no partial role state.
 */

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory } from '../history';
import { LEAD_AUTHORITY, type LeadAuthority } from './constants';
import { ROLE_TYPES, type RoleType } from '../roles/constants';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Get system template by roleType and leadAuthority
 *
 * Uses appliesTo field for exact match on lead authority.
 * Each lead authority has its own dedicated templates with appropriate authority models.
 *
 * @throws TEMPLATE_NOT_FOUND if template doesn't exist
 */
async function getSystemTemplateByRoleType(
	ctx: MutationCtx,
	roleType: typeof ROLE_TYPES.CIRCLE_LEAD | typeof ROLE_TYPES.STRUCTURAL,
	leadAuthority: LeadAuthority
): Promise<{
	_id: Id<'roleTemplates'>;
	name: string;
	roleType: RoleType;
	defaultPurpose: string;
	defaultDecisionRights: string[];
}> {
	const template = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) =>
			q.and(
				q.eq(q.field('roleType'), roleType),
				q.eq(q.field('appliesTo'), leadAuthority),
				q.eq(q.field('archivedAt'), undefined)
			)
		)
		.first();

	if (!template) {
		throw createError(
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`System role template with roleType "${roleType}" for lead authority "${leadAuthority}" not found. Run seed to create templates.`
		);
	}

	return template;
}

/**
 * Get all system templates for a lead authority
 *
 * Returns all role templates (both circle_lead and structural) that apply to the given lead authority.
 * Used when creating core roles to ensure all roles defined in templates are created.
 *
 * @returns Array of templates, ordered by roleType (circle_lead first, then structural)
 */
async function getAllSystemTemplatesForLeadAuthority(
	ctx: MutationCtx,
	leadAuthority: LeadAuthority
): Promise<
	Array<{
		_id: Id<'roleTemplates'>;
		name: string;
		roleType: RoleType;
		defaultPurpose: string;
		defaultDecisionRights: string[];
	}>
> {
	const templates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) =>
			q.and(q.eq(q.field('appliesTo'), leadAuthority), q.eq(q.field('archivedAt'), undefined))
		)
		.collect();

	// Sort: circle_lead first, then structural (ensures lead role is created before structural roles)
	return templates.sort((a, b) => {
		if (a.roleType === ROLE_TYPES.CIRCLE_LEAD && b.roleType !== ROLE_TYPES.CIRCLE_LEAD) return -1;
		if (a.roleType !== ROLE_TYPES.CIRCLE_LEAD && b.roleType === ROLE_TYPES.CIRCLE_LEAD) return 1;
		return 0;
	});
}

/**
 * Create core roles for a circle based on its lead authority
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 *
 * Dynamically creates all roles defined in system templates for the given lead authority.
 * This ensures consistency with seed templates and automatically picks up new templates.
 *
 * Lead authority → Auto-created roles (from templates):
 * - decides       → Circle Lead + Secretary
 * - facilitates   → Team Lead + Facilitator + Secretary
 * - convenes      → Steward + Secretary
 *
 * DR-011: Governance fields (purpose, decisionRights) are stored directly
 * on the circleRoles schema from template defaults.
 *
 * **Resilient**: If lead role already exists, logs and skips creation (idempotent).
 *
 * @param ctx - Mutation context
 * @param circleId - The circle to create roles for
 * @param workspaceId - Workspace ID
 * @param personId - Person creating the circle (for audit trail)
 * @param leadAuthority - Circle lead authority level
 */
export async function createCoreRolesForCircle(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>,
	leadAuthority: LeadAuthority = LEAD_AUTHORITY.DECIDES
): Promise<void> {
	// TODO: Replace with structured logging before production
	console.log(
		`[createCoreRolesForCircle] Creating core roles for circle ${circleId} with lead authority ${leadAuthority}`
	);

	// Dynamically fetch all templates for this lead authority
	const allTemplates = await getAllSystemTemplatesForLeadAuthority(ctx, leadAuthority);

	if (allTemplates.length === 0) {
		throw createError(
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`No system templates found for lead authority "${leadAuthority}". Run seed to create templates.`
		);
	}

	// Verify we have exactly one circle_lead template (GOV-01 requirement)
	// Single-pass optimization: find lead template, then iterate all templates
	const leadTemplate = allTemplates.find((t) => t.roleType === ROLE_TYPES.CIRCLE_LEAD);
	if (!leadTemplate) {
		throw createError(
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`Expected exactly one circle_lead template for lead authority "${leadAuthority}", found 0. Run seed to create templates.`
		);
	}

	// Get existing roles by template ID to avoid duplicates (idempotent behavior)
	const existingRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	const existingTemplateIds = new Set(
		existingRoles
			.map((r) => r.templateId)
			.filter((id): id is Id<'roleTemplates'> => id !== undefined)
	);

	// Create roles from all templates (lead first, then structural - already sorted)
	// Only create roles that don't already exist (by templateId)
	for (const template of allTemplates) {
		// Skip if role with this templateId already exists
		if (existingTemplateIds.has(template._id)) {
			// TODO: Replace with structured logging before production
			console.log(
				`[createCoreRolesForCircle] Role with template "${template.name}" (${template._id}) already exists for circle ${circleId}, skipping`
			);
			continue;
		}

		const now = Date.now();
		// Create circleRole with governance fields (DR-011: governance fields in core schema)
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId,
			name: template.name,
			purpose: template.defaultPurpose, // GOVERNANCE FIELD from template
			decisionRights: template.defaultDecisionRights, // GOVERNANCE FIELD from template
			roleType: template.roleType,
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

		// TODO: Replace with structured logging before production
		console.log(
			`[createCoreRolesForCircle] Created role "${template.name}" (${template.roleType}, ${roleId}) for circle ${circleId}`
		);
	}
}

/**
 * Transform lead role when lead authority changes
 *
 * Implements governance-design.md §5.4: Transform lead role, don't delete + create
 *
 * Transformations:
 * - Any → convenes: Circle Lead becomes Steward
 * - convenes → Any: Steward becomes Circle Lead
 *
 * DR-011: Governance fields (purpose, decisionRights) are updated directly
 * on the circleRoles schema from the new template.
 *
 * **Resilient**: If no lead role exists, creates one instead of erroring (SYOS-897 fix).
 *
 * @param ctx - Mutation context
 * @param circleId - The circle being updated
 * @param oldLeadAuthority - Previous lead authority
 * @param newLeadAuthority - New lead authority
 * @param personId - Person making the change (for audit trail)
 */
export async function transformLeadRoleOnCircleTypeChange(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	oldLeadAuthority: LeadAuthority,
	newLeadAuthority: LeadAuthority,
	personId: Id<'people'>
): Promise<void> {
	// TODO: Replace with structured logging before production
	console.log(
		`[transformLeadRoleOnCircleTypeChange] Circle ${circleId}: ${oldLeadAuthority} → ${newLeadAuthority}`
	);

	// Get current lead role (GOV-01: exactly one should exist)
	const leadRole = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_roleType', (q) =>
			q.eq('circleId', circleId).eq('roleType', ROLE_TYPES.CIRCLE_LEAD)
		)
		.first();

	if (!leadRole) {
		// SYOS-897 fix: Lead role missing - create core roles instead of erroring
		// TODO: Replace with structured logging before production
		console.warn(
			`[transformLeadRoleOnCircleTypeChange] GOV-01 violation: Circle ${circleId} has no lead role. Creating core roles for lead authority ${newLeadAuthority}...`
		);
		const circle = await ctx.db.get(circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		await createCoreRolesForCircle(ctx, circleId, circle.workspaceId, personId, newLeadAuthority);
		// TODO: Replace with structured logging before production
		console.log(
			`[transformLeadRoleOnCircleTypeChange] Created core roles for circle ${circleId} with lead authority ${newLeadAuthority}`
		);
		return;
	}

	// Determine if lead role transformation is needed
	if (newLeadAuthority === oldLeadAuthority) {
		// No change in lead authority - just handle structural role changes
		await handleStructuralRoleChange(ctx, circleId, oldLeadAuthority, newLeadAuthority, personId);
		return;
	}

	// Check if transformation is needed: convenes ↔ non-convenes transitions
	const isToConvenes =
		newLeadAuthority === LEAD_AUTHORITY.CONVENES && oldLeadAuthority !== LEAD_AUTHORITY.CONVENES;
	const isFromConvenes =
		oldLeadAuthority === LEAD_AUTHORITY.CONVENES && newLeadAuthority !== LEAD_AUTHORITY.CONVENES;
	const needsLeadTransform = isToConvenes || isFromConvenes;

	if (!needsLeadTransform) {
		// No lead role transformation needed
		// But check if we need to add/remove structural roles
		await handleStructuralRoleChange(ctx, circleId, oldLeadAuthority, newLeadAuthority, personId);
		return;
	}

	// Get target template using appliesTo field (correct approach per SYOS-895)
	const targetTemplate = await getSystemTemplateByRoleType(
		ctx,
		ROLE_TYPES.CIRCLE_LEAD,
		newLeadAuthority
	);

	// Get circle to access workspaceId
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	// Transform lead role in-place (don't delete + create)
	// DR-011: Update governance fields directly on schema
	const now = Date.now();
	await ctx.db.patch(leadRole._id, {
		name: targetTemplate.name,
		purpose: targetTemplate.defaultPurpose,
		decisionRights: targetTemplate.defaultDecisionRights,
		templateId: targetTemplate._id,
		updatedAt: now,
		updatedByPersonId: personId
	});

	// Handle structural role changes
	await handleStructuralRoleChange(ctx, circleId, oldLeadAuthority, newLeadAuthority, personId);
}

/**
 * Add or remove structural roles when lead authority changes
 *
 * Creates all structural roles for the new lead authority that don't already exist.
 * All lead authorities have structural roles (e.g., Secretary for decides/convenes,
 * Facilitator + Secretary for facilitates).
 *
 * DR-011: Governance fields (purpose, decisionRights) are stored directly
 * on the circleRoles schema from template defaults.
 *
 * Note: We don't remove structural roles when changing lead authority
 * Governance-design.md §5.4: "Keep Facilitator (now optional)"
 *
 * @param ctx - Mutation context
 * @param circleId - The circle being updated
 * @param oldLeadAuthority - Previous lead authority
 * @param newLeadAuthority - New lead authority
 * @param personId - Person making the change (for audit trail)
 */
async function handleStructuralRoleChange(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	oldLeadAuthority: LeadAuthority,
	newLeadAuthority: LeadAuthority,
	personId: Id<'people'>
): Promise<void> {
	// Always create structural roles for the new lead authority (all authorities have structural roles)
	const allTemplates = await getAllSystemTemplatesForLeadAuthority(ctx, newLeadAuthority);
	const structuralTemplates = allTemplates.filter((t) => t.roleType === ROLE_TYPES.STRUCTURAL);

	// If no structural templates for this type, nothing to do
	if (structuralTemplates.length === 0) {
		return;
	}

	const circle = await ctx.db.get(circleId);
	if (!circle) {
		return;
	}

	// Get existing roles by template ID to avoid duplicates
	const existingRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	const existingTemplateIds = new Set(
		existingRoles
			.map((r) => r.templateId)
			.filter((id): id is Id<'roleTemplates'> => id !== undefined)
	);

	// Create roles from templates that don't already exist
	for (const template of structuralTemplates) {
		if (existingTemplateIds.has(template._id)) {
			continue; // Role already exists
		}

		const now = Date.now();
		// Create circleRole with governance fields (DR-011: governance fields in core schema)
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId: circle.workspaceId,
			name: template.name,
			purpose: template.defaultPurpose, // GOVERNANCE FIELD from template
			decisionRights: template.defaultDecisionRights, // GOVERNANCE FIELD from template
			roleType: template.roleType,
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

		// TODO: Replace with structured logging before production
		console.log(
			`[handleStructuralRoleChange] Created structural role "${template.name}" (${roleId}) for circle ${circleId}`
		);
	}
	// Note: We don't remove structural roles when changing lead authority
	// Governance-design.md §5.4: "Keep Facilitator (now optional)"
}

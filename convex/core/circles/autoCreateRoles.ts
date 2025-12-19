/**
 * Circle Core Roles Auto-Creation
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 * Auto-creates roles based on circle type per governance-design.md §5.3, §7.1
 *
 * Note: Convex mutations are atomic. If any operation fails mid-way, all changes
 * roll back automatically, ensuring no partial role state.
 */

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory } from '../history';
import { CIRCLE_TYPES, type CircleType } from './constants';
import { ROLE_TYPES, type RoleType } from '../roles/constants';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { createCustomFieldValuesFromTemplate } from '../../infrastructure/customFields';

/**
 * Get system template by roleType and circleType
 *
 * Uses appliesTo field for exact match on circle type.
 * Each circle type has its own dedicated templates with appropriate authority models.
 *
 * @throws TEMPLATE_NOT_FOUND if template doesn't exist
 */
async function getSystemTemplateByRoleType(
	ctx: MutationCtx,
	roleType: typeof ROLE_TYPES.CIRCLE_LEAD | typeof ROLE_TYPES.STRUCTURAL,
	circleType: CircleType
): Promise<{
	_id: Id<'roleTemplates'>;
	name: string;
	roleType: RoleType;
	defaultFieldValues: Array<{ systemKey: string; values: string[] }>;
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
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`System role template with roleType "${roleType}" for circle type "${circleType}" not found. Run seed to create templates.`
		);
	}

	return template;
}

/**
 * Get all system templates for a circle type
 *
 * Returns all role templates (both circle_lead and structural) that apply to the given circle type.
 * Used when creating core roles to ensure all roles defined in templates are created.
 *
 * @returns Array of templates, ordered by roleType (circle_lead first, then structural)
 */
async function getAllSystemTemplatesForCircleType(
	ctx: MutationCtx,
	circleType: CircleType
): Promise<
	Array<{
		_id: Id<'roleTemplates'>;
		name: string;
		roleType: RoleType;
		defaultFieldValues: Array<{ systemKey: string; values: string[] }>;
	}>
> {
	const templates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) =>
			q.and(q.eq(q.field('appliesTo'), circleType), q.eq(q.field('archivedAt'), undefined))
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
 * Create core roles for a circle based on its type
 *
 * Implements GOV-01: Every circle has exactly one role with roleType: 'circle_lead'
 *
 * Dynamically creates all roles defined in system templates for the given circle type.
 * This ensures consistency with seed templates and automatically picks up new templates.
 *
 * Circle type → Auto-created roles (from templates):
 * - hierarchy       → Circle Lead + Secretary
 * - empowered_team → Team Lead + Facilitator + Secretary
 * - guild          → Steward + Secretary
 * - hybrid         → Circle Lead + Facilitator + Secretary
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
	// TODO: Replace with structured logging before production
	console.log(
		`[createCoreRolesForCircle] Creating core roles for circle ${circleId} with type ${circleType}`
	);

	// Fetch workspace to get phase (SYOS-996: phase-aware validation)
	const workspace = await ctx.db.get(workspaceId);

	// Dynamically fetch all templates for this circle type
	const allTemplates = await getAllSystemTemplatesForCircleType(ctx, circleType);

	if (allTemplates.length === 0) {
		throw createError(
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`No system templates found for circle type "${circleType}". Run seed to create templates.`
		);
	}

	// Verify we have exactly one circle_lead template (GOV-01 requirement)
	// Single-pass optimization: find lead template, then iterate all templates
	const leadTemplate = allTemplates.find((t) => t.roleType === ROLE_TYPES.CIRCLE_LEAD);
	if (!leadTemplate) {
		throw createError(
			ErrorCodes.TEMPLATE_NOT_FOUND,
			`Expected exactly one circle_lead template for circle type "${circleType}", found 0. Run seed to create templates.`
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
		// Create lean circleRole (no descriptive fields per SYOS-960)
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId,
			name: template.name,
			roleType: template.roleType,
			templateId: template._id,
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedByPersonId: personId
		});

		// Create customFieldValues from template defaults (SYOS-960)
		// This also validates required fields (GOV-02, GOV-03) - phase-aware (SYOS-996)
		await createCustomFieldValuesFromTemplate(ctx, {
			workspaceId,
			entityType: 'role',
			entityId: roleId,
			templateDefaultFieldValues: template.defaultFieldValues,
			createdByPersonId: personId,
			workspacePhase: workspace?.phase
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
	// TODO: Replace with structured logging before production
	console.log(
		`[transformLeadRoleOnCircleTypeChange] Circle ${circleId}: ${oldCircleType} → ${newCircleType}`
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
			`[transformLeadRoleOnCircleTypeChange] GOV-01 violation: Circle ${circleId} has no lead role. Creating core roles for type ${newCircleType}...`
		);
		const circle = await ctx.db.get(circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		await createCoreRolesForCircle(ctx, circleId, circle.workspaceId, personId, newCircleType);
		// TODO: Replace with structured logging before production
		console.log(
			`[transformLeadRoleOnCircleTypeChange] Created core roles for circle ${circleId} with type ${newCircleType}`
		);
		return;
	}

	// Determine if lead role transformation is needed
	if (newCircleType === oldCircleType) {
		// No change in circle type - just handle structural role changes
		await handleStructuralRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
		return;
	}

	// Check if transformation is needed: guild ↔ non-guild transitions
	const isToGuild = newCircleType === CIRCLE_TYPES.GUILD && oldCircleType !== CIRCLE_TYPES.GUILD;
	const isFromGuild = oldCircleType === CIRCLE_TYPES.GUILD && newCircleType !== CIRCLE_TYPES.GUILD;
	const needsLeadTransform = isToGuild || isFromGuild;

	if (!needsLeadTransform) {
		// No lead role transformation needed
		// But check if we need to add/remove structural roles
		await handleStructuralRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
		return;
	}

	// Get target template using appliesTo field (correct approach per SYOS-895)
	const targetTemplate = await getSystemTemplateByRoleType(
		ctx,
		ROLE_TYPES.CIRCLE_LEAD,
		newCircleType
	);

	// Get circle to access workspaceId
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	// Fetch workspace to get phase (SYOS-996: phase-aware validation)
	const workspace = await ctx.db.get(circle.workspaceId);

	// Transform lead role in-place (don't delete + create) - SYOS-960
	const now = Date.now();
	await ctx.db.patch(leadRole._id, {
		name: targetTemplate.name,
		templateId: targetTemplate._id,
		updatedAt: now,
		updatedByPersonId: personId
	});

	// Delete existing customFieldValues for this role
	const existingValues = await ctx.db
		.query('customFieldValues')
		.withIndex('by_entity', (q) => q.eq('entityType', 'role').eq('entityId', leadRole._id))
		.collect();
	for (const value of existingValues) {
		await ctx.db.delete(value._id);
	}

	// Create new customFieldValues from new template (SYOS-960) - phase-aware (SYOS-996)
	await createCustomFieldValuesFromTemplate(ctx, {
		workspaceId: circle.workspaceId,
		entityType: 'role',
		entityId: leadRole._id,
		templateDefaultFieldValues: targetTemplate.defaultFieldValues,
		createdByPersonId: personId,
		workspacePhase: workspace?.phase
	});

	// Handle structural role changes
	await handleStructuralRoleChange(ctx, circleId, oldCircleType, newCircleType, personId);
}

/**
 * Add or remove structural roles when circle type changes
 *
 * Creates all structural roles for the new circle type that don't already exist.
 * All circle types have structural roles (e.g., Secretary for hierarchy/guild,
 * Facilitator + Secretary for empowered_team/hybrid).
 *
 * Note: We don't remove structural roles when changing circle types
 * Governance-design.md §5.4: "Keep Facilitator (now optional)"
 *
 * @param ctx - Mutation context
 * @param circleId - The circle being updated
 * @param oldCircleType - Previous circle type
 * @param newCircleType - New circle type
 * @param personId - Person making the change (for audit trail)
 */
async function handleStructuralRoleChange(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	oldCircleType: CircleType,
	newCircleType: CircleType,
	personId: Id<'people'>
): Promise<void> {
	// Always create structural roles for the new circle type (all types have structural roles)
	const allTemplates = await getAllSystemTemplatesForCircleType(ctx, newCircleType);
	const structuralTemplates = allTemplates.filter((t) => t.roleType === ROLE_TYPES.STRUCTURAL);

	// If no structural templates for this type, nothing to do
	if (structuralTemplates.length === 0) {
		return;
	}

	const circle = await ctx.db.get(circleId);
	if (!circle) {
		return;
	}

	// Fetch workspace to get phase (SYOS-996: phase-aware validation)
	const workspace = await ctx.db.get(circle.workspaceId);

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
		// Create lean circleRole (no descriptive fields per SYOS-960)
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId: circle.workspaceId,
			name: template.name,
			roleType: template.roleType,
			templateId: template._id,
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedByPersonId: personId
		});

		// Create customFieldValues from template defaults (SYOS-960) - phase-aware (SYOS-996)
		// This also validates required fields (GOV-02, GOV-03)
		await createCustomFieldValuesFromTemplate(ctx, {
			workspaceId: circle.workspaceId,
			entityType: 'role',
			entityId: roleId,
			templateDefaultFieldValues: template.defaultFieldValues,
			createdByPersonId: personId,
			workspacePhase: workspace?.phase
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
	// Note: We don't remove structural roles when changing circle types
	// Governance-design.md §5.4: "Keep Facilitator (now optional)"
}

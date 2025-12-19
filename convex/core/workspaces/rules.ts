/**
 * Workspace Activation Validation Rules
 *
 * Registry pattern for extensible validation checks.
 * Adding/removing rules is a one-line change to the ACTIVATION_RULES array.
 *
 * @see SYOS-1006: Refactor activation validation to rules.ts with registry pattern
 * @see SYOS-997: Original activation validation implementation
 */

import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { ActivationIssue } from './schema';
import { CIRCLE_TYPES } from '../circles';

/**
 * Validation context passed to check functions
 */
export type ValidationContext = {
	workspaceSlug: string;
};

/**
 * Validation rule definition
 */
export type ValidationRule = {
	code: string;
	severity: 'error' | 'warning';
	check: (
		ctx: QueryCtx | MutationCtx,
		workspaceId: Id<'workspaces'>,
		context: ValidationContext
	) => Promise<ActivationIssue[]>;
};

/**
 * THE REGISTRY - Single source of truth for activation rules
 *
 * Adding a rule = add one line here
 * Removing a rule = remove one line here
 */
export const ACTIVATION_RULES: ValidationRule[] = [
	{ code: 'ORG-01', severity: 'error', check: checkRootCircle },
	{ code: 'ORG-10', severity: 'error', check: checkRootCircleType },
	{ code: 'GOV-01', severity: 'error', check: checkCircleLeadRoles },
	{ code: 'GOV-02', severity: 'error', check: checkRolePurposes },
	{ code: 'GOV-03', severity: 'error', check: checkRoleDecisionRights }
];

/**
 * Generic runner - executes all rules in registry
 *
 * This function never needs to change. Add/remove rules in ACTIVATION_RULES array.
 *
 * @param ctx - Query or Mutation context
 * @param workspaceId - Workspace to validate
 * @param workspaceSlug - Workspace slug for URLs
 * @returns Array of activation issues (empty = ready to activate)
 */
export async function runActivationValidation(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	workspaceSlug: string
): Promise<ActivationIssue[]> {
	console.log('🔍 Running activation validation for workspace:', {
		workspaceId,
		workspaceSlug,
		rulesCount: ACTIVATION_RULES.length
	});

	const context: ValidationContext = { workspaceSlug };
	const results = await Promise.all(
		ACTIVATION_RULES.map(async (rule) => {
			console.log(`  ✓ Checking rule: ${rule.code}`);
			const issues = await rule.check(ctx, workspaceId, context);
			console.log(`    → Found ${issues.length} issue(s)`);
			return issues;
		})
	);

	const allIssues = results.flat();
	console.log('✅ Validation complete:', {
		totalIssues: allIssues.length,
		issuesCodes: allIssues.map((i) => i.code).join(', ') || 'none',
		isReadyToActivate: allIssues.length === 0
	});

	return allIssues;
}

// ============================================================================
// Individual Check Functions (small, focused, testable)
// ============================================================================

/**
 * ORG-01: Workspace has exactly one root circle
 */
async function checkRootCircle(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const rootCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.filter((q) => q.eq(q.field('parentCircleId'), undefined))
		.collect();

	if (rootCircles.length === 0) {
		const workspace = await ctx.db.get(workspaceId);
		return [
			{
				id: 'ORG-01-MISSING',
				code: 'ORG-01',
				severity: 'error',
				entityType: 'workspace',
				entityId: workspaceId,
				entityName: workspace?.name ?? context.workspaceSlug,
				message: 'Workspace must have a root circle',
				actionType: 'create_root',
				actionUrl: `/w/${context.workspaceSlug}/activate`
			}
		];
	}

	if (rootCircles.length > 1) {
		const workspace = await ctx.db.get(workspaceId);
		return [
			{
				id: 'ORG-01-MULTIPLE',
				code: 'ORG-01',
				severity: 'error',
				entityType: 'workspace',
				entityId: workspaceId,
				entityName: workspace?.name ?? context.workspaceSlug,
				message: `Workspace has ${rootCircles.length} root circles, must have exactly one`,
				actionType: 'create_root',
				actionUrl: `/w/${context.workspaceSlug}/activate`
			}
		];
	}

	return [];
}

/**
 * ORG-10: Root circle type ≠ guild
 */
async function checkRootCircleType(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const rootCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.filter((q) => q.eq(q.field('parentCircleId'), undefined))
		.collect();

	// Only check if we have exactly one root (ORG-01 handles other cases)
	if (rootCircles.length !== 1) {
		return [];
	}

	const rootCircle = rootCircles[0];
	if (rootCircle.circleType === CIRCLE_TYPES.GUILD) {
		return [
			{
				id: `ORG-10-${rootCircle._id}`,
				code: 'ORG-10',
				severity: 'error',
				entityType: 'circle',
				entityId: rootCircle._id,
				entityName: rootCircle.name,
				message: `Root circle "${rootCircle.name}" cannot be type 'guild'`,
				actionType: 'edit_circle',
				actionUrl: `/w/${context.workspaceSlug}/chart`,
				// Structured navigation data (SYOS-1022)
				circleId: rootCircle._id
			}
		];
	}

	return [];
}

/**
 * GOV-01: Every circle has role with roleType: 'circle_lead'
 */
async function checkCircleLeadRoles(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	const allCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	for (const circle of allCircles) {
		const leadRole = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_roleType', (q) =>
				q.eq('circleId', circle._id).eq('roleType', 'circle_lead')
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (!leadRole) {
			issues.push({
				id: `GOV-01-${circle._id}`,
				code: 'GOV-01',
				severity: 'error',
				entityType: 'circle',
				entityId: circle._id,
				entityName: circle.name,
				message: `Circle "${circle.name}" is missing a Circle Lead role`,
				actionType: 'edit_circle',
				actionUrl: `/w/${context.workspaceSlug}/chart`,
				// Structured navigation data (SYOS-1022)
				circleId: circle._id
			});
		}
	}

	return issues;
}

/**
 * GOV-02: Every role has a purpose (customFieldValue)
 *
 * CRITICAL FIX (SYOS-1006): If customFieldDefinition for 'purpose' doesn't exist,
 * return SYS-01 error (not silent pass).
 */
async function checkRolePurposes(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	// Check if purpose definition exists
	const purposeDef = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', workspaceId).eq('systemKey', 'purpose')
		)
		.filter((q) => q.eq(q.field('entityType'), 'role'))
		.first();

	// ✅ CRITICAL FIX: Explicit fail if definition missing (not silent pass)
	if (!purposeDef) {
		const workspace = await ctx.db.get(workspaceId);
		return [
			{
				id: 'SYS-01-PURPOSE',
				code: 'SYS-01',
				severity: 'error',
				entityType: 'workspace',
				entityId: workspaceId,
				entityName: workspace?.name ?? context.workspaceSlug,
				message:
					'System field definitions not initialized. Complete onboarding step 3 (role field setup).',
				actionType: 'create_root',
				actionUrl: `/w/${context.workspaceSlug}/activate`
			}
		];
	}

	// Get all circles and their roles
	const allCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	for (const circle of allCircles) {
		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', circle._id).eq('archivedAt', undefined)
			)
			.collect();

		for (const role of roles) {
			const purposeValues = await ctx.db
				.query('customFieldValues')
				.withIndex('by_definition_entity', (q) =>
					q.eq('definitionId', purposeDef._id).eq('entityId', role._id)
				)
				.collect();

			const hasNonEmptyPurpose = purposeValues.some((v) => v.value && v.value.trim().length > 0);

			if (!hasNonEmptyPurpose) {
				issues.push({
					id: `GOV-02-${role._id}`,
					code: 'GOV-02',
					severity: 'error',
					entityType: 'role',
					entityId: role._id,
					entityName: role.name,
					message: `Role "${role.name}" in circle "${circle.name}" is missing a purpose`,
					actionType: 'edit_role',
					actionUrl: `/w/${context.workspaceSlug}/chart`,
					// Structured navigation data (SYOS-1022)
					circleId: circle._id,
					roleId: role._id
				});
			}
		}
	}

	return issues;
}

/**
 * GOV-03: Every role has ≥1 decision_right (customFieldValue)
 *
 * CRITICAL FIX (SYOS-1006): If customFieldDefinition for 'decision_right' doesn't exist,
 * return SYS-01 error (not silent pass).
 */
async function checkRoleDecisionRights(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	context: ValidationContext
): Promise<ActivationIssue[]> {
	const issues: ActivationIssue[] = [];

	// Check if decision_right definition exists
	const decisionRightDef = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', workspaceId).eq('systemKey', 'decision_right')
		)
		.filter((q) => q.eq(q.field('entityType'), 'role'))
		.first();

	// ✅ CRITICAL FIX: Explicit fail if definition missing (not silent pass)
	if (!decisionRightDef) {
		const workspace = await ctx.db.get(workspaceId);
		return [
			{
				id: 'SYS-01-DECISION-RIGHT',
				code: 'SYS-01',
				severity: 'error',
				entityType: 'workspace',
				entityId: workspaceId,
				entityName: workspace?.name ?? context.workspaceSlug,
				message:
					'System field definitions not initialized. Complete onboarding step 3 (role field setup).',
				actionType: 'create_root',
				actionUrl: `/w/${context.workspaceSlug}/activate`
			}
		];
	}

	// Get all circles and their roles
	const allCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	for (const circle of allCircles) {
		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', circle._id).eq('archivedAt', undefined)
			)
			.collect();

		for (const role of roles) {
			const decisionRightValues = await ctx.db
				.query('customFieldValues')
				.withIndex('by_definition_entity', (q) =>
					q.eq('definitionId', decisionRightDef._id).eq('entityId', role._id)
				)
				.collect();

			const hasNonEmptyDecisionRight = decisionRightValues.some(
				(v) => v.value && v.value.trim().length > 0
			);

			if (!hasNonEmptyDecisionRight) {
				issues.push({
					id: `GOV-03-${role._id}`,
					code: 'GOV-03',
					severity: 'error',
					entityType: 'role',
					entityId: role._id,
					entityName: role.name,
					message: `Role "${role.name}" in circle "${circle.name}" is missing decision rights`,
					actionType: 'edit_role',
					actionUrl: `/w/${context.workspaceSlug}/chart`,
					// Structured navigation data (SYOS-1022)
					circleId: circle._id,
					roleId: role._id
				});
			}
		}
	}

	return issues;
}

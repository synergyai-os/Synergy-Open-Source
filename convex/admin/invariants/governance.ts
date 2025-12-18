/**
 * Governance Invariants (GOV-*)
 *
 * Validates governance foundation requirements from governance-design.md.
 * These enforce role clarity and decision rights using the custom fields system.
 *
 * @see SYOS-962: Implement GOV-02, GOV-03 invariant checks
 * @see convex/admin/invariants/INVARIANTS.md for complete invariant documentation
 */

import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';
import type { Id } from '../../_generated/dataModel';

/**
 * GOV-02: Every role has a `purpose` (non-empty string)
 *
 * Checks that every role has at least one customFieldValue with systemKey='purpose'.
 * This ensures role clarity per governance-design.md.
 *
 * @see INVARIANTS.md:178 - GOV-02 definition
 * @see SYOS-962: Update invariants to check customFieldValues
 */
export const checkGOV02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all non-archived roles
		const roles = await ctx.db
			.query('circleRoles')
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		// Group roles by workspace for efficient batched queries
		const rolesByWorkspace = new Map<string, typeof roles>();
		for (const role of roles) {
			const wsKey = role.workspaceId.toString();
			if (!rolesByWorkspace.has(wsKey)) {
				rolesByWorkspace.set(wsKey, []);
			}
			rolesByWorkspace.get(wsKey)!.push(role);
		}

		const violations: string[] = [];

		// Check each workspace
		for (const [workspaceIdStr, wsRoles] of rolesByWorkspace) {
			const workspaceId = workspaceIdStr as Id<'workspaces'>;

			// Get purpose field definition for this workspace
			const purposeDef = await ctx.db
				.query('customFieldDefinitions')
				.withIndex('by_workspace_system_key', (q) =>
					q.eq('workspaceId', workspaceId).eq('systemKey', 'purpose')
				)
				.first();

			if (!purposeDef) {
				// If no purpose definition exists, all roles in this workspace violate GOV-02
				violations.push(...wsRoles.map((r) => r._id.toString()));
				continue;
			}

			// Get all customFieldValues for roles in this workspace
			const roleValues = await ctx.db
				.query('customFieldValues')
				.withIndex('by_workspace_entity', (q) =>
					q.eq('workspaceId', workspaceId).eq('entityType', 'role')
				)
				.collect();

			// Build lookup: roleId → purpose values
			const purposeByRole = new Map<string, string[]>();
			for (const value of roleValues) {
				if (value.definitionId.toString() === purposeDef._id.toString()) {
					const roleId = value.entityId;
					if (!purposeByRole.has(roleId)) {
						purposeByRole.set(roleId, []);
					}
					// Check if value is non-empty
					if (value.value && value.value.trim() !== '') {
						purposeByRole.get(roleId)!.push(value.value);
					}
				}
			}

			// Check each role has at least one non-empty purpose value
			for (const role of wsRoles) {
				const roleId = role._id.toString();
				const purposes = purposeByRole.get(roleId) || [];
				if (purposes.length === 0) {
					violations.push(roleId);
				}
			}
		}

		return makeResult({
			id: 'GOV-02',
			name: 'Every role has a purpose (non-empty string)',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles have purpose defined in customFieldValues'
					: `${violations.length} role(s) missing purpose in customFieldValues`
		});
	}
});

/**
 * GOV-03: Every role has at least one `decisionRight`
 *
 * Checks that every role has at least one customFieldValue with systemKey='decision_right'.
 * This ensures explicit authority per governance-design.md.
 *
 * @see INVARIANTS.md:179 - GOV-03 definition
 * @see SYOS-962: Update invariants to check customFieldValues
 */
export const checkGOV03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all non-archived roles
		const roles = await ctx.db
			.query('circleRoles')
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		// Group roles by workspace for efficient batched queries
		const rolesByWorkspace = new Map<string, typeof roles>();
		for (const role of roles) {
			const wsKey = role.workspaceId.toString();
			if (!rolesByWorkspace.has(wsKey)) {
				rolesByWorkspace.set(wsKey, []);
			}
			rolesByWorkspace.get(wsKey)!.push(role);
		}

		const violations: string[] = [];

		// Check each workspace
		for (const [workspaceIdStr, wsRoles] of rolesByWorkspace) {
			const workspaceId = workspaceIdStr as Id<'workspaces'>;

			// Get decision_right field definition for this workspace
			const decisionRightDef = await ctx.db
				.query('customFieldDefinitions')
				.withIndex('by_workspace_system_key', (q) =>
					q.eq('workspaceId', workspaceId).eq('systemKey', 'decision_right')
				)
				.first();

			if (!decisionRightDef) {
				// If no decision_right definition exists, all roles in this workspace violate GOV-03
				violations.push(...wsRoles.map((r) => r._id.toString()));
				continue;
			}

			// Get all customFieldValues for roles in this workspace
			const roleValues = await ctx.db
				.query('customFieldValues')
				.withIndex('by_workspace_entity', (q) =>
					q.eq('workspaceId', workspaceId).eq('entityType', 'role')
				)
				.collect();

			// Build lookup: roleId → decision right values
			const decisionRightsByRole = new Map<string, string[]>();
			for (const value of roleValues) {
				if (value.definitionId.toString() === decisionRightDef._id.toString()) {
					const roleId = value.entityId;
					if (!decisionRightsByRole.has(roleId)) {
						decisionRightsByRole.set(roleId, []);
					}
					// Check if value is non-empty
					if (value.value && value.value.trim() !== '') {
						decisionRightsByRole.get(roleId)!.push(value.value);
					}
				}
			}

			// Check each role has at least one non-empty decision right value
			for (const role of wsRoles) {
				const roleId = role._id.toString();
				const decisionRights = decisionRightsByRole.get(roleId) || [];
				if (decisionRights.length === 0) {
					violations.push(roleId);
				}
			}
		}

		return makeResult({
			id: 'GOV-03',
			name: 'Every role has at least one decision right',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles have at least one decision right in customFieldValues'
					: `${violations.length} role(s) missing decision rights in customFieldValues`
		});
	}
});

/**
 * Governance Invariants (GOV-*)
 *
 * Validates governance foundation requirements from governance-design.md.
 * These enforce role clarity and decision rights using the schema fields (DR-011).
 *
 * @see DR-011: Governance fields (purpose, decisionRights) stored in core schema
 * @see convex/admin/invariants/INVARIANTS.md for complete invariant documentation
 */

import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

/**
 * GOV-02: Every role has a `purpose` (non-empty string)
 *
 * DR-011: Checks that every role has a non-empty purpose field in the schema.
 * This ensures role clarity per governance-design.md.
 *
 * @see INVARIANTS.md:178 - GOV-02 definition
 */
export const checkGOV02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all non-archived roles
		const roles = await ctx.db
			.query('circleRoles')
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		const violations: string[] = [];

		// DR-011: Check purpose directly on schema
		for (const role of roles) {
			if (!role.purpose || role.purpose.trim() === '') {
				violations.push(role._id.toString());
			}
		}

		return makeResult({
			id: 'GOV-02',
			name: 'Every role has a purpose (non-empty string)',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles have purpose defined in schema'
					: `${violations.length} role(s) missing purpose`
		});
	}
});

/**
 * GOV-03: Every role has at least one `decisionRight`
 *
 * DR-011: Checks that every role has at least one decision right in the schema array.
 * This ensures explicit authority per governance-design.md.
 *
 * @see INVARIANTS.md:179 - GOV-03 definition
 */
export const checkGOV03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all non-archived roles
		const roles = await ctx.db
			.query('circleRoles')
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		const violations: string[] = [];

		// DR-011: Check decisionRights directly on schema
		for (const role of roles) {
			if (!role.decisionRights || role.decisionRights.length === 0) {
				violations.push(role._id.toString());
			} else {
				// Check that at least one is non-empty
				const hasValidRight = role.decisionRights.some((r) => r && r.trim() !== '');
				if (!hasValidRight) {
					violations.push(role._id.toString());
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
					? 'All roles have at least one decision right in schema'
					: `${violations.length} role(s) missing decision rights`
		});
	}
});

/**
 * GOV-08: Lead authority is explicit, never null for active circles
 *
 * Checks that every active circle has leadAuthority set.
 * This ensures authority calculation can function correctly.
 *
 * @see INVARIANTS.md:192 - GOV-08 definition
 */
export const checkGOV08 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		// Get all active circles
		const circles = await ctx.db
			.query('circles')
			.filter((q) =>
				q.and(q.eq(q.field('status'), 'active'), q.eq(q.field('archivedAt'), undefined))
			)
			.collect();

		const violations: string[] = [];

		// Check that active circles have leadAuthority set
		for (const circle of circles) {
			if (!circle.leadAuthority) {
				violations.push(circle._id.toString());
			}
		}

		return makeResult({
			id: 'GOV-08',
			name: 'Lead authority is explicit, never null for active circles',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active circles have leadAuthority defined'
					: `${violations.length} active circle(s) missing leadAuthority`
		});
	}
});

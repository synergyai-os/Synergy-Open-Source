/**
 * Authority calculation rules.
 * Computed from circle types; no persistence.
 */

import type { AuthorityContext } from './types';

/**
 * Check if the person is the Circle Lead of a circle.
 * Pure function — no database access.
 */
export function isCircleLead(ctx: AuthorityContext): boolean {
	return ctx.assignments.some(
		(a) => isSameActor(ctx, a) && a.circleId === ctx.circleId && a.roleType === 'lead'
	);
}

/**
 * Check if the person is a member of a circle (has any assignment).
 * Pure function — no database access.
 */
export function isCircleMember(ctx: AuthorityContext): boolean {
	return ctx.assignments.some((a) => isSameActor(ctx, a) && a.circleId === ctx.circleId);
}

/**
 * Check if the person has a specific role in a circle.
 * Pure function — no database access.
 */
export function hasRole(ctx: AuthorityContext, roleName: string): boolean {
	return ctx.assignments.some(
		(a) => isSameActor(ctx, a) && a.circleId === ctx.circleId && a.roleName === roleName
	);
}

/**
 * Check if the person is Facilitator of a circle.
 * Circle Leads can always facilitate.
 * Pure function — no database access.
 */
export function isFacilitator(ctx: AuthorityContext): boolean {
	return hasRole(ctx, 'Facilitator') || isCircleLead(ctx);
}

function isSameActor(ctx: AuthorityContext, assignment: { personId?: any }) {
	const personMatch = ctx.personId && assignment.personId && assignment.personId === ctx.personId;
	return Boolean(personMatch);
}

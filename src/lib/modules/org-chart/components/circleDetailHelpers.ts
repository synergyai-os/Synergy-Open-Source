/**
 * Helper functions for CircleDetailPanel
 *
 * Most custom field helpers have been moved to CustomFieldSection component.
 * These remaining helpers are for circle/role mutations that don't fit in the component.
 */

import type { ConvexClient } from 'convex/browser';
import type { Id } from '$lib/convex/_generated/dataModel';
import { api } from '$lib/convex';

/**
 * Quick update circle name/purpose (inline editing)
 */
export async function handleQuickUpdateCircle(
	convexClient: ConvexClient | null,
	sessionId: string | null,
	circleId: Id<'circles'> | null,
	updates: { name?: string; purpose?: string }
) {
	if (!convexClient || !circleId || !sessionId) return;
	await convexClient.mutation(api.core.circles.index.updateInline, {
		sessionId,
		circleId,
		updates
	});
}

/**
 * Quick update role name/purpose (inline editing)
 */
export async function handleQuickUpdateRole(
	convexClient: ConvexClient | null,
	sessionId: string | null,
	roleId: Id<'circleRoles'>,
	updates: { name?: string; purpose?: string }
) {
	if (!convexClient || !sessionId) return;
	await convexClient.mutation(api.core.roles.index.updateInline, {
		sessionId,
		circleRoleId: roleId,
		updates
	});
}

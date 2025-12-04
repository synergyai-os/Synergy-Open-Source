import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import { captureUpdate } from './orgVersionHistory';
import { requireQuickEditPermission } from './orgChartPermissions';

/**
 * Circle Items - Content items within categories (domains, accountabilities, etc.)
 * Quick update mutation for inline editing
 */

/**
 * Get circle for a circle item
 */
async function getCircleForItem(
	ctx: { db: { get: (id: Id<'circles'>) => Promise<Doc<'circles'> | null> } },
	item: Doc<'circleItems'>
): Promise<Doc<'circles'>> {
	// Circle items can belong to either a circle or a role
	// If entityType is 'circle', entityId is the circle ID
	// If entityType is 'role', we need to get the role's circleId
	if (item.entityType === 'circle') {
		const circle = await ctx.db.get(item.entityId as Id<'circles'>);
		if (!circle) {
			throw new Error('Circle not found');
		}
		return circle;
	} else {
		// entityType is 'role', get the role's circle
		const role = await ctx.db.get(item.entityId as Id<'circleRoles'>);
		if (!role) {
			throw new Error('Role not found');
		}
		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}
		return circle;
	}
}

/**
 * Quick update a circle item (inline editing with auto-save)
 * Requires: Org Designer role + allowQuickChanges workspace setting
 * PHASE 2: Simplified permission check (circle type checks deferred to Phase 3)
 */
export const quickUpdate = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get circle item and its circle
		const item = await ctx.db.get(args.circleItemId);
		if (!item) {
			throw new Error('Circle item not found');
		}

		const circle = await getCircleForItem(ctx, item);

		// 3. Check quick edit permission (RBAC + workspace setting)
		await requireQuickEditPermission(ctx, userId, circle);

		// 4. Capture before state
		const beforeDoc = { ...item };

		// 5. Apply update
		await ctx.db.patch(args.circleItemId, {
			content: args.content,
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// 6. Capture version history
		const afterDoc = await ctx.db.get(args.circleItemId);
		if (afterDoc) {
			await captureUpdate(ctx, 'circleItem', beforeDoc, afterDoc);
		}

		return { success: true };
	}
});


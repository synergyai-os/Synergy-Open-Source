/**
 * Ensure a person exists for a given workspace + user.
 *
 * Run:
 *   npx convex run admin/ensurePersonForUserInWorkspace '{"workspaceId":"...", "userId":"..."}'
 */

import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';

export default internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		userId: v.id('users')
	},
	handler: async ({ db }, args) => {
		// Check if person already exists
		const existing = await db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
			)
			.first();

		if (existing) {
			return { personId: existing._id, created: false };
		}

		// Fetch user for email/display name if available
		const user = await db.get(args.userId);
		const email = user?.email ?? `unknown-${args.userId}@example.invalid`;
		const displayName = (user?.name as string | undefined) ?? user?.firstName ?? null;

		const now = Date.now();
		const personId = await db.insert('people', {
			workspaceId: args.workspaceId,
			userId: args.userId,
			email,
			displayName: displayName ?? undefined,
			workspaceRole: 'member',
			status: 'active',
			invitedAt: now,
			joinedAt: now
		});

		return { personId, created: true };
	}
});

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { PermissionContext } from './types';
import { checkIsSystemAdmin, listUserPermissions } from './access';

export const isSystemAdmin = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return checkIsSystemAdmin(ctx, userId);
	}
});

export const getUserPermissionsQuery = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const context: PermissionContext = {
			workspaceId: args.workspaceId ?? undefined,
			circleId: args.circleId ?? undefined
		};
		return listUserPermissions(ctx, userId, context).then((permissions) =>
			permissions.map((p) => ({
				permissionSlug: p.permissionSlug,
				scope: p.scope,
				roleSlug: p.roleSlug,
				roleName: p.roleName
			}))
		);
	}
});

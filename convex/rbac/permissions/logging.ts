import type { Ctx, PermissionLogEntry } from './types';

export async function logPermissionCheck(ctx: Ctx, entry: PermissionLogEntry): Promise<void> {
	try {
		if ('insert' in ctx.db) {
			await ctx.db.insert('permissionAuditLog', {
				userId: entry.userId,
				action: entry.action,
				permissionSlug: entry.permissionSlug,
				roleSlug: entry.roleSlug,
				resourceType: entry.context?.resourceType,
				resourceId: entry.context?.resourceId,
				workspaceId: entry.context?.workspaceId,
				circleId: entry.context?.circleId,
				result: entry.result,
				reason: entry.reason,
				metadata: entry.context
					? {
							resourceOwnerId: entry.context.resourceOwnerId
						}
					: undefined,
				timestamp: Date.now()
			});
		}
	} catch (error) {
		console.error('Failed to log permission check:', error);
	}
}

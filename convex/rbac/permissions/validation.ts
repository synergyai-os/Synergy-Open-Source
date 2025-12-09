import type { PermissionContext } from './types';

export function normalizePermissionContext(context?: PermissionContext): PermissionContext {
	return {
		workspaceId: context?.workspaceId,
		circleId: context?.circleId,
		resourceType: context?.resourceType,
		resourceId: context?.resourceId,
		resourceOwnerId: context?.resourceOwnerId
	};
}

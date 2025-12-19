/**
 * Access Check Helpers
 *
 * Provides permission checking for navigation layers before loading content.
 * Used by stacked navigation to validate user access to resources.
 */

import type { LayerType } from './constants';
import { api } from '$convex/_generated/api';
import type { ConvexClient } from 'convex/browser';
import type { Id } from '$convex/_generated/dataModel';

/**
 * Check if user has access to a specific navigation layer
 *
 * @param convex - Convex client instance
 * @param layerType - Type of layer (circle, role, document, etc.)
 * @param resourceId - ID of the resource to check access for
 * @param sessionId - User's session ID
 * @returns Promise<boolean> - true if user has access, false otherwise
 *
 * @example
 * ```typescript
 * const hasAccess = await checkLayerAccess(convex, 'circle', 'abc123', sessionId);
 * if (!hasAccess) {
 *   // Show PermissionGate
 * }
 * ```
 */
export async function checkLayerAccess(
	convex: ConvexClient,
	layerType: LayerType,
	resourceId: string,
	sessionId: string
): Promise<boolean> {
	try {
		switch (layerType) {
			case 'circle':
				return await convex.query(api.core.circles.queries.canAccess, {
					sessionId,
					circleId: resourceId as Id<'circles'>
				});
			case 'role':
				return await convex.query(api.core.roles.queries.canAccess, {
					sessionId,
					roleId: resourceId as Id<'circleRoles'>
				});
			case 'document':
				// Documents feature doesn't exist yet, return true for now
				console.warn('[AccessCheck] Document access checks not implemented yet');
				return true;
			case 'meeting':
				// Meetings feature doesn't exist yet, return true for now
				console.warn('[AccessCheck] Meeting access checks not implemented yet');
				return true;
			case 'person':
				// Person access checks not implemented yet, return true for now
				console.warn('[AccessCheck] Person access checks not implemented yet');
				return true;
			case 'proposal':
				// Proposal access checks not implemented yet, return true for now
				console.warn('[AccessCheck] Proposal access checks not implemented yet');
				return true;
			case 'task':
				// Task access checks not implemented yet, return true for now
				console.warn('[AccessCheck] Task access checks not implemented yet');
				return true;
			default:
				console.warn(`[AccessCheck] Unknown layer type: ${layerType}`);
				return false;
		}
	} catch (error) {
		console.error(`[AccessCheck] Error checking ${layerType}:${resourceId}`, error);
		return false;
	}
}

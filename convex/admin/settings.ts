/**
 * Admin System Settings
 *
 * Queries and mutations for system-wide settings.
 * All functions require system admin access (global admin role).
 */

import { query, mutation } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../infrastructure/rbac/permissions';

/**
 * Get system settings (placeholder for future system settings)
 */
export const getSystemSettings = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Placeholder for future system settings
		return {
			maintenanceMode: false,
			registrationEnabled: true,
			version: '1.0.0'
		};
	}
});

/**
 * Update system settings (placeholder for future system settings)
 */
export const updateSystemSettings = mutation({
	args: {
		sessionId: v.string(),
		maintenanceMode: v.optional(v.boolean()),
		registrationEnabled: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Placeholder for future system settings updates
		// In the future, this would update a systemSettings table

		return {
			success: true,
			message: 'System settings updated (placeholder)'
		};
	}
});

import { captureCreate } from '../../orgVersionHistory';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

export async function createCoreRolesForCircle(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	circleType: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid' = 'hierarchy'
): Promise<void> {
	const now = Date.now();

	// 1. Query system-level core templates (workspaceId = undefined, isCore = true)
	const systemCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', undefined).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// 2. Query workspace-level core templates (workspaceId = workspaceId, isCore = true)
	const workspaceCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', workspaceId).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// Combine all core templates
	const allCoreTemplates = [...systemCoreTemplates, ...workspaceCoreTemplates];

	if (allCoreTemplates.length === 0) {
		// No core templates to create - this is fine
		return;
	}

	// Get existing roles in circle (for duplicate checking)
	const existingRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	// Create a case-insensitive set of existing role names
	const existingRoleNames = new Set(existingRoles.map((role) => role.name.toLowerCase().trim()));

	// 3. Create roles from templates
	for (const template of allCoreTemplates) {
		const templateNameLower = template.name.toLowerCase().trim();

		// Skip if role with same name already exists (idempotent behavior)
		if (existingRoleNames.has(templateNameLower)) {
			// Role already exists - skip silently
			continue;
		}

		// SYOS-674: Skip Lead role (isRequired: true) based on workspace settings or defaults
		// Check workspace settings first, fallback to DEFAULT_LEAD_REQUIRED
		if (template.isRequired === true) {
			// Get workspace org settings
			const orgSettings = await ctx.db
				.query('workspaceOrgSettings')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
				.first();

			// Determine if Lead is required for this circle type
			let leadRequired: boolean;
			if (orgSettings?.leadRequirementByCircleType) {
				// Use workspace-specific setting
				leadRequired = orgSettings.leadRequirementByCircleType[circleType];
			} else {
				// Fallback to system defaults
				const DEFAULT_LEAD_REQUIRED: Record<
					'hierarchy' | 'empowered_team' | 'guild' | 'hybrid',
					boolean
				> = {
					hierarchy: true,
					empowered_team: false,
					guild: false,
					hybrid: true
				};
				leadRequired = DEFAULT_LEAD_REQUIRED[circleType];
			}

			if (!leadRequired) {
				// Skip Lead role creation for this circle type
				continue;
			}
		}

		// Create role from template
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId,
			name: template.name,
			purpose: template.description, // Template description becomes role purpose
			templateId: template._id, // Link role to template
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for role creation
		const newRole = await ctx.db.get(roleId);
		if (newRole) {
			await captureCreate(ctx, 'circleRole', newRole);
		}
	}
}

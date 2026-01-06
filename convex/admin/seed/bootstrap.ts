/**
 * Bootstrap Minimum Viable Workspace
 *
 * Creates the minimum required setup for a functional workspace per
 * governance-design.md §11.2 (Minimum Viable Setup):
 * - 1 workspace (container)
 * - 1 root circle (top-level unit)
 * - 1 lead role with purpose + 1 decision right (GOV-02, GOV-03)
 *
 * Note: The workspace creator gets the org_designer RBAC role separately.
 * They are NOT automatically assigned to the Circle Lead - that's a separate action.
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { LEAD_AUTHORITY } from '../../core/circles/constants';

/**
 * Bootstrap workspace configuration
 */
interface BootstrapConfig {
	workspaceName: string;
	workspaceSlug: string;
	rootCircleName: string;
	rootCirclePurpose: string;
	circleLeadTemplateId: Id<'roleTemplates'>;
}

/**
 * Create a minimum viable workspace
 *
 * @param ctx - Mutation context
 * @param config - Bootstrap configuration
 * @returns Created workspace, circle, and role IDs
 */
export async function createMinimumViableWorkspace(
	ctx: MutationCtx,
	config: BootstrapConfig
): Promise<{
	workspaceId: Id<'workspaces'>;
	rootCircleId: Id<'circles'>;
	leadRoleId: Id<'circleRoles'>;
}> {
	const now = Date.now();

	console.log(`🚀 Bootstrapping workspace: ${config.workspaceName}...`);

	// Step 1: Create workspace (starts in 'design' phase)
	const workspaceId = await ctx.db.insert('workspaces', {
		name: config.workspaceName,
		slug: config.workspaceSlug,
		plan: 'free',
		phase: 'design', // Start in design phase - no governance overhead
		createdAt: now,
		updatedAt: now
	});
	console.log(`  ✅ Workspace created: ${config.workspaceName} (${workspaceId})`);

	// Step 2: Create root circle
	const rootCircleId = await ctx.db.insert('circles', {
		workspaceId,
		name: config.rootCircleName,
		slug: slugifyName(config.rootCircleName),
		purpose: config.rootCirclePurpose,
		parentCircleId: undefined, // Root circle - no parent
		status: 'active',
		leadAuthority: LEAD_AUTHORITY.DECIDES, // Default to decides for bootstrap
		createdAt: now,
		updatedAt: now
	});
	console.log(`  ✅ Root circle created: ${config.rootCircleName} (${rootCircleId})`);

	// Step 3: Create Circle Lead role (GOV-01: every circle needs lead role)
	const leadRoleId = await ctx.db.insert('circleRoles', {
		circleId: rootCircleId,
		workspaceId,
		name: 'Circle Lead',
		roleType: 'circle_lead',
		purpose: 'Lead this circle toward its purpose', // GOV-02: purpose required
		decisionRights: ['Assign roles within circle'], // GOV-03: min 1 decision right
		templateId: config.circleLeadTemplateId,
		status: 'active',
		isHiring: false,
		createdAt: now,
		updatedAt: now
	});
	console.log(`  ✅ Circle Lead role created (${leadRoleId})`);

	console.log(`🚀 Bootstrap complete!\n`);

	return { workspaceId, rootCircleId, leadRoleId };
}

/**
 * Helper: Slugify a name for use in URLs
 */
function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'circle'
	);
}

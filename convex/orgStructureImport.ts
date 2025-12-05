/**
 * Org Structure Import
 *
 * Provides mutation to import organizational structure from parsed tree.
 * All imported circles and roles start as "draft" status.
 * Roles are marked as "hiring" by default.
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import type { Id, MutationCtx } from './_generated/dataModel';
import { createCoreRolesForCircle } from './circles';
import { captureCreate } from './orgVersionHistory';

/**
 * Helper function to slugify a name (duplicated from circles.ts since not exported)
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

/**
 * Ensure unique circle slug within workspace (duplicated from circles.ts since not exported)
 */
async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	let slug = baseSlug;
	let suffix = 1;

	while (existingSlugs.has(slug)) {
		slug = `${baseSlug}-${suffix++}`;
	}

	return slug;
}

/**
 * Validate workspace membership
 */
async function ensureWorkspaceMembership(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('You do not have access to this workspace');
	}
}

/**
 * Validate that a circle exists and belongs to the workspace
 */
async function validateCircle(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>
): Promise<void> {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw new Error('Circle not found');
	}
	if (circle.workspaceId !== workspaceId) {
		throw new Error('Circle does not belong to this workspace');
	}
}

/**
 * Validate that no roles in the parsed structure match core template names
 * Throws error with user-friendly message if duplicates found
 */
async function validateNoCoreRoleDuplicates(
	ctx: MutationCtx,
	structure: ParsedNode,
	workspaceId: Id<'workspaces'>
): Promise<void> {
	// Query system-level core templates
	const systemCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', undefined).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// Query workspace-level core templates
	const workspaceCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', workspaceId).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// Combine all core templates (workspace takes precedence if duplicate names)
	const allCoreTemplates = [...systemCoreTemplates, ...workspaceCoreTemplates];
	const coreTemplateNames = new Set(allCoreTemplates.map((t) => t.name.toLowerCase().trim()));

	if (coreTemplateNames.size === 0) {
		// No core templates to check against
		return;
	}

	// Recursively check all roles in the structure
	const duplicateRoles: Array<{ lineNumber: number; roleName: string; templateName: string }> = [];

	function checkNode(node: ParsedNode): void {
		if (node.type === 'role') {
			const normalizedRoleName = node.name.toLowerCase().trim();
			if (coreTemplateNames.has(normalizedRoleName)) {
				// Find the matching template to get the exact name
				const matchingTemplate = allCoreTemplates.find(
					(t) => t.name.toLowerCase().trim() === normalizedRoleName
				);
				duplicateRoles.push({
					lineNumber: node.lineNumber,
					roleName: node.name,
					templateName: matchingTemplate?.name ?? node.name
				});
			}
		}

		// Recursively check children
		for (const child of node.children) {
			checkNode(child);
		}
	}

	// Check all nodes in structure (skip root)
	for (const child of structure.children) {
		checkNode(child);
	}

	// If duplicates found, throw error with user-friendly message
	if (duplicateRoles.length > 0) {
		const roleList = duplicateRoles.map((r) => `"${r.roleName}" (line ${r.lineNumber})`).join(', ');
		throw new Error(
			`Cannot import: ${roleList} ${duplicateRoles.length === 1 ? 'is' : 'are'} core role${duplicateRoles.length === 1 ? '' : 's'} that will be automatically created. Remove these lines from your import to avoid duplicates.`
		);
	}
}

/**
 * Type for parsed nodes (recursive structure)
 */
type ParsedNode = {
	type: 'circle' | 'role';
	name: string;
	purpose?: string;
	depth: number;
	lineNumber: number;
	children: ParsedNode[];
};

/**
 * Recursive schema for parsed nodes
 * Note: Using v.any() for recursive children since Convex doesn't support recursive schemas directly
 */
const parsedNodeSchema = v.object({
	type: v.union(v.literal('circle'), v.literal('role')),
	name: v.string(),
	purpose: v.optional(v.string()),
	depth: v.number(),
	lineNumber: v.number(),
	children: v.array(v.any()) // Recursive - will be validated at runtime
});

/**
 * Import org structure from parsed tree
 *
 * Creates circles and roles recursively in a transaction (all-or-nothing).
 * All imported items start as "draft" status.
 * Roles are marked as "hiring" by default.
 * Auto-creates core roles for each circle.
 * Captures version history for all creates.
 *
 * Edge cases handled:
 * - Duplicate names: Allowed for circles (uses unique slugs), allowed for roles
 * - Invalid parent IDs: Validated before creation
 * - Missing workspace: Validated at start
 */
export const importOrgStructure = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		rootCircleId: v.id('circles'), // Existing root circle to import into
		structure: parsedNodeSchema // Parsed tree from frontend (root node with children)
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Validate workspace membership
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Validate root circle exists and belongs to workspace
		await validateCircle(ctx, args.rootCircleId, args.workspaceId);

		// Validate workspace exists
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) {
			throw new Error('Workspace not found');
		}

		// Validate no core role duplicates BEFORE creating anything
		await validateNoCoreRoleDuplicates(ctx, args.structure, args.workspaceId);

		const now = Date.now();

		/**
		 * Recursive helper to create circles and roles
		 */
		async function createNode(
			node: {
				type: 'circle' | 'role';
				name: string;
				purpose?: string;
				children: ParsedNode[];
			},
			parentCircleId: Id<'circles'>
		): Promise<void> {
			if (node.type === 'circle') {
				// Validate parent circle exists and belongs to workspace
				await validateCircle(ctx, parentCircleId, args.workspaceId);

				// Create circle with unique slug
				const slugBase = slugifyName(node.name);
				const slug = await ensureUniqueCircleSlug(ctx, args.workspaceId, slugBase);

				const circleId = await ctx.db.insert('circles', {
					workspaceId: args.workspaceId,
					name: node.name.trim(),
					slug,
					purpose: node.purpose?.trim(),
					parentCircleId,
					circleType: 'hierarchy', // Default circle type (SYOS-675)
					decisionModel: 'manager_decides', // Default decision model (SYOS-675)
					status: 'draft', // All imports start as draft
					createdAt: now,
					updatedAt: now,
					updatedBy: userId
				});

				// Capture version history
				const newCircle = await ctx.db.get(circleId);
				if (newCircle) {
					await captureCreate(ctx, 'circle', newCircle);
				}

				// Auto-create core roles (Circle Lead, etc.) - respects circleType (SYOS-675)
				await createCoreRolesForCircle(ctx, circleId, args.workspaceId, userId, 'hierarchy');

				// Recursively create children
				for (const child of node.children) {
					await createNode(child, circleId);
				}
			} else {
				// Create role
				// Validate parent circle exists and belongs to workspace
				await validateCircle(ctx, parentCircleId, args.workspaceId);

				const roleId = await ctx.db.insert('circleRoles', {
					circleId: parentCircleId,
					workspaceId: args.workspaceId,
					name: node.name.trim(),
					purpose: node.purpose?.trim(),
					status: 'draft', // All imports start as draft
					isHiring: true, // All imported roles are hiring by default
					createdAt: now,
					updatedAt: now,
					updatedBy: userId
				});

				// Capture version history
				const newRole = await ctx.db.get(roleId);
				if (newRole) {
					await captureCreate(ctx, 'circleRole', newRole);
				}
			}
		}

		// Create all nodes starting from root's children
		// The structure parameter is the root node, we import its children into the existing root circle
		for (const child of args.structure.children) {
			await createNode(child, args.rootCircleId);
		}

		return {
			success: true,
			message: 'Structure imported successfully'
		};
	}
});

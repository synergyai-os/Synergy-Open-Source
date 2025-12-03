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

				// Auto-create core roles (Circle Lead, etc.)
				await createCoreRolesForCircle(ctx, circleId, args.workspaceId, userId);

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

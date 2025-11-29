/**
 * Tag Queries and Mutations
 *
 * Handles tag management with hierarchical support, color selection, and assignment to highlights
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import { normalizeTagName } from './readwiseUtils';
import type { Doc, Id } from './_generated/dataModel';
import { canAccessContent } from './permissions';
import type { QueryCtx, MutationCtx } from './_generated/server';
// TODO: Re-enable server-side analytics via HTTP action bridge
// import { captureAnalyticsEvent } from "./posthog";
// import { AnalyticsEventName } from "../src/lib/infrastructure/analytics/events";

export interface TagWithHierarchy {
	_id: Id<'tags'>;
	userId: Id<'users'>;
	name: string;
	displayName: string;
	color: string;
	parentId: Id<'tags'> | undefined;
	externalId: number | undefined;
	createdAt: number;
	level: number; // Depth in hierarchy (0 = root level)
	children?: TagWithHierarchy[];
}

// TODO: Re-enable when server-side analytics is restored
// async function resolveDistinctId(
// 	ctx: QueryCtx | MutationCtx,
// 	userId: Id<'users'>
// ): Promise<string> {
// 	const user = await ctx.db.get(userId);
// 	const email = (user as unknown as { email?: string } | undefined)?.email;
// 	return typeof email === 'string' ? email : userId;
// }

/**
 * Helper: Build hierarchical tag tree structure
 * Groups tags by parent and returns a flat list with hierarchy level
 */
function buildTagTree(tags: Doc<'tags'>[]): TagWithHierarchy[] {
	const tagMap = new Map<Id<'tags'>, TagWithHierarchy>();
	const rootTags: TagWithHierarchy[] = [];

	// First pass: create tag objects
	for (const tag of tags) {
		const tagWithHierarchy: TagWithHierarchy = {
			_id: tag._id,
			userId: tag.userId,
			name: tag.name,
			displayName: tag.displayName,
			color: tag.color,
			parentId: tag.parentId, // Can be undefined
			externalId: tag.externalId,
			createdAt: tag._creationTime,
			level: 0, // Will be calculated in second pass
			children: []
		};
		tagMap.set(tag._id, tagWithHierarchy);
	}

	// Second pass: build hierarchy and calculate levels
	for (const tag of tagMap.values()) {
		if (tag.parentId) {
			const parent = tagMap.get(tag.parentId);
			if (parent) {
				parent.children = parent.children || [];
				parent.children.push(tag);
				// Calculate level based on parent
				tag.level = (parent.level ?? 0) + 1;
			} else {
				// Parent not found (orphaned tag), treat as root
				tag.parentId = undefined;
				rootTags.push(tag);
			}
		} else {
			// Root level tag
			rootTags.push(tag);
		}
	}

	// Flatten tree for display (depth-first traversal)
	const flattened: TagWithHierarchy[] = [];
	function traverse(tag: TagWithHierarchy) {
		flattened.push(tag);
		if (tag.children) {
			for (const child of tag.children) {
				traverse(child);
			}
		}
	}

	for (const root of rootTags) {
		traverse(root);
	}

	return flattened;
}

/**
 * Helper: Get all descendant tag IDs for a given tag (recursively)
 * Returns the tag itself plus all its children, grandchildren, etc.
 */
async function getTagDescendants(
	ctx: QueryCtx | MutationCtx,
	tagId: Id<'tags'>,
	userId: Id<'users'>
): Promise<Id<'tags'>[]> {
	const descendants: Id<'tags'>[] = [tagId];
	const queue: Id<'tags'>[] = [tagId];

	while (queue.length > 0) {
		const currentTagId = queue.shift()!;
		const children = await ctx.db
			.query('tags')
			.withIndex('by_user_parent', (q) => q.eq('userId', userId).eq('parentId', currentTagId))
			.collect();

		for (const child of children) {
			descendants.push(child._id);
			queue.push(child._id);
		}
	}

	return descendants;
}

/**
 * Helper: Get all descendant tag IDs for multiple tags
 * Returns all provided tag IDs plus all their descendants
 */
export async function getTagDescendantsForTags(
	ctx: QueryCtx | MutationCtx,
	tagIds: Id<'tags'>[],
	userId: Id<'users'>
): Promise<Id<'tags'>[]> {
	if (tagIds.length === 0) {
		return [];
	}

	const allDescendants = new Set<Id<'tags'>>();
	for (const tagId of tagIds) {
		const descendants = await getTagDescendants(ctx, tagId, userId);
		for (const descId of descendants) {
			allDescendants.add(descId);
		}
	}

	return Array.from(allDescendants);
}

/**
 * Query: List all tags for the current user with hierarchical structure
 */
/**
 * List all tags for the current user
 * Uses sessionId-based authentication to prevent impersonation attacks
 */
export const listAllTags = query({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		workspaceId: v.optional(v.id('workspaces')) // Filter by workspace (required - users always have orgs)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get user tags filtered by workspace
		// Users are required to have at least one workspace (enforced server-side)
		let tags;
		if (args.workspaceId) {
			// Filter by workspace: tags owned by this org OR user tags (no orgId)
			tags = await ctx.db
				.query('tags')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
			// Filter client-side: org tags for this org OR user tags (no workspaceId)
			tags = tags.filter(
				(tag) =>
					!tag.workspaceId || // User tags (no org)
					tag.workspaceId === args.workspaceId // Org tags for this org
			);
		} else {
			// Fallback: get all user tags (shouldn't happen due to server-side enforcement)
			tags = await ctx.db
				.query('tags')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
		}

		// Build hierarchical tree structure
		return buildTagTree(tags);
	}
});

/**
 * Query: Get user's tags with ownership information
 * Returns all tags the user owns, including shared tags
 * Uses sessionId-based authentication to prevent impersonation attacks
 */
export const listUserTags = query({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		workspaceId: v.optional(v.id('workspaces')) // Filter by workspace (required - users always have orgs)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get user tags filtered by workspace
		// Users are required to have at least one workspace (enforced server-side)
		let tags;
		if (args.workspaceId) {
			// Filter by workspace: tags owned by this org OR user tags (no orgId)
			tags = await ctx.db
				.query('tags')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
			// Filter client-side: org tags for this org OR user tags (no workspaceId)
			tags = tags.filter(
				(tag) =>
					!tag.workspaceId || // User tags (no org)
					tag.workspaceId === args.workspaceId // Org tags for this org
			);
		} else {
			// Fallback: get all user tags (shouldn't happen due to server-side enforcement)
			tags = await ctx.db
				.query('tags')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
		}

		// Return tags with ownership info (no hierarchy for simple list view)
		return tags.map((tag) => ({
			_id: tag._id,
			displayName: tag.displayName ?? tag.name,
			color: tag.color,
			ownershipType: tag.ownershipType ?? undefined,
			workspaceId: tag.workspaceId ?? undefined,
			circleId: tag.circleId ?? undefined,
			userId: tag.userId,
			createdAt: tag.createdAt
		}));
	}
});

/**
 * Query: Get tags assigned to a specific highlight
 * Returns tags with their hierarchy information
 */
export const getTagsForHighlight = query({
	args: {
		sessionId: v.string(),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			return [];
		}

		// Get highlight tags
		const highlightTags = await ctx.db
			.query('highlightTags')
			.withIndex('by_highlight', (q) => q.eq('highlightId', args.highlightId))
			.collect();

		const tagIds = highlightTags.map((ht) => ht.tagId);
		const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

		// Filter out null tags and return
		return tags.filter((t): t is NonNullable<typeof t> => t !== null);
	}
});

/**
 * Query: Get tags assigned to a specific flashcard
 * Returns tags with their hierarchy information
 */
export const getTagsForFlashcard = query({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			return [];
		}

		// Get flashcard tags
		const flashcardTags = await ctx.db
			.query('flashcardTags')
			.withIndex('by_flashcard', (q) => q.eq('flashcardId', args.flashcardId))
			.collect();

		const tagIds = flashcardTags.map((ft) => ft.tagId);
		const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

		// Filter out null tags and return
		return tags.filter((t): t is NonNullable<typeof t> => t !== null);
	}
});

/**
 * Mutation: Create a new tag with color selection and optional parent
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const createTag = mutation({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		displayName: v.string(),
		color: v.string(), // Hex color code
		parentId: v.optional(v.id('tags')),
		ownership: v.optional(v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'))),
		workspaceId: v.optional(v.id('workspaces')), // Optional but will be required if not provided
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const ownership = args.ownership ?? 'workspace'; // Default to workspace (not user)

		// Defensive validation: reject mismatched ownership/circleId combinations
		if (ownership !== 'circle' && args.circleId) {
			throw new Error('circleId is only allowed when ownership is "circle"');
		}

		let workspaceId: Id<'workspaces'> | undefined = undefined;
		let circleId: Id<'circles'> | undefined = undefined;

		if (ownership === 'workspace') {
			// If workspaceId not provided, get user's first workspace
			if (!args.workspaceId) {
				// Users are required to have at least one workspace
				const memberships = await ctx.db
					.query('workspaceMembers')
					.withIndex('by_user', (q) => q.eq('userId', userId))
					.collect();
				if (memberships.length === 0) {
					throw new Error('User must belong to at least one workspace');
				}
				workspaceId = memberships[0].workspaceId;
			} else {
				// Validate membership
				const membership = await ctx.db
					.query('workspaceMembers')
					.withIndex('by_workspace_user', (q) =>
						q.eq('workspaceId', args.workspaceId!).eq('userId', userId)
					)
					.first();
				if (!membership) {
					throw new Error('You do not have access to this workspace');
				}
				workspaceId = args.workspaceId;
			}
			circleId = undefined;
		} else if (ownership === 'circle') {
			if (!args.circleId) {
				throw new Error('circleId is required for circle tags');
			}
			const circleMembership = await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_user', (q) => q.eq('circleId', args.circleId!).eq('userId', userId))
				.first();
			if (!circleMembership) {
				throw new Error('You do not have access to this circle');
			}
			const circle = await ctx.db.get(args.circleId);
			if (!circle) {
				throw new Error('Circle not found');
			}
			circleId = args.circleId;
			workspaceId = circle.workspaceId; // Circles always belong to an workspace
		} else {
			// ownership === 'user' - but user tags must still have workspaceId
			// Get user's first workspace (users are required to have at least one)
			const memberships = await ctx.db
				.query('workspaceMembers')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();
			if (memberships.length === 0) {
				throw new Error('User must belong to at least one workspace');
			}
			workspaceId = memberships[0].workspaceId;
			circleId = undefined;
		}

		// Validate tag name
		const normalizedName = normalizeTagName(args.displayName);
		if (!normalizedName || normalizedName.length === 0) {
			throw new Error('Tag name cannot be empty');
		}

		// Check max length (50 chars)
		if (normalizedName.length > 50) {
			throw new Error('Tag name cannot exceed 50 characters');
		}

		// All tags now require workspaceId - check for duplicates by workspace
		let existing: Doc<'tags'> | null = null;
		if (ownership === 'user' && workspaceId) {
			// User tags scoped to workspace (check by org + name + ownershipType)
			existing = await ctx.db
				.query('tags')
				.withIndex('by_workspace_name', (q) =>
					q.eq('workspaceId', workspaceId).eq('name', normalizedName)
				)
				.filter((q) => q.eq(q.field('ownershipType'), 'user'))
				.first();
		} else if (ownership === 'workspace' && workspaceId) {
			existing = await ctx.db
				.query('tags')
				.withIndex('by_workspace_name', (q) =>
					q.eq('workspaceId', workspaceId).eq('name', normalizedName)
				)
				.first();
		} else if (ownership === 'circle' && circleId && workspaceId) {
			existing = await ctx.db
				.query('tags')
				.withIndex('by_circle_name', (q) => q.eq('circleId', circleId).eq('name', normalizedName))
				.first();
		}

		if (existing) {
			throw new Error(`Tag "${args.displayName}" already exists`);
		}

		// Validate circular reference if parentId provided
		// We can't check against existing tag ID since we're creating new tag
		// So we check if parentId would create a cycle by walking up the chain
		if (args.parentId) {
			let currentParentId: Id<'tags'> | undefined = args.parentId;
			const visited = new Set<Id<'tags'>>();

			while (currentParentId) {
				if (visited.has(currentParentId)) {
					throw new Error('Circular reference detected in parent chain');
				}
				visited.add(currentParentId);

				const parentTag: Doc<'tags'> | null = await ctx.db.get(currentParentId);
				if (!parentTag) {
					throw new Error('Parent tag not found');
				}
				if (parentTag.userId !== userId) {
					const hasAccess = await canAccessContent(ctx, userId, {
						userId: parentTag.userId,
						workspaceId: parentTag.workspaceId ?? undefined,
						circleId: parentTag.circleId ?? undefined
					});
					if (!hasAccess) {
						throw new Error('Parent tag does not belong to current user scope');
					}
				}
				// NOTE: Parent tags must match workspaceId and circleId exactly
				// This strict validation may reject legacy data with mismatched parent-child relationships
				// If legacy data issues arise, consider adding migration logic or relaxing these checks
				if (parentTag.workspaceId !== workspaceId) {
					throw new Error('Parent tag must belong to the same workspace');
				}
				if (parentTag.circleId !== circleId) {
					throw new Error('Parent tag must belong to the same circle');
				}
				currentParentId = parentTag.parentId;
			}
		}

		// Create tag
		const tagId = await ctx.db.insert('tags', {
			userId,
			name: normalizedName,
			displayName: args.displayName,
			color: args.color,
			parentId: args.parentId,
			createdAt: Date.now(),
			workspaceId,
			circleId,
			ownershipType: ownership
		});

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const distinctId = await resolveDistinctId(ctx, userId as Id<'users'>);

		if (ownership === 'workspace' && workspaceId) {
			// TODO: Re-enable server-side analytics via HTTP action bridge
			// const tagCount = await ctx.db
			// 	.query('tags')
			// 	.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
			// 	.collect();
			// await captureAnalyticsEvent({
			// 	name: AnalyticsEventName.ORGANIZATION_TAG_ASSIGNED,
			// 	distinctId,
			// 	groups: { workspace: workspaceId },
			// 	properties: {
			// 		scope: "workspace",
			// 		workspaceId,
			// 		tagId,
			// 		tagName: args.displayName,
			// 		tagsAssignedCount: tagCount.length,
			// 	},
			// });
		} else if (ownership === 'circle' && circleId) {
			// TODO: Re-enable server-side analytics via HTTP action bridge
			// const tagCount = await ctx.db
			// 	.query('tags')
			// 	.withIndex('by_circle', (q) => q.eq('circleId', circleId))
			// 	.collect();
			// TODO: Re-enable server-side analytics via HTTP action bridge
			// await captureAnalyticsEvent({
			// 	name: AnalyticsEventName.CIRCLE_TAG_ASSIGNED,
			// 	distinctId,
			// 	groups: { workspace: workspaceId!, circle: circleId },
			// 	properties: {
			// 		scope: "circle",
			// 		workspaceId: workspaceId!,
			// 		circleId,
			// 		tagId,
			// 		tagName: args.displayName,
			// 		tagsAssignedCount: tagCount.length,
			// 	},
			// });
		}

		return tagId;
	}
});

/**
 * Query: Count items (highlights, flashcards) linked to a tag
 * Used to show user what will be transferred when sharing
 */
export const countTagItems = query({
	args: {
		sessionId: v.string(),
		tagId: v.id('tags')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			return { highlights: 0, flashcards: 0, total: 0 };
		}

		// Count highlights
		const highlightAssignments = await ctx.db
			.query('highlightTags')
			.withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
			.collect();

		// TODO: Count flashcards when implemented
		const flashcardCount = 0;

		return {
			highlights: highlightAssignments.length,
			flashcards: flashcardCount,
			total: highlightAssignments.length + flashcardCount
		};
	}
});

/**
 * Mutation: Share a personal tag with an workspace or circle
 * Converts a user-owned tag to workspace or circle ownership
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const shareTag = mutation({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		tagId: v.id('tags'),
		shareWith: v.union(v.literal('workspace'), v.literal('circle')),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get the tag
		const tag = await ctx.db.get(args.tagId);
		if (!tag) {
			throw new Error('Tag not found');
		}

		// Verify user owns this tag
		if (tag.userId !== userId) {
			throw new Error('You can only share tags you own');
		}

		// Verify tag is currently user-owned
		if (tag.ownershipType !== 'user' && tag.ownershipType !== undefined) {
			throw new Error('Tag is already shared');
		}

		// Validate sharing parameters
		let workspaceId: Id<'workspaces'> | undefined = undefined;
		let circleId: Id<'circles'> | undefined = undefined;
		let circleDoc: Doc<'circles'> | null = null; // Hoisted for reuse in logging

		if (args.shareWith === 'workspace') {
			if (!args.workspaceId) {
				throw new Error('workspaceId is required when sharing with workspace');
			}

			// Verify user is member of the workspace
			const membership = await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', args.workspaceId!).eq('userId', userId)
				)
				.first();
			if (!membership) {
				throw new Error('You are not a member of this workspace');
			}

			workspaceId = args.workspaceId;
			circleId = undefined;
		} else if (args.shareWith === 'circle') {
			if (!args.circleId) {
				throw new Error('circleId is required when sharing with circle');
			}

			// Verify user is member of the circle
			const circleMembership = await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_user', (q) => q.eq('circleId', args.circleId!).eq('userId', userId))
				.first();
			if (!circleMembership) {
				throw new Error('You are not a member of this circle');
			}

			// Get circle to verify it exists and get workspace
			circleDoc = await ctx.db.get(args.circleId);
			if (!circleDoc) {
				throw new Error('Circle not found');
			}

			circleId = args.circleId;
			// NOTE: This may move tags across workspaces if user is member of circle in different org
			// Cross-workspace transfers are allowed as long as user has access to both workspaces
			workspaceId = circleDoc.workspaceId;
		}

		// Check for naming conflicts in target scope
		const normalizedName = tag.name;
		let existing: Doc<'tags'> | null = null;

		if (args.shareWith === 'workspace' && workspaceId) {
			existing = await ctx.db
				.query('tags')
				.withIndex('by_workspace_name', (q) =>
					q.eq('workspaceId', workspaceId).eq('name', normalizedName)
				)
				.first();
		} else if (args.shareWith === 'circle' && circleId) {
			existing = await ctx.db
				.query('tags')
				.withIndex('by_circle_name', (q) => q.eq('circleId', circleId).eq('name', normalizedName))
				.first();
		}

		if (existing) {
			throw new Error(`A tag named "${tag.displayName}" already exists in this ${args.shareWith}`);
		}

		// Update the tag
		await ctx.db.patch(args.tagId, {
			ownershipType: args.shareWith,
			workspaceId,
			circleId
		});

		// Find all highlights linked to this tag
		const tagAssignments = await ctx.db
			.query('highlightTags')
			.withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
			.collect();

		// Transfer ownership of all linked highlights
		let highlightsTransferred = 0;
		for (const assignment of tagAssignments) {
			const highlight = await ctx.db.get(assignment.highlightId);
			if (highlight) {
				await ctx.db.patch(assignment.highlightId, {
					ownershipType: args.shareWith,
					workspaceId,
					circleId
				});
				highlightsTransferred++;
			}
		}

		// Get workspace details for analytics (circleDoc already fetched above if needed)
		const workspace = workspaceId ? await ctx.db.get(workspaceId) : null;

		// TODO: Capture analytics event
		// For now, log to console for testing
		console.log('📊 [TAG TRANSFERRED]', {
			tagId: args.tagId,
			tagName: tag.displayName,
			transferredBy: userId,
			transferTo: args.shareWith,
			workspaceId,
			organizationName: workspace?.name,
			circleId,
			circleName: circleDoc?.name,
			highlightsTransferred
		});

		return {
			success: true,
			tagId: args.tagId,
			scope: args.shareWith,
			workspaceId,
			circleId,
			itemsTransferred: highlightsTransferred
		};
	}
});

/**
 * Helper: Assign tags to any entity (highlights, flashcards, etc.)
 * Reduces code duplication while maintaining type safety at the mutation level
 */
async function assignTagsToEntity(
	ctx: MutationCtx,
	userId: Id<'users'>,
	entityType: 'highlights' | 'flashcards',
	entityId: Id<'highlights'> | Id<'flashcards'>,
	tagIds: Id<'tags'>[]
): Promise<Id<'tags'>[]> {
	// 1. Verify entity exists and belongs to user
	// Type assertion based on entityType to narrow the union type
	const entity =
		entityType === 'highlights'
			? await ctx.db.get(entityId as Id<'highlights'>)
			: await ctx.db.get(entityId as Id<'flashcards'>);
	if (!entity) {
		throw new Error(`${entityType.slice(0, -1)} not found`);
	}
	// Type guard: Both highlights and flashcards have userId field
	if (!('userId' in entity) || entity.userId !== userId) {
		throw new Error(`${entityType.slice(0, -1)} not found or access denied`);
	}

	// 2. Verify all tags exist and user has access
	const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));
	for (const tag of tags) {
		if (!tag) {
			throw new Error('One or more tags not found');
		}
		if (tag.userId !== userId) {
			const hasAccess = await canAccessContent(ctx, userId, {
				userId: tag.userId,
				workspaceId: tag.workspaceId ?? undefined,
				circleId: tag.circleId ?? undefined
			});
			if (!hasAccess) {
				throw new Error('One or more tags are not accessible');
			}
		}
	}

	// 3. Get and remove existing assignments
	// Use conditional logic to properly type each branch
	const existingAssignments =
		entityType === 'highlights'
			? await ctx.db
					.query('highlightTags')
					.withIndex('by_highlight', (q) => q.eq('highlightId', entityId as Id<'highlights'>))
					.collect()
			: await ctx.db
					.query('flashcardTags')
					.withIndex('by_flashcard', (q) => q.eq('flashcardId', entityId as Id<'flashcards'>))
					.collect();

	for (const assignment of existingAssignments) {
		await ctx.db.delete(assignment._id);
	}

	// 4. Create new assignments
	// Use conditional logic to properly type the insert based on entityType
	for (const tagId of tagIds) {
		if (entityType === 'highlights') {
			await ctx.db.insert('highlightTags', {
				highlightId: entityId as Id<'highlights'>,
				tagId
			});
		} else {
			await ctx.db.insert('flashcardTags', {
				flashcardId: entityId as Id<'flashcards'>,
				tagId
			});
		}
	}

	return tagIds;
}

/**
 * Mutation: Assign multiple tags to a highlight (replaces existing assignments)
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const assignTagsToHighlight = mutation({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		highlightId: v.id('highlights'),
		tagIds: v.array(v.id('tags'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		return await assignTagsToEntity(ctx, userId, 'highlights', args.highlightId, args.tagIds);
	}
});

/**
 * Mutation: Assign multiple tags to a flashcard (replaces existing assignments)
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const assignTagsToFlashcard = mutation({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		flashcardId: v.id('flashcards'),
		tagIds: v.array(v.id('tags'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		return await assignTagsToEntity(ctx, userId, 'flashcards', args.flashcardId, args.tagIds);
	}
});

/**
 * Mutation: Remove a single tag from a highlight
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const unassignTagFromHighlight = mutation({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		highlightId: v.id('highlights'),
		tagId: v.id('tags')
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify highlight exists and belongs to user
		const highlight = await ctx.db.get(args.highlightId);
		if (!highlight || highlight.userId !== userId) {
			throw new Error('Highlight not found or access denied');
		}

		// Find and delete the assignment
		const assignment = await ctx.db
			.query('highlightTags')
			.withIndex('by_highlight_tag', (q) =>
				q.eq('highlightId', args.highlightId).eq('tagId', args.tagId)
			)
			.first();

		if (assignment) {
			await ctx.db.delete(assignment._id);
		}

		return args.tagId;
	}
});

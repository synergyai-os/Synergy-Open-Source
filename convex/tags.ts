/**
 * Tag Queries and Mutations
 * 
 * Handles tag management with hierarchical support, color selection, and assignment to highlights
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { normalizeTagName } from "./readwiseUtils";
import type { Id } from "./_generated/dataModel";

/**
 * Helper: Validate that setting parentId doesn't create circular reference
 * Prevents a tag from being its own ancestor
 */
async function validateCircularReference(
	ctx: any,
	tagId: Id<"tags">,
	proposedParentId: Id<"tags"> | undefined
): Promise<void> {
	if (!proposedParentId) {
		return; // No parent = no cycle possible
	}

	if (tagId === proposedParentId) {
		throw new Error("Tag cannot be its own parent");
	}

	// Walk up the parent chain to check if proposedParentId is a descendant of tagId
	let currentParentId: Id<"tags"> | undefined = proposedParentId;
	const visited = new Set<Id<"tags">>([tagId]); // Track visited tags to prevent infinite loops

	while (currentParentId) {
		if (visited.has(currentParentId)) {
			throw new Error("Circular reference detected: tag would become its own ancestor");
		}
		visited.add(currentParentId);

		const currentTag = await ctx.db.get(currentParentId);
		if (!currentTag) {
			break; // Parent doesn't exist (shouldn't happen, but safe)
		}
		currentParentId = currentTag.parentId;
	}
}

/**
 * Helper: Build hierarchical tag tree structure
 * Groups tags by parent and returns a flat list with hierarchy level
 */
export interface TagWithHierarchy {
	_id: Id<"tags">;
	userId: Id<"users">;
	name: string;
	displayName: string;
	color: string;
	parentId: Id<"tags"> | undefined;
	externalId: number | undefined;
	createdAt: number;
	level: number; // Depth in hierarchy (0 = root level)
	children?: TagWithHierarchy[];
}

function buildTagTree(tags: any[]): TagWithHierarchy[] {
	const tagMap = new Map<Id<"tags">, TagWithHierarchy>();
	const rootTags: TagWithHierarchy[] = [];

	// First pass: create tag objects
	for (const tag of tags) {
		const tagWithHierarchy: TagWithHierarchy = {
			...tag,
			level: 0, // Will be calculated in second pass
			children: [],
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
	ctx: any,
	tagId: Id<"tags">,
	userId: Id<"users">
): Promise<Id<"tags">[]> {
	const descendants: Id<"tags">[] = [tagId];
	const queue: Id<"tags">[] = [tagId];

	while (queue.length > 0) {
		const currentTagId = queue.shift()!;
		const children = await ctx.db
			.query("tags")
			.withIndex("by_user_parent", (q) => q.eq("userId", userId).eq("parentId", currentTagId))
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
	ctx: any,
	tagIds: Id<"tags">[],
	userId: Id<"users">
): Promise<Id<"tags">[]> {
	if (tagIds.length === 0) {
		return [];
	}

	const allDescendants = new Set<Id<"tags">>();
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
export const listAllTags = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}

		// Get all user tags
		const tags = await ctx.db
			.query("tags")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		// Build hierarchical tree structure
		return buildTagTree(tags);
	},
});

/**
 * Query: Get tags assigned to a specific highlight
 * Returns tags with their hierarchy information
 */
export const getTagsForHighlight = query({
	args: {
		highlightId: v.id("highlights"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}

		// Get highlight tags
		const highlightTags = await ctx.db
			.query("highlightTags")
			.withIndex("by_highlight", (q) => q.eq("highlightId", args.highlightId))
			.collect();

		const tagIds = highlightTags.map((ht) => ht.tagId);
		const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

		// Filter out null tags and return
		return tags.filter((t): t is NonNullable<typeof t> => t !== null);
	},
});

/**
 * Mutation: Create a new tag with color selection and optional parent
 */
export const createTag = mutation({
	args: {
		displayName: v.string(),
		color: v.string(), // Hex color code
		parentId: v.optional(v.id("tags")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Validate tag name
		const normalizedName = normalizeTagName(args.displayName);
		if (!normalizedName || normalizedName.length === 0) {
			throw new Error("Tag name cannot be empty");
		}

		// Check max length (50 chars)
		if (normalizedName.length > 50) {
			throw new Error("Tag name cannot exceed 50 characters");
		}

		// Check if tag with same name already exists for this user
		const existing = await ctx.db
			.query("tags")
			.withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", normalizedName))
			.first();

		if (existing) {
			throw new Error(`Tag "${args.displayName}" already exists`);
		}

		// Validate circular reference if parentId provided
		// We can't check against existing tag ID since we're creating new tag
		// So we check if parentId would create a cycle by walking up the chain
		if (args.parentId) {
			let currentParentId: Id<"tags"> | undefined = args.parentId;
			const visited = new Set<Id<"tags">>();

			while (currentParentId) {
				if (visited.has(currentParentId)) {
					throw new Error("Circular reference detected in parent chain");
				}
				visited.add(currentParentId);

				const parentTag = await ctx.db.get(currentParentId);
				if (!parentTag) {
					throw new Error("Parent tag not found");
				}
				// Verify parent belongs to same user
				if (parentTag.userId !== userId) {
					throw new Error("Parent tag does not belong to current user");
				}
				currentParentId = parentTag.parentId;
			}
		}

		// Create tag
		const tagId = await ctx.db.insert("tags", {
			userId,
			name: normalizedName,
			displayName: args.displayName,
			color: args.color,
			parentId: args.parentId,
			createdAt: Date.now(),
		});

		return tagId;
	},
});

/**
 * Mutation: Assign multiple tags to a highlight (replaces existing assignments)
 */
export const assignTagsToHighlight = mutation({
	args: {
		highlightId: v.id("highlights"),
		tagIds: v.array(v.id("tags")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Verify highlight exists and belongs to user
		const highlight = await ctx.db.get(args.highlightId);
		if (!highlight || highlight.userId !== userId) {
			throw new Error("Highlight not found or access denied");
		}

		// Verify all tags exist and belong to user
		const tags = await Promise.all(args.tagIds.map((tagId) => ctx.db.get(tagId)));
		for (const tag of tags) {
			if (!tag) {
				throw new Error("One or more tags not found");
			}
			if (tag.userId !== userId) {
				throw new Error("One or more tags do not belong to current user");
			}
		}

		// Get existing assignments
		const existingAssignments = await ctx.db
			.query("highlightTags")
			.withIndex("by_highlight", (q) => q.eq("highlightId", args.highlightId))
			.collect();

		// Remove existing assignments
		for (const assignment of existingAssignments) {
			await ctx.db.delete(assignment._id);
		}

		// Create new assignments
		for (const tagId of args.tagIds) {
			// Check if assignment already exists (shouldn't happen after delete, but safe)
			const existing = await ctx.db
				.query("highlightTags")
				.withIndex("by_highlight_tag", (q) =>
					q.eq("highlightId", args.highlightId).eq("tagId", tagId)
				)
				.first();

			if (!existing) {
				await ctx.db.insert("highlightTags", {
					highlightId: args.highlightId,
					tagId,
				});
			}
		}

		return args.tagIds;
	},
});

/**
 * Mutation: Remove a single tag from a highlight
 */
export const unassignTagFromHighlight = mutation({
	args: {
		highlightId: v.id("highlights"),
		tagId: v.id("tags"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		// Verify highlight exists and belongs to user
		const highlight = await ctx.db.get(args.highlightId);
		if (!highlight || highlight.userId !== userId) {
			throw new Error("Highlight not found or access denied");
		}

		// Find and delete the assignment
		const assignment = await ctx.db
			.query("highlightTags")
			.withIndex("by_highlight_tag", (q) =>
				q.eq("highlightId", args.highlightId).eq("tagId", args.tagId)
			)
			.first();

		if (assignment) {
			await ctx.db.delete(assignment._id);
		}

		return args.tagId;
	},
});


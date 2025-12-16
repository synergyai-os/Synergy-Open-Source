import { mutation, internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requireWorkspaceAdminOrOwner } from './access';

// ============================================================================
// Slug Utilities (SYOS-855: merged from slug.ts)
// ============================================================================

const RESERVED_SLUGS = [
	'mail',
	'api',
	'app',
	'www',
	'admin',
	'blog',
	'docs',
	'help',
	'support',
	'status',
	'auth',
	'login',
	'signup',
	'pricing',
	'about',
	'legal',
	'w',
	'account',
	'settings',
	'profile',
	'invite',
	'join',
	'dashboard',
	'inbox',
	'dev',
	'staging',
	'test',
	'cdn',
	'assets',
	'static'
];

export function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'org'
	);
}

export function calculateInitialsFromName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('') || name.slice(0, 2).toUpperCase()
	);
}

function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.includes(slug.toLowerCase());
}

function ensureSlugFormat(slug: string) {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		throw createError(
			ErrorCodes.WORKSPACE_SLUG_INVALID,
			'Slug can only contain lowercase letters, numbers, and hyphens'
		);
	}

	if (slug.length < 2 || slug.length > 48) {
		throw createError(
			ErrorCodes.WORKSPACE_SLUG_INVALID,
			'Slug must be between 2 and 48 characters'
		);
	}
}

function ensureSlugNotReserved(
	slug: string,
	label: 'workspace name' | 'slug',
	originalName?: string
) {
	if (isReservedSlug(slug)) {
		let message: string;
		if (originalName) {
			const slugifiedOriginal = slugifyName(originalName);
			if (slugifiedOriginal === slug) {
				// User-friendly message: avoid technical jargon like "reserved slug"
				// Focus on what user can do, not technical details
				message = `The name "${originalName}" is not available. Please choose a different ${label}.`;
			} else {
				message = `The name "${originalName}" is not available. Please choose a different ${label}.`;
			}
		} else {
			message = `This ${label} is not available. Please choose a different ${label}.`;
		}
		throw createError(ErrorCodes.WORKSPACE_SLUG_RESERVED, message);
	}
}

async function ensureUniqueWorkspaceSlug(ctx: MutationCtx, baseSlug: string): Promise<string> {
	let slug = baseSlug;
	let suffix = 1;

	while (true) {
		const existing = await ctx.db
			.query('workspaces')
			.withIndex('by_slug', (q) => q.eq('slug', slug))
			.first();
		if (!existing) {
			return slug;
		}
		slug = `${baseSlug}-${suffix++}`;
	}
}

// ============================================================================
// User Field Helpers (SYOS-855: merged from user.ts)
// ============================================================================

export function findUserEmailField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const emailField = (user as Record<string, unknown>).email;
	return typeof emailField === 'string' ? emailField : null;
}

export function findUserNameField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const nameField = (user as Record<string, unknown>).name;
	return typeof nameField === 'string' ? nameField : null;
}

export function describeUserDisplayName(user: Doc<'users'> | null): string {
	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member';
}

export const createWorkspace = mutation({
	args: {
		name: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return createWorkspaceFlow(ctx, { name: args.name, userId });
	}
});

export const recordOrganizationSwitch = mutation({
	args: {
		sessionId: v.string(),
		fromOrganizationId: v.optional(v.id('workspaces')),
		toOrganizationId: v.id('workspaces'),
		availableCircleCount: v.number()
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		// Analytics intentionally disabled; keep handler thin to satisfy hygiene rules
		return;
	}
});

export const updateSlug = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		newSlug: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireWorkspaceAdminOrOwner(
			ctx,
			args.workspaceId,
			userId,
			'Must be org admin or owner to update slug'
		);

		return updateWorkspaceSlug(ctx, args.workspaceId, args.newSlug);
	}
});

export const updateDisplayNames = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		displayNames: v.object({
			circle: v.optional(v.string()),
			circleLead: v.optional(v.string()),
			facilitator: v.optional(v.string()),
			secretary: v.optional(v.string()),
			tension: v.optional(v.string()),
			proposal: v.optional(v.string())
		})
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireWorkspaceAdminOrOwner(
			ctx,
			args.workspaceId,
			userId,
			'Must be org admin or owner to update display names'
		);

		const now = Date.now();
		await ctx.db.patch(args.workspaceId, {
			displayNames: args.displayNames,
			updatedAt: now
		});
	}
});

async function createWorkspaceFlow(
	ctx: MutationCtx,
	args: { name: string; userId: Id<'users'> }
): Promise<{ workspaceId: Id<'workspaces'>; slug: string }> {
	const trimmedName = args.name.trim();
	if (!trimmedName) {
		throw createError(ErrorCodes.WORKSPACE_NAME_REQUIRED, 'Organization name is required');
	}

	const slugBase = slugifyName(trimmedName);
	ensureSlugNotReserved(slugBase, 'workspace name', trimmedName);

	const slug = await ensureUniqueWorkspaceSlug(ctx, slugBase);
	const now = Date.now();

	const workspaceId = await ctx.db.insert('workspaces', {
		name: trimmedName,
		slug,
		createdAt: now,
		updatedAt: now,
		plan: 'starter'
	});

	// Create people record (organizational identity) - SYOS-814 Phase 1
	const user = await ctx.db.get(args.userId);
	if (!user) {
		throw createError(ErrorCodes.USER_NOT_FOUND, 'User not found');
	}
	const userEmail = findUserEmailField(user);
	const userName = findUserNameField(user);
	const displayName = userName || userEmail?.split('@')[0] || 'Unknown';

	const personId = await ctx.db.insert('people', {
		workspaceId,
		userId: args.userId,
		displayName,
		email: undefined, // Email comes from user lookup, not stored per people/README.md
		workspaceRole: 'owner',
		status: 'active',
		invitedAt: now,
		invitedBy: undefined, // Self-created workspace, no inviter
		joinedAt: now,
		// Onboarding will be completed at the final step (/onboarding/complete)
		// when completeWorkspaceSetup is called
		onboardingCompletedAt: undefined,
		archivedAt: undefined,
		archivedBy: undefined
	});

	// Note: Root circle is NOT created here - it will be created in onboarding step 3
	// when the user chooses circle type. This ensures the circle is created complete
	// (with type) and avoids violating GOV-08 (circle type must be explicit).
	// All workspace seeding (custom fields, meeting templates, roles) happens when
	// the root circle is created with type in step 3.

	return { workspaceId, slug };
}

export async function updateWorkspaceSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	newSlug: string
) {
	const workspace = await ctx.db.get(workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
	}

	const trimmedSlug = newSlug.trim().toLowerCase();
	ensureSlugFormat(trimmedSlug);
	ensureSlugNotReserved(trimmedSlug, 'slug', trimmedSlug);

	const existing = await ctx.db
		.query('workspaces')
		.withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
		.first();

	if (existing && existing._id !== workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_SLUG_TAKEN, `Slug "${trimmedSlug}" is already taken`);
	}

	if (workspace.slug === trimmedSlug) {
		return { success: true, slug: trimmedSlug };
	}

	await ctx.scheduler.runAfter(0, internal.core.workspaces.lifecycle.createAlias, {
		workspaceId,
		slug: workspace.slug
	});

	const now = Date.now();
	await ctx.db.patch(workspaceId, {
		slug: trimmedSlug,
		updatedAt: now
	});

	return { success: true, slug: trimmedSlug };
}

// ============================================================================
// Alias Management (SYOS-855: merged from aliases.ts)
// ============================================================================

/**
 * Create a workspace alias (internal mutation)
 * Called when workspace slug is updated to preserve old slug
 */
export const createAlias = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		slug: v.string() // Old slug to preserve
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Check if alias already exists (idempotent)
		const existing = await ctx.db
			.query('workspaceAliases')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (existing) {
			// Alias already exists, return existing ID
			return existing._id;
		}

		// Create new alias
		const aliasId = await ctx.db.insert('workspaceAliases', {
			workspaceId: args.workspaceId,
			slug: args.slug,
			createdAt: now
		});

		return aliasId;
	}
});

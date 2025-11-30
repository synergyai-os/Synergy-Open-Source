import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import { requirePermission } from './rbac/permissions';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { internal } from './_generated/api';
// TODO: Re-enable server-side analytics via HTTP action bridge
// import { captureAnalyticsEvent } from "./posthog";
// import { AnalyticsEventName } from "../src/lib/infrastructure/analytics/events";

// TODO: Re-enable when needed
// type OrganizationRole = 'owner' | 'admin' | 'member';

function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'org'
	);
}

function initialsFromName(name: string): string {
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

// TODO: Re-enable when server-side analytics is restored
// async function resolveDistinctId(
// 	ctx: QueryCtx | MutationCtx,
// 	userId: Id<'users'>
// ): Promise<string> {
// 	const user = await ctx.db.get(userId);
// 	const email = (user as unknown as { email?: string } | undefined)?.email;
// 	return typeof email === 'string' ? email : userId;
// }

// TODO: Re-enable when server-side analytics is restored
// async function getOrganizationSummary(
// 	ctx: QueryCtx | MutationCtx,
// 	workspaceId: Id<'workspaces'>
// ) {
// 	const workspace = await ctx.db.get(workspaceId);
// 	if (!workspace) {
// 		throw new Error('Organization not found');
// 	}
// 	return workspace;
// }

// TODO: Re-enable when needed
// async function countOwnedOrganizations(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
// 	const memberships = await ctx.db
// 		.query('workspaceMembers')
// 		.withIndex('by_user', (q) => q.eq('userId', userId))
// 		.collect();
// 	return memberships.filter((membership) => membership.role === 'owner').length;
// }

function generateInviteCode(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	const randomTrailing = Math.random().toString(10).slice(2, 6);
	return `${prefix}-${random}-${randomTrailing}`;
}

/**
 * Reserved slugs that cannot be used for workspace URLs
 * These conflict with system routes, user routes, or infrastructure paths
 */
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
	'w', // Workspace route prefix
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

function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.includes(slug.toLowerCase());
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

async function getUserEmail(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
	const user = await ctx.db.get(userId);
	const emailField = (user as unknown as { email?: string } | undefined)?.email;
	return typeof emailField === 'string' ? emailField : null;
}

/**
 * List all workspaces the user is a member of
 * Uses sessionId-based authentication to prevent impersonation attacks
 */
export const listWorkspaces = query({
	args: {
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		console.log('🔍 [listOrganizations] Query started:', {
			sessionId: args.sessionId,
			userId
		});

		const memberships = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		console.log('🔍 [listOrganizations] Memberships found:', {
			membershipCount: memberships.length,
			memberships: memberships.map((m) => ({
				workspaceId: m.workspaceId,
				role: m.role
			}))
		});

		const workspaces = await Promise.all(
			memberships.map(async (membership) => {
				const workspace = await ctx.db.get(membership.workspaceId);
				if (!workspace) {
					console.warn('⚠️ [listOrganizations] Organization not found:', membership.workspaceId);
					return null;
				}

				const memberCount = await ctx.db
					.query('workspaceMembers')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', membership.workspaceId))
					.collect();

				return {
					workspaceId: membership.workspaceId,
					name: workspace.name,
					initials: initialsFromName(workspace.name),
					slug: workspace.slug,
					plan: workspace.plan,
					createdAt: workspace.createdAt,
					updatedAt: workspace.updatedAt,
					role: membership.role,
					joinedAt: membership.joinedAt,
					memberCount: memberCount.length
				};
			})
		);

		const filtered = workspaces.filter((item): item is NonNullable<typeof item> => item !== null);
		console.log('✅ [listOrganizations] Returning workspaces:', {
			count: filtered.length,
			orgs: filtered.map((o) => ({ id: o.workspaceId, name: o.name }))
		});

		return filtered;
	}
});

/**
 * Get workspace by slug
 * Validates user has access to the workspace via sessionId
 * Used for path-based routing (/w/:slug/)
 */
export const getBySlug = query({
	args: {
		slug: v.string(),
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Find workspace by slug
		const workspace = await ctx.db
			.query('workspaces')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (!workspace) {
			return null;
		}

		// Verify user has access to this workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', workspace._id).eq('userId', userId)
			)
			.first();

		if (!membership) {
			// User doesn't have access - return null (don't leak workspace existence)
			return null;
		}

		// Return workspace summary (matches listWorkspaces format)
		const memberCount = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', workspace._id))
			.collect();

		return {
			workspaceId: workspace._id,
			name: workspace.name,
			initials: initialsFromName(workspace.name),
			slug: workspace.slug,
			plan: workspace.plan,
			createdAt: workspace.createdAt,
			updatedAt: workspace.updatedAt,
			role: membership.role,
			joinedAt: membership.joinedAt,
			memberCount: memberCount.length
		};
	}
});

export const listWorkspaceInvites = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			return [];
		}

		const email = await getUserEmail(ctx, userId);

		const invitesByUser = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_user', (q) => q.eq('invitedUserId', userId))
			.collect();

		const invitesByEmail = email
			? await ctx.db
					.query('workspaceInvites')
					.withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
					.collect()
			: [];

		const inviteMap = new Map<string, Doc<'workspaceInvites'>>();
		for (const invite of invitesByUser) {
			inviteMap.set(invite._id, invite);
		}
		for (const invite of invitesByEmail) {
			inviteMap.set(invite._id, invite);
		}

		const invites = await Promise.all(
			Array.from(inviteMap.values()).map(async (invite) => {
				const workspace = await ctx.db.get(invite.workspaceId);
				if (!workspace) return null;

				const inviter = await ctx.db.get(invite.invitedBy);
				const inviterName =
					(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
					(inviter as unknown as { email?: string } | undefined)?.email ??
					'Member';

				return {
					inviteId: invite._id,
					workspaceId: invite.workspaceId,
					organizationName: workspace.name,
					role: invite.role,
					invitedBy: invite.invitedBy,
					invitedByName: inviterName,
					code: invite.code,
					createdAt: invite.createdAt
				};
			})
		);

		return invites.filter((item): item is NonNullable<typeof item> => item !== null);
	}
});

/**
 * Get invite details by code (public - no auth required)
 * Used for invite acceptance page to display invite information
 */
export const getInviteByCode = query({
	args: {
		code: v.string()
	},
	handler: async (ctx, args) => {
		// Try workspace invite first
		const orgInvite = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (orgInvite) {
			// Check if invite has been revoked
			if (orgInvite.revokedAt) {
				return null;
			}

			// Check if invite has expired
			if (orgInvite.expiresAt && orgInvite.expiresAt < Date.now()) {
				return null;
			}

			// Check if invite has already been accepted
			if (orgInvite.acceptedAt) {
				return null;
			}

			const workspace = await ctx.db.get(orgInvite.workspaceId);
			if (!workspace) {
				return null;
			}

			const inviter = await ctx.db.get(orgInvite.invitedBy);
			const inviterName =
				(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
				(inviter as unknown as { email?: string } | undefined)?.email ??
				'Member';

			return {
				type: 'workspace' as const,
				workspaceId: orgInvite.workspaceId,
				organizationName: workspace.name,
				inviterName,
				role: orgInvite.role,
				email: orgInvite.email ?? undefined,
				invitedUserId: orgInvite.invitedUserId ?? undefined
			};
		}

		// No invite found
		return null;
	}
});

/**
 * Create a new workspace
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const createWorkspace = mutation({
	args: {
		name: v.string(),
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new Error('Organization name is required');
		}

		const slugBase = slugifyName(trimmedName);

		// Validate reserved slugs
		if (isReservedSlug(slugBase)) {
			throw new Error(
				`"${slugBase}" is a reserved name and cannot be used. Please choose a different workspace name.`
			);
		}

		const slug = await ensureUniqueWorkspaceSlug(ctx, slugBase);
		const now = Date.now();

		const workspaceId = await ctx.db.insert('workspaces', {
			name: trimmedName,
			slug,
			createdAt: now,
			updatedAt: now,
			plan: 'starter'
		});

		await ctx.db.insert('workspaceMembers', {
			workspaceId,
			userId,
			role: 'owner',
			joinedAt: now
		});

		// Seed default meeting templates (Governance, Weekly Tactical)
		// Schedule seeding to run after org creation completes
		await ctx.scheduler.runAfter(0, internal.meetingTemplates.seedDefaultTemplatesInternal, {
			workspaceId,
			userId
		});

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const totalOwned = await countOwnedOrganizations(ctx, userId);
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.ORGANIZATION_CREATED,
		//   distinctId,
		//   groups: { workspace: workspaceId },
		//   properties: {
		//     scope: "workspace",
		//     workspaceId,
		//     organizationName: trimmedName,
		//     plan: "starter",
		//     createdVia: "dashboard",
		//     totalOrganizationsOwned: totalOwned,
		//   },
		// });

		return {
			workspaceId,
			slug
		};
	}
});

export const createWorkspaceInvite = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		email: v.optional(v.string()),
		invitedUserId: v.optional(v.id('users')),
		role: v.optional(v.union(v.literal('owner'), v.literal('admin'), v.literal('member'))),
		userId: v.optional(v.id('users')) // TODO: Remove once Convex auth context is set up
	},
	handler: async (ctx, args) => {
		// Try explicit userId first (client passes it), fallback to session auth
		const userId = args.userId ?? (await getAuthUserId(ctx, args.sessionId));
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Check if user is an workspace owner (owners can always invite members)
		const userMembership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		const isOwner = userMembership?.role === 'owner';

		// RBAC Permission Check: Only owners or users with "users.invite" permission can invite
		// Admins and Managers can invite users to workspaces
		if (!isOwner) {
			await requirePermission(ctx, userId, 'users.invite', {
				workspaceId: args.workspaceId
			});
		}

		if (!args.email && !args.invitedUserId) {
			throw new Error('Either email or invitedUserId must be provided');
		}

		// Validate email format (requires valid domain with TLD)
		if (args.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/;
			if (!emailRegex.test(args.email.trim())) {
				throw new Error('Invalid email format. Please enter a valid email address.');
			}
		}

		const normalizedEmail = args.email?.trim().toLowerCase();

		if (normalizedEmail) {
			const existingEmailInvite = await ctx.db
				.query('workspaceInvites')
				.withIndex('by_email', (q) => q.eq('email', normalizedEmail))
				.first();

			if (existingEmailInvite && existingEmailInvite.workspaceId === args.workspaceId) {
				throw new Error('An invite for this email already exists');
			}
		}

		if (args.invitedUserId) {
			const existingUserInvite = await ctx.db
				.query('workspaceInvites')
				.withIndex('by_user', (q) => q.eq('invitedUserId', args.invitedUserId))
				.first();

			if (existingUserInvite && existingUserInvite.workspaceId === args.workspaceId) {
				throw new Error('This user already has an invite');
			}

			const alreadyMember = await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('userId', args.invitedUserId!)
				)
				.first();

			if (alreadyMember) {
				throw new Error('User is already a member of this workspace');
			}
		}

		const code = generateInviteCode('ORG');
		const inviteId = await ctx.db.insert('workspaceInvites', {
			workspaceId: args.workspaceId,
			invitedUserId: args.invitedUserId,
			email: normalizedEmail,
			role: args.role ?? 'member',
			invitedBy: userId,
			code,
			createdAt: Date.now()
		});

		// Send email if email was provided (not userId-only invite)
		if (normalizedEmail) {
			// Get workspace name and inviter name for email
			const workspace = await ctx.db.get(args.workspaceId);
			const inviter = await ctx.db.get(userId);
			const inviterName =
				(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
				(inviter as unknown as { email?: string } | undefined)?.email ??
				'Member';

			if (workspace) {
				// Construct invite link
				const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
				const inviteLink = `${baseUrl}/invite?code=${code}`;

				// Schedule email sending (non-blocking)
				await ctx.scheduler.runAfter(0, internal.email.sendOrganizationInviteEmail, {
					email: normalizedEmail,
					inviteLink,
					organizationName: workspace.name,
					inviterName,
					role: args.role ?? 'member'
				});
			}
		}

		return {
			inviteId,
			code
		};
	}
});

export const acceptOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		code: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const invite = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (!invite) {
			throw new Error('Invite not found or already used');
		}

		if (invite.invitedUserId && invite.invitedUserId !== userId) {
			throw new Error('This invite is addressed to a different user');
		}

		const email = invite.email ? invite.email.toLowerCase() : null;
		const userEmail = await getUserEmail(ctx, userId);
		if (email && userEmail && email !== userEmail.toLowerCase()) {
			throw new Error('This invite is addressed to a different email');
		}

		const existingMembership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', invite.workspaceId).eq('userId', userId)
			)
			.first();

		if (!existingMembership) {
			await ctx.db.insert('workspaceMembers', {
				workspaceId: invite.workspaceId,
				userId,
				role: invite.role,
				joinedAt: Date.now()
			});
		}

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const workspace = await getOrganizationSummary(ctx, invite.workspaceId);
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const inviteChannel = invite.email ? "email" : invite.invitedUserId ? "manual" : "link";
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.ORGANIZATION_JOINED,
		//   distinctId,
		//   groups: { workspace: invite.workspaceId },
		//   properties: {
		//     scope: "workspace",
		//     workspaceId: invite.workspaceId,
		//     organizationName: workspace.name,
		//     role: invite.role,
		//     inviteChannel,
		//   },
		// });

		await ctx.db.delete(invite._id);

		return {
			workspaceId: invite.workspaceId
		};
	}
});

/**
 * Internal mutation to accept workspace invite (for server-side use)
 * Used when user registers from invite link - accepts invite automatically after account creation
 */
export const acceptOrganizationInviteInternal = internalMutation({
	args: {
		userId: v.id('users'),
		code: v.string()
	},
	handler: async (ctx, args) => {
		const invite = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (!invite) {
			throw new Error('Invite not found or already used');
		}

		// Check if invite has been revoked
		if (invite.revokedAt) {
			throw new Error('Invite has been revoked');
		}

		// Check if invite has expired
		if (invite.expiresAt && invite.expiresAt < Date.now()) {
			throw new Error('Invite has expired');
		}

		// Check if invite has already been accepted
		if (invite.acceptedAt) {
			throw new Error('Invite has already been accepted');
		}

		if (invite.invitedUserId && invite.invitedUserId !== args.userId) {
			throw new Error('This invite is addressed to a different user');
		}

		const email = invite.email ? invite.email.toLowerCase() : null;
		const userEmail = await getUserEmail(ctx, args.userId);
		if (email && userEmail && email !== userEmail.toLowerCase()) {
			throw new Error('This invite is addressed to a different email');
		}

		const existingMembership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', invite.workspaceId).eq('userId', args.userId)
			)
			.first();

		if (!existingMembership) {
			await ctx.db.insert('workspaceMembers', {
				workspaceId: invite.workspaceId,
				userId: args.userId,
				role: invite.role,
				joinedAt: Date.now()
			});
		}

		// Mark invite as accepted
		await ctx.db.patch(invite._id, {
			acceptedAt: Date.now()
		});

		// Delete the invite (cleanup)
		await ctx.db.delete(invite._id);

		return {
			workspaceId: invite.workspaceId
		};
	}
});

export const declineOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('workspaceInvites')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const invite = await ctx.db.get(args.inviteId);
		if (!invite) {
			return;
		}

		if (invite.invitedUserId && invite.invitedUserId !== userId) {
			throw new Error('Cannot decline invite for another user');
		}

		if (invite.email) {
			const userEmail = await getUserEmail(ctx, userId);
			if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
				throw new Error('Cannot decline invite for another email');
			}
		}

		await ctx.db.delete(args.inviteId);
	}
});

export const recordOrganizationSwitch = mutation({
	args: {
		fromOrganizationId: v.optional(v.id('workspaces')),
		toOrganizationId: v.id('workspaces'),
		availableCircleCount: v.number()
	},
	handler: async () => {
		// Silently skip analytics tracking if session not available - non-critical, shouldn't break UX
		// Note: This mutation doesn't require auth - it's just analytics tracking
		// If we need to track userId, we should add sessionId to args
		// For now, skip tracking since we don't have sessionId available
		return;

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const distinctId = await resolveDistinctId(ctx, userId);
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.ORGANIZATION_SWITCHED,
		//   distinctId,
		//   groups: { workspace: args.toOrganizationId },
		//   properties: {
		//     scope: "workspace",
		//     fromOrganizationId: args.fromOrganizationId ?? undefined,
		//     toOrganizationId: args.toOrganizationId,
		//     availableCircleCount: args.availableCircleCount,
		//   },
		// });
	}
});

/**
 * Remove a member from an workspace
 * Only admins/owners can remove members
 * Cannot remove the last owner
 */
export const removeOrganizationMember = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get acting user's membership
		const actingMembership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', actingUserId)
			)
			.first();

		// 3. Check permission (only admin/owner)
		if (!actingMembership || actingMembership.role === 'member') {
			throw new Error('Only admins/owners can remove members');
		}

		// 4. Find target membership
		const targetMembership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
			)
			.first();

		if (!targetMembership) {
			throw new Error('User is not a member of this workspace');
		}

		// 5. Check if target is owner - if so, verify not last owner
		if (targetMembership.role === 'owner') {
			const ownerCount = await ctx.db
				.query('workspaceMembers')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
				.filter((q) => q.eq(q.field('role'), 'owner'))
				.collect();

			if (ownerCount.length === 1) {
				throw new Error('Cannot remove the last owner');
			}
		}

		// 6. Delete membership
		await ctx.db.delete(targetMembership._id);

		return { success: true };
	}
});

/**
 * Get all members of an workspace
 */
export const getMembers = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw new Error('You are not a member of this workspace');
		}

		// Get all members of the workspace
		const memberships = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		const members = await Promise.all(
			memberships.map(async (membership) => {
				const user = await ctx.db.get(membership.userId);
				if (!user) return null;

				return {
					userId: membership.userId,
					email: (user as unknown as { email?: string } | undefined)?.email ?? '',
					name: (user as unknown as { name?: string } | undefined)?.name ?? '',
					role: membership.role,
					joinedAt: membership.joinedAt
				};
			})
		);

		return members.filter((m): m is NonNullable<typeof m> => m !== null);
	}
});

/**
 * Get all invites sent by an workspace
 * Only admins/owners can view invites
 */
export const getWorkspaceInvites = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Permission check: Only admins/owners can view invites
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw new Error('You are not a member of this workspace');
		}

		const isOwner = membership.role === 'owner';

		// RBAC Permission Check: Only owners or users with "users.invite" permission can view invites
		if (!isOwner) {
			await requirePermission(ctx, userId, 'users.invite', {
				workspaceId: args.workspaceId
			});
		}

		// Get all invites for this workspace
		const invites = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Get all members to check if invitees have joined
		const memberships = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Create sets for quick lookup
		const memberUserIds = new Set(memberships.map((m) => m.userId));
		const memberEmails = new Set<string>();
		for (const membership of memberships) {
			const user = await ctx.db.get(membership.userId);
			const email = (user as unknown as { email?: string } | undefined)?.email;
			if (email) {
				memberEmails.add(email.toLowerCase());
			}
		}

		// Map invites with status
		const invitesWithStatus = await Promise.all(
			invites.map(async (invite) => {
				// Check if user has joined (by userId or email)
				let hasJoined = false;
				if (invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) {
					hasJoined = true;
				} else if (invite.email && memberEmails.has(invite.email.toLowerCase())) {
					hasJoined = true;
				}

				// Get inviter name
				const inviter = await ctx.db.get(invite.invitedBy);
				const inviterName =
					(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
					(inviter as unknown as { email?: string } | undefined)?.email ??
					'Member';

				return {
					inviteId: invite._id,
					email: invite.email ?? '',
					role: invite.role,
					status: hasJoined ? ('accepted' as const) : ('pending' as const),
					invitedAt: invite.createdAt,
					invitedBy: invite.invitedBy,
					invitedByName: inviterName
				};
			})
		);

		return invitesWithStatus;
	}
});

/**
 * Resend invite email for an existing workspace invite
 * Only admins/owners can resend invites
 */
export const resendOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('workspaceInvites')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get invite
		const invite = await ctx.db.get(args.inviteId);
		if (!invite) {
			throw new Error('Invite not found');
		}

		// Permission check: Only admins/owners can resend
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', invite.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw new Error('You are not a member of this workspace');
		}

		const isOwner = membership.role === 'owner';

		// RBAC Permission Check: Only owners or users with "users.invite" permission can resend
		if (!isOwner) {
			await requirePermission(ctx, userId, 'users.invite', {
				workspaceId: invite.workspaceId
			});
		}

		// Only resend if invite has email (not userId-only)
		if (!invite.email) {
			throw new Error('Cannot resend invite without email');
		}

		// Check if invite already accepted
		if (invite.acceptedAt) {
			throw new Error('Invite already accepted');
		}

		// Check if invite has been revoked
		if (invite.revokedAt) {
			throw new Error('Invite has been revoked');
		}

		// Get workspace and inviter info
		const workspace = await ctx.db.get(invite.workspaceId);
		if (!workspace) {
			throw new Error('Organization not found');
		}

		const inviter = await ctx.db.get(invite.invitedBy);
		const inviterName =
			(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
			(inviter as unknown as { email?: string } | undefined)?.email ??
			'Member';

		// Construct invite link
		const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
		const inviteLink = `${baseUrl}/invite?code=${invite.code}`;

		// Schedule email sending (non-blocking)
		await ctx.scheduler.runAfter(0, internal.email.sendOrganizationInviteEmail, {
			email: invite.email,
			inviteLink,
			organizationName: workspace.name,
			inviterName,
			role: invite.role
		});

		return { success: true };
	}
});

/**
 * Internal mutation to add a user to an workspace (for scripts/admin tools)
 * Use with caution - bypasses normal invitation flow
 */
export const addMemberDirect = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		userId: v.id('users'),
		role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member'))
	},
	handler: async (ctx, args) => {
		// Check if workspace exists
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) {
			throw new Error('Organization not found');
		}

		// Check if user exists
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Check if membership already exists
		const existing = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
			)
			.first();

		if (existing) {
			console.log(`User ${args.userId} is already a member of org ${args.workspaceId}`);
			return existing._id;
		}

		// Create membership
		const membershipId = await ctx.db.insert('workspaceMembers', {
			workspaceId: args.workspaceId,
			userId: args.userId,
			role: args.role,
			joinedAt: Date.now()
		});

		console.log(`✅ Added user ${args.userId} to org ${args.workspaceId} with role ${args.role}`);
		return membershipId;
	}
});

/**
 * Update workspace branding (primary/secondary colors, logo)
 * Requires org admin/owner role
 */
export const updateBranding = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		primaryColor: v.string(), // OKLCH format: "oklch(55% 0.2 250)"
		secondaryColor: v.string(), // OKLCH format
		logo: v.optional(v.string()) // Convex Storage ID or URL
	},
	handler: async (ctx, args) => {
		// Auth: Validate session + require org admin
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Check user is org admin/owner
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership || membership.role === 'member') {
			throw new Error('Must be org admin or owner to update branding');
		}

		// Validate color formats (OKLCH only)
		if (!args.primaryColor.startsWith('oklch(')) {
			throw new Error('primaryColor must be OKLCH format (e.g., "oklch(55% 0.2 250)")');
		}

		if (!args.secondaryColor.startsWith('oklch(')) {
			throw new Error('secondaryColor must be OKLCH format (e.g., "oklch(55% 0.2 250)")');
		}

		// Update workspace
		await ctx.db.patch(args.workspaceId, {
			branding: {
				primaryColor: args.primaryColor,
				secondaryColor: args.secondaryColor,
				logo: args.logo,
				updatedAt: Date.now(),
				updatedBy: userId
			}
		});

		return { success: true };
	}
});

/**
 * Get workspace branding (primary/secondary colors, logo)
 * Returns null if no branding configured
 */
export const getBranding = query({
	args: {
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const org = await ctx.db.get(args.workspaceId);

		if (!org) return null;

		return org.branding || null; // Return null if no branding set
	}
});

/**
 * Get branding for all workspaces the user has access to
 * Returns map of orgId -> branding (only orgs with branding set)
 * Used to generate CSS for all orgs at once (prevents CSS loss on workspace switch)
 */
export const getAllOrgBranding = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get all orgs user is member of
		const memberships = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Get branding for each org (only if branding exists)
		const brandingMap: Record<
			string,
			{ primaryColor: string; secondaryColor: string; logo?: string }
		> = {};

		await Promise.all(
			memberships.map(async (membership) => {
				const org = await ctx.db.get(membership.workspaceId);
				if (org?.branding) {
					brandingMap[membership.workspaceId] = {
						primaryColor: org.branding.primaryColor,
						secondaryColor: org.branding.secondaryColor,
						logo: org.branding.logo
					};
				}
			})
		);

		return brandingMap;
	}
});

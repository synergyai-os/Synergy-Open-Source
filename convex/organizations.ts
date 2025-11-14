import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import { requirePermission } from './rbac/permissions';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
// TODO: Re-enable server-side analytics via HTTP action bridge
// import { captureAnalyticsEvent } from "./posthog";
// import { AnalyticsEventName } from "../src/lib/analytics/events";

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
// 	organizationId: Id<'organizations'>
// ) {
// 	const organization = await ctx.db.get(organizationId);
// 	if (!organization) {
// 		throw new Error('Organization not found');
// 	}
// 	return organization;
// }

// TODO: Re-enable when needed
// async function countOwnedOrganizations(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
// 	const memberships = await ctx.db
// 		.query('organizationMembers')
// 		.withIndex('by_user', (q) => q.eq('userId', userId))
// 		.collect();
// 	return memberships.filter((membership) => membership.role === 'owner').length;
// }

function generateInviteCode(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	const randomTrailing = Math.random().toString(10).slice(2, 6);
	return `${prefix}-${random}-${randomTrailing}`;
}

async function ensureUniqueOrganizationSlug(ctx: MutationCtx, baseSlug: string): Promise<string> {
	let slug = baseSlug;
	let suffix = 1;

	while (true) {
		const existing = await ctx.db
			.query('organizations')
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
 * List all organizations the user is a member of
 * Uses sessionId-based authentication to prevent impersonation attacks
 */
export const listOrganizations = query({
	args: {
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const memberships = await ctx.db
			.query('organizationMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		const organizations = await Promise.all(
			memberships.map(async (membership) => {
				const organization = await ctx.db.get(membership.organizationId);
				if (!organization) {
					return null;
				}

				const memberCount = await ctx.db
					.query('organizationMembers')
					.withIndex('by_organization', (q) => q.eq('organizationId', membership.organizationId))
					.collect();

				const teamCount = await ctx.db
					.query('teams')
					.withIndex('by_organization', (q) => q.eq('organizationId', membership.organizationId))
					.collect();

				return {
					organizationId: membership.organizationId,
					name: organization.name,
					initials: initialsFromName(organization.name),
					slug: organization.slug,
					plan: organization.plan,
					createdAt: organization.createdAt,
					updatedAt: organization.updatedAt,
					role: membership.role,
					joinedAt: membership.joinedAt,
					memberCount: memberCount.length,
					teamCount: teamCount.length
				};
			})
		);

		return organizations.filter((item): item is NonNullable<typeof item> => item !== null);
	}
});

export const listOrganizationInvites = query({
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
			.query('organizationInvites')
			.withIndex('by_user', (q) => q.eq('invitedUserId', userId))
			.collect();

		const invitesByEmail = email
			? await ctx.db
					.query('organizationInvites')
					.withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
					.collect()
			: [];

		const inviteMap = new Map<string, Doc<'organizationInvites'>>();
		for (const invite of invitesByUser) {
			inviteMap.set(invite._id, invite);
		}
		for (const invite of invitesByEmail) {
			inviteMap.set(invite._id, invite);
		}

		const invites = await Promise.all(
			Array.from(inviteMap.values()).map(async (invite) => {
				const organization = await ctx.db.get(invite.organizationId);
				if (!organization) return null;

				const inviter = await ctx.db.get(invite.invitedBy);
				const inviterName =
					(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
					(inviter as unknown as { email?: string } | undefined)?.email ??
					'Member';

				return {
					inviteId: invite._id,
					organizationId: invite.organizationId,
					organizationName: organization.name,
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
 * Create a new organization
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const createOrganization = mutation({
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
		const slug = await ensureUniqueOrganizationSlug(ctx, slugBase);
		const now = Date.now();

		const organizationId = await ctx.db.insert('organizations', {
			name: trimmedName,
			slug,
			createdAt: now,
			updatedAt: now,
			plan: 'starter'
		});

		await ctx.db.insert('organizationMembers', {
			organizationId,
			userId,
			role: 'owner',
			joinedAt: now
		});

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const totalOwned = await countOwnedOrganizations(ctx, userId);
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.ORGANIZATION_CREATED,
		//   distinctId,
		//   groups: { organization: organizationId },
		//   properties: {
		//     scope: "organization",
		//     organizationId,
		//     organizationName: trimmedName,
		//     plan: "starter",
		//     createdVia: "dashboard",
		//     totalOrganizationsOwned: totalOwned,
		//   },
		// });

		return {
			organizationId,
			slug
		};
	}
});

export const createOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
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

		// RBAC Permission Check: Only users with "users.invite" permission can invite
		// Admins and Managers can invite users to organizations
		await requirePermission(ctx, userId, 'users.invite', {
			organizationId: args.organizationId
		});

		if (!args.email && !args.invitedUserId) {
			throw new Error('Either email or invitedUserId must be provided');
		}

		const normalizedEmail = args.email?.trim().toLowerCase();

		if (normalizedEmail) {
			const existingEmailInvite = await ctx.db
				.query('organizationInvites')
				.withIndex('by_email', (q) => q.eq('email', normalizedEmail))
				.first();

			if (existingEmailInvite && existingEmailInvite.organizationId === args.organizationId) {
				throw new Error('An invite for this email already exists');
			}
		}

		if (args.invitedUserId) {
			const existingUserInvite = await ctx.db
				.query('organizationInvites')
				.withIndex('by_user', (q) => q.eq('invitedUserId', args.invitedUserId))
				.first();

			if (existingUserInvite && existingUserInvite.organizationId === args.organizationId) {
				throw new Error('This user already has an invite');
			}

			const alreadyMember = await ctx.db
				.query('organizationMembers')
				.withIndex('by_organization_user', (q) =>
					q.eq('organizationId', args.organizationId).eq('userId', args.invitedUserId!)
				)
				.first();

			if (alreadyMember) {
				throw new Error('User is already a member of this organization');
			}
		}

		const code = generateInviteCode('ORG');
		const inviteId = await ctx.db.insert('organizationInvites', {
			organizationId: args.organizationId,
			invitedUserId: args.invitedUserId,
			email: normalizedEmail,
			role: args.role ?? 'member',
			invitedBy: userId,
			code,
			createdAt: Date.now()
		});

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
			.query('organizationInvites')
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
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', invite.organizationId).eq('userId', userId)
			)
			.first();

		if (!existingMembership) {
			await ctx.db.insert('organizationMembers', {
				organizationId: invite.organizationId,
				userId,
				role: invite.role,
				joinedAt: Date.now()
			});
		}

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const organization = await getOrganizationSummary(ctx, invite.organizationId);
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const inviteChannel = invite.email ? "email" : invite.invitedUserId ? "manual" : "link";
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.ORGANIZATION_JOINED,
		//   distinctId,
		//   groups: { organization: invite.organizationId },
		//   properties: {
		//     scope: "organization",
		//     organizationId: invite.organizationId,
		//     organizationName: organization.name,
		//     role: invite.role,
		//     inviteChannel,
		//   },
		// });

		await ctx.db.delete(invite._id);

		return {
			organizationId: invite.organizationId
		};
	}
});

export const declineOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('organizationInvites')
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
		fromOrganizationId: v.optional(v.id('organizations')),
		toOrganizationId: v.id('organizations'),
		availableTeamCount: v.number()
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
		//   groups: { organization: args.toOrganizationId },
		//   properties: {
		//     scope: "organization",
		//     fromOrganizationId: args.fromOrganizationId ?? undefined,
		//     toOrganizationId: args.toOrganizationId,
		//     availableTeamCount: args.availableTeamCount,
		//   },
		// });
	}
});

/**
 * Remove a member from an organization
 * Requires "users.remove" permission
 * Only Admins can remove users from organizations
 */
export const removeOrganizationMember = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// RBAC Permission Check: Only users with "users.remove" permission can remove members
		// Only Admins can remove users from organizations
		await requirePermission(ctx, userId, 'users.remove', {
			organizationId: args.organizationId
		});

		if (args.targetUserId === userId) {
			throw new Error('Cannot remove yourself from organization');
		}

		const targetMembership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', args.organizationId).eq('userId', args.targetUserId)
			)
			.first();

		if (!targetMembership) {
			throw new Error('User is not a member of this organization');
		}

		if (targetMembership.role === 'owner') {
			throw new Error('Cannot remove organization owner');
		}

		await ctx.db.delete(targetMembership._id);

		// Also remove from all teams in this organization
		const teamMemberships = await ctx.db
			.query('teamMembers')
			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId))
			.collect();

		for (const teamMembership of teamMemberships) {
			const team = await ctx.db.get(teamMembership.teamId);
			if (team && team.organizationId === args.organizationId) {
				await ctx.db.delete(teamMembership._id);
			}
		}

		return { success: true };
	}
});

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import { requirePermission } from './rbac/permissions';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { internal } from './_generated/api';
// TODO: Re-enable server-side analytics via HTTP action bridge
// import { captureAnalyticsEvent } from "./posthog";
// import { AnalyticsEventName, type AnalyticsEventPayloads } from "../src/lib/analytics/events";

// TODO: Re-enable when needed
// type TeamRole = 'admin' | 'member';

function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'team'
	);
}

function generateInviteCode(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	const randomTrailing = Math.random().toString(10).slice(2, 6);
	return `${prefix}-${random}-${randomTrailing}`;
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

// TODO: Re-enable when server-side analytics is restored
// async function getTeamSummary(ctx: QueryCtx | MutationCtx, teamId: Id<'teams'>) {
// 	const team = await ctx.db.get(teamId);
// 	if (!team) {
// 		throw new Error('Team not found');
// 	}
// 	return team;
// }

async function ensureUniqueTeamSlug(
	ctx: MutationCtx,
	organizationId: Id<'organizations'>,
	baseSlug: string
): Promise<string> {
	const existingTeams = await ctx.db
		.query('teams')
		.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
		.collect();

	const existingSlugs = new Set(existingTeams.map((team) => team.slug));
	let slug = baseSlug;
	let suffix = 1;

	while (existingSlugs.has(slug)) {
		slug = `${baseSlug}-${suffix++}`;
	}

	return slug;
}

async function getUserEmail(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
	const user = await ctx.db.get(userId);
	const emailField = (user as unknown as { email?: string } | undefined)?.email;
	return typeof emailField === 'string' ? emailField : null;
}

async function ensureOrganizationMembership(
	ctx: MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>,
	role: 'member' | 'admin' | 'owner' = 'member'
) {
	const existing = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!existing) {
		await ctx.db.insert('organizationMembers', {
			organizationId,
			userId,
			role,
			joinedAt: Date.now()
		});
	}
}

/**
 * List teams for an organization
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const listTeams = query({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		organizationId: v.optional(v.id('organizations'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// If no organizationId provided, return empty array (personal workspace mode)
		if (!args.organizationId) {
			return [];
		}

		// After the check above, organizationId is guaranteed to be defined
		const organizationId = args.organizationId;

		const membership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', organizationId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw new Error('You do not have access to this organization');
		}

		const teams = await ctx.db
			.query('teams')
			.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
			.collect();

		const userTeamMemberships = await ctx.db
			.query('teamMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		const membershipMap = new Map<Id<'teams'>, Doc<'teamMembers'>>();
		for (const entry of userTeamMemberships) {
			membershipMap.set(entry.teamId, entry);
		}

		const results = await Promise.all(
			teams.map(async (team) => {
				const members = await ctx.db
					.query('teamMembers')
					.withIndex('by_team', (q) => q.eq('teamId', team._id))
					.collect();

				const userMembership = membershipMap.get(team._id) ?? null;

				return {
					teamId: team._id,
					organizationId: team.organizationId,
					name: team.name,
					slug: team.slug,
					createdAt: team.createdAt,
					memberCount: members.length,
					role: userMembership?.role ?? null,
					joinedAt: userMembership?.joinedAt ?? null
				};
			})
		);

		return results;
	}
});

export const listTeamInvites = query({
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
			.query('teamInvites')
			.withIndex('by_user', (q) => q.eq('invitedUserId', userId))
			.collect();

		const invitesByEmail = email
			? await ctx.db
					.query('teamInvites')
					.withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
					.collect()
			: [];

		const inviteMap = new Map<string, Doc<'teamInvites'>>();
		for (const invite of invitesByUser) {
			inviteMap.set(invite._id, invite);
		}
		for (const invite of invitesByEmail) {
			inviteMap.set(invite._id, invite);
		}

		const invites = await Promise.all(
			Array.from(inviteMap.values()).map(async (invite) => {
				const team = await ctx.db.get(invite.teamId);
				const organization = await ctx.db.get(invite.organizationId);
				if (!team || !organization) return null;

				const inviter = await ctx.db.get(invite.invitedBy);
				const inviterName =
					(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
					(inviter as unknown as { email?: string } | undefined)?.email ??
					'Member';

				return {
					inviteId: invite._id,
					teamId: invite.teamId,
					teamName: team.name,
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

export const createTeam = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		name: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Verify user has access to this organization (same pattern as circles.create)
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new Error('Team name is required');
		}

		const slugBase = slugifyName(trimmedName);
		const slug = await ensureUniqueTeamSlug(ctx, args.organizationId, slugBase);
		const now = Date.now();

		const teamId = await ctx.db.insert('teams', {
			organizationId: args.organizationId,
			name: trimmedName,
			slug,
			createdAt: now,
			updatedAt: now
		});

		await ctx.db.insert('teamMembers', {
			teamId,
			userId,
			role: 'admin',
			joinedAt: now
		});

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const organization = await getOrganizationSummary(ctx, args.organizationId);
		// const distinctId = await resolveDistinctId(ctx, userId);
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.TEAM_CREATED,
		//   distinctId,
		//   groups: { organization: args.organizationId, team: teamId },
		//   properties: {
		//     scope: "team",
		//     organizationId: args.organizationId,
		//     organizationName: organization.name,
		//     teamId,
		//     teamName: trimmedName,
		//     createdVia: "dashboard",
		//   },
		// });

		return { teamId, slug };
	}
});

export const createTeamInvite = mutation({
	args: {
		sessionId: v.string(),
		teamId: v.id('teams'),
		email: v.optional(v.string()),
		invitedUserId: v.optional(v.id('users')),
		role: v.optional(v.union(v.literal('admin'), v.literal('member')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const team = await ctx.db.get(args.teamId);
		if (!team) {
			throw new Error('Team not found');
		}

		// Check if user is a team admin (team admins can always invite members)
		const membership = await ctx.db
			.query('teamMembers')
			.withIndex('by_team_user', (q) => q.eq('teamId', args.teamId).eq('userId', userId))
			.first();

		const isTeamAdmin = membership?.role === 'admin';

		// RBAC Permission Check: Team admins can invite, otherwise check "teams.add-members" permission
		// Team Leads can only invite to their own teams (via RBAC role with teamId scope)
		// Admins/Managers can invite to any team (scope: "all")
		if (!isTeamAdmin) {
			await requirePermission(ctx, userId, 'teams.add-members', {
				organizationId: team.organizationId,
				teamId: args.teamId,
				resourceType: 'team',
				resourceId: args.teamId
				// Note: resourceOwnerId not used - RBAC handles scoping via teamId in userRoles table
			});
		}

		if (!args.email && !args.invitedUserId) {
			throw new Error('Either email or invitedUserId must be provided');
		}

		const normalizedEmail = args.email?.trim().toLowerCase();

		if (normalizedEmail) {
			const existingEmailInvite = await ctx.db
				.query('teamInvites')
				.withIndex('by_email', (q) => q.eq('email', normalizedEmail))
				.first();

			if (existingEmailInvite && existingEmailInvite.teamId === args.teamId) {
				throw new Error('An invite for this email already exists');
			}
		}

		if (args.invitedUserId) {
			const existingUserInvite = await ctx.db
				.query('teamInvites')
				.withIndex('by_user', (q) => q.eq('invitedUserId', args.invitedUserId))
				.first();

			if (existingUserInvite && existingUserInvite.teamId === args.teamId) {
				throw new Error('This user already has a team invite');
			}

			const alreadyMember = await ctx.db
				.query('teamMembers')
				.withIndex('by_team_user', (q) =>
					q.eq('teamId', args.teamId).eq('userId', args.invitedUserId!)
				)
				.first();

			if (alreadyMember) {
				throw new Error('User is already a member of this team');
			}
		}

		const code = generateInviteCode('TEAM');
		const inviteId = await ctx.db.insert('teamInvites', {
			teamId: args.teamId,
			organizationId: team.organizationId,
			invitedUserId: args.invitedUserId,
			email: normalizedEmail,
			role: args.role ?? 'member',
			invitedBy: userId,
			code,
			createdAt: Date.now()
		});

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const organization = await getOrganizationSummary(ctx, team.organizationId);
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const inviteChannel = normalizedEmail ? 'email' : args.invitedUserId ? 'manual' : 'link';
		const properties: {
			scope: string;
			organizationId: string;
			organizationName: string;
			teamId: string;
			teamName: string;
			inviteChannel: string;
			role: string;
			inviteTarget?: string;
		} = {
			scope: 'team',
			organizationId: team.organizationId,
			organizationName: '', // TODO: Get organization name when analytics is re-enabled
			teamId: args.teamId,
			teamName: team.name,
			inviteChannel: normalizedEmail ? 'email' : args.invitedUserId ? 'manual' : 'link',
			role: args.role ?? 'member'
		};

		if (normalizedEmail) {
			properties.inviteTarget = normalizedEmail;
		}

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.TEAM_INVITE_SENT,
		//   distinctId,
		//   groups: { organization: team.organizationId, team: args.teamId },
		//   properties,
		// });

		// Send email if email was provided (not userId-only invite)
		if (normalizedEmail) {
			// Get organization name, team name, and inviter name for email
			const organization = await ctx.db.get(team.organizationId);
			const inviter = await ctx.db.get(userId);
			const inviterName =
				(inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
				(inviter as unknown as { email?: string } | undefined)?.email ??
				'Member';

			if (organization) {
				// Construct invite link
				const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
				const inviteLink = `${baseUrl}/invite?code=${code}`;

				// Schedule email sending (non-blocking)
				await ctx.scheduler.runAfter(0, internal.email.sendTeamInviteEmail, {
					email: normalizedEmail,
					inviteLink,
					teamName: team.name,
					organizationName: organization.name,
					inviterName,
					role: args.role ?? 'member'
				});
			}
		}

		return { inviteId, code };
	}
});

export const acceptTeamInvite = mutation({
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
			.query('teamInvites')
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

		await ensureOrganizationMembership(ctx, invite.organizationId, userId, 'member');

		const existingMembership = await ctx.db
			.query('teamMembers')
			.withIndex('by_team_user', (q) => q.eq('teamId', invite.teamId).eq('userId', userId))
			.first();

		if (!existingMembership) {
			await ctx.db.insert('teamMembers', {
				teamId: invite.teamId,
				userId,
				role: invite.role,
				joinedAt: Date.now()
			});
		}

		// TODO: Re-enable server-side analytics via HTTP action bridge
		// const team = await getTeamSummary(ctx, invite.teamId);
		// const organization = await getOrganizationSummary(ctx, invite.organizationId);
		// const distinctId = await resolveDistinctId(ctx, userId);
		// const inviteChannel = invite.email ? "email" : invite.invitedUserId ? "manual" : "link";
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.TEAM_JOINED,
		//   distinctId,
		//   groups: { organization: invite.organizationId, team: invite.teamId },
		//   properties: {
		//     scope: "team",
		//     organizationId: invite.organizationId,
		//     organizationName: organization.name,
		//     teamId: invite.teamId,
		//     teamName: team.name,
		//     role: invite.role,
		//   },
		// });
		//
		// await captureAnalyticsEvent({
		//   name: AnalyticsEventName.TEAM_INVITE_ACCEPTED,
		//   distinctId,
		//   groups: { organization: invite.organizationId, team: invite.teamId },
		//   properties: {
		//     scope: "team",
		//     organizationId: invite.organizationId,
		//     organizationName: organization.name,
		//     teamId: invite.teamId,
		//     teamName: team.name,
		//     role: invite.role,
		//     inviteChannel,
		//   },
		// });

		await ctx.db.delete(invite._id);

		return {
			teamId: invite.teamId,
			organizationId: invite.organizationId
		};
	}
});

export const declineTeamInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('teamInvites')
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

/**
 * Update team settings
 * Requires "teams.update" permission
 * Team Leads can only update their own teams
 */
export const updateTeam = mutation({
	args: {
		sessionId: v.string(),
		teamId: v.id('teams'),
		name: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const team = await ctx.db.get(args.teamId);
		if (!team) {
			throw new Error('Team not found');
		}

		// TODO: Check membership if needed for validation
		// const membership = await ctx.db
		// 	.query('teamMembers')
		// 	.withIndex('by_team_user', (q) => q.eq('teamId', args.teamId).eq('userId', userId))
		// 	.first();

		// RBAC Permission Check: Check "teams.update" permission
		// Team Leads can only update their own teams (via RBAC role with teamId scope)
		// Admins/Managers can update any team (scope: "all")
		await requirePermission(ctx, userId, 'teams.update', {
			organizationId: team.organizationId,
			teamId: args.teamId,
			resourceType: 'team',
			resourceId: args.teamId
			// Note: resourceOwnerId not used - RBAC handles scoping via teamId in userRoles table
		});

		const updates: Partial<Doc<'teams'>> = {
			updatedAt: Date.now()
		};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new Error('Team name cannot be empty');
			}
			updates.name = trimmedName;

			const slugBase = slugifyName(trimmedName);
			updates.slug = await ensureUniqueTeamSlug(ctx, team.organizationId, slugBase);
		}

		await ctx.db.patch(args.teamId, updates);

		return { success: true };
	}
});

/**
 * Delete team
 * Requires "teams.delete" permission
 * Only Admins/Managers can delete teams (Team Leads cannot)
 */
export const deleteTeam = mutation({
	args: {
		sessionId: v.string(),
		teamId: v.id('teams')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const team = await ctx.db.get(args.teamId);
		if (!team) {
			throw new Error('Team not found');
		}

		// RBAC Permission Check: Check "teams.delete" permission
		// Team Leads CANNOT delete teams (even their own)
		// Only Admins/Managers can delete teams
		await requirePermission(ctx, userId, 'teams.delete', {
			organizationId: team.organizationId,
			teamId: args.teamId,
			resourceType: 'team',
			resourceId: args.teamId,
			resourceOwnerId: undefined // Explicitly don't allow "own" scope for delete
		});

		// Delete all team members
		const members = await ctx.db
			.query('teamMembers')
			.withIndex('by_team', (q) => q.eq('teamId', args.teamId))
			.collect();

		for (const member of members) {
			await ctx.db.delete(member._id);
		}

		// Delete all team invites
		const invites = await ctx.db
			.query('teamInvites')
			.withIndex('by_team', (q) => q.eq('teamId', args.teamId))
			.collect();

		for (const invite of invites) {
			await ctx.db.delete(invite._id);
		}

		// Delete the team
		await ctx.db.delete(args.teamId);

		return { success: true };
	}
});

/**
 * Remove team member
 * Requires "teams.remove-members" permission
 * Team Leads can only remove members from their own teams
 */
export const removeTeamMember = mutation({
	args: {
		sessionId: v.string(),
		teamId: v.id('teams'),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const team = await ctx.db.get(args.teamId);
		if (!team) {
			throw new Error('Team not found');
		}

		const actingUserMembership = await ctx.db
			.query('teamMembers')
			.withIndex('by_team_user', (q) => q.eq('teamId', args.teamId).eq('userId', userId))
			.first();

		// RBAC Permission Check: Check "teams.remove-members" permission
		// Team Leads can only remove members from their own teams
		// Admins/Managers can remove members from any team
		await requirePermission(ctx, userId, 'teams.remove-members', {
			organizationId: team.organizationId,
			teamId: args.teamId,
			resourceType: 'team',
			resourceId: args.teamId,
			resourceOwnerId: actingUserMembership?.role === 'admin' ? userId : undefined
		});

		const targetMembership = await ctx.db
			.query('teamMembers')
			.withIndex('by_team_user', (q) => q.eq('teamId', args.teamId).eq('userId', args.targetUserId))
			.first();

		if (!targetMembership) {
			throw new Error('User is not a member of this team');
		}

		if (args.targetUserId === userId) {
			throw new Error('Cannot remove yourself from team. Use leaveTeam instead.');
		}

		await ctx.db.delete(targetMembership._id);

		return { success: true };
	}
});

/**
 * Get a single team by slug
 * Returns team details with members list
 */
export const getTeamBySlug = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		slug: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this organization
		const membership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', args.organizationId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw new Error('You do not have access to this organization');
		}

		// Query teams by organizationId and filter by slug
		const teams = await ctx.db
			.query('teams')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.collect();

		const team = teams.find((t) => t.slug === args.slug);
		if (!team) {
			throw new Error('Team not found');
		}

		// Get team members
		const teamMemberships = await ctx.db
			.query('teamMembers')
			.withIndex('by_team', (q) => q.eq('teamId', team._id))
			.collect();

		const members = await Promise.all(
			teamMemberships.map(async (membership) => {
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

		return {
			teamId: team._id,
			organizationId: team.organizationId,
			name: team.name,
			slug: team.slug,
			createdAt: team.createdAt,
			updatedAt: team.updatedAt,
			members: members.filter((member): member is NonNullable<typeof member> => member !== null)
		};
	}
});

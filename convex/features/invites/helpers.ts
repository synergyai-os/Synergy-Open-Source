import { internal } from '../../_generated/api';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getPublicAppUrl } from '../../infrastructure/urls';
import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../../core/people/queries';
import { getPersonEmail } from '../../core/people/rules';
import { requireCanInviteMembers } from '../../core/workspaces/access';
import {
	ensureInviteCode,
	ensureInviteEmailFormat,
	ensureInviteEmailMatchesUser,
	ensureNoExistingEmailInvite,
	ensureNoExistingUserInvite,
	ensureUserNotAlreadyMember
} from './rules';

// User field helpers (duplicated to avoid circular imports)
function findUserNameField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const nameField = (user as Record<string, unknown>).name;
	return typeof nameField === 'string' ? nameField : null;
}

function findUserEmailField(user: Doc<'users'> | null): string | null {
	if (!user) return null;
	const emailField = (user as Record<string, unknown>).email;
	return typeof emailField === 'string' ? emailField : null;
}

function describeUserDisplayName(user: Doc<'users'> | null): string {
	return findUserNameField(user) ?? findUserEmailField(user) ?? 'Member';
}

/**
 * Find an active (non-expired, non-revoked, non-accepted) invite by code
 */
export async function findActiveInviteByCode(ctx: QueryCtx | MutationCtx, code: string) {
	const invite = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_code', (q) => q.eq('code', code))
		.first();

	if (!invite) return null;
	if (invite.revokedAt) return null;
	if (invite.expiresAt && invite.expiresAt < Date.now()) return null;
	if (invite.acceptedAt) return null;
	return invite;
}

/**
 * Create a new workspace invite record
 */
export async function createWorkspaceInviteRecord(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		email?: string;
		invitedUserId?: Id<'users'>;
		role?: 'owner' | 'admin' | 'member';
		personId: Id<'people'>;
	}
): Promise<{ inviteId: Id<'workspaceInvites'>; code: string }> {
	const normalizedEmail = args.email?.trim();

	if (!normalizedEmail && !args.invitedUserId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'Either email or invitedUserId must be provided'
		);
	}

	ensureInviteEmailFormat(normalizedEmail);

	const emailToUse = normalizedEmail ? normalizedEmail.toLowerCase() : undefined;
	await ensureNoExistingEmailInvite(ctx, args.workspaceId, emailToUse);
	await ensureNoExistingUserInvite(ctx, args.workspaceId, args.invitedUserId);
	await ensureUserNotAlreadyMember(ctx, args.workspaceId, args.invitedUserId);

	const code = ensureInviteCode('ORG');
	const inviteId = await ctx.db.insert('workspaceInvites', {
		workspaceId: args.workspaceId,
		invitedUserId: args.invitedUserId,
		email: emailToUse,
		role: args.role ?? 'member',
		invitedByPersonId: args.personId,
		code,
		createdAt: Date.now()
	});

	if (emailToUse) {
		await sendInviteEmail(ctx, {
			inviteId,
			workspaceId: args.workspaceId,
			invitedByPersonId: args.personId,
			email: emailToUse,
			role: args.role ?? 'member',
			code
		});
	}
	return { inviteId, code };
}

/**
 * Send invite email via scheduled job
 */
async function sendInviteEmail(
	ctx: MutationCtx,
	args: {
		inviteId: Id<'workspaceInvites'>;
		workspaceId: Id<'workspaces'>;
		invitedByPersonId: Id<'people'>;
		email: string;
		role: 'owner' | 'admin' | 'member';
		code: string;
	}
) {
	const workspace = await ctx.db.get(args.workspaceId);
	const inviterPerson = await ctx.db.get(args.invitedByPersonId);
	if (!workspace || !inviterPerson) return;

	const inviter = inviterPerson.userId ? await ctx.db.get(inviterPerson.userId) : null;
	const inviterName = describeUserDisplayName(inviter);
	const inviteLink = `${getPublicAppUrl()}/invite?code=${args.code}`;

	await ctx.scheduler.runAfter(0, internal.infrastructure.email.sendOrganizationInviteEmail, {
		email: args.email,
		inviteLink,
		organizationName: workspace.name,
		inviterName,
		role: args.role
	});
}

/**
 * Accept a workspace invite
 */
export async function acceptWorkspaceInvite(
	ctx: MutationCtx,
	code: string,
	userId: Id<'users'>,
	options: { markAccepted: boolean }
): Promise<{ workspaceId: Id<'workspaces'> }> {
	const invite = await findActiveInviteByCode(ctx, code);
	if (!invite) {
		throw createError(ErrorCodes.INVITE_NOT_FOUND, 'Invite not found or already used');
	}

	if (invite.invitedUserId && invite.invitedUserId !== userId) {
		throw createError(
			ErrorCodes.INVITE_USER_MISMATCH,
			'This invite is addressed to a different user'
		);
	}

	await ensureInviteEmailMatchesUser(ctx, invite, userId);

	const now = Date.now();

	// Create people record (organizational identity)
	const existingPerson = await findPersonByUserAndWorkspace(ctx, userId, invite.workspaceId);
	if (!existingPerson || existingPerson.status !== 'active') {
		const user = await ctx.db.get(userId);
		if (!user) {
			throw createError(ErrorCodes.PERSON_NOT_FOUND, 'User not found');
		}
		const userName = findUserNameField(user);
		const userEmail = findUserEmailField(user);
		const displayName = userName || userEmail?.split('@')[0] || 'Unknown';

		// invitedByPersonId is already a personId, use it directly
		await ctx.db.insert('people', {
			workspaceId: invite.workspaceId,
			userId,
			displayName,
			email: null, // Email comes from user lookup, not stored per people/README.md
			workspaceRole: invite.role,
			status: 'active',
			invitedAt: invite.createdAt,
			invitedBy: invite.invitedByPersonId,
			joinedAt: now,
			archivedAt: undefined,
			archivedBy: undefined
		});
	}

	if (options.markAccepted) {
		await ctx.db.patch(invite._id, {
			acceptedAt: Date.now()
		});
	}

	await ctx.db.delete(invite._id);

	return {
		workspaceId: invite.workspaceId
	};
}

/**
 * Decline a workspace invite
 */
export async function declineWorkspaceInvite(
	ctx: MutationCtx,
	inviteId: Id<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const invite = await ctx.db.get(inviteId);
	if (!invite) return;

	if (invite.invitedUserId && invite.invitedUserId !== userId) {
		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Cannot decline invite for another user');
	}

	if (invite.email) {
		const user = await ctx.db.get(userId);
		const userEmail = user ? findUserEmailField(user) : null;
		if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
			throw createError(
				ErrorCodes.INVITE_EMAIL_MISMATCH,
				'Cannot decline invite for another email'
			);
		}
	}
	await ctx.db.delete(inviteId);
}

/**
 * Resend invite email
 */
export async function resendInviteEmail(
	ctx: MutationCtx,
	inviteId: Id<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const invite = await ctx.db.get(inviteId);
	if (!invite) {
		throw createError(ErrorCodes.INVITE_NOT_FOUND, 'Invite not found');
	}

	await requireCanInviteMembers(ctx, invite.workspaceId, userId);

	if (!invite.email) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Cannot resend invite without email');
	}

	if (invite.acceptedAt) {
		throw createError(ErrorCodes.INVITE_ALREADY_ACCEPTED, 'Invite already accepted');
	}

	if (invite.revokedAt) {
		throw createError(ErrorCodes.INVITE_REVOKED, 'Invite has been revoked');
	}

	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const inviterPerson = await ctx.db.get(invite.invitedByPersonId);
	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null;
	const inviterName = describeUserDisplayName(inviter);
	const inviteLink = `${getPublicAppUrl()}/invite?code=${invite.code}`;

	await ctx.scheduler.runAfter(0, internal.infrastructure.email.sendOrganizationInviteEmail, {
		email: invite.email,
		inviteLink,
		organizationName: workspace.name,
		inviterName,
		role: invite.role
	});
	return { success: true };
}

// --- Query Helpers ---

export type WorkspaceInviteDetails = {
	inviteId: Id<'workspaceInvites'>;
	workspaceId: Id<'workspaces'>;
	organizationName: string;
	role: string;
	invitedByPersonId: Id<'people'>;
	invitedByName: string;
	code: string;
	createdAt: number;
};

/**
 * List invites for a user (by userId or email)
 */
export async function listInvitesForUser(ctx: QueryCtx, userId: Id<'users'>) {
	const user = await ctx.db.get(userId);
	const email = user ? findUserEmailField(user) : null;

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

	return Promise.all(Array.from(inviteMap.values()).map((invite) => getInviteDetails(ctx, invite)));
}

/**
 * Get full invite details
 */
export async function getInviteDetails(ctx: QueryCtx, invite: Doc<'workspaceInvites'>) {
	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const inviterPerson = await ctx.db.get(invite.invitedByPersonId);
	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null;
	const inviterName = describeUserDisplayName(inviter);

	return {
		inviteId: invite._id,
		workspaceId: invite.workspaceId,
		organizationName: workspace.name,
		role: invite.role,
		invitedByPersonId: invite.invitedByPersonId,
		invitedByName: inviterName,
		code: invite.code,
		createdAt: invite.createdAt
	};
}

/**
 * Get invite preview (for invite acceptance page)
 */
export async function getInvitePreview(ctx: QueryCtx, invite: Doc<'workspaceInvites'>) {
	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		return null;
	}

	const inviterPerson = await ctx.db.get(invite.invitedByPersonId);
	const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null;
	const inviterName = describeUserDisplayName(inviter);

	return {
		type: 'workspace' as const,
		workspaceId: invite.workspaceId,
		organizationName: workspace.name,
		inviterName,
		role: invite.role,
		email: invite.email ?? undefined,
		invitedUserId: invite.invitedUserId ?? undefined
	};
}

/**
 * List all invites for a workspace (admin view)
 */
export async function listWorkspaceInvitesForOrg(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
	const invites = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const activePeople = await listPeopleInWorkspace(ctx, workspaceId, { status: 'active' });

	const memberUserIds = new Set(
		activePeople.filter((p) => p.userId).map((p) => p.userId as Id<'users'>)
	);
	const memberEmails = await listPeopleEmails(ctx, activePeople);

	return Promise.all(
		invites.map(async (invite) => {
			const hasJoined =
				(invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) ||
				(invite.email && memberEmails.has(invite.email.toLowerCase()));

			const inviterPerson = await ctx.db.get(invite.invitedByPersonId);
			const inviter = inviterPerson?.userId ? await ctx.db.get(inviterPerson.userId) : null;

			return {
				inviteId: invite._id,
				email: invite.email ?? '',
				role: invite.role,
				status: hasJoined ? ('accepted' as const) : ('pending' as const),
				invitedAt: invite.createdAt,
				invitedByPersonId: invite.invitedByPersonId,
				invitedByName: describeUserDisplayName(inviter)
			};
		})
	);
}

async function listPeopleEmails(ctx: QueryCtx, people: Doc<'people'>[]) {
	const emails = new Set<string>();
	for (const person of people) {
		const email = await getPersonEmail(ctx, person);
		if (email) {
			emails.add(email.toLowerCase());
		}
	}
	return emails;
}

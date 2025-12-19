/**
 * Integration Test Setup and Helpers
 *
 * Provides test fixtures and utilities for Convex integration tests
 */

import type { TestConvex } from 'convex-test';
import type { Id } from '$convex/_generated/dataModel';

// Provide a deterministic public URL for tests that rely on invite links.
if (!process.env.PUBLIC_APP_URL) {
	process.env.PUBLIC_APP_URL = 'http://localhost:4173';
}

// Counter to ensure unique sessions even within the same millisecond
let sessionCounter = 0;

/**
 * Create a test session and user for integration tests
 * Returns sessionId and userId for use in test queries/mutations
 */
export async function createTestSession(t: TestConvex<any>): Promise<{
	sessionId: string;
	userId: Id<'users'>;
	workspaceId: Id<'workspaces'>;
	personId: Id<'people'>;
}> {
	const now = Date.now();
	const uniqueId = `${now}_${sessionCounter++}`; // Ensure uniqueness

	// Create a test user with all required fields
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			workosId: `test_workos_${uniqueId}`,
			email: `test-${uniqueId}@example.com`,
			name: 'Test User',
			firstName: 'Test',
			lastName: 'User',
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
			lastLoginAt: now
		});
	});

	// Create a test session with all required fields
	const sessionId = `test_session_${uniqueId}`;
	await t.run(async (ctx) => {
		await ctx.db.insert('authSessions', {
			sessionId,
			convexUserId: userId,
			workosUserId: `test_workos_${uniqueId}`,
			workosSessionId: `test_workos_session_${uniqueId}`,
			accessTokenCiphertext: 'test_access_token',
			refreshTokenCiphertext: 'test_refresh_token',
			csrfTokenHash: 'test_csrf_hash',
			isValid: true,
			expiresAt: now + 3600000, // 1 hour from now
			createdAt: now,
			userSnapshot: {
				userId,
				workosId: `test_workos_${uniqueId}`,
				email: `test-${uniqueId}@example.com`,
				firstName: 'Test',
				lastName: 'User',
				name: 'Test User'
			}
		});
	});

	// Create a default workspace and membership for this user to satisfy workspace-scoped features
	const workspaceId = await createTestOrganization(t, `Test Org ${uniqueId}`);
	await createTestOrganizationMember(t, workspaceId, userId, 'owner');
	const personId = await getPersonIdForUser(t, workspaceId, userId);

	return { sessionId, userId, workspaceId, personId };
}

/**
 * Create a test tag for a user
 */
export async function createTestTag(
	t: TestConvex<any>,
	userId: Id<'users'>,
	name: string = 'Test Tag',
	workspaceId?: Id<'workspaces'>
): Promise<Id<'tags'>> {
	const resolvedWorkspaceId = workspaceId ?? (await createTestOrganization(t));
	await createTestOrganizationMember(t, resolvedWorkspaceId, userId, 'owner');
	const personId = await getPersonIdForUser(t, resolvedWorkspaceId, userId);

	return await t.run(async (ctx) => {
		return await ctx.db.insert('tags', {
			personId,
			name,
			displayName: name, // displayName is required
			ownershipType: 'user',
			color: '#3b82f6',
			createdAt: Date.now(),
			workspaceId: resolvedWorkspaceId
		});
	});
}

/**
 * Create a test note for a user (creates an inbox item with type 'note')
 */
export async function createTestNote(
	t: TestConvex<any>,
	userId: Id<'users'>,
	title: string = 'Test Note'
): Promise<Id<'inboxItems'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('inboxItems', {
			type: 'note' as const,
			userId,
			title,
			content: 'Test content',
			contentMarkdown: 'Test content',
			status: 'backlog' as const,
			processedAt: undefined,
			createdAt: Date.now()
		});
	});
}

/**
 * Create a test workspace
 */
export async function createTestOrganization(
	t: TestConvex<any>,
	name: string = 'Test Org'
): Promise<Id<'workspaces'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('workspaces', {
			name,
			slug: `test-org-${Date.now()}`,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			plan: 'starter'
		});
	});
}

/**
 * Create an workspace membership
 */
export async function createTestOrganizationMember(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	role: 'owner' | 'admin' | 'member' = 'member'
): Promise<Id<'people'>> {
	return await t.run(async (ctx) => {
		const now = Date.now();

		const existingPerson = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
			.first();

		if (existingPerson) {
			return existingPerson._id;
		}

		const user = await ctx.db.get(userId);
		return await ctx.db.insert('people', {
			workspaceId,
			userId,
			email: (user as any)?.email ?? `user-${userId}@example.com`,
			displayName: (user as any)?.name ?? 'Test User',
			workspaceRole: role,
			status: 'active',
			createdAt: now,
			invitedAt: now,
			invitedBy: undefined,
			joinedAt: now,
			archivedAt: undefined,
			archivedBy: undefined
		});
	});
}

export async function getPersonIdForUser(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<Id<'people'>> {
	return await t.run(async (ctx) => {
		const person = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
			.first();
		if (!person) {
			throw new Error('Person not found for user in workspace');
		}
		return person._id as Id<'people'>;
	});
}

/**
 * Create a meeting template for a workspace
 */
export async function createTestMeetingTemplate(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>,
	createdBy: Id<'users'>,
	name: string = 'Test Meeting Template'
): Promise<Id<'meetingTemplates'>> {
	const now = Date.now();
	return await t.run(async (ctx) => {
		return await ctx.db.insert('meetingTemplates', {
			workspaceId,
			name,
			description: 'Test template',
			createdAt: now,
			createdBy
		});
	});
}

/**
 * Create an workspace invite
 */
export async function createTestInvite(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>,
	invitedBy: Id<'users'>,
	options?: {
		email?: string;
		invitedUserId?: Id<'users'>;
		role?: 'owner' | 'admin' | 'member';
	}
): Promise<{ inviteId: Id<'workspaceInvites'>; code: string }> {
	const code = `TEST-${Date.now()}`;
	const inviteId = await t.run(async (ctx) => {
		return await ctx.db.insert('workspaceInvites', {
			workspaceId,
			invitedBy,
			email: options?.email,
			invitedUserId: options?.invitedUserId,
			role: options?.role ?? 'member',
			code,
			createdAt: Date.now()
		});
	});
	return { inviteId, code };
}

/**
 * Create a test role
 */
export async function createTestRole(
	t: TestConvex<any>,
	slug: string,
	name: string
): Promise<Id<'roles'>> {
	const now = Date.now();
	return await t.run(async (ctx) => {
		return await ctx.db.insert('roles', {
			slug,
			name,
			description: `Test role: ${name}`,
			isSystem: false,
			createdAt: now,
			updatedAt: now
		});
	});
}

/**
 * Create a test permission
 */
export async function createTestPermission(
	t: TestConvex<any>,
	slug: string,
	name: string
): Promise<Id<'permissions'>> {
	const now = Date.now();
	return await t.run(async (ctx) => {
		return await ctx.db.insert('permissions', {
			slug,
			action: slug, // action field is required
			description: `Test permission: ${name}`,
			category: 'test',
			requiresResource: false, // No resource check required for test permissions
			isSystem: false, // Not a system permission
			createdAt: now,
			updatedAt: now
		});
	});
}

/**
 * Assign a role to a user
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export async function assignRoleToUser(
	t: TestConvex<any>,
	userId: Id<'users'>,
	roleId: Id<'roles'>,
	context?: {
		workspaceId?: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		assignedBy?: Id<'users'>;
	}
): Promise<Id<'systemRoles'> | Id<'workspaceRoles'>> {
	return await t.run(async (ctx) => {
		// Get role slug
		const role = await ctx.db.get(roleId);
		if (!role) {
			throw new Error(`Role ${roleId} not found`);
		}

		if (context?.workspaceId) {
			// Workspace-scoped role
			const person = await ctx.db
				.query('people')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.filter((q) => q.eq(q.field('workspaceId'), context.workspaceId))
				.first();

			if (!person) {
				throw new Error(`Person not found for user ${userId} in workspace ${context.workspaceId}`);
			}

			// Get assignedBy personId if provided
			let grantedByPersonId: Id<'people'> | undefined;
			if (context.assignedBy) {
				const assignedByPerson = await ctx.db
					.query('people')
					.withIndex('by_user', (q) => q.eq('userId', context.assignedBy!))
					.filter((q) => q.eq(q.field('workspaceId'), context.workspaceId))
					.first();
				grantedByPersonId = assignedByPerson?._id;
			}

			return await ctx.db.insert('workspaceRoles', {
				personId: person._id,
				workspaceId: context.workspaceId,
				role: role.slug,
				grantedAt: Date.now(),
				grantedByPersonId
			});
		} else {
			// System-scoped role
			return await ctx.db.insert('systemRoles', {
				userId,
				role: role.slug,
				grantedAt: Date.now(),
				grantedBy: context?.assignedBy ?? userId // Default to self-assignment for tests
			});
		}
	});
}

/**
 * Assign a permission to a role
 */
export async function assignPermissionToRole(
	t: TestConvex<any>,
	roleId: Id<'roles'>,
	permissionId: Id<'permissions'>,
	scope: 'all' | 'own' | 'none' = 'all'
): Promise<Id<'rolePermissions'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('rolePermissions', {
			roleId,
			permissionId,
			scope,
			createdAt: Date.now()
		});
	});
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(t: TestConvex<any>, userId?: Id<'users'>): Promise<void> {
	if (!userId) return;

	await t.run(async (ctx) => {
		// Clean up sessions
		const sessions = await ctx.db
			.query('authSessions')
			.filter((q) => q.eq(q.field('convexUserId'), userId))
			.collect();
		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}

		// Clean up system roles (SYOS-862: migrated from userRoles)
		const systemRoles = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const role of systemRoles) {
			await ctx.db.delete(role._id);
		}

		// Clean up workspace invites sent by user
		const invites = await ctx.db
			.query('workspaceInvites')
			.filter((q) => q.eq(q.field('invitedBy'), userId))
			.collect();
		for (const invite of invites) {
			await ctx.db.delete(invite._id);
		}

		// Clean up account links
		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', userId))
			.collect();
		for (const link of links) {
			await ctx.db.delete(link._id);
		}

		// Clean up tags and people (SYOS-862: also clean up workspaceRoles)
		const people = await ctx.db
			.query('people')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const person of people) {
			const tags = await ctx.db
				.query('tags')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.collect();
			for (const tag of tags) {
				await ctx.db.delete(tag._id);
			}

			// Clean up workspace roles for this person
			const workspaceRoles = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.collect();
			for (const role of workspaceRoles) {
				await ctx.db.delete(role._id);
			}

			await ctx.db.delete(person._id);
		}

		// Clean up flashcards
		const flashcards = await ctx.db
			.query('flashcards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const flashcard of flashcards) {
			await ctx.db.delete(flashcard._id);
		}

		// Clean up auth sessions
		const authSessions = await ctx.db
			.query('authSessions')
			.withIndex('by_convex_user', (q) => q.eq('convexUserId', userId))
			.collect();
		for (const session of authSessions) {
			await ctx.db.delete(session._id);
		}

		// Clean up user (check if it exists first)
		const user = await ctx.db.get(userId);
		if (user) {
			await ctx.db.delete(userId);
		}
	});
}

/**
 * Create a test circle
 */
export async function createTestCircle(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>,
	name: string = 'Test Circle',
	parentCircleId?: Id<'circles'>
): Promise<Id<'circles'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('circles', {
			workspaceId,
			name,
			slug: `test-circle-${Date.now()}`,
			purpose: 'Test purpose',
			parentCircleId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});
	});
}

/**
 * Create a circle membership
 */
export async function createTestCircleMember(
	t: TestConvex<any>,
	circleId: Id<'circles'>,
	userId: Id<'users'>
): Promise<Id<'circleMembers'>> {
	return await t.run(async (ctx) => {
		const circle = await ctx.db.get(circleId);
		const workspaceId = circle?.workspaceId as Id<'workspaces'>;
		const person =
			workspaceId &&
			(await ctx.db
				.query('people')
				.withIndex('by_workspace_user', (q) =>
					q.eq('workspaceId', workspaceId).eq('userId', userId)
				)
				.first());

		return await ctx.db.insert('circleMembers', {
			circleId,
			personId: person?._id ?? (userId as unknown as Id<'people'>),
			joinedAt: Date.now()
		});
	});
}

/**
 * Clean up test workspace and related data
 */
export async function cleanupTestOrganization(
	t: TestConvex<any>,
	workspaceId: Id<'workspaces'>
): Promise<void> {
	await t.run(async (ctx) => {
		// Clean up circles and circle members
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
			.collect();
		for (const circle of circles) {
			// Clean up circle members first
			const circleMembers = await ctx.db
				.query('circleMembers')
				.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
				.collect();
			for (const member of circleMembers) {
				await ctx.db.delete(member._id);
			}
			const people = await ctx.db
				.query('people')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
				.collect();
			for (const person of people) {
				await ctx.db.delete(person._id);
			}
			// Then delete the circle
			await ctx.db.delete(circle._id);
		}

		// Clean up workspace invites
		const invites = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
			.collect();
		for (const invite of invites) {
			await ctx.db.delete(invite._id);
		}

		// Clean up workspace (check if it exists first)
		const org = await ctx.db.get(workspaceId);
		if (org) {
			await ctx.db.delete(workspaceId);
		}
	});
}

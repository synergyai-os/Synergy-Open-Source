/**
 * Integration Test Setup and Helpers
 *
 * Provides test fixtures and utilities for Convex integration tests
 */

import type { TestConvex } from 'convex-test';
import type { Id } from '../../../convex/_generated/dataModel';

// Counter to ensure unique sessions even within the same millisecond
let sessionCounter = 0;

/**
 * Create a test session and user for integration tests
 * Returns sessionId and userId for use in test queries/mutations
 */
export async function createTestSession(
	t: TestConvex<any>
): Promise<{ sessionId: string; userId: Id<'users'> }> {
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

	return { sessionId, userId };
}

/**
 * Create a test tag for a user
 */
export async function createTestTag(
	t: TestConvex<any>,
	userId: Id<'users'>,
	name: string = 'Test Tag'
): Promise<Id<'tags'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('tags', {
			userId,
			name,
			displayName: name, // displayName is required
			ownershipType: 'user',
			color: '#3b82f6',
			createdAt: Date.now()
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
 * Create a test organization
 */
export async function createTestOrganization(
	t: TestConvex<any>,
	name: string = 'Test Org'
): Promise<Id<'organizations'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('organizations', {
			name,
			slug: `test-org-${Date.now()}`,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			plan: 'starter'
		});
	});
}

/**
 * Create an organization membership
 */
export async function createTestOrganizationMember(
	t: TestConvex<any>,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>,
	role: 'owner' | 'admin' | 'member' = 'member'
): Promise<Id<'organizationMembers'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('organizationMembers', {
			organizationId,
			userId,
			role,
			joinedAt: Date.now()
		});
	});
}

/**
 * Create an organization invite
 */
export async function createTestInvite(
	t: TestConvex<any>,
	organizationId: Id<'organizations'>,
	invitedBy: Id<'users'>,
	options?: {
		email?: string;
		invitedUserId?: Id<'users'>;
		role?: 'owner' | 'admin' | 'member';
	}
): Promise<{ inviteId: Id<'organizationInvites'>; code: string }> {
	const code = `TEST-${Date.now()}`;
	const inviteId = await t.run(async (ctx) => {
		return await ctx.db.insert('organizationInvites', {
			organizationId,
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
 */
export async function assignRoleToUser(
	t: TestConvex<any>,
	userId: Id<'users'>,
	roleId: Id<'roles'>,
	context?: {
		organizationId?: Id<'organizations'>;
		teamId?: Id<'teams'>;
		assignedBy?: Id<'users'>;
	}
): Promise<Id<'userRoles'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('userRoles', {
			userId,
			roleId,
			organizationId: context?.organizationId,
			teamId: context?.teamId,
			assignedBy: context?.assignedBy ?? userId, // Default to self-assignment for tests
			assignedAt: Date.now()
		});
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

		// Clean up user roles
		const userRoles = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const userRole of userRoles) {
			await ctx.db.delete(userRole._id);
		}

		// Clean up organization memberships
		const orgMembers = await ctx.db
			.query('organizationMembers')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const member of orgMembers) {
			await ctx.db.delete(member._id);
		}

		// Clean up organization invites sent by user
		const invites = await ctx.db
			.query('organizationInvites')
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

		// Clean up tags
		const tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const tag of tags) {
			await ctx.db.delete(tag._id);
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
	organizationId: Id<'organizations'>,
	name: string = 'Test Circle',
	parentCircleId?: Id<'circles'>
): Promise<Id<'circles'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('circles', {
			organizationId,
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
		return await ctx.db.insert('circleMembers', {
			circleId,
			userId,
			joinedAt: Date.now()
		});
	});
}

/**
 * Clean up test organization and related data
 */
export async function cleanupTestOrganization(
	t: TestConvex<any>,
	organizationId: Id<'organizations'>
): Promise<void> {
	await t.run(async (ctx) => {
		// Clean up circles and circle members
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
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
			// Then delete the circle
			await ctx.db.delete(circle._id);
		}

		// Clean up organization members
		const members = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
			.collect();
		for (const member of members) {
			await ctx.db.delete(member._id);
		}

		// Clean up organization invites
		const invites = await ctx.db
			.query('organizationInvites')
			.withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
			.collect();
		for (const invite of invites) {
			await ctx.db.delete(invite._id);
		}

		// Clean up organization (check if it exists first)
		const org = await ctx.db.get(organizationId);
		if (org) {
			await ctx.db.delete(organizationId);
		}
	});
}

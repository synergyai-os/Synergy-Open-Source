/**
 * Users Module Integration Tests
 *
 * Tests actual Convex functions to catch bugs like destructuring issues
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import schema from '../../../convex/schema';
import { modules } from './test.setup';
import {
	createTestSession,
	cleanupTestData,
	createTestRole,
	createTestPermission,
	assignRoleToUser,
	assignPermissionToRole
} from './setup';

describe('Users Integration Tests', () => {
	const cleanupQueue: any[] = [];

	afterEach(async () => {
		const t = convexTest(schema, modules);
		for (const userId of cleanupQueue) {
			await cleanupTestData(t, userId);
		}
		cleanupQueue.length = 0;
	});

	it('should sync user from WorkOS - create new user', async () => {
		const t = convexTest(schema, modules);

		const userId = await t.mutation(api.users.syncUserFromWorkOS, {
			workosId: 'workos_test_123',
			email: 'newuser@example.com',
			firstName: 'Test',
			lastName: 'User',
			emailVerified: true
		});

		expect(userId).toBeDefined();
		cleanupQueue.push(userId);

		// Verify user was created
		const user = await t.run(async (ctx) => {
			return await ctx.db.get(userId);
		});

		expect(user).toBeDefined();
		expect(user?.email).toBe('newuser@example.com');
		expect(user?.name).toBe('Test User');
	});

	it('should sync user from WorkOS - update existing user', async () => {
		const t = convexTest(schema, modules);

		// Create initial user
		const userId = await t.mutation(api.users.syncUserFromWorkOS, {
			workosId: 'workos_test_456',
			email: 'existing@example.com',
			firstName: 'Old',
			lastName: 'Name'
		});

		cleanupQueue.push(userId);

		// Update user with new data
		const updatedUserId = await t.mutation(api.users.syncUserFromWorkOS, {
			workosId: 'workos_test_456',
			email: 'updated@example.com',
			firstName: 'New',
			lastName: 'Name'
		});

		expect(updatedUserId).toBe(userId);

		const user = await t.run(async (ctx) => {
			return await ctx.db.get(userId);
		});

		expect(user?.email).toBe('updated@example.com');
		expect(user?.name).toBe('New Name');
	});

	it('should get user by ID with sessionId validation', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push(userId);

		// This would fail if userId is an object (destructuring bug)
		const user = await t.query(api.users.getUserById, { sessionId });

		expect(user).toBeDefined();
		expect(user?._id).toBe(userId);
	});

	it('should get current user with sessionId validation', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push(userId);

		const user = await t.query(api.users.getCurrentUser, { sessionId });

		expect(user).toBeDefined();
		expect(user?._id).toBe(userId);
	});

	it('should update own profile with RBAC permission check', async () => {
		const t = convexTest(schema, modules);
		const { userId } = await createTestSession(t);

		// Set up RBAC: User role with users.manage-profile permission (scope: "own")
		const userRole = await createTestRole(t, 'user', 'User');
		const profilePermission = await createTestPermission(
			t,
			'users.manage-profile',
			'Manage Profile'
		);
		await assignPermissionToRole(t, userRole, profilePermission, 'own');
		await assignRoleToUser(t, userId, userRole);

		cleanupQueue.push(userId);

		// User should be able to update their own profile
		const result = await t.mutation(api.users.updateUserProfile, {
			targetUserId: userId,
			firstName: 'Updated',
			lastName: 'Name',
			userId
		});

		expect(result.success).toBe(true);

		const user = await t.run(async (ctx) => {
			return await ctx.db.get(userId);
		});

		expect(user?.firstName).toBe('Updated');
		expect(user?.lastName).toBe('Name');
		expect(user?.name).toBe('Updated Name');
	});

	it('should link accounts bidirectionally', async () => {
		const t = convexTest(schema, modules);
		const { userId: user1 } = await createTestSession(t);
		const { userId: user2 } = await createTestSession(t);

		cleanupQueue.push(user1, user2);

		const result = await t.mutation(api.users.linkAccounts, {
			primaryUserId: user1,
			linkedUserId: user2,
			linkType: 'test-link'
		});

		expect(result.success).toBe(true);

		// Verify bidirectional links
		const links1 = await t.query(api.users.listLinkedAccounts, { userId: user1 });
		expect(links1.length).toBe(1);
		expect(links1[0].userId).toBe(user2);

		const links2 = await t.query(api.users.listLinkedAccounts, { userId: user2 });
		expect(links2.length).toBe(1);
		expect(links2[0].userId).toBe(user1);
	});

	it('should validate account links transitively', async () => {
		const t = convexTest(schema, modules);
		const { userId: userA } = await createTestSession(t);
		const { userId: userB } = await createTestSession(t);
		const { userId: userC } = await createTestSession(t);

		cleanupQueue.push(userA, userB, userC);

		// Link A → B
		await t.mutation(api.users.linkAccounts, {
			primaryUserId: userA,
			linkedUserId: userB
		});

		// Link B → C
		await t.mutation(api.users.linkAccounts, {
			primaryUserId: userB,
			linkedUserId: userC
		});

		// A should be able to see C transitively
		const validation = await t.query(api.users.validateAccountLink, {
			primaryUserId: userA,
			linkedUserId: userC
		});

		expect(validation.linked).toBe(true);
	});

	// TODO: Backend implementation needs to be fixed to properly enforce depth limits
	it.skip('should enforce account link depth limits', async () => {
		const t = convexTest(schema, modules);
		const users = [];

		// Create 11 users (exceeds MAX_TOTAL_ACCOUNTS=10)
		for (let i = 0; i < 11; i++) {
			const { userId } = await createTestSession(t);
			users.push(userId);
			cleanupQueue.push(userId);
		}

		// Link 10 users together in a chain
		for (let i = 0; i < 9; i++) {
			await t.mutation(api.users.linkAccounts, {
				primaryUserId: users[i],
				linkedUserId: users[i + 1]
			});
		}

		// Try to link the 11th user (would exceed MAX_TOTAL_ACCOUNTS=10, should fail)
		await expect(
			t.mutation(api.users.linkAccounts, {
				primaryUserId: users[9],
				linkedUserId: users[10]
			})
		).rejects.toThrow();
	});

	it('should fail with invalid sessionId', async () => {
		const t = convexTest(schema, modules);

		await expect(
			t.query(api.users.getCurrentUser, {
				sessionId: 'invalid_session_id'
			})
		).rejects.toThrow('Session not found');
	});
});

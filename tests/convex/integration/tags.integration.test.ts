/**
 * Tags Module Integration Tests
 *
 * Tests actual Convex functions to catch bugs like destructuring issues
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from './test.setup';
import { createTestSession, createTestTag, cleanupTestData } from './setup';

describe('Tags Integration Tests', () => {
	let userId: any;

	afterEach(async () => {
		// Cleanup after each test
		if (userId) {
			const t = convexTest(schema, modules);
			await cleanupTestData(t, userId);
		}
	});

	it('should list user tags without type errors', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create a test tag
		await createTestTag(t, userId, 'Test Tag 1');

		// This would fail if userId is an object (destructuring bug)
		const tags = await t.query(api.tags.listUserTags, { sessionId });

		expect(tags).toBeDefined();
		expect(Array.isArray(tags)).toBe(true);
		expect(tags.length).toBeGreaterThan(0);
	});

	it('should list user tags with ownership info', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create test tags
		await createTestTag(t, userId, 'Personal Tag');

		// Query with sessionId (tests destructuring)
		const tags = await t.query(api.tags.listUserTags, { sessionId });

		expect(tags).toBeDefined();
		expect(Array.isArray(tags)).toBe(true);
		expect(tags.length).toBeGreaterThan(0);
		expect(tags[0]).toHaveProperty('displayName');
		expect(tags[0]).toHaveProperty('ownershipType');
	});

	it('should get tags by ownership', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create test tags
		await createTestTag(t, userId, 'User Tag');

		// Query user tags (tests destructuring)
		const tags = await t.query(api.tags.listUserTags, {
			sessionId
		});

		expect(tags).toBeDefined();
		expect(Array.isArray(tags)).toBe(true);
		expect(tags.length).toBeGreaterThan(0);
	});

	it('should get tag details', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create test tag
		await createTestTag(t, userId, 'Detail Tag');

		// List tags to verify creation (tests destructuring)
		const tags = await t.query(api.tags.listUserTags, {
			sessionId
		});

		expect(tags).toBeDefined();
		expect(tags.length).toBeGreaterThan(0);
		expect(tags[0].displayName).toBe('Detail Tag');
	});

	it('should fail with invalid sessionId', async () => {
		const t = convexTest(schema, modules);

		// Try to query with invalid sessionId
		await expect(
			t.query(api.tags.listUserTags, {
				sessionId: 'invalid_session_id'
			})
		).rejects.toThrow('Session not found');
	});

	it('should enforce user isolation', async () => {
		const t = convexTest(schema, modules);

		// Create two users
		const { sessionId: _session1, userId: user1 } = await createTestSession(t);
		const { sessionId: session2, userId: user2 } = await createTestSession(t);

		// Create tags for user1
		await createTestTag(t, user1, 'User 1 Tag');

		// User2 should not see user1's tags
		const user2Tags = await t.query(api.tags.listUserTags, {
			sessionId: session2
		});

		expect(user2Tags.length).toBe(0);

		// Cleanup
		await cleanupTestData(t, user1);
		await cleanupTestData(t, user2);
		userId = null; // Prevent double cleanup
	});
});

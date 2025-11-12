/**
 * Integration Test Setup and Helpers
 * 
 * Provides test fixtures and utilities for Convex integration tests
 */

import type { ConvexTestingHelper } from 'convex-test';
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';

/**
 * Create a test session and user for integration tests
 * Returns sessionId and userId for use in test queries/mutations
 */
export async function createTestSession(
	t: ConvexTestingHelper
): Promise<{ sessionId: string; userId: Id<'users'> }> {
	// Create a test user
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			email: `test-${Date.now()}@example.com`,
			name: 'Test User',
			isAnonymous: false
		});
	});

	// Create a test session
	const sessionId = `test_session_${Date.now()}`;
	await t.run(async (ctx) => {
		await ctx.db.insert('authSessions', {
			sessionId,
			convexUserId: userId,
			workosUserId: 'test_workos_user',
			isValid: true,
			expiresAt: Date.now() + 3600000, // 1 hour from now
			createdAt: Date.now(),
			lastAccessedAt: Date.now()
		});
	});

	return { sessionId, userId };
}

/**
 * Create a test tag for a user
 */
export async function createTestTag(
	t: ConvexTestingHelper,
	userId: Id<'users'>,
	name: string = 'Test Tag'
): Promise<Id<'tags'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('tags', {
			userId,
			name,
			ownership: 'user',
			color: '#3b82f6'
		});
	});
}

/**
 * Create a test note for a user
 */
export async function createTestNote(
	t: ConvexTestingHelper,
	userId: Id<'users'>,
	title: string = 'Test Note'
): Promise<Id<'notes'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('notes', {
			userId,
			title,
			content: 'Test content',
			format: 'markdown' as const,
			status: 'active' as const,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});
	});
}

/**
 * Create a test organization
 */
export async function createTestOrganization(
	t: ConvexTestingHelper,
	name: string = 'Test Org'
): Promise<Id<'organizations'>> {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('organizations', {
			name,
			slug: `test-org-${Date.now()}`,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});
	});
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(
	t: ConvexTestingHelper,
	userId?: Id<'users'>
): Promise<void> {
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

		// Clean up tags
		const tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const tag of tags) {
			await ctx.db.delete(tag._id);
		}

		// Clean up notes
		const notes = await ctx.db
			.query('notes')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		for (const note of notes) {
			await ctx.db.delete(note._id);
		}

		// Clean up user
		await ctx.db.delete(userId);
	});
}


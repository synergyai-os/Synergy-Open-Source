/**
 * Flashcards Module Integration Tests
 *
 * Tests actual Convex functions to catch bugs like destructuring issues
 */

import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '$convex/_generated/api';
import schema from '$convex/schema';
import { modules } from '$tests/convex/integration/test.setup';
import { createTestSession, cleanupTestData } from '$tests/convex/integration/setup';

describe('Flashcards Integration Tests', () => {
	let userId: any;

	afterEach(async () => {
		// Cleanup after each test
		if (userId) {
			const t = convexTest(schema, modules);
			await cleanupTestData(t, userId);
		}
	});

	it('should create flashcard without type errors', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create flashcard (tests destructuring)
		const flashcardId = await t.mutation(api.features.flashcards.index.createFlashcard, {
			sessionId,
			question: 'Test Question',
			answer: 'Test Answer',
			sourceType: 'manual'
		});

		expect(flashcardId).toBeDefined();
	});

	it('should list user flashcards', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create flashcard
		await t.mutation(api.features.flashcards.index.createFlashcard, {
			sessionId,
			question: 'Q1',
			answer: 'A1',
			sourceType: 'manual'
		});

		// List flashcards (tests destructuring)
		const flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, {
			sessionId
		});

		expect(flashcards).toBeDefined();
		expect(Array.isArray(flashcards)).toBe(true);
		expect(flashcards.length).toBeGreaterThan(0);
	});

	it('should review flashcard and update state', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Create flashcard
		const flashcardId = await t.mutation(api.features.flashcards.index.createFlashcard, {
			sessionId,
			question: 'Review Test',
			answer: 'Answer',
			sourceType: 'manual'
		});

		// Review flashcard (tests destructuring)
		const result = await t.mutation(api.features.flashcards.index.updateFlashcardReview, {
			sessionId,
			flashcardId,
			rating: 'good' // Valid rating: 'again', 'hard', 'good', 'easy'
		});

		expect(result).toBeDefined();
		expect(result.success).toBe(true);
		expect(result.nextDue).toBeDefined();
	});

	it('should fail with invalid sessionId', async () => {
		const t = convexTest(schema, modules);

		// Try to create flashcard with invalid sessionId
		await expect(
			t.mutation(api.features.flashcards.index.createFlashcard, {
				sessionId: 'invalid_session',
				question: 'Q',
				answer: 'A',
				sourceType: 'manual'
			})
		).rejects.toThrow('Session not found');
	});

	it('should enforce user isolation', async () => {
		const t = convexTest(schema, modules);

		// Create two users
		const { sessionId: session1, userId: user1 } = await createTestSession(t);
		const { sessionId: session2, userId: user2 } = await createTestSession(t);

		// User1 creates flashcard
		await t.mutation(api.features.flashcards.index.createFlashcard, {
			sessionId: session1,
			question: 'User 1 Q',
			answer: 'User 1 A',
			sourceType: 'manual'
		});

		// User2 should not see user1's flashcards
		const user2Flashcards = await t.query(api.features.flashcards.index.getUserFlashcards, {
			sessionId: session2
		});

		expect(user2Flashcards.length).toBe(0);

		// Cleanup
		await cleanupTestData(t, user1);
		await cleanupTestData(t, user2);
		userId = null;
	});
});

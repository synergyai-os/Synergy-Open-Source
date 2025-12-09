import { describe, expect, test, vi } from 'vitest';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user1' })
}));

vi.mock('./access', () => ({
	ensureOwnershipContext: vi.fn().mockResolvedValue({
		ownership: 'workspace',
		workspaceId: 'ws1',
		circleId: undefined
	}),
	ensureWorkspaceMembership: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('./validation', () => ({
	validateTagName: vi.fn(() => ({ normalizedName: 'tag-name' })),
	ensureUniqueTagName: vi.fn().mockResolvedValue(undefined),
	ensureParentChainValid: vi.fn().mockResolvedValue(undefined)
}));

import { ensureOwnershipContext } from './access';
import { ensureUniqueTagName, validateTagName } from './validation';
import { createTagInternal, createTagShareInternal } from './lifecycle';

const makeCtx = (opts: {
	tag?: any;
	existingByWorkspace?: any[];
	circle?: any;
	highlightAssignments?: any[];
}) =>
	({
		db: {
			get: vi.fn(async (id: string) => {
				if (opts.tag && id === opts.tag._id) return opts.tag;
				if (opts.circle && id === opts.circle._id) return opts.circle;
				return null;
			}),
			query: vi.fn((table: string) => {
				if (table === 'tags') {
					return {
						withIndex: vi.fn(() => ({
							first: vi.fn().mockResolvedValue(opts.existingByWorkspace?.[0] ?? null)
						}))
					};
				}
				if (table === 'highlightTags') {
					return {
						withIndex: vi.fn(() => ({
							collect: vi.fn().mockResolvedValue(opts.highlightAssignments ?? [])
						}))
					};
				}
				return { withIndex: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })) };
			}),
			insert: vi.fn(async () => 'tag1'),
			patch: vi.fn(async () => undefined)
		}
	}) as any;

describe('tags/lifecycle', () => {
	test('createTag rejects invalid ownership with circleId', async () => {
		const ctx = makeCtx({});

		await expect(
			createTagInternal(ctx, {
				sessionId: 's',
				displayName: 'Hello',
				color: '#000',
				circleId: 'circle1',
				ownership: 'workspace'
			})
		).rejects.toThrow(/TAG_INVALID_OWNERSHIP/);
	});

	test('createTag inserts tag with normalized name', async () => {
		const ctx = makeCtx({});

		const id = await createTagInternal(ctx, {
			sessionId: 's',
			displayName: 'Hello',
			color: '#000'
		});

		expect(id).toBe('tag1');
		expect(validateTagName).toHaveBeenCalledWith('Hello');
		expect(ensureUniqueTagName).toHaveBeenCalled();
	});

	test('createTagShare rejects when user does not own tag', async () => {
		const ctx = makeCtx({
			tag: { _id: 't1', userId: 'other', ownershipType: 'user', displayName: 'Tag' }
		});

		await expect(
			createTagShareInternal(ctx, {
				sessionId: 's',
				tagId: 't1',
				shareWith: 'workspace',
				workspaceId: 'ws1'
			})
		).rejects.toThrow(/TAG_ACCESS_DENIED/);
	});

	test('createTagShare rejects when duplicate exists in workspace', async () => {
		const ctx = makeCtx({
			tag: { _id: 't1', userId: 'user1', ownershipType: 'user', displayName: 'Tag', name: 'tag' },
			existingByWorkspace: [{ _id: 'existing', name: 'tag' }]
		});
		(ensureOwnershipContext as any).mockResolvedValueOnce({
			ownership: 'workspace',
			workspaceId: 'ws1'
		});

		await expect(
			createTagShareInternal(ctx, {
				sessionId: 's',
				tagId: 't1',
				shareWith: 'workspace',
				workspaceId: 'ws1'
			})
		).rejects.toThrow(/TAG_ALREADY_EXISTS/);
	});
});

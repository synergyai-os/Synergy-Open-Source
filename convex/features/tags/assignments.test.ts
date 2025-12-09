import { describe, expect, test, vi } from 'vitest';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user1' })
}));

vi.mock('../../permissions', () => ({
	canAccessContent: vi.fn().mockResolvedValue(true)
}));

import { canAccessContent } from '../../permissions';
import {
	archiveHighlightTagAssignmentHandler,
	updateHighlightTagAssignmentsHandler
} from './assignments';

type HighlightAssignment = { _id: string; highlightId: string; tagId: string };

const makeCtx = (opts: {
	highlight?: any;
	tags?: Record<string, any>;
	assignments?: HighlightAssignment[];
}) => {
	const deletes: string[] = [];
	const inserts: any[] = [];
	const highlight = opts.highlight ?? { _id: 'h1', userId: 'user1' };
	const assignments = opts.assignments ?? [{ _id: 'a1', highlightId: 'h1', tagId: 't1' }];
	return {
		db: {
			get: vi.fn(async (id: string) => {
				if (id === highlight._id) return highlight;
				return opts.tags?.[id] ?? null;
			}),
			query: vi.fn((table: string) => {
				if (table === 'highlightTags') {
					return {
						withIndex: vi.fn(() => ({
							collect: vi.fn().mockResolvedValue(assignments),
							first: vi.fn().mockResolvedValue(assignments[0] ?? null)
						}))
					};
				}
				return { withIndex: vi.fn(() => ({ collect: vi.fn().mockResolvedValue([]) })) };
			}),
			delete: vi.fn(async (id: string) => {
				deletes.push(id);
			}),
			insert: vi.fn(async (_table: string, doc: any) => {
				inserts.push(doc);
				return 'newId';
			})
		},
		__ops: { deletes, inserts }
	} as any;
};

describe('tags/assignments', () => {
	test('updates highlight tags with auth and replaces assignments', async () => {
		const ctx = makeCtx({
			tags: {
				t1: { _id: 't1', userId: 'user1' },
				t2: { _id: 't2', userId: 'user1' }
			}
		});

		await updateHighlightTagAssignmentsHandler(ctx, {
			sessionId: 's',
			highlightId: 'h1',
			tagIds: ['t2']
		});

		expect(ctx.__ops.deletes).toContain('a1');
		expect(ctx.__ops.inserts).toEqual([
			expect.objectContaining({ highlightId: 'h1', tagId: 't2' })
		]);
	});

	test('throws when tag missing', async () => {
		const ctx = makeCtx({ tags: {} });

		await expect(
			updateHighlightTagAssignmentsHandler(ctx, {
				sessionId: 's',
				highlightId: 'h1',
				tagIds: ['missing']
			})
		).rejects.toThrow(/TAG_NOT_FOUND/);
	});

	test('throws when tag access denied', async () => {
		(canAccessContent as any).mockResolvedValueOnce(false);
		const ctx = makeCtx({
			tags: {
				t1: { _id: 't1', userId: 'other', workspaceId: 'ws1' }
			}
		});

		await expect(
			updateHighlightTagAssignmentsHandler(ctx, {
				sessionId: 's',
				highlightId: 'h1',
				tagIds: ['t1']
			})
		).rejects.toThrow(/TAG_ACCESS_DENIED/);
	});

	test('archives highlight tag assignment when found', async () => {
		const ctx = makeCtx({
			assignments: [{ _id: 'a1', highlightId: 'h1', tagId: 't1' }],
			tags: { t1: { _id: 't1', userId: 'user1' } }
		});

		await archiveHighlightTagAssignmentHandler(ctx, {
			sessionId: 's',
			highlightId: 'h1',
			tagId: 't1'
		});

		expect(ctx.__ops.deletes).toContain('a1');
	});
});

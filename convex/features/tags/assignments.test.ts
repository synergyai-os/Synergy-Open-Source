import { describe, expect, test, vi } from 'vitest';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';

const accessMocks = vi.hoisted(() => ({
	ensureTagAccess: vi.fn().mockResolvedValue(undefined),
	getActorFromSession: vi
		.fn()
		.mockResolvedValue({ personId: 'person1', workspaceId: 'ws1', user: 'u1' }),
	ensureWorkspaceMembership: vi.fn().mockResolvedValue(undefined),
	ensureCircleMembership: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('./access', () => accessMocks);

const { ensureTagAccess } = accessMocks;

import {
	archiveHighlightTagAssignmentHandler,
	updateHighlightTagAssignmentsHandler
} from './assignments';

type HighlightAssignment = { _id: string; highlightId: string; tagId: string };

const highlightId = 'h1' as Id<'highlights'>;
const tagId = 't1' as Id<'tags'>;

const makeCtx = (opts: {
	highlight?: any;
	tags?: Record<string, any>;
	assignments?: HighlightAssignment[];
}) => {
	const deletes: string[] = [];
	const inserts: any[] = [];
	const highlight = opts.highlight ?? { _id: highlightId, workspaceId: 'ws1' };
	const assignments = opts.assignments ?? [{ _id: 'a1', highlightId, tagId }];
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
		ensureTagAccess.mockResolvedValue(undefined);
		const ctx = makeCtx({
			tags: {
				t1: { _id: 't1', personId: 'person1', workspaceId: 'ws1' },
				t2: { _id: 't2', personId: 'person1', workspaceId: 'ws1' }
			}
		});

		await updateHighlightTagAssignmentsHandler(ctx, {
			sessionId: 's',
			highlightId,
			tagIds: ['t2' as Id<'tags'>]
		});

		expect(ctx.__ops.deletes).toContain('a1');
		expect(ctx.__ops.inserts).toEqual([
			expect.objectContaining({ highlightId: 'h1', tagId: 't2' })
		]);
	});

	test('throws when tag missing', async () => {
		ensureTagAccess.mockResolvedValue(undefined);
		const ctx = makeCtx({ tags: {} });

		await expect(
			updateHighlightTagAssignmentsHandler(ctx, {
				sessionId: 's',
				highlightId,
				tagIds: ['missing' as Id<'tags'>]
			})
		).rejects.toThrow(/TAG_NOT_FOUND/);
	});

	test('throws when tag access denied', async () => {
		ensureTagAccess.mockRejectedValueOnce(createError(ErrorCodes.TAG_ACCESS_DENIED, 'denied'));
		const ctx = makeCtx({
			tags: {
				t1: { _id: 't1', personId: 'other', workspaceId: 'ws1' }
			}
		});

		await expect(
			updateHighlightTagAssignmentsHandler(ctx, {
				sessionId: 's',
				highlightId,
				tagIds: [tagId]
			})
		).rejects.toThrow(/TAG_ACCESS_DENIED/);
	});

	test('archives highlight tag assignment when found', async () => {
		ensureTagAccess.mockResolvedValue(undefined);
		const ctx = makeCtx({
			assignments: [{ _id: 'a1', highlightId: 'h1', tagId: 't1' }],
			tags: { t1: { _id: 't1', personId: 'person1', workspaceId: 'ws1' } }
		});

		await archiveHighlightTagAssignmentHandler(ctx, {
			sessionId: 's',
			highlightId,
			tagId
		});

		expect(ctx.__ops.deletes).toContain('a1');
	});
});

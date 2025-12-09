import { afterEach, describe, expect, test, vi } from 'vitest';

import type { ActionCtx } from '../_generated/server';
import { ErrorCodes } from '../infrastructure/errors/codes';
import { fetchReadwiseHighlightsHandler } from './access';
import { ensureSources } from './sources';
import { parseFilters, parseIncrementalDate, requireWorkspaceId } from './filters';

describe('readwise helpers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('fetchReadwiseHighlightsHandler requires authentication', async () => {
		const runQuery = vi.fn().mockResolvedValueOnce(null);
		const ctx = { runQuery, runAction: vi.fn() } as unknown as ActionCtx;

		await expect(fetchReadwiseHighlightsHandler(ctx, { sessionId: 's1' })).rejects.toThrow(
			`${ErrorCodes.AUTH_REQUIRED}: Authentication required`
		);
	});

	test('fetchReadwiseHighlightsHandler requires API key', async () => {
		const runQuery = vi
			.fn()
			.mockResolvedValueOnce('user-1') // getUserId
			.mockResolvedValueOnce({ readwiseApiKey: null, claudeApiKey: null }); // getEncryptedKeys
		const ctx = { runQuery, runAction: vi.fn() } as unknown as ActionCtx;

		await expect(fetchReadwiseHighlightsHandler(ctx, { sessionId: 's1' })).rejects.toThrow(
			`${ErrorCodes.EXTERNAL_API_KEY_MISSING}: Readwise API key not found. Please add it in Settings first.`
		);
	});

	test('parseFilters supports custom date range and quantity', () => {
		const range = parseFilters({
			customStartDate: '2024-01-01',
			customEndDate: '2024-01-02'
		});
		expect(range.updatedAfter).toBeDefined();
		expect(range.updatedBefore).toBeDefined();

		const quantity = parseFilters({ quantity: 50 });
		expect(quantity.limit).toBe(50);
	});

	test('parseIncrementalDate falls back to last sync time', async () => {
		const lastSyncAt = 1_700_000_000_000;
		const ctx = {
			runQuery: vi.fn().mockResolvedValue({ lastReadwiseSyncAt: lastSyncAt })
		} as unknown as ActionCtx;

		const result = await parseIncrementalDate(ctx, 'user-1', undefined, undefined, undefined);
		expect(result).toBe(new Date(lastSyncAt).toISOString());
	});

	test('requireWorkspaceId throws when no memberships found', async () => {
		const ctx = { runQuery: vi.fn().mockResolvedValue([]) } as unknown as ActionCtx;

		await expect(requireWorkspaceId(ctx, 'user-1' as any)).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED}: User must belong to at least one workspace`
		);
	});

	test('ensureSources creates author and source when missing', async () => {
		const runMutation = vi.fn(async (_fn, args: any) => {
			if (args && 'authorName' in args) return 'author-1';
			if (args && 'readwiseSource' in args) return 'source-1';
			return undefined;
		});
		const runQuery = vi.fn().mockResolvedValue(null);
		const runAction = vi.fn().mockResolvedValue({
			results: [
				{
					id: 123,
					title: 'Book Title',
					author: 'Author One',
					category: 'book',
					source: 'book',
					num_highlights: 1
				}
			],
			next: null
		});

		const ctx = { runMutation, runQuery, runAction } as unknown as ActionCtx;

		const map = await ensureSources(ctx, {
			userId: 'user-1',
			apiKey: 'key-123',
			workspaceId: 'workspace-1' as any,
			neededBookIds: new Set([123])
		});

		expect(map.get(123)).toBe('source-1');
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ authorName: 'Author One' })
		);
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ readwiseSource: expect.objectContaining({ id: 123 }) })
		);
	});
});

import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import { recordVersionHistory } from './capture';

function createCircleDoc(): Doc<'circles'> {
	return {
		_id: 'circle1' as Id<'circles'>,
		workspaceId: 'workspace1' as Id<'workspaces'>,
		name: 'Example',
		slug: 'example',
		status: 'active',
		createdAt: 0,
		updatedAt: 0,
		updatedByPersonId: 'person1' as Id<'people'>
	} as unknown as Doc<'circles'>;
}

function createCtx(insert: (table: string, value: unknown) => Promise<unknown>): MutationCtx {
	return {
		db: {
			get: vi.fn(),
			insert
		}
	} as unknown as MutationCtx;
}

describe('recordVersionHistory', () => {
	test('inserts history when change is valid', async () => {
		const insert = vi.fn();
		const ctx = createCtx(insert);
		const circle = createCircleDoc();

		await recordVersionHistory(ctx, 'circle', {
			id: circle._id,
			operation: 'insert',
			oldDoc: null,
			newDoc: circle
		} as any);

		expect(insert).toHaveBeenCalledTimes(1);
		expect(insert).toHaveBeenCalledWith(
			'orgVersionHistory',
			expect.objectContaining({
				entityType: 'circle',
				entityId: circle._id,
				workspaceId: circle.workspaceId,
				changedByPersonId: circle.updatedByPersonId
			})
		);
	});

	test('skips insert when actor cannot be determined', async () => {
		const insert = vi.fn();
		const ctx = createCtx(insert);
		const circle = {
			...createCircleDoc(),
			updatedByPersonId: undefined,
			createdByPersonId: undefined,
			archivedByPersonId: undefined
		} as any;

		await recordVersionHistory(ctx, 'circle', {
			id: circle._id,
			operation: 'insert',
			oldDoc: null,
			newDoc: circle
		} as any);

		expect(insert).not.toHaveBeenCalled();
	});
});

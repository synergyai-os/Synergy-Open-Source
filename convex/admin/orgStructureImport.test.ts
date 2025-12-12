import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { importOrgStructure } from './orgStructureImport';

const mockUserId = 'u1' as Id<'users'>;
const workspaceId = 'w1' as Id<'workspaces'>;

vi.mock('../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: async () => ({ userId: mockUserId })
}));

function createDb(overrides: Partial<MutationCtx['db']> = {}): MutationCtx['db'] {
	const defaultDb = {
		query: (_name: string) => ({
			withIndex: (_index: string, _cb: (q: any) => any) => ({
				collect: async () => [],
				first: async () => undefined
			})
		}),
		get: async () => null,
		insert: async () => 'new-id',
		patch: async () => {}
	};

	return { ...defaultDb, ...overrides } as MutationCtx['db'];
}

describe('importOrgStructure', () => {
	test('rejects when user lacks workspace membership (error uses ErrorCodes)', async () => {
		const handler = (importOrgStructure as any).handler ?? (importOrgStructure as any);
		const ctx = {
			db: createDb({
				query: (name: string) => ({
					withIndex: (_index: string, cb: (q: any) => any) => {
						if (name === 'workspaceMembers') {
							const builder = {
								eq: () => builder
							};
							return {
								first: async () => {
									cb(builder);
									return null;
								},
								collect: async () => []
							};
						}
						return {
							first: async () => null,
							collect: async () => []
						};
					}
				}),
				get: async () => null
			})
		} as unknown as MutationCtx;

		await expect(
			handler(ctx as any, {
				sessionId: 's1',
				workspaceId,
				rootCircleId: 'c-root' as Id<'circles'>,
				structure: {
					type: 'circle',
					name: 'Root',
					purpose: '',
					depth: 0,
					lineNumber: 1,
					children: []
				}
			})
		).rejects.toThrow(/WORKSPACE_ACCESS_DENIED/);
	});
});

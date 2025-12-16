import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { create as createTemplate } from './templates';

const { mockPersonId, workspaceId } = vi.hoisted(() => ({
	mockPersonId: 'p1' as Id<'people'>,
	workspaceId: 'w1' as Id<'workspaces'>
}));

vi.mock('./roleAccess', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId)
}));
vi.mock('../roleAccess', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId)
}));

vi.mock('./rules', () => ({
	findLeadRoleTemplate: vi.fn().mockResolvedValue(null),
	isWorkspaceAdmin: vi.fn().mockResolvedValue(false),
	updateLeadRolesFromTemplate: vi.fn()
}));

function createCtx(): MutationCtx {
	const person = {
		_id: mockPersonId,
		workspaceId,
		userId: 'u1' as Id<'users'>,
		email: 'test@example.com',
		displayName: 'Test User',
		workspaceRole: 'member',
		status: 'active',
		invitedAt: Date.now()
	};

	return {
		db: {
			get: vi.fn(),
			query: (table: string) => {
				if (table === 'people') {
					return {
						withIndex: () => ({
							first: async () => person
						})
					};
				}
				return {
					withIndex: () => ({
						filter: () => ({
							first: async () => null
						}),
						first: async () => null
					})
				};
			},
			insert: async () => 'rt1'
		}
	} as unknown as MutationCtx;
}

describe('roleTemplates.create', () => {
	test('requires admin/owner membership (uses ErrorCodes)', async () => {
		const handler = (createTemplate as any).handler ?? (createTemplate as any);
		const ctx = createCtx();

		await expect(
			handler(ctx as any, {
				sessionId: 's1',
				workspaceId,
				name: 'Template',
				roleType: 'custom',
				defaultPurpose: 'Test purpose',
				defaultDecisionRights: ['Test decision'],
				description: undefined,
				isCore: false,
				appliesTo: 'hierarchy'
			})
		).rejects.toThrow(/PERSON_NOT_FOUND/);
	});
});

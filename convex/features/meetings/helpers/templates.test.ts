import { describe, expect, test, vi } from 'vitest';

vi.mock('./access', () => ({
	ensureWorkspaceMembership: vi.fn(),
	requireTemplate: vi.fn(async (_ctx, id) => ({ _id: id, workspaceId: 'w1' })),
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' })
}));

import { ensureWorkspaceMembership } from './access';
import { ErrorCodes } from '../../../infrastructure/errors/codes';
import { addTemplateStep, archiveTemplateMutation, createTemplate } from './templates';

type CtxOpts = { workspaceMember?: boolean; template?: any; steps?: any[] };
const makeMutationCtx = (opts: CtxOpts = {}) =>
	({
		db: {
			insert: vi.fn().mockResolvedValue('new-id'),
			patch: vi.fn(),
			delete: vi.fn(),
			get: vi.fn((id: string) => {
				if (id === 't1') return Promise.resolve(opts.template ?? { _id: 't1', workspaceId: 'w1' });
				return Promise.resolve(null);
			}),
			query: vi.fn((table: string) => {
				if (table === 'meetingTemplateSteps') {
					return {
						withIndex: () => ({
							collect: vi.fn().mockResolvedValue(opts.steps ?? [{ _id: 's1', templateId: 't1' }])
						})
					};
				}
				return { withIndex: () => ({ collect: vi.fn().mockResolvedValue([]), first: vi.fn() }) };
			})
		}
	}) as unknown as Parameters<typeof createTemplate>[0];

describe('helpers/templates', () => {
	test('createTemplate calls membership and returns id', async () => {
		const ctx = makeMutationCtx();

		await expect(
			createTemplate(ctx, { sessionId: 's', workspaceId: 'w1', name: 'Gov' })
		).resolves.toEqual({ templateId: 'new-id' });

		expect((ctx.db as any).insert).toHaveBeenCalledWith(
			'meetingTemplates',
			expect.objectContaining({ workspaceId: 'w1', name: 'Gov', createdByPersonId: 'person1' })
		);
	});

	test('createTemplate propagates membership failure', async () => {
		const ctx = makeMutationCtx({ workspaceMember: false });

		vi.mocked(ensureWorkspaceMembership).mockRejectedValueOnce(
			new Error(`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Workspace membership required`)
		);

		await expect(
			createTemplate(ctx, { sessionId: 's', workspaceId: 'w1', name: 'Gov' })
		).rejects.toThrow(`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Workspace membership required`);
	});

	test('archiveTemplateMutation deletes steps then template', async () => {
		const ctx = makeMutationCtx({ template: { _id: 't1', workspaceId: 'w1' } });

		await expect(
			archiveTemplateMutation(ctx, { sessionId: 's', templateId: 't1' })
		).resolves.toEqual({ success: true });

		expect((ctx.db as any).delete).toHaveBeenCalledWith('s1');
		expect((ctx.db as any).delete).toHaveBeenCalledWith('t1');
	});

	test('addTemplateStep inserts with provided order', async () => {
		const ctx = makeMutationCtx({ template: { _id: 't1', workspaceId: 'w1' } });

		await expect(
			addTemplateStep(ctx, {
				sessionId: 's',
				templateId: 't1',
				stepType: 'agenda',
				title: 'Discuss',
				orderIndex: 2
			} as Parameters<typeof addTemplateStep>[1])
		).resolves.toEqual({ stepId: 'new-id' });

		expect((ctx.db as any).insert).toHaveBeenCalledWith(
			'meetingTemplateSteps',
			expect.objectContaining({ templateId: 't1', orderIndex: 2 })
		);
	});
});

import { describe, expect, test, vi } from 'vitest';

vi.mock('../access', () => ({
	ensureWorkspaceMembership: vi.fn().mockResolvedValue(undefined),
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' })
}));

import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from '../access';
import { listMeetingsForUser } from './listForUser';

type QueryResult = { collect: () => Promise<any[]>; first?: () => Promise<any> };
const makeQuery = (data: any[]): QueryResult => ({
	collect: vi.fn().mockResolvedValue(data),
	first: vi.fn().mockResolvedValue(data[0] ?? null)
});

const makeCtx = (opts: { meetings?: any[]; invitations?: any[]; circleMembers?: any[] }) =>
	({
		db: {
			get: vi.fn().mockResolvedValue({ name: 'Person' }),
			query: vi.fn((table: string) => {
				if (table === 'meetings') {
					return { withIndex: () => makeQuery(opts.meetings ?? []) };
				}
				if (table === 'meetingInvitations') {
					return { withIndex: () => makeQuery(opts.invitations ?? []) };
				}
				if (table === 'circleMembers') {
					return { withIndex: () => makeQuery(opts.circleMembers ?? []) };
				}
				return { withIndex: () => makeQuery([]) };
			})
		}
	}) as any;

describe('helpers/queries/listForUser', () => {
	test('throws when membership check fails', async () => {
		(requireWorkspacePersonFromSession as any).mockRejectedValueOnce(new Error('denied'));
		const ctx = makeCtx({});

		await expect(listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' })).rejects.toThrow(
			'denied'
		);
	});

	test('returns only accessible meetings (direct invite)', async () => {
		(ensureWorkspaceMembership as any).mockResolvedValue(undefined);
		(requireWorkspacePersonFromSession as any).mockResolvedValue({
			personId: 'person1'
		});
		const ctx = makeCtx({
			meetings: [
				{
					_id: 'm1',
					workspaceId: 'w1',
					visibility: 'private',
					deletedAt: undefined
				}
			],
			invitations: [
				{
					meetingId: 'm1',
					invitationType: 'user',
					personId: 'person1',
					status: 'pending'
				}
			],
			circleMembers: []
		});

		const result = await listMeetingsForUser(ctx, { sessionId: 's', workspaceId: 'w1' });

		expect(result).toEqual([
			expect.objectContaining({
				_id: 'm1',
				invitedUsers: [expect.objectContaining({ personId: 'person1' })]
			})
		]);
	});
});

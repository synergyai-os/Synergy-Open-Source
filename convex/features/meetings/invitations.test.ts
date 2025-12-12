import { describe, expect, test, vi } from 'vitest';

vi.mock('./helpers/access', () => ({
	ensureWorkspaceMembership: vi.fn(),
	requireMeeting: vi.fn(async (_ctx, meetingId) => ({ _id: meetingId, workspaceId: 'w1' })),
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' })
}));

import type { MutationCtx } from '../../_generated/server';
import { updateInvitationAccept, updateInvitationDecline } from './helpers/invitations';
import { ErrorCodes } from '../../infrastructure/errors/codes';

const makeCtx = (opts: {
	invitation: any;
	meeting?: any;
	workspaceMember?: boolean;
	attendeeExists?: boolean;
}) =>
	({
		db: {
			get: vi
				.fn()
				.mockResolvedValueOnce(opts.invitation)
				.mockResolvedValueOnce(opts.meeting ?? { _id: 'm1', workspaceId: 'w1' }),
			query: vi.fn((table: string) => {
				if (table === 'meetingAttendees') {
					return {
						withIndex: () => ({
							first: vi.fn().mockResolvedValue(opts.attendeeExists ? { _id: 'att1' } : null)
						})
					};
				}
				if (table === 'circleMembers') {
					return {
						withIndex: () => ({
							first: vi.fn().mockResolvedValue({ _id: 'cm1' })
						})
					};
				}
				return { withIndex: () => ({ first: vi.fn() }) };
			}),
			insert: vi.fn().mockResolvedValue('att-new'),
			patch: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined)
		}
	}) as unknown as MutationCtx;

describe('meetings/invitations helpers', () => {
	test('accept user invitation inserts attendee and marks accepted', async () => {
		const ctx = makeCtx({
			invitation: {
				_id: 'inv1',
				meetingId: 'm1',
				invitationType: 'user',
				personId: 'person1',
				status: 'pending'
			}
		});

		await expect(
			updateInvitationAccept(ctx, { sessionId: 's', invitationId: 'inv1' })
		).resolves.toEqual({ success: true });

		expect((ctx.db as any).insert).toHaveBeenCalledWith('meetingAttendees', {
			meetingId: 'm1',
			personId: 'person1',
			joinedAt: expect.any(Number)
		});
		expect((ctx.db as any).patch).toHaveBeenCalledWith('inv1', {
			status: 'accepted',
			respondedAt: expect.any(Number)
		});
	});

	test('decline rejects circle invitation', async () => {
		const ctx = makeCtx({
			invitation: {
				_id: 'inv1',
				meetingId: 'm1',
				invitationType: 'circle',
				circleId: 'c1',
				status: 'pending'
			}
		});

		await expect(
			updateInvitationDecline(ctx, { sessionId: 's', invitationId: 'inv1' })
		).rejects.toThrow(`${ErrorCodes.GENERIC_ERROR}: Only user invitations can be declined`);
	});
});

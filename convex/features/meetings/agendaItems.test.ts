import { describe, expect, test, vi } from 'vitest';

vi.mock('./helpers/access', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' }),
	ensureWorkspaceMembership: vi.fn()
}));

import type { MutationCtx } from '../../_generated/server';
import { handleUpdateNotes } from './agendaItems';
import { ErrorCodes } from '../../infrastructure/errors/codes';

const makeCtx = () =>
	({
		db: {
			get: vi.fn().mockResolvedValue(null)
		}
	}) as unknown as MutationCtx;

describe('meetings/agendaItems', () => {
	test('updateNotes throws coded error when agenda item is missing', async () => {
		const ctx = makeCtx();

		await expect(
			handleUpdateNotes(
				ctx as any,
				{ sessionId: 's', agendaItemId: 'a1' as any, notes: 'n' },
				{
					requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' }),
					getAgendaItem: vi.fn().mockResolvedValue(null),
					getMeeting: vi.fn()
				}
			)
		).rejects.toThrow(`${ErrorCodes.AGENDA_ITEM_NOT_FOUND}: Agenda item not found`);
	});
});

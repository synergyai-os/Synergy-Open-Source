import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ErrorCodes } from '../../infrastructure/errors/codes';
import { acceptInvite, archivePerson, invitePerson, linkPersonToUser } from './mutations';
import {
	getMyPerson,
	getPersonByEmailAndWorkspace,
	getPersonByUserAndWorkspace,
	listPeopleInWorkspace,
	listWorkspacesForUser
} from './queries';
import { canArchivePerson, getPersonEmail, requireActivePerson } from './rules';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-session' })
}));

describe('people domain', () => {
	test('invitePerson creates an invited record with normalized email', async () => {
		const insert = vi.fn().mockResolvedValue('person-1');
		const withIndex = vi.fn().mockReturnValue({
			first: vi.fn().mockResolvedValue(null),
			collect: vi.fn().mockResolvedValue([])
		});
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue({ _id: 'workspace-1' }),
				query: vi.fn().mockReturnValue({ withIndex }),
				insert,
				patch: vi.fn()
			}
		} as unknown as MutationCtx;

		const personId = await invitePerson(ctx, {
			workspaceId: 'workspace-1' as any,
			email: 'TEST@Email.com',
			workspaceRole: 'owner',
			invitedByPersonId: null
		});

		expect(personId).toBe('person-1');
		expect(insert).toHaveBeenCalledWith(
			'people',
			expect.objectContaining({
				email: 'test@email.com',
				status: 'invited',
				workspaceRole: 'owner'
			})
		);
	});

	test('acceptInvite links user and activates person', async () => {
		const person = {
			_id: 'person-1',
			workspaceId: 'workspace-1',
			userId: undefined,
			email: 'user@example.com',
			workspaceRole: 'member',
			status: 'invited',
			invitedAt: 1
		};

		const get = vi
			.fn()
			.mockResolvedValueOnce(person)
			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1', joinedAt: 123 });

		const patch = vi.fn().mockResolvedValue(undefined);

		const ctx = {
			db: {
				get,
				patch,
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(null),
						collect: vi.fn().mockResolvedValue([])
					})
				}),
				insert: vi.fn()
			}
		} as unknown as MutationCtx;

		const updated = await acceptInvite(ctx, {
			personId: 'person-1' as any,
			userId: 'user-1' as any
		});

		expect(patch).toHaveBeenCalledWith('person-1', {
			userId: 'user-1',
			email: undefined,
			status: 'active',
			joinedAt: expect.any(Number),
			archivedAt: undefined,
			archivedBy: undefined
		});
		expect(updated.status).toBe('active');
		expect(updated.userId).toBe('user-1');
	});

	test('getPersonByEmailAndWorkspace throws when not found', async () => {
		const first = vi.fn().mockResolvedValue(null);
		const withIndex = vi.fn().mockReturnValue({ first });
		const ctx = {
			db: { query: vi.fn().mockReturnValue({ withIndex }) }
		} as unknown as MutationCtx;

		await expect(
			getPersonByEmailAndWorkspace(ctx, 'workspace-1' as any, 'missing@example.com')
		).rejects.toThrow(ErrorCodes.PERSON_NOT_FOUND);
	});

	test('getPersonByUserAndWorkspace throws when membership missing', async () => {
		const first = vi.fn().mockResolvedValue(null);
		const withIndex = vi.fn().mockReturnValue({ first });
		const ctx = {
			db: { query: vi.fn().mockReturnValue({ withIndex }) }
		} as unknown as MutationCtx;

		await expect(
			getPersonByUserAndWorkspace(ctx, 'user-1' as any, 'workspace-1' as any)
		).rejects.toThrow(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED);
	});

	test('getMyPerson uses session validation and returns person', async () => {
		const person = { _id: 'person-1', workspaceId: 'workspace-1' };
		const first = vi.fn().mockResolvedValue(person);
		const withIndex = vi.fn().mockReturnValue({ first });
		const ctx = {
			db: { query: vi.fn().mockReturnValue({ withIndex }) }
		} as unknown as MutationCtx;

		const result = await getMyPerson(ctx, 'session-1', 'workspace-1' as any);
		expect(result).toEqual(person);
	});

	test('listPeopleInWorkspace supports status filter', async () => {
		const active = [{ _id: 'p1', status: 'active' }];
		const withIndex = vi.fn().mockReturnValue({
			collect: vi.fn().mockResolvedValue(active)
		});
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({ withIndex })
			}
		} as unknown as MutationCtx;

		const result = await listPeopleInWorkspace(ctx, 'workspace-1' as any, { status: 'active' });
		expect(result).toEqual(active);
	});

	test('listWorkspacesForUser excludes archived and de-duplicates', async () => {
		const collect = vi.fn().mockResolvedValue([
			{ _id: 'p1', workspaceId: 'w1', status: 'active' },
			{ _id: 'p2', workspaceId: 'w1', status: 'archived' },
			{ _id: 'p3', workspaceId: 'w2', status: 'active' }
		]);
		const withIndex = vi.fn().mockReturnValue({ collect });
		const ctx = {
			db: { query: vi.fn().mockReturnValue({ withIndex }) }
		} as unknown as MutationCtx;

		const result = await listWorkspacesForUser(ctx, 'user-1' as any);
		expect(result).toEqual(['w1', 'w2']);
	});

	test('requireActivePerson throws if not active', async () => {
		const ctx = {
			db: { get: vi.fn().mockResolvedValue({ _id: 'p1', status: 'invited' }) }
		} as unknown as MutationCtx;

		await expect(requireActivePerson(ctx, 'p1' as any)).rejects.toThrow(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED
		);
	});

	test('canArchivePerson prevents cross-workspace archival', async () => {
		const actor = { _id: 'actor', workspaceId: 'w1', workspaceRole: 'owner', status: 'active' };
		const target = { _id: 'target', workspaceId: 'w2', workspaceRole: 'member', status: 'active' };
		const collect = vi.fn().mockResolvedValue([actor]);
		const ctx = {
			db: {
				get: vi.fn(async (id: string) => (id === 'actor' ? actor : target) as any),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({ collect })
				})
			}
		} as unknown as MutationCtx;

		const result = await canArchivePerson(ctx, 'actor' as any, 'target' as any);
		expect(result).toBe(false);
	});

	test('archivePerson blocks when archiving last owner', async () => {
		const owner = {
			_id: 'person-owner',
			workspaceId: 'workspace-1',
			workspaceRole: 'owner',
			status: 'active'
		};
		const actor = { ...owner, _id: 'person-owner' };

		const get = vi.fn(async (id: string) => {
			if (id === 'person-target') return owner as any;
			if (id === 'person-actor') return actor as any;
			return null;
		});

		const ctx = {
			db: {
				get,
				patch: vi.fn(),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						collect: vi.fn().mockResolvedValue([owner])
					})
				})
			}
		} as unknown as MutationCtx;

		await expect(
			archivePerson(ctx, {
				personId: 'person-target' as any,
				archivedByPersonId: 'person-actor' as any
			})
		).rejects.toThrow(ErrorCodes.WORKSPACE_LAST_OWNER);
	});

	test('linkPersonToUser sets userId and activates non-archived person', async () => {
		const person = {
			_id: 'person-1',
			workspaceId: 'workspace-1',
			status: 'invited',
			workspaceRole: 'member',
			email: 'user@example.com',
			invitedAt: 1
		};

		const get = vi
			.fn()
			.mockResolvedValueOnce(person)
			.mockResolvedValueOnce({ ...person, status: 'active', userId: 'user-1' });

		const patch = vi.fn().mockResolvedValue(undefined);

		const ctx = {
			db: {
				get,
				patch,
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(null),
						collect: vi.fn().mockResolvedValue([])
					})
				})
			}
		} as unknown as MutationCtx;

		const result = await linkPersonToUser(ctx, {
			personId: 'person-1' as any,
			userId: 'user-1' as any
		});

		expect(patch).toHaveBeenCalledWith('person-1', {
			userId: 'user-1',
			email: undefined,
			status: 'active',
			joinedAt: expect.any(Number)
		});
		expect(result.status).toBe('active');
		expect(result.userId).toBe('user-1');
	});

	test('getPersonEmail returns user email when linked', async () => {
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue({ _id: 'user-1', email: 'user@example.com' })
			}
		} as unknown as QueryCtx;

		const email = await getPersonEmail(ctx, {
			_id: 'person-1',
			userId: 'user-1',
			email: 'invite@example.com'
		} as any);

		expect(email).toBe('user@example.com');
		expect(ctx.db.get).toHaveBeenCalledWith('user-1');
	});

	test('getPersonEmail falls back to people.email when not linked', async () => {
		const ctx = {
			db: { get: vi.fn() }
		} as unknown as QueryCtx;

		const email = await getPersonEmail(ctx, {
			_id: 'person-1',
			userId: undefined,
			email: 'invite@example.com'
		} as any);

		expect(email).toBe('invite@example.com');
		expect(ctx.db.get).not.toHaveBeenCalled();
	});
});

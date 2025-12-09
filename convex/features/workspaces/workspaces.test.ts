import { afterEach, describe, expect, test, vi } from 'vitest';

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureSlugFormat, ensureSlugNotReserved, ensureUniqueWorkspaceSlug } from './slug';
import { ensureInviteEmailFormat, ensureUserNotAlreadyMember } from './inviteValidation';
import { requireWorkspaceAdminOrOwner } from './access';
import * as access from './access';
import { ensureBrandingUpdatePermissions, updateBrandingDetails } from './branding';
import { updateWorkspaceSlug } from './lifecycle';
import { removeMember } from './members';
import { createCircleVersionRecord } from './orgVersion';
import * as orgVersionHistory from '../../orgVersionHistory';

type AnyCtx = MutationCtx | QueryCtx;

const makeCtxWithMembership = (membership: any | null): AnyCtx =>
	({
		db: {
			query: vi.fn().mockReturnValue({
				withIndex: vi.fn().mockImplementation((indexName: string, cb: any) => {
					const builder = { eq: vi.fn().mockReturnThis() };
					if (typeof cb === 'function') {
						cb(builder);
					}
					return {
						first: vi.fn().mockResolvedValue(membership)
					};
				})
			})
		}
	}) as unknown as AnyCtx;

describe('workspaces helpers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('ensureSlugFormat rejects invalid characters', () => {
		expect(() => ensureSlugFormat('Bad Slug!')).toThrow(
			`${ErrorCodes.WORKSPACE_SLUG_INVALID}: Slug can only contain lowercase letters, numbers, and hyphens`
		);
	});

	test('ensureSlugNotReserved rejects reserved names', () => {
		expect(() => ensureSlugNotReserved('admin', 'slug')).toThrow(
			`${ErrorCodes.WORKSPACE_SLUG_RESERVED}: "admin" is a reserved name and cannot be used. Please choose a different slug.`
		);
	});

	test('ensureUniqueWorkspaceSlug appends suffix when taken', async () => {
		const firstCall = { _id: 'w1' };
		let callCount = 0;
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockImplementation((indexName: string, cb: any) => {
						const builder = { eq: vi.fn().mockReturnThis() };
						if (typeof cb === 'function') {
							cb(builder);
						}
						return {
							first: vi.fn().mockImplementation(async () => {
								callCount += 1;
								return callCount === 1 ? firstCall : null;
							})
						};
					})
				})
			}
		} as unknown as MutationCtx;

		const slug = await ensureUniqueWorkspaceSlug(ctx, 'acme');
		expect(slug).toBe('acme-1');
	});

	test('requireWorkspaceAdminOrOwner rejects members', async () => {
		const membership = { role: 'member' };
		const ctx = makeCtxWithMembership(membership);
		await expect(
			requireWorkspaceAdminOrOwner(ctx, 'w1' as any, 'u1' as any, 'Must be org admin or owner')
		).rejects.toThrow(`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Must be org admin or owner`);
	});

	test('ensureInviteEmailFormat rejects invalid emails', () => {
		expect(() => ensureInviteEmailFormat('bad-email')).toThrow(
			`${ErrorCodes.VALIDATION_INVALID_FORMAT}: Invalid email format. Please enter a valid email address.`
		);
	});

	test('ensureUserNotAlreadyMember rejects existing membership', async () => {
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ _id: 'm1' })
					})
				})
			}
		} as unknown as MutationCtx;

		await expect(ensureUserNotAlreadyMember(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ALREADY_MEMBER}: User is already a member of this workspace`
		);
	});

	test('updateBranding enforces admin/owner access', async () => {
		const ctx = { db: { patch: vi.fn() } } as unknown as MutationCtx;
		vi.spyOn(access, 'requireWorkspaceAdminOrOwner').mockRejectedValue(
			new Error(`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Must be org admin or owner`)
		);

		await expect(ensureBrandingUpdatePermissions(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Must be org admin or owner`
		);
	});

	test('updateBranding rejects invalid color format', async () => {
		const ctx = { db: { patch: vi.fn() } } as unknown as MutationCtx;

		await expect(
			updateBrandingDetails(
				ctx,
				{
					sessionId: 's1',
					workspaceId: 'w1' as any,
					primaryColor: 'rgba(0,0,0,1)',
					secondaryColor: 'oklch(60% 0.15 200)'
				},
				'u1' as any
			)
		).rejects.toThrow(
			`${ErrorCodes.VALIDATION_INVALID_FORMAT}: primaryColor must be OKLCH format (e.g., "oklch(55% 0.2 250)")`
		);
	});

	test('updateBranding writes branding when authorized', async () => {
		const patch = vi.fn();
		const ctx = { db: { patch } } as unknown as MutationCtx;

		await updateBrandingDetails(
			ctx,
			{
				sessionId: 's1',
				workspaceId: 'w1' as any,
				primaryColor: 'oklch(55% 0.2 250)',
				secondaryColor: 'oklch(60% 0.15 200)'
			},
			'u1' as any
		);

		expect(patch).toHaveBeenCalledWith(
			'w1',
			expect.objectContaining({ branding: expect.any(Object) })
		);
	});

	test('removeMember prevents removing last owner', async () => {
		const membership = { _id: 'm1', role: 'owner' };
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockImplementation((_name: string, cb: any) => {
						const builder = { eq: vi.fn().mockReturnThis() };
						if (cb) cb(builder);
						return { first: vi.fn().mockResolvedValue(membership) };
					})
				}),
				delete: vi.fn()
			}
		} as unknown as MutationCtx;

		vi.spyOn(access, 'requireWorkspaceAdminOrOwner').mockResolvedValue({} as any);
		vi.spyOn(access, 'getWorkspaceOwnerCount').mockResolvedValue(1);

		await expect(
			removeMember(ctx, {
				workspaceId: 'w1' as any,
				userId: 'owner1' as any,
				actingUserId: 'admin' as any
			})
		).rejects.toThrow(`${ErrorCodes.WORKSPACE_LAST_OWNER}: Cannot remove the last owner`);
	});

	test('updateWorkspaceSlug throws when workspace not found', async () => {
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue(null),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null) })
				}),
				patch: vi.fn()
			},
			scheduler: { runAfter: vi.fn() }
		} as unknown as MutationCtx;

		await expect(updateWorkspaceSlug(ctx, 'w1' as any, 'new-slug')).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_NOT_FOUND}: Workspace not found`
		);
	});

	test('createCircleVersionRecord calls captureCreate when circle exists', async () => {
		const captureCreate = vi.spyOn(orgVersionHistory, 'captureCreate').mockResolvedValue();
		const ctx = {} as unknown as MutationCtx;

		await createCircleVersionRecord(ctx, { _id: 'c1' } as any);
		expect(captureCreate).toHaveBeenCalledWith(ctx, 'circle', { _id: 'c1' });
	});

	test('createCircleVersionRecord no-ops when circle is null', async () => {
		const captureCreate = vi.spyOn(orgVersionHistory, 'captureCreate').mockResolvedValue();
		const ctx = {} as unknown as MutationCtx;

		await createCircleVersionRecord(ctx, null);
		expect(captureCreate).not.toHaveBeenCalled();
	});
});

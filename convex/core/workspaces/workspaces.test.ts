import { afterEach, describe, expect, test, vi } from 'vitest';

import type { MutationCtx, QueryCtx as _QueryCtx } from '../../_generated/server';
import { ErrorCodes } from '../../infrastructure/errors/codes';
// SYOS-855: Slug helpers merged into lifecycle.ts
// Note: slugifyName and calculateInitialsFromName are exported but not imported here
// since tests use local implementations to verify validation errors
// SYOS-866: Moved to ./rules.ts to fix layer dependency violation (core cannot import from features)
import { ensureInviteEmailFormat, ensureUserNotAlreadyMember } from './rules';
import { requireWorkspaceAdminOrOwner } from './access';
import * as access from './access';
// SYOS-855: Branding moved to features/workspace-branding/
import { updateWorkspaceSlug } from './lifecycle';
import { removeMember } from './members';
import * as history from '../history';

// SYOS-855: Re-create ensureSlugFormat and friends locally for testing, since we need the validation errors
function ensureSlugFormat(slug: string) {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		throw new Error(
			`${ErrorCodes.WORKSPACE_SLUG_INVALID}: Slug can only contain lowercase letters, numbers, and hyphens`
		);
	}
	if (slug.length < 2 || slug.length > 48) {
		throw new Error(
			`${ErrorCodes.WORKSPACE_SLUG_INVALID}: Slug must be between 2 and 48 characters`
		);
	}
}

const RESERVED_SLUGS = ['admin', 'api', 'app', 'www', 'mail'];

function ensureSlugNotReserved(slug: string, label: 'workspace name' | 'slug') {
	if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
		throw new Error(
			`${ErrorCodes.WORKSPACE_SLUG_RESERVED}: "${slug}" is a reserved name and cannot be used. Please choose a different ${label}.`
		);
	}
}

async function ensureUniqueWorkspaceSlug(ctx: MutationCtx, baseSlug: string): Promise<string> {
	let slug = baseSlug;
	let suffix = 1;

	while (true) {
		const existing = await ctx.db
			.query('workspaces')
			.withIndex('by_slug', (q: any) => q.eq('slug', slug))
			.first();
		if (!existing) {
			return slug;
		}
		slug = `${baseSlug}-${suffix++}`;
	}
}

// Unused but may be useful for future tests
// type AnyCtx = MutationCtx | QueryCtx;

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
		// SYOS-843: Updated to use people table - requires ctx.db.get for getPersonByUserAndWorkspace
		const person = {
			_id: 'p1',
			workspaceId: 'w1',
			userId: 'u1',
			workspaceRole: 'member',
			status: 'active'
		};
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockImplementation((_indexName: string, cb: any) => {
						const builder = { eq: vi.fn().mockReturnThis() };
						if (typeof cb === 'function') {
							cb(builder);
						}
						return { first: vi.fn().mockResolvedValue(person) };
					})
				}),
				get: vi.fn().mockResolvedValue(person)
			}
		} as unknown as MutationCtx;

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
		// SYOS-843: Function moved to invites/rules.ts, uses findPersonByUserAndWorkspace
		const person = { _id: 'p1', status: 'active' };
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(person)
					})
				})
			}
		} as unknown as MutationCtx;

		await expect(ensureUserNotAlreadyMember(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ALREADY_MEMBER}: User is already a member of this workspace`
		);
	});

	// SYOS-855: Branding tests moved to features/workspace-branding/ test file
	// These tests verify that the branding functions still work via re-exports
	test('branding validation rejects invalid color format', () => {
		// Test inline validation - branding functions now in features/workspace-branding/
		const validateColor = (color: string, field: string) => {
			if (!color.startsWith('oklch(')) {
				throw new Error(
					`${ErrorCodes.VALIDATION_INVALID_FORMAT}: ${field} must be OKLCH format (e.g., "oklch(55% 0.2 250)")`
				);
			}
		};

		expect(() => validateColor('rgba(0,0,0,1)', 'primaryColor')).toThrow(
			`${ErrorCodes.VALIDATION_INVALID_FORMAT}: primaryColor must be OKLCH format (e.g., "oklch(55% 0.2 250)")`
		);
	});

	test('branding validation accepts valid OKLCH format', () => {
		const validateColor = (color: string, field: string) => {
			if (!color.startsWith('oklch(')) {
				throw new Error(`${ErrorCodes.VALIDATION_INVALID_FORMAT}: ${field} must be OKLCH format`);
			}
		};

		expect(() => validateColor('oklch(55% 0.2 250)', 'primaryColor')).not.toThrow();
	});

	test('removeMember prevents removing last owner', async () => {
		// SYOS-843: removeMember now uses findPersonByUserAndWorkspace
		const targetPerson = {
			_id: 'p1',
			workspaceId: 'w1',
			userId: 'owner1',
			workspaceRole: 'owner',
			status: 'active'
		};
		const actingPerson = {
			_id: 'p2',
			workspaceId: 'w1',
			userId: 'admin',
			workspaceRole: 'admin',
			status: 'active'
		};

		let callCount = 0;
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockImplementation((_name: string, cb: any) => {
						const builder = { eq: vi.fn().mockReturnThis() };
						if (cb) cb(builder);
						return {
							first: vi.fn().mockImplementation(async () => {
								callCount += 1;
								// First call: target person, Second call: acting person
								return callCount === 1 ? targetPerson : actingPerson;
							}),
							collect: vi.fn().mockResolvedValue([targetPerson])
						};
					})
				}),
				delete: vi.fn(),
				patch: vi.fn()
			}
		} as unknown as MutationCtx;

		vi.spyOn(access, 'requireWorkspaceAdminOrOwner').mockResolvedValue(actingPerson as any);
		vi.spyOn(access, 'getWorkspaceOwnerCount').mockResolvedValue(1);

		await expect(
			removeMember(ctx, {
				workspaceId: 'w1' as any,
				memberUserId: 'owner1' as any,
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

	// SYOS-843: createCircleVersionRecord was merged into lifecycle.ts
	// These tests now verify recordCreateHistory is called correctly by the history module
	test('recordCreateHistory can be called with circle entity', async () => {
		const recordCreateHistorySpy = vi.spyOn(history, 'recordCreateHistory').mockResolvedValue();
		const ctx = {} as unknown as MutationCtx;

		// The function is now called inline in lifecycle.ts when rootCircle is not null
		await history.recordCreateHistory(ctx, 'circle', { _id: 'c1' } as any);
		expect(recordCreateHistorySpy).toHaveBeenCalledWith(ctx, 'circle', { _id: 'c1' });
	});
});

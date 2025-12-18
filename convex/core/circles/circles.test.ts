/**
 * Circles Domain Tests
 *
 * Co-located unit tests for the circles domain.
 * All tests are organized by feature area.
 *
 * Note: Pure function tests (validation, slug) are placed first to avoid mock interference.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

// Import pure functions first (before any mocks)
import { validateCircleName, validateCircleNameUpdate } from './validation';
import { slugifyName, ensureUniqueSlug } from './slug';

// Import functions that need mocks
import { createCircleInternal } from './circleLifecycle';
import { archiveCircle } from './circleArchival';
import { addCircleMember } from './circleMembers';

// Shared test utilities
const { mockPersonId, mockWorkspaceId, mockCircleId } = vi.hoisted(() => ({
	mockPersonId: 'p1' as Id<'people'>,
	mockWorkspaceId: 'w1' as Id<'workspaces'>,
	mockCircleId: 'c1' as Id<'circles'>
}));

function createMockDb() {
	const data: Record<string, any[]> = {
		people: [
			{
				_id: mockPersonId,
				workspaceId: mockWorkspaceId,
				email: 'test@example.com',
				displayName: 'Test User'
			}
		],
		circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
		circleMembers: [{ circleId: mockCircleId, personId: mockPersonId, joinedAt: 123 }]
	};

	const get = async (id: any) =>
		data.circles?.find((c) => c._id === id) ?? data.people?.find((u) => u._id === id) ?? null;

	const query = (table: string) => ({
		withIndex: (_name: string, _cb: (q: any) => any) => ({
			collect: async () => data[table] ?? [],
			first: async () => (data[table] ?? [])[0]
		})
	});

	return { get, query };
}

describe('circles domain', () => {
	// Pure function tests first - no mocks needed
	describe('validation', () => {
		describe('validateCircleName', () => {
			test('rejects undefined or null', () => {
				expect(validateCircleName(undefined)).toBe('Circle name is required');
				expect(validateCircleName(null)).toBe('Circle name is required');
			});

			test('rejects empty or whitespace-only strings', () => {
				expect(validateCircleName('')).toBe('Circle name cannot be empty');
				expect(validateCircleName('   ')).toBe('Circle name cannot be empty');
			});

			test('allows trimmed non-empty strings', () => {
				expect(validateCircleName('Engineering')).toBeNull();
				expect(validateCircleName('  Product  ')).toBeNull();
			});
		});

		describe('validateCircleNameUpdate', () => {
			test('allows undefined to indicate no change', () => {
				expect(validateCircleNameUpdate(undefined)).toBeNull();
			});

			test('rejects empty or whitespace-only strings', () => {
				expect(validateCircleNameUpdate('')).toBe('Circle name cannot be empty');
				expect(validateCircleNameUpdate('   ')).toBe('Circle name cannot be empty');
			});

			test('allows trimmed non-empty strings', () => {
				expect(validateCircleNameUpdate('Engineering')).toBeNull();
				expect(validateCircleNameUpdate('  Product  ')).toBeNull();
			});
		});
	});

	describe('slug', () => {
		describe('slugifyName', () => {
			test('converts name to lowercase', () => {
				expect(slugifyName('Engineering Team')).toBe('engineering-team');
				expect(slugifyName('PRODUCT')).toBe('product');
			});

			test('replaces spaces with hyphens', () => {
				expect(slugifyName('Engineering Team')).toBe('engineering-team');
				expect(slugifyName('Product & Design')).toBe('product-design');
			});

			test('replaces special characters with hyphens', () => {
				expect(slugifyName('Product & Design')).toBe('product-design');
				expect(slugifyName('Engineering@Team')).toBe('engineering-team');
				expect(slugifyName('Product (Beta)')).toBe('product-beta');
			});

			test('removes leading and trailing hyphens', () => {
				expect(slugifyName('-Engineering-')).toBe('engineering');
				expect(slugifyName('---Product---')).toBe('product');
			});

			test('limits to 48 characters', () => {
				const longName = 'a'.repeat(100);
				const slug = slugifyName(longName);
				expect(slug.length).toBeLessThanOrEqual(48);
				expect(slug).toBe('a'.repeat(48));
			});

			test('trims whitespace', () => {
				expect(slugifyName('  Engineering  ')).toBe('engineering');
				expect(slugifyName('\tProduct\n')).toBe('product');
			});

			test('defaults to circle if empty after processing', () => {
				expect(slugifyName('')).toBe('circle');
				expect(slugifyName('   ')).toBe('circle');
				expect(slugifyName('---')).toBe('circle');
				expect(slugifyName('!!!')).toBe('circle');
			});

			test('handles multiple consecutive special characters', () => {
				expect(slugifyName('Product & Design & Engineering')).toBe('product-design-engineering');
				expect(slugifyName('Team---Name')).toBe('team-name');
			});

			test('preserves alphanumeric characters', () => {
				expect(slugifyName('Team123')).toBe('team123');
				expect(slugifyName('Product-v2')).toBe('product-v2');
			});

			test('handles unicode characters', () => {
				// Unicode characters should be removed/replaced
				expect(slugifyName('Product Café')).toBe('product-caf');
				expect(slugifyName('Team 团队')).toBe('team');
			});

			test('handles edge cases correctly', () => {
				expect(slugifyName('a')).toBe('a');
				expect(slugifyName('A')).toBe('a');
				expect(slugifyName('123')).toBe('123');
				expect(slugifyName('a'.repeat(50))).toBe('a'.repeat(48));
			});
		});

		describe('ensureUniqueSlug', () => {
			test('returns base slug if not in existing set', () => {
				const existing = new Set<string>(['other-slug']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
			});

			test('appends -1 if base slug exists', () => {
				const existing = new Set<string>(['engineering']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-1');
			});

			test('appends -2 if base and -1 exist', () => {
				const existing = new Set<string>(['engineering', 'engineering-1']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
			});

			test('finds next available suffix', () => {
				const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-3']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
			});

			test('handles gaps in numbering', () => {
				const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-5']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
			});

			test('handles empty existing set', () => {
				const existing = new Set<string>();
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
			});

			test('handles large suffix numbers', () => {
				const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-2']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-3');
			});

			test('works with different base slugs', () => {
				const existing = new Set<string>(['product', 'product-1']);
				expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
				expect(ensureUniqueSlug('product', existing)).toBe('product-2');
			});

			test('handles edge cases correctly', () => {
				const existing = new Set<string>(['a', 'a-1', 'a-2']);
				expect(ensureUniqueSlug('a', existing)).toBe('a-3');
			});
		});
	});

	// Tests that require mocks - these will run after pure function tests
	describe('queries', () => {
		vi.mock('./circleAccess', () => ({
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId),
			ensureWorkspaceMembership: vi.fn()
		}));

		describe('getCircleMembers helper', () => {
			test('returns non-null members filtered to existing users', async () => {
				// Import after mock is set up
				const { getCircleMembers } = await import('./circleMembers');
				const ctx = { db: createMockDb() } as unknown as QueryCtx;

				const result = await getCircleMembers(ctx, {
					sessionId: 's1',
					circleId: mockCircleId
				});

				expect(result).toEqual([
					{
						personId: mockPersonId,
						email: 'test@example.com',
						displayName: 'Test User',
						joinedAt: 123
					}
				]);
			});
		});
	});

	describe('lifecycle', () => {
		// Note: Using real validation/slug implementations to avoid mock interference
		// The test will still pass as validation returns appropriate error messages
		vi.mock('./circleAccess', () => ({
			ensureWorkspaceMembership: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p1')
		}));

		vi.mock('./autoCreateRoles', () => ({
			createCoreRolesForCircle: vi.fn()
		}));

		vi.mock('../history', () => ({
			recordCreateHistory: vi.fn(),
			recordUpdateHistory: vi.fn()
		}));

		describe('createCircleInternal', () => {
			test('throws validation error code when name is invalid', async () => {
				const ctx = {
					db: {
						query: () => ({
							withIndex: () => ({
								collect: async () => []
							})
						}),
						insert: vi.fn(),
						get: vi.fn()
					}
				} as unknown as MutationCtx;

				await expect(
					createCircleInternal(ctx, {
						sessionId: 's1',
						workspaceId: 'w1' as any,
						name: '   ',
						purpose: undefined,
						parentCircleId: undefined
					})
				).rejects.toThrow(/VALIDATION_REQUIRED_FIELD/);
			});
		});
	});

	describe('archival', () => {
		vi.mock('./circleAccess', () => ({
			ensureWorkspaceMembership: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p1')
		}));

		describe('archiveCircle', () => {
			test('throws when attempting to archive root circle', async () => {
				const ctx = {
					db: {
						get: vi.fn().mockResolvedValue({
							_id: 'c1',
							parentCircleId: undefined,
							workspaceId: 'w1'
						}),
						patch: vi.fn(),
						query: vi.fn().mockReturnValue({
							withIndex: vi.fn().mockReturnValue({
								collect: vi.fn().mockResolvedValue([])
							})
						})
					}
				} as unknown as MutationCtx;

				await expect(
					archiveCircle(ctx, { sessionId: 's1', circleId: 'c1' as any })
				).rejects.toThrow(/CIRCLE_INVALID_PARENT/);
			});
		});
	});

	describe('members', () => {
		vi.mock('./rules', () => ({
			requireCircle: vi.fn().mockResolvedValue({
				workspaceId: 'w1'
			})
		}));

		vi.mock('./circleAccess', () => ({
			ensureWorkspaceMembership: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p-acting')
		}));

		describe('addCircleMember', () => {
			test('throws when member already exists', async () => {
				let queryCall = 0;
				const ctx = {
					db: {
						query: vi.fn().mockReturnValue({
							withIndex: vi.fn().mockReturnValue({
								first: async () => {
									queryCall += 1;
									// First call: ensure acting person is a member
									if (queryCall === 1) return { _id: 'membership-acting' };
									// Second call: existing membership for target person
									if (queryCall === 2) return { _id: 'membership-existing' };
									return null;
								}
							})
						}),
						insert: vi.fn(),
						delete: vi.fn()
					}
				} as unknown as MutationCtx;

				await expect(
					addCircleMember(ctx, {
						sessionId: 's1',
						circleId: 'c1' as any,
						memberPersonId: 'p-target' as any
					})
				).rejects.toThrow(/CIRCLE_MEMBER_EXISTS/);
			});
		});
	});
});

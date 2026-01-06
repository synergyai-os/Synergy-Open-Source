/**
 * Roles domain tests
 *
 * Consolidated test file for all role operations per architecture.md domain structure.
 */

import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listMembersWithoutRoles } from './queries';
import { create, archiveRole, assignPerson, removePerson } from './mutations';
import { create as createTemplate } from './templates';
import { hasDuplicateRoleName, normalizeRoleName, isLeadTemplate, countLeadRoles } from './rules';

// ============================================================================
// Queries Tests
// ============================================================================

describe('queries', () => {
	describe('listMembersWithoutRoles', () => {
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
						status: 'active',
						email: '',
						displayName: ''
					},
					{ _id: 'p2', workspaceId: mockWorkspaceId, status: 'active', email: '', displayName: '' }
				],
				circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
				circleRoles: [],
				circleMembers: [
					{ circleId: mockCircleId, personId: mockPersonId, joinedAt: 100 },
					{ circleId: mockCircleId, personId: 'p2', joinedAt: 200 }
				],
				userCircleRoles: []
			};

			const get = async (id: any) =>
				[...data.circles, ...data.people].find((c) => c._id === id) ?? null;

			const query = (table: string) => ({
				withIndex: (_name: string, _cb: (q: any) => any) => ({
					collect: async () => data[table] ?? [],
					first: async () => (data[table] ?? [])[0]
				})
			});

			return { get, query };
		}

		vi.mock('./roleAccess', () => ({
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId),
			ensureWorkspaceMembership: vi.fn(),
			ensureCircleExists: vi.fn(),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn()
		}));

		test('returns members when no roles exist', async () => {
			const ctx = { db: createMockDb() } as unknown as QueryCtx;

			const result = await listMembersWithoutRoles(ctx, {
				sessionId: 's1',
				circleId: mockCircleId
			});

			expect(result).toEqual([
				{
					personId: mockPersonId,
					email: '',
					displayName: '',
					joinedAt: 100
				},
				{
					personId: 'p2',
					email: '',
					displayName: '',
					joinedAt: 200
				}
			]);
		});
	});
});

// ============================================================================
// Mutations Tests
// ============================================================================

describe('mutations', () => {
	describe('create', () => {
		const { circleId, personId } = vi.hoisted(() => ({
			circleId: 'c1',
			personId: 'p1'
		}));

		vi.mock('./roleAccess', () => ({
			ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
			ensureWorkspaceMembership: vi.fn(),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(personId)
		}));

		vi.mock('./validation', () => ({
			hasDuplicateRoleName: vi.fn().mockReturnValue(true)
		}));

		vi.mock('../history', () => ({
			recordCreateHistory: vi.fn(),
			recordUpdateHistory: vi.fn()
		}));

		test('throws when role name duplicates existing role (uses ErrorCodes)', async () => {
			const handler = (create as any).handler ?? (create as any);
			const ctx = {
				db: {
					query: vi.fn().mockReturnValue({
						withIndex: vi.fn().mockReturnValue({
							collect: vi.fn().mockResolvedValue([{ _id: 'r-existing', name: 'Lead' }])
						})
					}),
					insert: vi.fn()
				}
			} as unknown as MutationCtx;

			await expect(
				handler(ctx as any, {
					sessionId: 's1',
					circleId: circleId as any,
					name: 'Lead',
					fieldValues: undefined
				})
			).rejects.toThrow(/VALIDATION_INVALID_FORMAT/);
		});
	});

	describe('archiveRole', () => {
		vi.mock('./roleAccess', () => ({
			ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
			ensureWorkspaceMembership: vi.fn(),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p1')
		}));

		test('throws when role is not found', async () => {
			const handler = (archiveRole as any).handler ?? (archiveRole as any);
			const ctx = {
				db: {
					get: vi.fn().mockResolvedValue(null)
				}
			} as unknown as MutationCtx;

			await expect(
				handler(ctx as any, { sessionId: 's1', circleRoleId: 'r1' as any })
			).rejects.toThrow(/ROLE_NOT_FOUND/);
		});
	});

	describe('assignPerson', () => {
		vi.mock('../authority/quickEdit', () => ({
			requireQuickEditPermissionForPerson: vi.fn().mockResolvedValue(undefined)
		}));

		vi.mock('./roleAccess', () => ({
			ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
			ensureWorkspaceMembership: vi.fn(),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p-acting')
		}));

		vi.mock('./roleRbac', () => ({
			handleUserCircleRoleCreated: vi.fn(),
			handleUserCircleRoleRemoved: vi.fn()
		}));

		test('throws when assignment already exists', async () => {
			const handler = (assignPerson as any).handler ?? (assignPerson as any);
			const ctx = {
				db: {
					get: vi.fn().mockResolvedValue({
						_id: 'r1',
						circleId: 'c1',
						templateId: undefined
					}),
					query: vi.fn().mockReturnValue({
						withIndex: vi.fn().mockReturnValue({
							filter: vi.fn().mockReturnValue({
								first: vi.fn().mockResolvedValue({ _id: 'existing-assignment' })
							})
						})
					}),
					insert: vi.fn()
				}
			} as unknown as MutationCtx;

			await expect(
				handler(ctx as any, {
					sessionId: 's1',
					circleRoleId: 'r1' as any,
					assigneePersonId: 'p-target' as any
				})
			).rejects.toThrow(/ASSIGNMENT_ALREADY_EXISTS/);
		});
	});

	describe('removePerson', () => {
		vi.mock('./roleAccess', () => ({
			ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
			ensureWorkspaceMembership: vi.fn(),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn(),
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p-acting')
		}));

		vi.mock('./roleRbac', () => ({
			handleUserCircleRoleCreated: vi.fn(),
			handleUserCircleRoleRemoved: vi.fn()
		}));

		test('removes circle membership when the last role assignment is removed', async () => {
			const handler = (removePerson as any).handler ?? (removePerson as any);

			const assignmentQueryChain = {
				withIndex: vi.fn().mockReturnValue({
					filter: vi.fn().mockReturnValue({
						first: vi
							.fn()
							// 1) find active assignment for by_role_person (exists)
							.mockResolvedValueOnce({ _id: 'a1' })
							// 2) remaining assignments for by_circle_person (none)
							.mockResolvedValueOnce(null)
					})
				})
			};

			const circleMembersQueryChain = {
				withIndex: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue({ _id: 'cm1' })
				})
			};

			const ctx = {
				db: {
					get: vi.fn().mockResolvedValue({
						_id: 'r1',
						circleId: 'c1',
						templateId: undefined
					}),
					query: vi.fn((table: string) => {
						if (table === 'assignments') return assignmentQueryChain as any;
						if (table === 'circleMembers') return circleMembersQueryChain as any;
						return { withIndex: vi.fn() } as any;
					}),
					patch: vi.fn().mockResolvedValue(undefined),
					delete: vi.fn().mockResolvedValue(undefined)
				}
			} as unknown as MutationCtx;

			await expect(
				handler(ctx as any, {
					sessionId: 's1',
					circleRoleId: 'r1' as any,
					assigneePersonId: 'p-target' as any
				})
			).resolves.toEqual({ success: true });

			expect(ctx.db.delete).toHaveBeenCalledWith('cm1');
		});

		test('does not remove circle membership if the person still has another active role in the circle', async () => {
			const handler = (removePerson as any).handler ?? (removePerson as any);

			const assignmentQueryChain = {
				withIndex: vi.fn().mockReturnValue({
					filter: vi.fn().mockReturnValue({
						first: vi
							.fn()
							// 1) find active assignment for by_role_person (exists)
							.mockResolvedValueOnce({ _id: 'a1' })
							// 2) remaining assignments for by_circle_person (exists)
							.mockResolvedValueOnce({ _id: 'a2' })
					})
				})
			};

			const circleMembersQueryChain = {
				withIndex: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue({ _id: 'cm1' })
				})
			};

			const ctx = {
				db: {
					get: vi.fn().mockResolvedValue({
						_id: 'r1',
						circleId: 'c1',
						templateId: undefined
					}),
					query: vi.fn((table: string) => {
						if (table === 'assignments') return assignmentQueryChain as any;
						if (table === 'circleMembers') return circleMembersQueryChain as any;
						return { withIndex: vi.fn() } as any;
					}),
					patch: vi.fn().mockResolvedValue(undefined),
					delete: vi.fn().mockResolvedValue(undefined)
				}
			} as unknown as MutationCtx;

			await expect(
				handler(ctx as any, {
					sessionId: 's1',
					circleRoleId: 'r1' as any,
					assigneePersonId: 'p-target' as any
				})
			).resolves.toEqual({ success: true });

			expect(ctx.db.delete).not.toHaveBeenCalled();
		});
	});
});

// ============================================================================
// Templates Tests
// ============================================================================

describe('templates', () => {
	describe('create', () => {
		const { templateMockPersonId, templateWorkspaceId } = vi.hoisted(() => ({
			templateMockPersonId: 'p1' as Id<'people'>,
			templateWorkspaceId: 'w1' as Id<'workspaces'>
		}));

		vi.mock('./roleAccess', () => ({
			requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(templateMockPersonId),
			ensureWorkspaceMembership: vi.fn(),
			ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
			ensureWorkspacePersonIsInWorkspace: vi.fn(),
			isLeadRole: vi.fn(),
			isWorkspaceAdmin: vi.fn(),
			requireWorkspacePersonById: vi.fn()
		}));

		vi.mock('./templates/rules', () => ({
			findLeadRoleTemplate: vi.fn().mockResolvedValue(null),
			isWorkspaceAdmin: vi.fn().mockResolvedValue(false),
			updateLeadRolesFromTemplate: vi.fn()
		}));

		function createCtx(): MutationCtx {
			const person = {
				_id: templateMockPersonId,
				workspaceId: templateWorkspaceId,
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

		test('requires admin/owner membership (uses ErrorCodes)', async () => {
			const handler = (createTemplate as any).handler ?? (createTemplate as any);
			const ctx = createCtx();

			await expect(
				handler(ctx as any, {
					sessionId: 's1',
					workspaceId: templateWorkspaceId,
					name: 'Template',
					roleType: 'custom',
					defaultFieldValues: [
						{ systemKey: 'purpose', values: ['Test purpose'] },
						{ systemKey: 'decision_right', values: ['Test decision'] }
					],
					description: undefined,
					isCore: false,
					appliesTo: 'decides'
				})
			).rejects.toThrow(/AUTHZ_INSUFFICIENT_RBAC/);
		});
	});
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('validation', () => {
	const roles = [
		{ _id: '1', name: 'Lead' },
		{ _id: '2', name: 'Member' }
	];

	describe('normalizeRoleName', () => {
		test('trims and lowercases', () => {
			expect(normalizeRoleName('  Lead ')).toBe('lead');
		});
	});

	describe('hasDuplicateRoleName', () => {
		test('detects duplicates case-insensitively', () => {
			expect(hasDuplicateRoleName('lead', roles)).toBe(true);
			expect(hasDuplicateRoleName('LEAD', roles)).toBe(true);
		});

		test('returns false when no duplicate exists', () => {
			expect(hasDuplicateRoleName('Facilitator', roles)).toBe(false);
		});

		test('ignores current role id', () => {
			expect(hasDuplicateRoleName('Lead', roles, '1')).toBe(false);
		});

		test('trims candidate before comparison', () => {
			expect(hasDuplicateRoleName('  member  ', roles)).toBe(true);
		});
	});
});

describe('lead detection', () => {
	describe('isLeadTemplate', () => {
		test('returns true when template is circle_lead', () => {
			expect(isLeadTemplate({ roleType: 'circle_lead' })).toBe(true);
		});

		test('returns false when template is structural', () => {
			expect(isLeadTemplate({ roleType: 'structural' })).toBe(false);
		});

		test('returns false when template is custom', () => {
			expect(isLeadTemplate({ roleType: 'custom' })).toBe(false);
		});

		test('returns false when template is undefined', () => {
			expect(isLeadTemplate(undefined)).toBe(false);
		});

		test('returns false when template is null', () => {
			expect(isLeadTemplate(null)).toBe(false);
		});
	});
});

describe('lead helpers', () => {
	describe('countLeadRoles', () => {
		test('counts lead roles based on template roleType', () => {
			const roles = [
				{ templateId: 'lead-template' },
				{ templateId: 'non-lead-template' },
				{ templateId: undefined },
				{ templateId: 'missing-template' }
			];

			const templateMap = new Map<
				string,
				{ roleType?: 'circle_lead' | 'structural' | 'custom' | null }
			>([
				['lead-template', { roleType: 'circle_lead' }],
				['non-lead-template', { roleType: 'structural' }]
			]);

			const result = countLeadRoles(roles, (templateId) => templateMap.get(templateId));
			expect(result).toBe(1);
		});
	});
});

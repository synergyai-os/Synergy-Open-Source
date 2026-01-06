import { describe, expect, test } from 'vitest';
import type { Id } from '../../_generated/dataModel';
import { calculateAuthority } from './calculator';
import { getAuthorityContext } from './context';
import type { Assignment, AuthorityContext } from './types';

const personId = 'person_1' as Id<'people'>;
const circleId = 'circle_1' as Id<'circles'>;

const leadAssignment: Assignment = {
	personId,
	circleId,
	roleId: 'role_lead' as Id<'circleRoles'>,
	roleName: 'Circle Lead',
	roleType: 'lead'
};

const memberAssignment: Assignment = {
	personId,
	circleId,
	roleId: 'role_member' as Id<'circleRoles'>,
	roleName: 'Member',
	roleType: 'core'
};

const facilitatorAssignment: Assignment = {
	personId,
	circleId,
	roleId: 'role_facilitator' as Id<'circleRoles'>,
	roleName: 'Facilitator',
	roleType: 'core'
};

const stewardAssignment: Assignment = {
	personId,
	circleId,
	roleId: 'role_steward' as Id<'circleRoles'>,
	roleName: 'Steward',
	roleType: 'core'
};

describe('calculateAuthority', () => {
	test('Decides Circle Lead', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'decides',
			assignments: [leadAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canApproveProposals).toBe(true);
		expect(authority.canAssignRoles).toBe(true);
		expect(authority.canModifyCircleStructure).toBe(true);
		expect(authority.canRaiseObjections).toBe(false);
		expect(authority.canFacilitate).toBe(true);
	});

	test('Decides Member (not lead)', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'decides',
			assignments: [memberAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canApproveProposals).toBe(false);
		expect(authority.canRaiseObjections).toBe(false);
		expect(authority.canAssignRoles).toBe(false);
		expect(authority.canModifyCircleStructure).toBe(false);
		expect(authority.canFacilitate).toBe(false);
	});

	test('Facilitates Team Member', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'facilitates',
			assignments: [memberAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canApproveProposals).toBe(false);
		expect(authority.canRaiseObjections).toBe(true);
		expect(authority.canAssignRoles).toBe(false);
		expect(authority.canModifyCircleStructure).toBe(false);
		expect(authority.canFacilitate).toBe(false);
	});

	test('Convenes Steward', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'convenes',
			assignments: [stewardAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canApproveProposals).toBe(false);
		expect(authority.canRaiseObjections).toBe(true);
		expect(authority.canAssignRoles).toBe(false);
		expect(authority.canModifyCircleStructure).toBe(false);
		expect(authority.canFacilitate).toBe(false);
	});

	test('Facilitator Role', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'facilitates',
			assignments: [facilitatorAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canFacilitate).toBe(true);
		expect(authority.canRaiseObjections).toBe(true);
	});

	test('Circle Lead Always Facilitates', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'facilitates',
			assignments: [leadAssignment]
		};

		const authority = calculateAuthority(ctx);

		expect(authority.canFacilitate).toBe(true);
	});

	test('Empty Assignments return default deny', () => {
		const ctx: AuthorityContext = {
			personId,
			circleId,
			leadAuthority: 'decides',
			assignments: []
		};

		const authority = calculateAuthority(ctx);

		expect(authority).toEqual({
			canApproveProposals: false,
			canAssignRoles: false,
			canModifyCircleStructure: false,
			canRaiseObjections: false,
			canFacilitate: false
		});
	});
});

describe('getAuthorityContext', () => {
	const circle = {
		_id: circleId,
		leadAuthority: 'facilitates' as const,
		workspaceId: 'ws1' as Id<'workspaces'>
	};

	const facilitatorTemplateId = 'template_fac' as Id<'roleTemplates'>;
	const leadTemplateId = 'template_lead' as Id<'roleTemplates'>;

	const facilitatorRole = {
		_id: 'role_fac' as Id<'circleRoles'>,
		circleId,
		workspaceId: 'ws1' as Id<'workspaces'>,
		name: 'Facilitator',
		templateId: facilitatorTemplateId,
		archivedAt: undefined
	};

	const leadRole = {
		_id: 'role_lead_circle' as Id<'circleRoles'>,
		circleId,
		workspaceId: 'ws1' as Id<'workspaces'>,
		name: 'Circle Lead',
		templateId: leadTemplateId,
		archivedAt: undefined
	};

	const facilitatorTemplate = { isCore: true, roleType: 'structural' as const };
	const leadTemplate = { roleType: 'circle_lead' as const };

	function makeCtx(overrides: {
		circle?: any;
		assignments?: any[];
		circleRoles?: Record<string, any>;
		templates?: Record<string, any>;
		person?: any;
	}) {
		const circleDoc = overrides.circle !== undefined ? overrides.circle : circle;
		const workspaceId = circleDoc?.workspaceId ?? 'ws1';
		// Assignments table data (matches what context.ts queries)
		const assignmentRows = overrides.assignments ?? [
			{ roleId: facilitatorRole._id, circleId, personId, status: 'active' },
			{ roleId: leadRole._id, circleId, personId, status: 'active' }
		];
		const circleRoles = overrides.circleRoles ?? {
			[facilitatorRole._id]: facilitatorRole,
			[leadRole._id]: leadRole
		};
		const templates = overrides.templates ?? {
			[facilitatorTemplateId]: facilitatorTemplate,
			[leadTemplateId]: leadTemplate
		};
		const person =
			overrides.person ??
			({
				_id: personId,
				workspaceId,
				email: 'test@example.com',
				displayName: 'Test User',
				workspaceRole: 'member',
				status: 'active',
				invitedAt: 0
			} as const);

		return {
			db: {
				get: async (id: Id<any>) => {
					if (id === person._id) return person;
					if (id === circleId) return circleDoc;
					if (circleRoles[id as string]) return circleRoles[id as string];
					if (templates[id as string]) return templates[id as string];
					return null;
				},
				query: (table: string) => {
					if (table === 'people') {
						const withIndex = (_name: string, fn: (q: any) => any) => {
							const q = { eq: () => q };
							fn(q);
							return {
								first: async () => person
							};
						};
						return { withIndex };
					}
					if (table === 'assignments') {
						const withIndex = (_name: string, fn: (q: any) => any) => {
							const q = { eq: () => q };
							fn(q);
							return {
								filter: () => ({
									collect: async () => assignmentRows
								})
							};
						};
						return { withIndex };
					}
					throw new Error(`Unexpected table ${table}`);
				}
			}
		};
	}

	test('maps lead and facilitator to assignments with correct roleType', async () => {
		const ctx = makeCtx({});
		const result = await getAuthorityContext(ctx as any, { personId, circleId });

		expect(result.leadAuthority).toBe('facilitates');
		expect(result.assignments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ roleId: facilitatorRole._id, roleType: 'core' }),
				expect.objectContaining({ roleId: leadRole._id, roleType: 'lead' })
			])
		);
	});

	test('falls back to custom roleType when no core/lead signals', async () => {
		const customRole = {
			_id: 'role_custom' as Id<'circleRoles'>,
			circleId,
			workspaceId: 'ws1' as Id<'workspaces'>,
			name: 'Reporter',
			templateId: undefined,
			archivedAt: undefined
		};
		const ctx = makeCtx({
			assignments: [{ roleId: customRole._id, circleId, personId, status: 'active' }],
			circleRoles: { [customRole._id]: customRole },
			templates: {}
		});

		const result = await getAuthorityContext(ctx as any, { personId, circleId });
		expect(result.assignments).toHaveLength(1);
		expect(result.assignments[0]).toEqual(
			expect.objectContaining({ roleId: customRole._id, roleType: 'custom' })
		);
	});

	test('throws when circle does not exist', async () => {
		const ctx = makeCtx({ circle: null });
		await expect(getAuthorityContext(ctx as any, { personId, circleId })).rejects.toThrow(
			'CIRCLE_NOT_FOUND'
		);
	});
});

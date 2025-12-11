import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

const VALID_ROLE_STATUS = new Set(['draft', 'active']);

export const checkROLE01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const roles = await ctx.db.query('circleRoles').collect();
		const circles = await ctx.db.query('circles').collect();
		const circleIds = new Set(circles.map((circle) => circle._id.toString()));

		const violations = roles
			.filter((role) => !role.circleId || !circleIds.has(role.circleId.toString()))
			.map((role) => role._id.toString());

		return makeResult({
			id: 'ROLE-01',
			name: 'Every circleRoles.circleId points to existing circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles reference existing circles'
					: `${violations.length} roles reference missing circles`
		});
	}
});

export const checkROLE02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const roles = await ctx.db.query('circleRoles').collect();
		const circles = await ctx.db.query('circles').collect();

		const circleWorkspaceMap = new Map(
			circles.map((circle) => [circle._id.toString(), circle.workspaceId.toString()])
		);

		const violations: string[] = [];

		for (const role of roles) {
			if (!role.circleId || !role.workspaceId) continue;
			const circleWorkspace = circleWorkspaceMap.get(role.circleId.toString());
			if (!circleWorkspace) continue;
			if (circleWorkspace !== role.workspaceId.toString()) {
				violations.push(role._id.toString());
			}
		}

		return makeResult({
			id: 'ROLE-02',
			name: 'Every circleRoles.workspaceId matches circle.workspaceId',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Role workspace matches their circles'
					: `${violations.length} roles have workspace mismatch with circle`
		});
	}
});

export const checkROLE03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const roles = await ctx.db.query('circleRoles').collect();
		const templates = await ctx.db.query('roleTemplates').collect();
		const templateIds = new Set(templates.map((template) => template._id.toString()));

		const violations = roles
			.filter((role) => role.templateId && !templateIds.has(role.templateId.toString()))
			.map((role) => role._id.toString());

		return makeResult({
			id: 'ROLE-03',
			name: 'Every circleRoles.templateId points to existing template',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All role template references are valid'
					: `${violations.length} roles reference missing templates`
		});
	}
});

export const checkROLE04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('circleRoles').collect())
			.filter((role) => !VALID_ROLE_STATUS.has(role.status))
			.map((role) => role._id.toString());

		return makeResult({
			id: 'ROLE-04',
			name: 'Role status is draft or active only',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All roles use valid status (draft/active)'
					: `${violations.length} roles have invalid status`
		});
	}
});

export const checkROLE05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const workspaces = await ctx.db.query('workspaces').collect();
		const templates = await ctx.db.query('roleTemplates').collect();

		const workspaceHasCore = new Map<string, boolean>();
		for (const template of templates) {
			if (!template.isCore) continue;
			const workspaceKey = template.workspaceId ? template.workspaceId.toString() : 'system';
			workspaceHasCore.set(workspaceKey, true);
		}

		const violations = workspaces
			.filter(
				(workspace) =>
					!workspaceHasCore.get(workspace._id.toString()) && !workspaceHasCore.get('system')
			)
			.map((workspace) => workspace._id.toString());

		return makeResult({
			id: 'ROLE-05',
			name: 'Core role templates (isCore=true) exist for every workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Each workspace has access to core role templates'
					: `${violations.length} workspace(s) missing core role templates`
		});
	}
});

export const checkROLE06 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('circleRoles').collect())
			.filter((role) => role.archivedByPersonId !== undefined && role.archivedAt === undefined)
			.map((role) => role._id.toString());

		return makeResult({
			id: 'ROLE-06',
			name: 'Roles with archivedByPersonId must have archivedAt',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All soft-deleted roles have complete archival metadata'
					: `${violations.length} role(s) have archivedByPersonId but missing archivedAt`
		});
	}
});

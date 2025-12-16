import { calculateAuthority } from '../../core/authority';
import { isLeadTemplate } from '../../core/roles/detection';
import { CIRCLE_TYPES } from '../../core/circles';
import { internalQuery } from '../../_generated/server';
import { findOperationalWorkspaces, makeResult, type InvariantResult } from './types';

const ACTIVE_STATUS = 'active';

export const checkAUTH01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, roles, templates, assignments, workspaces] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('circleRoles').collect(),
			ctx.db.query('roleTemplates').collect(),
			ctx.db
				.query('assignments')
				.filter((q) => q.eq(q.field('status'), ACTIVE_STATUS))
				.collect(),
			ctx.db.query('workspaces').collect()
		]);

		// Archived workspaces excluded via explicit archivedAt (SYOS-811)
		const operationalWorkspaces = findOperationalWorkspaces(workspaces);

		const activeCircles = circles.filter(
			(circle) =>
				circle.status === ACTIVE_STATUS &&
				!circle.archivedAt &&
				circle.workspaceId &&
				operationalWorkspaces.has(circle.workspaceId.toString())
		);
		const templateLookup = new Map(
			templates.map((template) => [template._id.toString(), template])
		);
		const roleIsLead = new Map<string, boolean>();

		for (const role of roles) {
			if (!role.templateId) {
				roleIsLead.set(role._id.toString(), false);
				continue;
			}
			const template = templateLookup.get(role.templateId.toString());
			roleIsLead.set(role._id.toString(), isLeadTemplate(template));
		}

		const circleHasLead = new Set<string>();
		for (const assignment of assignments) {
			if (roleIsLead.get(assignment.roleId.toString())) {
				circleHasLead.add(assignment.circleId.toString());
			}
		}

		const violations = activeCircles
			.filter((circle) => !circleHasLead.has(circle._id.toString()))
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'AUTH-01',
			name: 'Every active circle has at least one Circle Lead assignment',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active circles have a Lead assignment'
					: `${violations.length} active circle(s) missing Lead assignment`
		});
	}
});

export const checkAUTH02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, roles, templates, assignments, workspaces] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('circleRoles').collect(),
			ctx.db.query('roleTemplates').collect(),
			ctx.db
				.query('assignments')
				.filter((q) => q.eq(q.field('status'), ACTIVE_STATUS))
				.collect(),
			ctx.db.query('workspaces').collect()
		]);

		// Archived workspaces excluded via explicit archivedAt (SYOS-811)
		const operationalWorkspaces = findOperationalWorkspaces(workspaces);

		const templateLookup = new Map(
			templates.map((template) => [template._id.toString(), template])
		);
		const roleIsLead = new Map<string, boolean>();
		for (const role of roles) {
			const template = role.templateId ? templateLookup.get(role.templateId.toString()) : null;
			roleIsLead.set(role._id.toString(), isLeadTemplate(template));
		}

		const rootCircleByWorkspace = new Map<string, string>();
		for (const circle of circles) {
			if (
				circle.parentCircleId === undefined &&
				!circle.archivedAt &&
				circle.status === ACTIVE_STATUS
			) {
				rootCircleByWorkspace.set(circle.workspaceId.toString(), circle._id.toString());
			}
		}

		const circleLeadAssignments = new Set<string>();
		for (const assignment of assignments) {
			if (roleIsLead.get(assignment.roleId.toString())) {
				circleLeadAssignments.add(assignment.circleId.toString());
			}
		}

		const violations = workspaces
			.filter((workspace) => {
				// Skip archived workspaces
				if (!operationalWorkspaces.has(workspace._id.toString())) return false;
				const rootCircleId = rootCircleByWorkspace.get(workspace._id.toString());
				if (!rootCircleId) return true;
				return !circleLeadAssignments.has(rootCircleId);
			})
			.map((workspace) => workspace._id.toString());

		return makeResult({
			id: 'AUTH-02',
			name: 'Root circle Circle Lead exists for every workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All root circles have Lead assignments'
					: `${violations.length} workspace(s) missing Lead on root circle`
		});
	}
});

export const checkAUTH03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, roles, templates] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('circleRoles').collect(),
			ctx.db.query('roleTemplates').collect()
		]);

		const templateLookup = new Map(
			templates.map((template) => [template._id.toString(), template])
		);
		const circleHasLeadRole = new Set<string>();

		for (const role of roles) {
			if (!role.templateId) continue;
			const template = templateLookup.get(role.templateId.toString());
			if (isLeadTemplate(template)) {
				circleHasLeadRole.add(role.circleId.toString());
			}
		}

		const violations = circles
			.filter((circle) => !circleHasLeadRole.has(circle._id.toString()))
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'AUTH-03',
			name: 'Circle Lead role exists in every circle',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All circles have a Lead role defined'
					: `${violations.length} circle(s) missing Lead role`
		});
	}
});

export const checkAUTH04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, roles, templates, assignments, people] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('circleRoles').collect(),
			ctx.db.query('roleTemplates').collect(),
			ctx.db.query('assignments').collect(),
			ctx.db.query('people').collect()
		]);

		const templateLookup = new Map(
			templates.map((template) => [template._id.toString(), template])
		);
		const roleMeta = new Map<
			string,
			{
				name: string;
				roleType: 'lead' | 'core' | 'custom';
			}
		>();

		for (const role of roles) {
			const template = role.templateId ? templateLookup.get(role.templateId.toString()) : undefined;
			const roleType = template
				? isLeadTemplate(template)
					? 'lead'
					: template.isCore
						? 'core'
						: 'custom'
				: 'custom';

			roleMeta.set(role._id.toString(), { name: role.name, roleType });
		}

		const assignmentsByCircle = new Map<string, typeof assignments>();
		for (const assignment of assignments) {
			const circleId = assignment.circleId.toString();
			const roleInfo = roleMeta.get(assignment.roleId.toString());
			if (!roleInfo) continue;
			const list = assignmentsByCircle.get(circleId) ?? [];
			list.push({
				personId: assignment.personId,
				circleId: assignment.circleId,
				roleId: assignment.roleId,
				roleName: roleInfo.name,
				roleType: roleInfo.roleType
			});
			assignmentsByCircle.set(circleId, list);
		}

		const defaultPerson = people[0]?.['_id'];
		const violations: string[] = [];

		for (const circle of circles) {
			const actorId =
				assignmentsByCircle.get(circle._id.toString())?.[0]?.personId ?? defaultPerson;
			if (!actorId) continue;
			const contextAssignments = assignmentsByCircle.get(circle._id.toString()) ?? [];

			try {
				const result = calculateAuthority({
					personId: actorId,
					circleId: circle._id,
					circleType: circle.circleType ?? CIRCLE_TYPES.HIERARCHY,
					assignments: contextAssignments
				});

				const hasAllFields =
					result &&
					typeof result.canApproveProposals === 'boolean' &&
					typeof result.canAssignRoles === 'boolean' &&
					typeof result.canModifyCircleStructure === 'boolean' &&
					typeof result.canRaiseObjections === 'boolean' &&
					typeof result.canFacilitate === 'boolean';

				if (!hasAllFields) {
					violations.push(circle._id.toString());
				}
			} catch (error) {
				console.error('Authority calculation error', error);
				violations.push(circle._id.toString());
			}
		}

		return makeResult({
			id: 'AUTH-04',
			name: 'Authority calculation returns valid Authority object',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Authority calculation succeeds for all circles'
					: `${violations.length} circle(s) failed authority calculation`
		});
	}
});

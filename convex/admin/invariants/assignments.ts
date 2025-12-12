import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

const VALID_ASSIGNMENT_STATUS = new Set(['active', 'ended']);

export const checkASSIGN01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const assignments = await ctx.db.query('assignments').collect();
		const people = await ctx.db.query('people').collect();
		const personIds = new Set(people.map((person) => person._id.toString()));

		const violations = assignments
			.filter(
				(assignment) => !assignment.personId || !personIds.has(assignment.personId.toString())
			)
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'ASSIGN-01',
			name: 'Every assignment.personId points to existing person',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All assignments reference valid people'
					: `${violations.length} assignments reference missing people`
		});
	}
});

export const checkASSIGN02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const assignments = await ctx.db.query('assignments').collect();
		const roles = await ctx.db.query('circleRoles').collect();
		const roleIds = new Set(roles.map((role) => role._id.toString()));

		const violations = assignments
			.filter((assignment) => !assignment.roleId || !roleIds.has(assignment.roleId.toString()))
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'ASSIGN-02',
			name: 'Every assignment.roleId points to existing role',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All assignments reference valid roles'
					: `${violations.length} invalid roleId`
		});
	}
});

export const checkASSIGN03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const assignments = await ctx.db.query('assignments').collect();
		const circles = await ctx.db.query('circles').collect();
		const circleIds = new Set(circles.map((circle) => circle._id.toString()));

		const violations = assignments
			.filter(
				(assignment) => !assignment.circleId || !circleIds.has(assignment.circleId.toString())
			)
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'ASSIGN-03',
			name: 'Every assignment.circleId points to existing circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All assignments reference valid circles'
					: `${violations.length} assignments reference missing circles`
		});
	}
});

export const checkASSIGN04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const assignments = await ctx.db.query('assignments').collect();
		const circles = await ctx.db.query('circles').collect();
		const people = await ctx.db.query('people').collect();

		const circleWorkspaceMap = new Map(
			circles.map((circle) => [circle._id.toString(), circle.workspaceId.toString()])
		);
		const personWorkspaceMap = new Map(
			people.map((person) => [person._id.toString(), person.workspaceId.toString()])
		);

		const violations: string[] = [];

		for (const assignment of assignments) {
			if (!assignment.circleId || !assignment.personId) continue;
			const circleWorkspace = circleWorkspaceMap.get(assignment.circleId.toString());
			const personWorkspace = personWorkspaceMap.get(assignment.personId.toString());
			if (!circleWorkspace || !personWorkspace) continue;
			if (circleWorkspace !== personWorkspace) {
				violations.push(assignment._id.toString());
			}
		}

		return makeResult({
			id: 'ASSIGN-04',
			name: "Assignment person belongs to same workspace as role's circle",
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Assignments respect workspace boundaries'
					: `${violations.length} assignments cross workspace boundaries`
		});
	}
});

export const checkASSIGN05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const activeAssignments = await ctx.db
			.query('assignments')
			.filter((q) => q.eq(q.field('status'), 'active'))
			.collect();

		const counts = new Map<string, number>();
		for (const assignment of activeAssignments) {
			if (!assignment.personId || !assignment.roleId) continue;
			const key = `${assignment.personId}|${assignment.roleId}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const violations = Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'ASSIGN-05',
			name: 'No duplicate (personId, roleId) pairs in active assignments',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'Active assignments unique per person/role'
					: `${violations.length} duplicate active assignments detected`
		});
	}
});

export const checkASSIGN06 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('assignments').collect())
			.filter((assignment) => !VALID_ASSIGNMENT_STATUS.has(assignment.status))
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'ASSIGN-06',
			name: 'Assignment status is valid enum value',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Assignments use valid statuses'
					: `${violations.length} assignments with invalid status`
		});
	}
});

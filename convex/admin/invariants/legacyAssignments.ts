import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

export const checkUCROLE01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const legacyAssignments = await ctx.db.query('userCircleRoles').collect();
		const people = await ctx.db.query('people').collect();
		const personIds = new Set(people.map((person) => person._id.toString()));

		const violations = legacyAssignments
			.filter(
				(assignment) => !assignment.personId || !personIds.has(assignment.personId.toString())
			)
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'UCROLE-01',
			name: 'Every userCircleRole.personId points to existing person',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Legacy assignments reference valid people'
					: `${violations.length} legacy assignments reference missing people`
		});
	}
});

export const checkUCROLE02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const legacyAssignments = await ctx.db.query('userCircleRoles').collect();
		const roles = await ctx.db.query('circleRoles').collect();
		const roleIds = new Set(roles.map((role) => role._id.toString()));

		const violations = legacyAssignments
			.filter(
				(assignment) => !assignment.circleRoleId || !roleIds.has(assignment.circleRoleId.toString())
			)
			.map((assignment) => assignment._id.toString());

		return makeResult({
			id: 'UCROLE-02',
			name: 'Every userCircleRole.circleRoleId points to existing role',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Legacy assignments reference valid roles'
					: `${violations.length} legacy assignments reference missing roles`
		});
	}
});

export const checkUCROLE03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const legacyAssignments = await ctx.db.query('userCircleRoles').collect();
		const people = await ctx.db.query('people').collect();
		const roles = await ctx.db.query('circleRoles').collect();
		const circles = await ctx.db.query('circles').collect();

		const personWorkspace = new Map(
			people.map((person) => [person._id.toString(), person.workspaceId.toString()])
		);
		const circleMap = new Map(
			circles.map((circle) => [circle._id.toString(), circle.workspaceId.toString()])
		);
		const roleCircle = new Map(
			roles.map((role) => [role._id.toString(), role.circleId.toString()])
		);

		const violations: string[] = [];

		for (const assignment of legacyAssignments) {
			if (!assignment.circleRoleId || !assignment.personId) continue;
			const circleId = roleCircle.get(assignment.circleRoleId.toString());
			const workspaceFromCircle = circleId ? circleMap.get(circleId) : undefined;
			const workspaceFromPerson = personWorkspace.get(assignment.personId.toString());
			if (!workspaceFromCircle || !workspaceFromPerson) continue;
			if (workspaceFromCircle !== workspaceFromPerson) {
				violations.push(assignment._id.toString());
			}
		}

		return makeResult({
			id: 'UCROLE-03',
			name: "Legacy assignment person belongs to same workspace as role's circle",
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Legacy assignments stay within workspace boundaries'
					: `${violations.length} legacy assignments cross workspaces`
		});
	}
});

export const checkUCROLE04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const activeLegacy = (await ctx.db.query('userCircleRoles').collect()).filter(
			(assignment) => assignment.archivedAt === undefined
		);

		const counts = new Map<string, number>();
		for (const assignment of activeLegacy) {
			if (!assignment.personId || !assignment.circleRoleId) continue;
			const key = `${assignment.personId}|${assignment.circleRoleId}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const violations = Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'UCROLE-04',
			name: 'No duplicate (personId, circleRoleId) pairs in active legacy assignments',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'Legacy assignments unique per person/role'
					: `${violations.length} duplicate active legacy assignments`
		});
	}
});

import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

export const checkCMEM01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circleMembers = await ctx.db.query('circleMembers').collect();
		const circles = await ctx.db.query('circles').collect();
		const circleIds = new Set(circles.map((circle) => circle._id.toString()));

		const violations = circleMembers
			.filter((member) => !member.circleId || !circleIds.has(member.circleId.toString()))
			.map((member) => member._id.toString());

		return makeResult({
			id: 'CMEM-01',
			name: 'Every circleMember.circleId points to existing circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circle memberships reference valid circles'
					: `${violations.length} circleMembers point to missing circles`
		});
	}
});

export const checkCMEM02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circleMembers = await ctx.db.query('circleMembers').collect();
		const people = await ctx.db.query('people').collect();
		const personIds = new Set(people.map((person) => person._id.toString()));

		const violations = circleMembers
			.filter((member) => !member.personId || !personIds.has(member.personId.toString()))
			.map((member) => member._id.toString());

		return makeResult({
			id: 'CMEM-02',
			name: 'Every circleMember.personId points to existing person',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circle memberships reference valid people'
					: `${violations.length} circleMembers point to missing people`
		});
	}
});

export const checkCMEM03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circleMembers = await ctx.db.query('circleMembers').collect();
		const circles = await ctx.db.query('circles').collect();
		const people = await ctx.db.query('people').collect();

		const circleMap = new Map(
			circles.map((circle) => [circle._id.toString(), circle.workspaceId.toString()])
		);
		const personMap = new Map(
			people.map((person) => [person._id.toString(), person.workspaceId.toString()])
		);

		const violations: string[] = [];

		for (const member of circleMembers) {
			if (!member.circleId || !member.personId) continue;
			const circleWorkspace = circleMap.get(member.circleId.toString());
			const personWorkspace = personMap.get(member.personId.toString());
			if (!circleWorkspace || !personWorkspace) continue;
			if (circleWorkspace !== personWorkspace) {
				violations.push(member._id.toString());
			}
		}

		return makeResult({
			id: 'CMEM-03',
			name: 'Circle member person belongs to same workspace as circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circle memberships stay within workspace boundaries'
					: `${violations.length} circleMembers reference cross-workspace people`
		});
	}
});

export const checkCMEM04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const activeMembers = (await ctx.db.query('circleMembers').collect()).filter(
			(member) => member.archivedAt === undefined
		);

		const counts = new Map<string, number>();
		for (const member of activeMembers) {
			if (!member.circleId || !member.personId) continue;
			const key = `${member.circleId}|${member.personId}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const violations = Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'CMEM-04',
			name: 'No duplicate (circleId, personId) pairs in active memberships',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'Active circle memberships are unique per circle/person'
					: `${violations.length} duplicate active circle/person memberships`
		});
	}
});

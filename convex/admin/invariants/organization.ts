import { internalQuery } from '../../_generated/server';
import { LEAD_AUTHORITY } from '../../core/circles';
import { findOperationalWorkspaces, makeResult, type InvariantResult } from './types';

const VALID_LEAD_AUTHORITY = new Set([
	LEAD_AUTHORITY.DECIDES,
	LEAD_AUTHORITY.FACILITATES,
	LEAD_AUTHORITY.CONVENES
]);
const VALID_CIRCLE_STATUS = new Set(['draft', 'active']);

export const checkORG01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, workspaces] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('workspaces').collect()
		]);

		// Archived workspaces excluded via explicit archivedAt (SYOS-811)
		const operationalWorkspaces = findOperationalWorkspaces(workspaces);

		const rootCounts = new Map<string, number>();
		for (const circle of circles) {
			if (circle.parentCircleId === undefined && circle.archivedAt === undefined) {
				if (!circle.workspaceId) continue;
				const key = circle.workspaceId.toString();
				rootCounts.set(key, (rootCounts.get(key) ?? 0) + 1);
			}
		}

		const violations = workspaces
			.filter((workspace) => {
				// Skip abandoned workspaces (no active people)
				if (!operationalWorkspaces.has(workspace._id.toString())) return false;
				return rootCounts.get(workspace._id.toString()) !== 1;
			})
			.map((workspace) => workspace._id.toString());

		return makeResult({
			id: 'ORG-01',
			name: 'Every workspace has exactly one root circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Each workspace has a single active root circle'
					: `${violations.length} workspace(s) missing or duplicating root circles`
		});
	}
});

export const checkORG02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circles = await ctx.db.query('circles').collect();
		const circleMap = new Map(circles.map((circle) => [circle._id.toString(), circle]));
		const violations: string[] = [];

		for (const circle of circles) {
			if (!circle.parentCircleId) continue;
			if (!circleMap.has(circle.parentCircleId.toString())) {
				violations.push(circle._id.toString());
			}
		}

		return makeResult({
			id: 'ORG-02',
			name: 'Every non-root circle has valid parentCircleId',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circles reference existing parents'
					: `${violations.length} circles have missing parentCircleId`
		});
	}
});

export const checkORG03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circles = await ctx.db.query('circles').collect();
		const circleMap = new Map(circles.map((circle) => [circle._id.toString(), circle]));
		const violations: string[] = [];

		for (const circle of circles) {
			let current = circle;
			const visited = new Set<string>();

			while (current.parentCircleId) {
				const parentId = current.parentCircleId.toString();
				if (visited.has(parentId)) {
					violations.push(circle._id.toString());
					break;
				}
				visited.add(parentId);
				const parent = circleMap.get(parentId);
				if (!parent) break;
				current = parent;
			}
		}

		return makeResult({
			id: 'ORG-03',
			name: 'No circular references in circle.parentCircleId chain',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Circle hierarchy has no cycles'
					: `${violations.length} circle(s) participate in parent cycles`
		});
	}
});

export const checkORG04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circles = await ctx.db.query('circles').collect();
		const workspaces = await ctx.db.query('workspaces').collect();
		const workspaceIds = new Set(workspaces.map((workspace) => workspace._id.toString()));

		const violations = circles
			.filter((circle) => !circle.workspaceId || !workspaceIds.has(circle.workspaceId.toString()))
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'ORG-04',
			name: 'Every circle.workspaceId points to existing workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circles reference valid workspaces'
					: `${violations.length} circle(s) reference missing workspaces`
		});
	}
});

export const checkORG05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circles = await ctx.db.query('circles').collect();
		const circleMap = new Map(circles.map((circle) => [circle._id.toString(), circle]));
		const violations: string[] = [];

		for (const circle of circles) {
			if (!circle.parentCircleId || !circle.workspaceId) continue;
			const parent = circleMap.get(circle.parentCircleId.toString());
			if (!parent || !parent.workspaceId) continue;
			if (parent.workspaceId.toString() !== circle.workspaceId.toString()) {
				violations.push(circle._id.toString());
			}
		}

		return makeResult({
			id: 'ORG-05',
			name: "Circle's parent belongs to same workspace",
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circle parents stay within workspace boundary'
					: `${violations.length} circle(s) have parents in different workspaces`
		});
	}
});

export const checkORG06 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (
			await ctx.db
				.query('circles')
				.filter((q) => q.neq(q.field('leadAuthority'), null))
				.collect()
		)
			.filter((circle) => circle.leadAuthority && !VALID_LEAD_AUTHORITY.has(circle.leadAuthority))
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'ORG-06',
			name: 'Circle leadAuthority is valid enum value when set',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circles use valid leadAuthority values'
					: `${violations.length} circle(s) have invalid leadAuthority`
		});
	}
});

export const checkORG07 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('circles').collect())
			.filter((circle) => !VALID_CIRCLE_STATUS.has(circle.status))
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'ORG-07',
			name: 'Circle status is valid enum value',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All circles use valid status values'
					: `${violations.length} circle(s) have invalid status`
		});
	}
});

export const checkORG08 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const circles = await ctx.db.query('circles').collect();
		const counts = new Map<string, number>();

		for (const circle of circles) {
			if (circle.archivedAt !== undefined) continue;
			const key = `${circle.workspaceId}|${circle.slug.toLowerCase()}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const violations = Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([key]) => key);

		return makeResult({
			id: 'ORG-08',
			name: 'Circle slug is unique within workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active circles have unique slugs per workspace'
					: `${violations.length} workspace(s) contain duplicate active slugs`
		});
	}
});

export const checkORG09 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('circles').collect())
			.filter(
				(circle) => circle.archivedByPersonId !== undefined && circle.archivedAt === undefined
			)
			.map((circle) => circle._id.toString());

		return makeResult({
			id: 'ORG-09',
			name: 'Circles with archivedByPersonId must have archivedAt',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All soft-deleted circles have complete archival metadata'
					: `${violations.length} circle(s) have archivedByPersonId but missing archivedAt`
		});
	}
});

export const checkORG10 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [circles, workspaces] = await Promise.all([
			ctx.db.query('circles').collect(),
			ctx.db.query('workspaces').collect()
		]);

		// Archived workspaces excluded via explicit archivedAt (SYOS-811)
		const operationalWorkspaces = findOperationalWorkspaces(workspaces);

		const violations: string[] = [];

		// Find root circles (parentCircleId is undefined and not archived)
		for (const circle of circles) {
			if (circle.parentCircleId === undefined && circle.archivedAt === undefined) {
				// Only check operational workspaces
				if (!circle.workspaceId || !operationalWorkspaces.has(circle.workspaceId.toString())) {
					continue;
				}

				// Get the workspace to check phase
				const workspace = workspaces.find(
					(w) => w._id.toString() === circle.workspaceId?.toString()
				);
				if (!workspace) continue;

				// ORG-10 only enforced when workspace is active
				if (workspace.phase === 'active' && circle.leadAuthority === LEAD_AUTHORITY.CONVENES) {
					violations.push(circle._id.toString());
				}
			}
		}

		return makeResult({
			id: 'ORG-10',
			name: "Root circle lead authority must not be 'convenes'",
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All active workspace root circles have valid lead authority'
					: `${violations.length} root circle(s) have convening authority (not allowed)`
		});
	}
});

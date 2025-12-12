import type { Id } from '../../_generated/dataModel';

export type InvariantSeverity = 'critical' | 'warning';

/**
 * Returns workspace IDs that are considered operational (i.e. not archived).
 * Used to skip invariants for intentionally archived workspaces rather than
 * relying on active-people heuristics (see SYOS-811).
 */
export function findOperationalWorkspaces(
	workspaces: Array<{ _id: Id<'workspaces'>; archivedAt?: number | null }>
): Set<string> {
	return new Set(
		workspaces
			.filter((workspace) => workspace.archivedAt === undefined)
			.map((ws) => ws._id.toString())
	);
}

export type InvariantResult = {
	id: string;
	name: string;
	passed: boolean;
	severity: InvariantSeverity;
	violationCount: number;
	sample: string[];
	message: string;
};

export type ViolationList = Array<string | Id<string>>;

export function toSample(violations: ViolationList, limit = 5): string[] {
	return violations.slice(0, limit).map((value) => value.toString());
}

export function makeResult(params: {
	id: string;
	name: string;
	severity: InvariantSeverity;
	violations: ViolationList;
	message?: string;
}): InvariantResult {
	const { id, name, severity, violations, message } = params;
	const violationCount = violations.length;

	return {
		id,
		name,
		passed: violationCount === 0,
		severity,
		violationCount,
		sample: toSample(violations),
		message:
			message ??
			(violationCount === 0
				? 'All records satisfy invariant'
				: `${violationCount} violation(s) detected`)
	};
}

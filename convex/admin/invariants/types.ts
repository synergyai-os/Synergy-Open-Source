import type { Id } from '../../_generated/dataModel';

export type InvariantSeverity = 'critical' | 'warning';

/**
 * Identifies workspaces with no active people.
 * These are considered "abandoned" and excluded from certain invariant checks.
 * Abandoned workspaces excluded per SYOS-806.
 *
 * @returns Set of workspace IDs that have at least one active person
 */
export function findOperationalWorkspaces(
	people: Array<{ workspaceId: Id<'workspaces'>; status: string }>
): Set<string> {
	const operational = new Set<string>();
	for (const person of people) {
		if (person.status === 'active' && person.workspaceId) {
			operational.add(person.workspaceId.toString());
		}
	}
	return operational;
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

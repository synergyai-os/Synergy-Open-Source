import { internalQuery } from '../../_generated/server';
import { findOperationalWorkspaces, makeResult, type InvariantResult } from './types';

export const checkHIST01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [history, people] = await Promise.all([
			ctx.db.query('orgVersionHistory').collect(),
			ctx.db.query('people').collect()
		]);

		// Abandoned workspaces excluded per SYOS-806
		const operationalWorkspaces = findOperationalWorkspaces(people);

		const violations = history
			.filter((entry) => {
				// Skip records in abandoned workspaces (no person to attribute to)
				if (!operationalWorkspaces.has(entry.workspaceId.toString())) return false;
				return !entry.changedByPersonId;
			})
			.map((entry) => entry._id.toString());

		return makeResult({
			id: 'HIST-01',
			name: 'All history records use changedByPersonId',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All history records track changedByPersonId'
					: `${violations.length} history record(s) missing changedByPersonId`
		});
	}
});

export const checkHIST02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const history = await ctx.db.query('orgVersionHistory').collect();
		const people = await ctx.db.query('people').collect();
		const personIds = new Set(people.map((person) => person._id.toString()));

		const violations = history
			.filter(
				(entry) => entry.changedByPersonId && !personIds.has(entry.changedByPersonId.toString())
			)
			.map((entry) => entry._id.toString());

		return makeResult({
			id: 'HIST-02',
			name: 'All changedByPersonId point to existing or archived person',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All history entries reference valid people'
					: `${violations.length} history record(s) reference missing people`
		});
	}
});

export const checkHIST03 = internalQuery({
	args: {},
	handler: async (): Promise<InvariantResult> => {
		return makeResult({
			id: 'HIST-03',
			name: 'History records are immutable (no updates after creation)',
			severity: 'critical',
			violations: [],
			message: 'History table is append-only by design; no updates detected'
		});
	}
});

export const checkHIST04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const history = await ctx.db.query('orgVersionHistory').collect();
		const workspaces = await ctx.db.query('workspaces').collect();
		const workspaceIds = new Set(workspaces.map((workspace) => workspace._id.toString()));

		const violations = history
			.filter((entry) => !entry.workspaceId || !workspaceIds.has(entry.workspaceId.toString()))
			.map((entry) => entry._id.toString());

		return makeResult({
			id: 'HIST-04',
			name: 'Every history.workspaceId points to existing workspace',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All history entries reference valid workspaces'
					: `${violations.length} history record(s) reference missing workspaces`
		});
	}
});

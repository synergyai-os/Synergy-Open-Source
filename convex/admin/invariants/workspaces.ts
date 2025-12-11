import { internalQuery } from '../../_generated/server';
import { findOperationalWorkspaces, makeResult, type InvariantResult } from './types';

const ACTIVE_STATUS = 'active';
const OWNER_ROLE = 'owner';

export const checkWS01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [workspaces, people] = await Promise.all([
			ctx.db.query('workspaces').collect(),
			ctx.db.query('people').collect()
		]);

		const activeCountByWorkspace = new Map<string, number>();
		for (const person of people) {
			if (person.status !== ACTIVE_STATUS) continue;
			if (!person.workspaceId) continue;
			const key = person.workspaceId.toString();
			activeCountByWorkspace.set(key, (activeCountByWorkspace.get(key) ?? 0) + 1);
		}

		const violations = workspaces
			.filter((workspace) => (activeCountByWorkspace.get(workspace._id.toString()) ?? 0) < 1)
			.map((workspace) => workspace._id.toString());

		return makeResult({
			id: 'WS-01',
			name: 'Every workspace has at least one active person',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All workspaces have active people'
					: `${violations.length} workspace(s) lack active people`
		});
	}
});

export const checkWS02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [workspaces, people] = await Promise.all([
			ctx.db.query('workspaces').collect(),
			ctx.db.query('people').collect()
		]);

		// Abandoned workspaces excluded per SYOS-806
		const operationalWorkspaces = findOperationalWorkspaces(people);

		const ownerCountByWorkspace = new Map<string, number>();
		for (const person of people) {
			if (person.status !== ACTIVE_STATUS) continue;
			if (person.workspaceRole !== OWNER_ROLE) continue;
			if (!person.workspaceId) continue;
			const key = person.workspaceId.toString();
			ownerCountByWorkspace.set(key, (ownerCountByWorkspace.get(key) ?? 0) + 1);
		}

		const violations = workspaces
			.filter((workspace) => {
				// Skip abandoned workspaces (no active people)
				if (!operationalWorkspaces.has(workspace._id.toString())) return false;
				return (ownerCountByWorkspace.get(workspace._id.toString()) ?? 0) < 1;
			})
			.map((workspace) => workspace._id.toString());

		return makeResult({
			id: 'WS-02',
			name: 'Every workspace has at least one owner',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All workspaces have at least one owner'
					: `${violations.length} workspace(s) missing owners`
		});
	}
});

export const checkWS03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const workspaces = await ctx.db.query('workspaces').collect();
		const counts = new Map<string, number>();

		for (const workspace of workspaces) {
			if (!workspace.slug) continue;
			const slug = workspace.slug.toLowerCase();
			counts.set(slug, (counts.get(slug) ?? 0) + 1);
		}

		const violations = Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([slug]) => slug);

		return makeResult({
			id: 'WS-03',
			name: 'Workspace slug is unique',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All workspace slugs are unique'
					: `${violations.length} duplicate workspace slug(s)`
		});
	}
});

export const checkWS04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const aliases = await ctx.db.query('workspaceAliases').collect();
		const workspaces = await ctx.db.query('workspaces').collect();
		const workspaceIds = new Set(workspaces.map((workspace) => workspace._id.toString()));

		const violations = aliases
			.filter((alias) => !alias.workspaceId || !workspaceIds.has(alias.workspaceId.toString()))
			.map((alias) => alias._id.toString());

		return makeResult({
			id: 'WS-04',
			name: 'Workspace aliases point to existing workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All aliases resolve to workspaces'
					: `${violations.length} alias record(s) reference missing workspaces`
		});
	}
});

export const checkWS05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const [workspaces, aliases] = await Promise.all([
			ctx.db.query('workspaces').collect(),
			ctx.db.query('workspaceAliases').collect()
		]);

		const workspaceSlugToId = new Map(
			workspaces
				.filter((workspace) => workspace.slug)
				.map((workspace) => [workspace.slug.toLowerCase(), workspace._id])
		);
		const violations: string[] = [];

		for (const alias of aliases) {
			if (!alias.workspaceId || !alias.slug) continue;
			const targetWorkspaceId = alias.workspaceId.toString();
			const workspaceIdForSlug = workspaceSlugToId.get(alias.slug.toLowerCase());
			if (workspaceIdForSlug && workspaceIdForSlug.toString() !== targetWorkspaceId) {
				violations.push(alias._id.toString());
			}
		}

		return makeResult({
			id: 'WS-05',
			name: 'No workspace slug conflicts with workspace aliases',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Workspace slugs and aliases do not conflict'
					: `${violations.length} alias(es) conflict with workspace slugs`
		});
	}
});

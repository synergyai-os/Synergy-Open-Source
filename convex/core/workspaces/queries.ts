import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
// SYOS-814 Phase 3: All functions migrated to people table
// SYOS-855: calculateInitialsFromName merged into lifecycle.ts
import { calculateInitialsFromName } from './lifecycle';
import {
	listWorkspacesForUser,
	findPersonByUserAndWorkspace,
	listPeopleInWorkspace
} from '../people/queries';
// SYOS-1006: Import validation rules (static import required by Convex)
import { runActivationValidation } from './rules';

type WorkspaceSummary = {
	workspaceId: Id<'workspaces'>;
	name: string;
	initials: string;
	slug: string;
	plan: string;
	phase?: 'design' | 'active'; // Optional: undefined treated as 'active' for backwards compat
	createdAt: number;
	updatedAt: number;
	role: string;
	joinedAt: number;
	memberCount: number;
};

export const findBySlug = query({
	args: {
		slug: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspace = await findWorkspaceBySlug(ctx, args.slug);
		if (!workspace || workspace.archivedAt) return null;

		// SYOS-814 Phase 2: Use people table
		const person = await findPersonByUserAndWorkspace(ctx, userId, workspace._id);
		if (!person || person.status !== 'active') return null;

		return getWorkspaceSummaryFromPerson(ctx, workspace, person);
	}
});

export const findById = query({
	args: {
		workspaceId: v.id('workspaces'),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace || workspace.archivedAt) return null;

		// SYOS-814 Phase 2: Use people table
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
		if (!person || person.status !== 'active') return null;

		return getWorkspaceSummaryFromPerson(ctx, workspace, person);
	}
});

async function listWorkspaceSummaries(ctx: QueryCtx, userId: Id<'users'>) {
	const workspaceIds = await listWorkspacesForUser(ctx, userId);

	const summaries = await Promise.all(
		workspaceIds.map(async (workspaceId) => {
			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
			if (!person || person.status !== 'active') return undefined;

			const workspace = await ctx.db.get(workspaceId);
			if (!workspace || workspace.archivedAt) return undefined;

			return getWorkspaceSummaryFromPerson(ctx, workspace, person);
		})
	);

	return summaries.filter((summary): summary is WorkspaceSummary => summary !== undefined);
}

// SYOS-814 Phase 3: Removed deprecated getWorkspaceSummary functions
// All code now uses getWorkspaceSummaryFromPerson with people table

// SYOS-814 Phase 2: New function using people table
async function getWorkspaceSummaryFromPerson(
	ctx: QueryCtx,
	workspace: Doc<'workspaces'>,
	person: Doc<'people'>
): Promise<WorkspaceSummary> {
	// Get member count from people table
	const activePeople = await listPeopleInWorkspace(ctx, workspace._id, { status: 'active' });

	return {
		workspaceId: workspace._id,
		name: workspace.name,
		initials: calculateInitialsFromName(workspace.name),
		slug: workspace.slug,
		plan: workspace.plan,
		phase: workspace.phase,
		createdAt: workspace.createdAt,
		updatedAt: workspace.updatedAt,
		role: person.workspaceRole,
		joinedAt: person.joinedAt ?? person.invitedAt ?? person.createdAt,
		memberCount: activePeople.length
	};
}

async function findWorkspaceBySlug(ctx: QueryCtx, slug: string) {
	return ctx.db
		.query('workspaces')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.first();
}

export const listWorkspaces = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args): Promise<WorkspaceSummary[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const summaries = await listWorkspaceSummaries(ctx, userId);
		return summaries ?? [];
	}
});

// ============================================================================
// Alias Queries (SYOS-855: merged from aliases.ts)
// ============================================================================

/**
 * Get workspace alias by slug
 * Used to resolve old slugs to current workspace
 */
export const getAliasBySlug = query({
	args: {
		slug: v.string(),
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Find alias by slug
		const alias = await ctx.db
			.query('workspaceAliases')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (!alias) {
			return null;
		}

		// Verify user has access to the workspace (SYOS-814 Phase 2: Use people table)
		const person = await findPersonByUserAndWorkspace(ctx, userId, alias.workspaceId);
		if (!person || person.status !== 'active') {
			// User doesn't have access - return null (don't leak workspace existence)
			return null;
		}

		return {
			workspaceId: alias.workspaceId,
			slug: alias.slug,
			createdAt: alias.createdAt
		};
	}
});

// ============================================================================
// Activation Validation (SYOS-997, SYOS-1006)
// ============================================================================

/**
 * Get activation issues for a workspace
 *
 * Returns a list of validation issues that block activation (design → active phase).
 * Empty array means workspace is ready to activate.
 *
 * Validation checks:
 * - ORG-01: Workspace has exactly one root circle
 * - ORG-10: Root circle type ≠ guild
 * - GOV-01: Every circle has role with roleType: 'circle_lead'
 * - GOV-02: Every role has a purpose (customFieldValue)
 * - GOV-03: Every role has ≥1 decision_right (customFieldValue)
 *
 * @see SYOS-997: Activation validation query and mutation
 * @see SYOS-1006: Refactored to use rules.ts registry pattern
 */
export const getActivationIssues = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	returns: v.array(
		v.object({
			id: v.string(),
			code: v.string(),
			severity: v.literal('error'),
			entityType: v.union(v.literal('circle'), v.literal('role'), v.literal('workspace')),
			entityId: v.string(),
			entityName: v.string(),
			message: v.string(),
			actionType: v.union(
				v.literal('edit_role'),
				v.literal('edit_circle'),
				v.literal('assign_lead'),
				v.literal('create_root')
			),
			actionUrl: v.string()
		})
	),
	handler: async (ctx, args) => {
		// Auth check: verify user has access to workspace
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
		if (!person || person.status !== 'active') {
			throw new Error('AUTHZ_NOT_WORKSPACE_MEMBER: You do not have access to this workspace');
		}

		// Get workspace
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace || workspace.archivedAt) {
			throw new Error('WORKSPACE_NOT_FOUND: Workspace not found');
		}

		// Delegate to shared validation rules (SYOS-1006)
		return runActivationValidation(ctx, args.workspaceId, workspace.slug);
	}
});

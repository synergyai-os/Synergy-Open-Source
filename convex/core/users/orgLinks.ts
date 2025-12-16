import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../people/queries';

export type OrgLink = {
	workspaceId: Id<'workspaces'>;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

// SYOS-814 Phase 3: Migrated to use people table
export async function listOrgLinksForUser(ctx: QueryCtx, userId: Id<'users'>): Promise<OrgLink[]> {
	const workspaceIds = await listWorkspacesForUser(ctx, userId);

	const links = await Promise.all(
		workspaceIds.map(async (workspaceId) => {
			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
			if (!person || person.status !== 'active') return null;

			return {
				workspaceId,
				role: person.workspaceRole,
				joinedAt: person.joinedAt ?? person.invitedAt
			};
		})
	);

	return links.filter((link): link is OrgLink => link !== null);
}

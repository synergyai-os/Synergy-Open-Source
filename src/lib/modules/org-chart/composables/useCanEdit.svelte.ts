import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { invariant } from '$lib/utils/invariant';

interface UseCanEditParams {
	sessionId: () => string | null;
	workspaceId: () => Id<'workspaces'> | null;
	circleId: () => Id<'circles'> | null;
}

export function useCanEdit(params: UseCanEditParams) {
	// Query workspace to get phase
	const workspaceQuery = $derived(
		params.workspaceId() && params.sessionId()
			? useQuery(api.core.workspaces.index.findById, () => {
					const sessionId = params.sessionId();
					const workspaceId = params.workspaceId();
					invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
					return { sessionId, workspaceId };
				})
			: null
	);

	// Query circle membership (for active phase)
	const membershipQuery = $derived(
		params.circleId() && params.sessionId()
			? useQuery(api.core.circles.index.isMember, () => {
					const sessionId = params.sessionId();
					const circleId = params.circleId();
					invariant(sessionId && circleId, 'sessionId and circleId required');
					return { sessionId, circleId };
				})
			: null
	);

	const canEdit = $derived.by(() => {
		const workspace = workspaceQuery?.data;
		if (!workspace) return false;

		// Design phase: any workspace member can edit
		if (workspace.phase === 'design') {
			return true; // Already a member if they can see the workspace
		}

		// Active phase: must be circle member to propose
		return membershipQuery?.data ?? false;
	});

	const isDesignPhase = $derived(workspaceQuery?.data?.phase === 'design');

	return {
		get canEdit() {
			return canEdit;
		},
		get isDesignPhase() {
			return isDesignPhase;
		},
		get isLoading() {
			return workspaceQuery?.isLoading ?? true;
		}
	};
}

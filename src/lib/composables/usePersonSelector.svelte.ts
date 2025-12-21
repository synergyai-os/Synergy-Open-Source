/**
 * usePersonSelector Composable
 *
 * Manages state and data fetching for PersonSelector component.
 * Supports six modes: workspace-all, circle-members, circle-aware,
 * role-fillers, task-assignee, document-owner.
 *
 * Pattern: Single $state object with getters (Svelte 5)
 * Queries: Reactive using useQuery from convex-svelte
 *
 * @see dev-docs/investigation-people-selector.md
 */

import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import { SvelteSet } from 'svelte/reactivity';
import { invariant } from '$lib/utils/invariant';
import type { Id } from '$lib/convex';
import type {
	PersonSelectorMode,
	PersonSelectorOption,
	PersonBadgeType,
	PersonStatus
} from '$lib/types/person-selector';

type Config = {
	mode: () => PersonSelectorMode;
	workspaceId: () => Id<'workspaces'>;
	sessionId: () => string;
	circleId?: () => Id<'circles'> | undefined;
};

export function usePersonSelector(config: Config) {
	// Internal state (single $state object pattern)
	const state = $state({
		searchValue: '',
		isLoading: true,
		error: null as string | null
	});

	// Get reactive config values
	const mode = config.mode;
	const workspaceId = config.workspaceId;
	const sessionId = config.sessionId;
	const circleId = config.circleId;

	// Derived: Check which queries are needed at initialization
	// Pattern from convex-integration.md#L140 - check mode requirements ONCE
	const initialMode = mode();
	const needsCircleQuery = initialMode === 'circle-members' || initialMode === 'circle-aware';
	const needsRoleQuery = initialMode === 'role-fillers';

	// Query: Workspace people (always needed - all modes use workspace data)
	// This includes active, invited, AND placeholder people
	const workspacePeopleQuery = useQuery(api.core.people.queries.listAllPeopleInWorkspace, () => {
		const sid = sessionId();
		const wid = workspaceId();
		return { sessionId: sid, workspaceId: wid };
	});

	// Query: Circle members (conditional - only when mode needs it AND circleId provided)
	// Pattern: Conditional creation based on mode + config (convex-integration.md#L185)
	const circleMembersQuery =
		needsCircleQuery && config.circleId
			? useQuery(api.core.circles.index.getMembers, () => {
					const sid = sessionId();
					const cid = circleId?.();
					// Throw for missing REQUIRED params
					invariant(sid, 'sessionId required');
					invariant(cid, 'circleId required for circle-members/circle-aware modes');
					return { sessionId: sid, circleId: cid, includeArchived: false };
				})
			: null;

	// Query: Role fillers (conditional - only when mode needs it AND circleId provided)
	const rolesByCircleQuery =
		needsRoleQuery && config.circleId
			? useQuery(api.core.roles.index.listByCircle, () => {
					const sid = sessionId();
					const cid = circleId?.();
					invariant(sid, 'sessionId required');
					invariant(cid, 'circleId required for role-fillers mode');
					return { sessionId: sid, circleId: cid };
				})
			: null;

	// Derived: Options based on mode
	const options = $derived.by((): PersonSelectorOption[] => {
		const m = mode();

		// Mode: workspace-all, task-assignee, document-owner
		if (m === 'workspace-all' || m === 'task-assignee' || m === 'document-owner') {
			const people = workspacePeopleQuery?.data ?? [];

			return people
				.filter((person) => {
					// task-assignee and document-owner: only invited+active (no placeholders)
					if (m === 'task-assignee' || m === 'document-owner') {
						return person.status === 'invited' || person.status === 'active';
					}
					return true;
				})
				.map((person) =>
					mapPersonToOption(person, {
						showStatusBadge: true,
						showMembershipBadge: false
					})
				);
		}

		// Mode: circle-members
		if (m === 'circle-members') {
			const members = circleMembersQuery?.data ?? [];

			return members.map((member) =>
				mapCircleMemberToOption(member, {
					showStatusBadge: true,
					showMembershipBadge: false
				})
			);
		}

		// Mode: circle-aware (show all workspace, badge circle members)
		if (m === 'circle-aware') {
			const workspacePeople = workspacePeopleQuery?.data ?? [];
			const circleMembers = circleMembersQuery?.data ?? [];
			const circlePersonIds = new SvelteSet(circleMembers.map((m) => m.personId).filter(Boolean));

			return workspacePeople.map((person) => {
				const isCircleMember = person.personId ? circlePersonIds.has(person.personId) : false;
				const option = mapPersonToOption(person, {
					showStatusBadge: true,
					showMembershipBadge: true,
					isCircleMember
				});
				return {
					...option,
					circleMembership: isCircleMember ? 'in-circle' : 'outside-circle'
				};
			});
		}

		// Mode: role-fillers (show roles with fillers expanded)
		if (m === 'role-fillers') {
			const roles = rolesByCircleQuery?.data ?? [];
			const roleOptions: PersonSelectorOption[] = [];

			for (const role of roles) {
				// Role with fillers - expand to one option per filler
				if (role.fillerCount > 0) {
					// Note: We need the actual filler details (name, email, etc.)
					// The listByCircle query returns { roleId, name, purpose, fillerCount }
					// We need a separate query or field to get filler details
					// For now, we'll create options with the role name only
					// TODO: Implement proper filler expansion when getRoleFillers is available
					roleOptions.push({
						id: role.roleId,
						personId: undefined,
						roleId: role.roleId,
						displayName: role.name,
						searchableText: role.name,
						status: undefined
					});
				} else {
					// Unfilled role
					roleOptions.push({
						id: `${role.roleId}-unfilled`,
						personId: undefined,
						roleId: role.roleId,
						displayName: role.name,
						searchableText: role.name,
						status: undefined
					});
				}
			}

			return roleOptions;
		}

		return [];
	});

	// Derived: Filtered options based on search
	const filteredOptions = $derived.by(() => {
		if (!state.searchValue || state.searchValue.trim().length === 0) {
			return options;
		}

		const searchLower = state.searchValue.toLowerCase().trim();
		return options.filter((option) => option.searchableText.toLowerCase().includes(searchLower));
	});

	// Derived: Can create new (search doesn't match existing)
	const canCreateNew = $derived.by(() => {
		if (!state.searchValue || state.searchValue.trim().length === 0) return false;

		const searchLower = state.searchValue.toLowerCase().trim();
		return !options.some(
			(opt) =>
				opt.displayName.toLowerCase() === searchLower || opt.email?.toLowerCase() === searchLower
		);
	});

	// Derived: Loading state
	const isLoading = $derived.by(() => {
		const m = mode();

		if (m === 'workspace-all' || m === 'task-assignee' || m === 'document-owner') {
			return workspacePeopleQuery?.isLoading ?? true;
		}

		if (m === 'circle-members') {
			return circleMembersQuery?.isLoading ?? true;
		}

		if (m === 'circle-aware') {
			return (workspacePeopleQuery?.isLoading ?? true) || (circleMembersQuery?.isLoading ?? true);
		}

		if (m === 'role-fillers') {
			return rolesByCircleQuery?.isLoading ?? true;
		}

		return false;
	});

	// Derived: Error state
	const error = $derived.by(() => {
		const m = mode();

		if (m === 'workspace-all' || m === 'task-assignee' || m === 'document-owner') {
			return workspacePeopleQuery?.error?.message ?? null;
		}

		if (m === 'circle-members') {
			return circleMembersQuery?.error?.message ?? null;
		}

		if (m === 'circle-aware') {
			return workspacePeopleQuery?.error?.message ?? circleMembersQuery?.error?.message ?? null;
		}

		if (m === 'role-fillers') {
			return rolesByCircleQuery?.error?.message ?? null;
		}

		return null;
	});

	return {
		get options() {
			return filteredOptions;
		},
		// Unfiltered options (ignore search). Useful for rendering selected items while searching.
		get allOptions() {
			return options;
		},
		get searchValue() {
			return state.searchValue;
		},
		set searchValue(v: string) {
			state.searchValue = v;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get canCreateNew() {
			return canCreateNew;
		},
		// Actions
		clearSearch: () => {
			state.searchValue = '';
		}
	};
}

// ============================================================================
// Mapping Functions
// ============================================================================

type WorkspacePerson = {
	personId: Id<'people'>;
	displayName: string;
	email: string | null;
	status: PersonStatus;
	workspaceRole: 'owner' | 'admin' | 'member';
	userId?: Id<'users'>;
};

type CircleMember = {
	personId: Id<'people'>;
	displayName: string;
	email?: string;
	status: PersonStatus;
	addedAt: number;
	addedBy?: Id<'people'>;
};

function mapPersonToOption(
	person: WorkspacePerson,
	config: {
		showStatusBadge: boolean;
		showMembershipBadge: boolean;
		isCircleMember?: boolean;
	}
): PersonSelectorOption {
	let badge: PersonBadgeType | undefined;

	// Status badges take priority
	if (config.showStatusBadge) {
		if (person.status === 'placeholder') badge = 'placeholder';
		else if (person.status === 'invited') badge = 'invited';
	}

	// Membership badges (if no status badge)
	if (!badge && config.showMembershipBadge) {
		badge = config.isCircleMember ? 'circle-member' : 'workspace-member';
	}

	return {
		id: person.personId,
		personId: person.personId,
		displayName: person.displayName,
		searchableText: `${person.displayName ?? ''} ${person.email ?? ''}`.trim(),
		avatarName: person.displayName,
		email: person.email ?? undefined,
		badge,
		status: person.status
	};
}

function mapCircleMemberToOption(
	member: CircleMember,
	config: {
		showStatusBadge: boolean;
		showMembershipBadge: boolean;
	}
): PersonSelectorOption {
	let badge: PersonBadgeType | undefined;

	// Status badges take priority
	if (config.showStatusBadge) {
		if (member.status === 'placeholder') badge = 'placeholder';
		else if (member.status === 'invited') badge = 'invited';
	}

	return {
		id: member.personId,
		personId: member.personId,
		displayName: member.displayName || member.email || 'Unknown',
		searchableText: `${member.displayName ?? ''} ${member.email ?? ''}`.trim(),
		avatarName: member.displayName,
		email: member.email,
		badge,
		status: member.status
	};
}

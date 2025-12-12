/**
 * Tasks Data Composable
 *
 * Provides data fetching logic for tasks (formerly action items).
 *
 * Features:
 * - Fetches tasks for agenda item
 * - Fetches workspace members (for user dropdown)
 * - Fetches circle roles (for role dropdown, if circle exists)
 * - Provides loading/error state
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { Doc } from '$convex/_generated/dataModel';
import type { UseTasksOptions, UseTasksReturn } from '../api';
import { invariant } from '$lib/utils/invariant';

// Type alias for clarity - Task is just a Doc with no additional fields
export type Task = Doc<'tasks'>;

export interface Member {
	personId?: Id<'people'>;
	userId: Id<'users'>;
	email: string;
	name: string;
	role: string;
	joinedAt: number;
}

export interface Role {
	roleId: Id<'circleRoles'>;
	circleId: Id<'circles'>;
	name: string;
	purpose: string | undefined;
	fillerCount: number;
	createdAt: number;
}

export function useTasks(params: UseTasksOptions): UseTasksReturn {
	// Query tasks for this agenda item
	const tasksQuery =
		browser && params.sessionId()
			? useQuery(api.features.tasks.index.listByAgendaItem, () => {
					const sessionId = params.sessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId, agendaItemId: params.agendaItemId() };
				})
			: null;

	// Query workspace members (for user dropdown)
	const membersQuery =
		browser && params.sessionId()
			? useQuery(api.core.workspaces.index.listMembers, () => {
					const sessionId = params.sessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId, workspaceId: params.workspaceId() };
				})
			: null;

	// Query circle roles (for role dropdown) - only if circle exists
	const rolesQuery =
		browser && params.sessionId() && params.circleId?.()
			? useQuery(api.core.roles.index.listByCircle, () => {
					const sessionId = params.sessionId();
					const circleId = params.circleId?.();
					invariant(sessionId, 'sessionId required');
					invariant(circleId, 'circleId required');
					return { sessionId, circleId };
				})
			: null;

	// Derived data
	const tasks = $derived(tasksQuery?.data ?? []);
	const members = $derived(membersQuery?.data ?? []);
	const roles = $derived(rolesQuery?.data ?? []);
	const isLoading = $derived(
		(tasksQuery?.isLoading ?? false) ||
			(membersQuery?.isLoading ?? false) ||
			(rolesQuery?.isLoading ?? false)
	);

	return {
		get tasks() {
			return tasks;
		},
		get members() {
			return members;
		},
		get roles() {
			return roles;
		},
		get isLoading() {
			return isLoading;
		}
	};
}

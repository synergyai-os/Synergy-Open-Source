/**
 * Action Items Data Composable
 *
 * SYOS-467: Extracts data fetching logic from ActionItemsList component
 *
 * Features:
 * - Fetches action items for agenda item
 * - Fetches organization members (for user dropdown)
 * - Fetches circle roles (for role dropdown, if circle exists)
 * - Provides loading/error state
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { Doc } from '$convex/_generated/dataModel';

interface UseActionItemsParams {
	agendaItemId: () => Id<'meetingAgendaItems'>;
	sessionId: () => string | undefined;
	organizationId: () => Id<'organizations'>;
	circleId?: () => Id<'circles'> | undefined;
}

// Type alias for clarity - ActionItem is just a Doc with no additional fields
export type ActionItem = Doc<'meetingActionItems'>;

export interface Member {
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

export interface UseActionItemsReturn {
	get actionItems(): ActionItem[];
	get members(): Member[];
	get roles(): Role[];
	get isLoading(): boolean;
}

export function useActionItems(params: UseActionItemsParams): UseActionItemsReturn {
	// Query action items for this agenda item
	const actionItemsQuery =
		browser && params.sessionId()
			? useQuery(api.meetingActionItems.listByAgendaItem, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId, agendaItemId: params.agendaItemId() };
				})
			: null;

	// Query organization members (for user dropdown)
	const membersQuery =
		browser && params.sessionId()
			? useQuery(api.organizations.getMembers, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId, organizationId: params.organizationId() };
				})
			: null;

	// Query circle roles (for role dropdown) - only if circle exists
	const rolesQuery =
		browser && params.sessionId() && params.circleId?.()
			? useQuery(api.circleRoles.listByCircle, () => {
					const sessionId = params.sessionId();
					const circleId = params.circleId?.();
					if (!sessionId) throw new Error('sessionId required');
					if (!circleId) throw new Error('circleId required');
					return { sessionId, circleId };
				})
			: null;

	// Derived data
	const actionItems = $derived(actionItemsQuery?.data ?? []);
	const members = $derived(membersQuery?.data ?? []);
	const roles = $derived(rolesQuery?.data ?? []);
	const isLoading = $derived(
		(actionItemsQuery?.isLoading ?? false) ||
			(membersQuery?.isLoading ?? false) ||
			(rolesQuery?.isLoading ?? false)
	);

	return {
		get actionItems() {
			return actionItems;
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

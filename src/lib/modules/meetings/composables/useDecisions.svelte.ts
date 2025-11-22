/**
 * Decisions Data Composable
 *
 * SYOS-470: Extracts data fetching logic from DecisionsList component
 *
 * Features:
 * - Fetches decisions for agenda item
 * - Provides sorted decisions (by decidedAt DESC)
 * - Provides loading/error state
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { Doc } from '$convex/_generated/dataModel';

interface UseDecisionsParams {
	agendaItemId: () => Id<'meetingAgendaItems'>;
	sessionId: () => string | undefined;
}

export interface Decision extends Doc<'meetingDecisions'> {}

export interface UseDecisionsReturn {
	get decisions(): Decision[];
	get isLoading(): boolean;
}

export function useDecisions(params: UseDecisionsParams): UseDecisionsReturn {
	// Query decisions for this agenda item
	const decisionsQuery =
		browser && params.sessionId()
			? useQuery(api.meetingDecisions.listByAgendaItem, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId, agendaItemId: params.agendaItemId() };
				})
			: null;

	// Derived data
	const decisions = $derived(decisionsQuery?.data ?? []);
	const sortedDecisions = $derived([...decisions].sort((a, b) => b.decidedAt - a.decidedAt));
	const isLoading = $derived(decisionsQuery?.isLoading ?? false);

	return {
		get decisions() {
			return sortedDecisions;
		},
		get isLoading() {
			return isLoading;
		}
	};
}

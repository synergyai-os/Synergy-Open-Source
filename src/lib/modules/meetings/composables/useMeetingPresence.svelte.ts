/**
 * Meeting Presence Composable - Real-time presence tracking (SYOS-227)
 *
 * Manages recordHeartbeat lifecycle and provides real-time presence data.
 *
 * Pattern: Svelte 5 composable with single $state object + getters
 * Reference: dev-docs/2-areas/patterns/svelte-reactivity.md#L10
 */

import { useQuery, useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { browser } from '$app/environment';
import { invariant } from '$lib/utils/invariant';

interface UseMeetingPresenceOptions {
	/**
	 * Meeting ID (reactive function)
	 * Pattern: Pass function to get latest value
	 * Reference: dev-docs/2-areas/patterns/svelte-reactivity.md#L80
	 */
	meetingId: () => Id<'meetings'> | undefined;

	/**
	 * Session ID for authentication
	 * Pattern: sessionId auth pattern
	 * Reference: dev-docs/2-areas/patterns/convex-integration.md#L1200
	 */
	sessionId: () => string | undefined;
}

/**
 * Composable for managing meeting presence
 *
 * Usage:
 * ```typescript
 * const presence = useMeetingPresence({
 *   meetingId: () => meeting._id,
 *   sessionId: () => data.sessionId
 * });
 *
 * $effect(() => {
 *   if (!browser) return;
 *   presence.startHeartbeat();
 *   return () => presence.stopHeartbeat();
 * });
 * ```
 */
export function useMeetingPresence(options: UseMeetingPresenceOptions) {
	const { meetingId, sessionId } = options;

	// Single $state object (Svelte 5 pattern)
	const state = $state({
		recordHeartbeatInterval: null as NodeJS.Timeout | null
	});

	// Real-time subscription to active presence
	// Pattern: useQuery for reactive subscriptions
	// Reference: dev-docs/2-areas/patterns/svelte-reactivity.md#L220
	const activePresenceQuery =
		browser && meetingId() && sessionId()
			? useQuery(api.modules.meetings.presence.getActivePresence, () => {
					const mid = meetingId();
					const sid = sessionId();
					invariant(mid && sid, 'meetingId and sessionId required for presence tracking');
					return {
						meetingId: mid,
						sessionId: sid
					};
				})
			: null;

	// Real-time subscription to combined attendance (expected + active + guests)
	const combinedAttendanceQuery =
		browser && meetingId() && sessionId()
			? useQuery(api.modules.meetings.presence.getCombinedAttendance, () => {
					const mid = meetingId();
					const sid = sessionId();
					invariant(mid && sid, 'meetingId and sessionId required for attendance tracking');
					return {
						meetingId: mid,
						sessionId: sid
					};
				})
			: null;

	// Convex client for mutations
	const convexClient = useConvexClient();

	// Derived values (reactive)
	// Handle errors gracefully - if presence functions don't exist yet, return empty arrays
	const activeUsers = $derived(activePresenceQuery?.error ? [] : (activePresenceQuery?.data ?? []));
	const activeCount = $derived(activeUsers.length);
	const combinedAttendance = $derived(
		combinedAttendanceQuery?.error ? [] : (combinedAttendanceQuery?.data ?? [])
	);

	/**
	 * Start recordHeartbeat interval
	 * - Sends immediate recordHeartbeat
	 * - Sets up 30s interval for subsequent recordHeartbeats
	 *
	 * Pattern: Context7 validated (Convex Presence Component)
	 * Heartbeat frequency: 30s (2 requests/min/user)
	 */
	const startHeartbeat = () => {
		// Don't start if already running
		if (state.recordHeartbeatInterval) {
			return;
		}

		// Send immediate recordHeartbeat
		sendHeartbeat();

		// Set up interval for subsequent recordHeartbeats (30s)
		state.recordHeartbeatInterval = setInterval(
			() => {
				sendHeartbeat();
			},
			30_000 // 30 seconds
		);
	};

	/**
	 * Stop recordHeartbeat interval
	 * Cleans up interval on component unmount
	 */
	const stopHeartbeat = () => {
		if (state.recordHeartbeatInterval) {
			clearInterval(state.recordHeartbeatInterval);
			state.recordHeartbeatInterval = null;
		}
	};

	/**
	 * Send recordHeartbeat to server
	 * Internal method - called by startHeartbeat
	 */
	const sendHeartbeat = async () => {
		const mid = meetingId();
		const sid = sessionId();

		// Skip if missing required params
		if (!mid || !sid) {
			return;
		}

		try {
			await convexClient.mutation(api.modules.meetings.presence.recordHeartbeat, {
				meetingId: mid,
				sessionId: sid
			});
		} catch (error) {
			console.error('Failed to send recordHeartbeat:', error);
			// Don't throw - allow silent failure for recordHeartbeats
		}
	};

	// Return API with getters (Svelte 5 pattern)
	return {
		/**
		 * List of currently active users
		 * Format: [{ userId, name, joinedAt }]
		 */
		get activeUsers() {
			return activeUsers;
		},

		/**
		 * Count of active users (for header display)
		 */
		get activeCount() {
			return activeCount;
		},

		/**
		 * Combined attendance list (expected + active + guests)
		 * Format: [{ userId, name, isExpected, isActive, attendeeType? }]
		 * Sorted: Expected first, then guests; alphabetically within groups
		 */
		get combinedAttendance() {
			return combinedAttendance;
		},

		/**
		 * Count of expected attendees (for X/Y display)
		 */
		get expectedCount() {
			return combinedAttendance.filter((a) => a.isExpected).length;
		},

		/**
		 * Start sending recordHeartbeats (call on mount)
		 */
		startHeartbeat,

		/**
		 * Stop sending recordHeartbeats (call on unmount)
		 */
		stopHeartbeat
	};
}

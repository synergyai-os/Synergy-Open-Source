/**
 * Meetings Module API Contract
 *
 * Public interface for the Meetings module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';

/**
 * Meeting data structure
 */
export interface Meeting {
	_id: Id<'meetings'> | string; // Synthetic ID for React keys (recurring instances)
	originalMeetingId?: Id<'meetings'>; // Real Convex ID for navigation/queries
	_creationTime: number;
	workspaceId: Id<'workspaces'> | string;
	circleId?: Id<'circles'> | string;
	templateId: Id<'meetingTemplates'> | string; // Required: template defines meeting type/structure
	title: string;
	startTime: number;
	duration: number;
	visibility: 'public' | 'private';
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
	attendeeCount?: number;
	invitedUsers?: Array<{ personId: string; name: string }>;
	createdAt: number;
	createdByPersonId: Id<'people'> | string;
	updatedAt: number;
	closedAt?: number; // Meeting session closed timestamp
	viewerPersonId?: Id<'people'> | string;
	recorderPersonId?: Id<'people'> | string;
}

/**
 * Options for useMeetings composable
 */
export interface UseMeetingsOptions {
	workspaceId: () => string | undefined;
	sessionId: () => string | undefined;
	circleFilter?: () => string | undefined;
}

/**
 * Return type for useMeetings composable
 */
export interface UseMeetingsReturn {
	/**
	 * Meetings scheduled for today
	 */
	get todayMeetings(): Meeting[];

	/**
	 * Meetings scheduled for this week (after today)
	 */
	get thisWeekMeetings(): Meeting[];

	/**
	 * Meetings scheduled beyond this week
	 */
	get futureMeetings(): Meeting[];

	/**
	 * Meetings that have been closed
	 */
	get closedMeetings(): Meeting[];

	/**
	 * Whether meetings query is currently loading
	 */
	get isLoading(): boolean;

	/**
	 * Query error (if any)
	 */
	get error(): unknown;
}

/**
 * Options for useMeetingSession composable
 */
export interface UseMeetingSessionOptions {
	meetingId: () => Id<'meetings'> | undefined;
	sessionId: () => string | undefined;
	personId?: () => Id<'people'> | undefined;
}

/**
 * Return type for useMeetingSession composable
 */
export interface UseMeetingSessionReturn {
	/**
	 * Current meeting data (null if loading or not found)
	 */
	get meeting(): unknown | null;

	/**
	 * List of agenda items for the meeting
	 */
	get agendaItems(): unknown[];

	/**
	 * Whether meeting queries are currently loading
	 */
	get isLoading(): boolean;

	/**
	 * Query error (if any)
	 */
	get error(): unknown;

	/**
	 * Whether the meeting has been started
	 */
	get isStarted(): boolean;

	/**
	 * Whether the meeting has been closed
	 */
	get isClosed(): boolean;

	/**
	 * Current meeting step (e.g., 'check-in', 'agenda', 'decisions')
	 */
	get currentStep(): string;

	/**
	 * Elapsed time since meeting started (in milliseconds)
	 */
	get elapsedTime(): number;

	/**
	 * Elapsed time formatted as "MMmSSs"
	 */
	get elapsedTimeFormatted(): string;

	/**
	 * Start the meeting
	 */
	startMeeting(): Promise<void>;

	/**
	 * Advance to the next meeting step (secretary only)
	 * @param newStep - Step name to advance to
	 */
	advanceStep(newStep: string): Promise<void>;

	/**
	 * Close the meeting (secretary only)
	 */
	closeMeeting(): Promise<void>;

	/**
	 * Add an agenda item to the meeting
	 * @param title - Agenda item title
	 */
	addAgendaItem(title: string): Promise<void>;
}

/**
 * Public API contract for the Meetings module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Usage Pattern:**
 * ```typescript
 * import type { MeetingsModuleAPI } from '$lib/modules/meetings/api';
 *
 * // In component:
 * const meetings = getContext<MeetingsModuleAPI>('meetings');
 * const todayMeetings = meetings.useMeetings({ ... });
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface MeetingsModuleAPI {
	// ===== Public Composables =====

	/**
	 * Composable for managing meetings list
	 *
	 * Provides reactive access to meetings filtered by date ranges
	 * (today, this week, future) and optional circle filter.
	 *
	 * @param options - Configuration options
	 * @returns Reactive meetings data and loading state
	 */
	useMeetings(options: UseMeetingsOptions): UseMeetingsReturn;

	/**
	 * Composable for managing a single meeting session
	 *
	 * Provides real-time meeting state, agenda items, timer, and
	 * secretary actions for running a meeting.
	 *
	 * @param options - Configuration options
	 * @returns Reactive meeting session data and actions
	 */
	useMeetingSession(options: UseMeetingSessionOptions): UseMeetingSessionReturn;
}

/**
 * Global Activity Tracker Store
 * 
 * Manages all background activities (sync, import, export, notifications, etc.)
 * Uses Svelte 5 $state for reactive state management
 */

export interface ActivityProgress {
	// Determinate progress (X/Y)
	current?: number;
	total?: number;
	percentage?: number;
	
	// Indeterminate progress
	indeterminate?: boolean;
	
	// Step-based progress
	currentStep?: number;
	totalSteps?: number;
	steps?: Array<{ id: number; name: string; completed: boolean; current?: boolean }>;
	
	// Queue progress
	queuePosition?: number;
	totalInQueue?: number;
	
	// Free-form progress info
	step?: string;
	message?: string;
	details?: string;
	subStep?: string;
	
	// Time estimates
	estimatedTimeRemaining?: number; // seconds
	startedAt?: number;
}

export interface ActivityQuickAction {
	label: string;
	action: () => void;
	icon?: string;
	variant?: 'primary' | 'secondary' | 'danger';
}

export interface Activity {
	// Core required fields
	id: string;
	type: string; // 'sync' | 'generation' | 'bulk' | 'notification' | 'export' | etc.
	status: 'pending' | 'running' | 'completed' | 'error' | 'cancelled';
	
	// Flexible progress tracking
	progress?: ActivityProgress;
	
	// Flexible metadata per activity type
	metadata?: {
		source?: string; // 'readwise', 'manual', 'ai', etc.
		operation?: string; // 'delete', 'import', 'export', etc.
		format?: string; // 'json', 'csv', etc.
		itemId?: string; // Related item ID
		itemType?: string; // Related item type
		[key: string]: any; // Extensible for future needs
	};
	
	// User interactions
	quickActions?: ActivityQuickAction[];
	
	// Lifecycle
	onCancel?: () => void;
	onDismiss?: () => void;
	autoDismiss?: boolean;
	dismissAfter?: number; // milliseconds
	
	// Visual customization
	icon?: string;
	color?: string;
	priority?: number; // For ordering when multiple activities
	
	// Timestamps
	createdAt: number;
	updatedAt: number;
}

interface ActivityState {
	activities: Activity[];
	pollingInterval: ReturnType<typeof setInterval> | null;
}

export const activityState = $state<ActivityState>({
	activities: [],
	pollingInterval: null
});

/**
 * Add a new activity to the tracker
 */
export function addActivity(activity: Omit<Activity, 'createdAt' | 'updatedAt'>): string {
	const newActivity: Activity = {
		...activity,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	
	activityState.activities.push(newActivity);
	
	// Note: Polling is managed by GlobalActivityTracker component via $effect
	// Do not call startPolling() here - it requires a pollFunction parameter
	
	return newActivity.id;
}

/**
 * Update an existing activity
 */
export function updateActivity(id: string, updates: Partial<Activity>): void {
	const activity = activityState.activities.find(a => a.id === id);
	if (activity) {
		Object.assign(activity, updates);
		activity.updatedAt = Date.now();
	}
}

/**
 * Remove an activity from the tracker
 */
export function removeActivity(id: string): void {
	const index = activityState.activities.findIndex(a => a.id === id);
	if (index !== -1) {
		activityState.activities.splice(index, 1);
		
		// Stop polling if no more activities
		if (activityState.activities.length === 0 && activityState.pollingInterval) {
			stopPolling();
		}
	}
}

/**
 * Find activity by ID
 */
export function getActivity(id: string): Activity | undefined {
	return activityState.activities.find(a => a.id === id);
}

/**
 * Find activities by type
 */
export function getActivitiesByType(type: string): Activity[] {
	return activityState.activities.filter(a => a.type === type);
}

/**
 * Start polling for activity updates
 * This will be called by the GlobalActivityTracker component
 */
export function startPolling(pollFunction: () => Promise<void>): void {
	if (activityState.pollingInterval) {
		return; // Already polling
	}
	
	activityState.pollingInterval = setInterval(async () => {
		await pollFunction();
	}, 500);
}

/**
 * Stop polling for activity updates
 */
export function stopPolling(): void {
	if (activityState.pollingInterval) {
		clearInterval(activityState.pollingInterval);
		activityState.pollingInterval = null;
	}
}

/**
 * Auto-dismiss completed activities after delay
 */
export function setupAutoDismiss(): void {
	for (const activity of activityState.activities) {
		if (activity.autoDismiss && activity.status === 'completed' && activity.dismissAfter) {
			setTimeout(() => {
				removeActivity(activity.id);
			}, activity.dismissAfter);
		}
	}
}


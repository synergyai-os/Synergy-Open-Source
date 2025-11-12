/**
 * Composable for inbox sync functionality
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';
import { addActivity, updateActivity, removeActivity } from '$lib/stores/activityTracker.svelte';
import type { ConvexClient, InboxApi, SyncProgress, SyncReadwiseResult } from '$lib/types/convex';

export interface UseInboxSyncReturn {
	get isSyncing(): boolean;
	get syncError(): string | null;
	get syncSuccess(): boolean;
	get syncProgress(): SyncProgress;
	get showSyncConfig(): boolean;
	handleSyncClick: () => void;
	pollSyncProgress: () => Promise<void>;
	handleImport: (options: {
		dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
		customStartDate?: string;
		customEndDate?: string;
		quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
	}) => Promise<void>;
	handleCancelSync: () => void;
}

export function useInboxSync(
	convexClient: ConvexClient | null,
	inboxApi: InboxApi | null,
	getUserId: () => string | undefined,
	onItemsReload?: () => Promise<void>,
	onClearSelection?: () => void
): UseInboxSyncReturn {
	// Sync state - use single $state object for better reactivity tracking
	const state = $state({
		isSyncing: false,
		syncError: null as string | null,
		syncSuccess: false,
		syncProgress: null as SyncProgress,
		showSyncConfig: false
	});

	let progressPollInterval: ReturnType<typeof setInterval> | null = null;
	let syncActivityId: string | null = null; // Track activity ID for global tracker

	// Functions
	function handleSyncClick() {
		// Show config panel instead of directly syncing
		state.showSyncConfig = true;

		// Clear any stale sync state when opening config (in case of previous incomplete sync)
		state.syncProgress = null;
		state.syncSuccess = false;
		state.syncError = null;
		state.isSyncing = false;

		// Clear any existing poll interval (shouldn't exist, but safety check)
		if (progressPollInterval) {
			clearInterval(progressPollInterval);
			progressPollInterval = null;
		}

		// Clear any stale activity from previous sync (if it exists)
		if (syncActivityId) {
			removeActivity(syncActivityId);
			syncActivityId = null;
		}

		// Clear selection to show config panel
		if (onClearSelection) {
			onClearSelection();
		}
	}

	// Poll for sync progress
	// Only updates progress state - does NOT mark completion (that's handled by handleImport based on action result)
	async function pollSyncProgress() {
		if (!browser || !convexClient || !inboxApi) return;

		// Don't poll if we're just showing the config panel (not actively syncing)
		if (!state.isSyncing && !state.syncProgress) return;

		const userId = getUserId();
		if (!userId) return;

		try {
			const progress = (await convexClient.query(inboxApi.getSyncProgress, { userId })) as SyncProgress;
			if (progress) {
				// Update progress state
				state.syncProgress = progress;

				// Update global tracker if activity exists
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'running',
						progress: {
							step: progress.step,
							current: progress.current,
							total: progress.total,
							message: progress.message
						}
					});
				}
			}
			// Note: We do NOT mark completion here when progress is null
			// Completion is handled by handleImport() based on the action result
			// This prevents race conditions where completion is marked too early
		} catch (error) {
			console.error('Failed to poll sync progress:', error);

			// Only update tracker on error if we're actively syncing
			if (syncActivityId && state.isSyncing) {
				updateActivity(syncActivityId, {
					status: 'error',
					progress: {
						message: error instanceof Error ? error.message : 'Failed to sync'
					}
				});
			}
		}
	}

	async function handleImport(options: {
		dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
		quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
		customStartDate?: string;
		customEndDate?: string;
	}) {
		if (!browser || !convexClient || !inboxApi) return;

		state.showSyncConfig = false;
		state.isSyncing = true;
		state.syncError = null;
		state.syncSuccess = false;

		// Clear any existing poll interval
		if (progressPollInterval) {
			clearInterval(progressPollInterval);
			progressPollInterval = null;
		}

		// Clear any existing activity
		if (syncActivityId) {
			removeActivity(syncActivityId);
			syncActivityId = null;
		}

		// Add activity to global tracker
		syncActivityId = addActivity({
			id: `sync-readwise-${Date.now()}`,
			type: 'sync',
			status: 'running',
			metadata: {
				source: 'readwise',
				operation: 'import'
			},
			progress: {
				step: 'Starting sync...',
				current: 0,
				indeterminate: true
			},
			quickActions: [
				{
					label: 'View Inbox',
					action: () => {
						// Will be handled by dismiss, navigation can happen on dismiss
					}
				}
			],
			onCancel: () => {
				handleCancelSync();
			},
			autoDismiss: true,
			dismissAfter: 5000
		});

		// Start polling for progress updates (every 500ms)
		progressPollInterval = setInterval(pollSyncProgress, 500);
		// Poll immediately
		pollSyncProgress();

		try {
			const result = (await convexClient.action(
				inboxApi.syncReadwiseHighlights,
				options
			)) as SyncReadwiseResult;

			// Stop polling immediately after action completes (before processing result)
			// This prevents race conditions where pollSyncProgress might mark completion too early
			if (progressPollInterval) {
				clearInterval(progressPollInterval);
				progressPollInterval = null;
			}

			// Final poll to get the last progress update (if any)
			await pollSyncProgress();

			// Show friendly message if nothing new was imported (quantity-based)
			if (options.quantity && result?.newCount === 0 && result?.skippedCount > 0) {
				state.syncError = null;
				state.syncSuccess = true;
				state.syncProgress = {
					step: 'Already imported',
					current: result.skippedCount,
					total: result.skippedCount,
					message: `All ${result.skippedCount} highlights are already in your inbox. No new items imported.`
				};

				// Update global tracker
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							step: 'Already imported',
							current: result.skippedCount,
							total: result.skippedCount,
							message: `All ${result.skippedCount} highlights are already in your inbox.`
						}
					});
				}

				// Reload inbox items
				if (onItemsReload) {
					await onItemsReload();
				}

				// Clear progress after 4 seconds
				// Activity auto-dismiss is handled by setupAutoDismiss() in GlobalActivityTracker
				setTimeout(() => {
					state.syncProgress = null;
					state.syncSuccess = false;
					state.isSyncing = false;
					if (progressPollInterval) {
						clearInterval(progressPollInterval);
						progressPollInterval = null;
					}
				}, 4000);
			} else if (result?.newCount === 0 && result?.skippedCount === 0) {
				// Nothing at all was found/processed
				state.syncError = null;
				state.syncSuccess = false;
				state.syncProgress = null;
				state.isSyncing = false;

				// Update global tracker
				// Activity auto-dismiss is handled by setupAutoDismiss() in GlobalActivityTracker
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							message: 'No new items to import'
						}
					});
				}
			} else {
				// New items imported
				state.syncSuccess = true;

				// Update global tracker with success message
				if (syncActivityId && result) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							message:
								result.newCount > 0
									? `Imported ${result.newCount} new highlight${result.newCount === 1 ? '' : 's'}`
									: 'Sync completed'
						}
					});
				}

				// Reload inbox items after successful sync
				if (onItemsReload) {
					await onItemsReload();
				}

				// Clear progress after 2 seconds
				// Activity auto-dismiss is handled by setupAutoDismiss() in GlobalActivityTracker
				setTimeout(() => {
					state.syncProgress = null;
					state.syncSuccess = false;
					state.isSyncing = false;
					if (progressPollInterval) {
						clearInterval(progressPollInterval);
						progressPollInterval = null;
					}
				}, 2000);
			}
		} catch (error) {
			state.syncError = error instanceof Error ? error.message : 'Failed to sync';
			state.syncProgress = null;
			state.isSyncing = false;

			// Update global tracker with error
			if (syncActivityId) {
				updateActivity(syncActivityId, {
					status: 'error',
					progress: {
						message: state.syncError
					}
				});

				// Keep error visible longer
				setTimeout(() => {
					if (syncActivityId) {
						removeActivity(syncActivityId);
						syncActivityId = null;
					}
				}, 5000);
			}

			if (progressPollInterval) {
				clearInterval(progressPollInterval);
				progressPollInterval = null;
			}
		}
	}

	function handleCancelSync() {
		state.showSyncConfig = false;
		state.syncProgress = null;
		state.isSyncing = false;
		state.syncError = null;

		// Remove activity from global tracker
		if (syncActivityId) {
			updateActivity(syncActivityId, {
				status: 'cancelled'
			});
			setTimeout(() => {
				if (syncActivityId) {
					removeActivity(syncActivityId);
					syncActivityId = null;
				}
			}, 1000);
		}

		if (progressPollInterval) {
			clearInterval(progressPollInterval);
			progressPollInterval = null;
		}
	}

	// Return state and functions
	// State object is already reactive, so we merge it with functions
	return {
		// State - directly reference the reactive state object properties
		get isSyncing() {
			return state.isSyncing;
		},
		get syncError() {
			return state.syncError;
		},
		get syncSuccess() {
			return state.syncSuccess;
		},
		get syncProgress() {
			return state.syncProgress;
		},
		get showSyncConfig() {
			return state.showSyncConfig;
		},
		// Functions
		handleSyncClick,
		pollSyncProgress,
		handleImport,
		handleCancelSync
	};
}

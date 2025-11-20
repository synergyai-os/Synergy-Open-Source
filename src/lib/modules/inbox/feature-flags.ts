/**
 * Inbox Module Feature Flags
 *
 * Feature flags specific to the inbox module.
 * System-level flags are in `$lib/infrastructure/feature-flags`.
 */

export const InboxFeatureFlags = {
	/**
	 * Inbox Batch Actions - Enables multi-select functionality in the inbox:
	 * select multiple items, bulk archive, bulk delete, bulk tag, and bulk move to folders.
	 * Status: Not yet implemented
	 */
	INBOX_BATCH_ACTIONS_DEV: 'inbox_batch_actions_dev',

	/**
	 * Readwise Sync v2 - Upgrades Readwise integration with improved error handling,
	 * retry logic, and sync reliability. Automatically handles failed syncs and provides
	 * better status reporting.
	 * Status: Not yet implemented
	 */
	SYNC_READWISE_V2_ROLLOUT: 'sync_readwise_v2_rollout'
} as const;

export type InboxFeatureFlagKey = (typeof InboxFeatureFlags)[keyof typeof InboxFeatureFlags];

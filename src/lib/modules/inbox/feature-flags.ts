/**
 * Inbox Module Feature Flags
 *
 * All feature flags have been removed - inbox is a core feature, always enabled.
 * This file is kept for backward compatibility but exports empty objects.
 */

export const InboxFeatureFlags = {} as const;

export type InboxFeatureFlagKey = (typeof InboxFeatureFlags)[keyof typeof InboxFeatureFlags];

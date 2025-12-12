/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
	/** Unique flag identifier */
	flag: string;
	/** User ID to check flag for */
	userId?: string;
	/** User email for domain-based checks */
	userEmail?: string;
	/** Check if user is team member */
	isTeamMember?: boolean;
}

/**
 * Feature flag targeting rules
 */
export interface FeatureFlagRule {
	/** Flag identifier */
	flag: string;
	/** Is flag globally enabled? */
	enabled: boolean;
	/** Percentage of users to show (0-100) */
	rolloutPercentage?: number;
	/** Specific user IDs that should see this */
	allowedUserIds?: string[];
	/** Specific organization IDs that should see this (all members) */
	allowedOrganizationIds?: string[];
	/** Email domains that should see this (e.g., "@yourcompany.com") */
	allowedDomains?: string[];
	/** Created timestamp */
	createdAt?: number;
	/** Last updated timestamp */
	updatedAt?: number;
}

/**
 * Application configuration
 * Centralized settings for the app that can be easily adjusted
 */

const SESSION_DURATION_DAYS = 30;

export const config = {
	auth: {
		// Session duration in days (default: 30 days)
		sessionDurationDays: SESSION_DURATION_DAYS,
		// Calculate maxAge in seconds for cookie configuration
		sessionMaxAgeSeconds: SESSION_DURATION_DAYS * 24 * 60 * 60
	}
} as const;

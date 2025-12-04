/**
 * Application configuration
 * Centralized settings for the app that can be easily adjusted
 */

const SESSION_DURATION_DAYS = 30;

// Helper to read env vars safely (server-side only)
// Uses process.env directly to avoid import issues in shared config
function getEnvVar(key: string): string | undefined {
	if (typeof process !== 'undefined' && process.env) {
		return process.env[key];
	}
	return undefined;
}

export const config = {
	auth: {
		// Session duration in days (default: 30 days)
		sessionDurationDays: SESSION_DURATION_DAYS,
		// Calculate maxAge in seconds for cookie configuration
		sessionMaxAgeSeconds: SESSION_DURATION_DAYS * 24 * 60 * 60
	},
	logging: {
		// Enable debug logging by category via environment variables
		// Usage: DEBUG_AUTH=true npm run dev
		auth: getEnvVar('DEBUG_AUTH') === 'true',
		layout: getEnvVar('DEBUG_LAYOUT') === 'true',
		linkedSessions: getEnvVar('DEBUG_LINKED_SESSIONS') === 'true',
		api: getEnvVar('DEBUG_API') === 'true',
		rateLimit: getEnvVar('DEBUG_RATE_LIMIT') === 'true',
		general: getEnvVar('DEBUG_GENERAL') === 'true'
	}
} as const;

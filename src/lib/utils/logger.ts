/**
 * Logger Utility
 *
 * Provides structured logging with categories and log levels.
 * Logs can be enabled/disabled by category via environment variables or config.
 *
 * ⚠️ IMPORTANT: When to use this vs console.log
 * - Use `console.log` for TEMPORARY debugging (remove before commit)
 * - Use `logger` for LONG-TERM production logs (persistent, structured)
 *
 * See: .cursor/rules/logging-patterns.mdc for complete guidelines
 *
 * Usage:
 *   import { logger } from '$lib/utils/logger';
 *   logger.debug('auth', 'Resolving session', { pathname: '/chart' });
 *   logger.info('auth', 'Session established', { email: 'user@example.com' });
 *   logger.warn('auth', 'Session expired', { sessionId: '...' });
 *   logger.error('auth', 'Failed to refresh session', { error });
 *
 * Enable categories via environment variables:
 *   DEBUG_AUTH=true npm run dev
 *   DEBUG_LAYOUT=true npm run dev
 *   DEBUG_LINKED_SESSIONS=true npm run dev
 */

import { config } from '$lib/config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'auth' | 'layout' | 'linkedSessions' | 'api' | 'rateLimit' | 'general';

interface LogEntry {
	category: LogCategory;
	level: LogLevel;
	message: string;
	data?: unknown;
	timestamp: string;
}

/**
 * Check if a log category is enabled
 */
function isCategoryEnabled(category: LogCategory): boolean {
	return config.logging[category] ?? false;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
	const emoji = {
		debug: '🔍',
		info: '✅',
		warn: '⚠️',
		error: '❌'
	}[entry.level];

	const prefix = `${emoji} [${entry.category.toUpperCase()}] ${entry.message}`;

	if (entry.data) {
		return `${prefix}\n${JSON.stringify(entry.data, null, 2)}`;
	}

	return prefix;
}

/**
 * Logger class with category-based filtering
 */
class Logger {
	/**
	 * Log a debug message (only if category is enabled)
	 */
	debug(category: LogCategory, message: string, data?: unknown): void {
		if (!isCategoryEnabled(category)) return;

		const entry: LogEntry = {
			category,
			level: 'debug',
			message,
			data,
			timestamp: new Date().toISOString()
		};

		console.log(formatLogEntry(entry));
	}

	/**
	 * Log an info message (only if category is enabled)
	 */
	info(category: LogCategory, message: string, data?: unknown): void {
		if (!isCategoryEnabled(category)) return;

		const entry: LogEntry = {
			category,
			level: 'info',
			message,
			data,
			timestamp: new Date().toISOString()
		};

		console.log(formatLogEntry(entry));
	}

	/**
	 * Log a warning message (always shown)
	 */
	warn(category: LogCategory, message: string, data?: unknown): void {
		const entry: LogEntry = {
			category,
			level: 'warn',
			message,
			data,
			timestamp: new Date().toISOString()
		};

		console.warn(formatLogEntry(entry));
	}

	/**
	 * Log an error message (always shown)
	 */
	error(category: LogCategory, message: string, data?: unknown): void {
		const entry: LogEntry = {
			category,
			level: 'error',
			message,
			data,
			timestamp: new Date().toISOString()
		};

		console.error(formatLogEntry(entry));
	}
}

export const logger = new Logger();

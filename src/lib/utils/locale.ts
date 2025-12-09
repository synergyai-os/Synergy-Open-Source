/**
 * Locale configuration for SynergyOS
 *
 * Global business rules:
 * - Date format: Day/Month/Year (DD/MM/YYYY)
 * - First day of week: Monday
 *
 * See: dev-docs/master-docs/global-business-rules.md
 */

/**
 * Default locale for date/time formatting
 * en-GB uses day/month/year format and Monday as first day of week
 */
export const DEFAULT_LOCALE = 'en-GB';

/**
 * Default date format options for full date display
 */
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

/**
 * Default date format options for short date display (e.g., "15 Jan 2024")
 */
export const DEFAULT_SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'short',
	day: 'numeric'
};

/**
 * Default date format options for date with time (e.g., "15 January 2024 at 2:30 PM")
 */
export const DEFAULT_DATETIME_FORMAT: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
};

/**
 * Day names array with Monday as first day
 * Index mapping: 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Full day names array with Monday as first day
 */
export const DAY_NAMES_FULL = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const;

/**
 * Convert JavaScript's Date.getDay() (0=Sunday, 1=Monday, ...) to our system (0=Monday, 6=Sunday)
 *
 * @param jsDay - JavaScript day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @returns Our day index (0=Monday, 1=Tuesday, ..., 6=Sunday)
 */
export function jsDayToOurDay(jsDay: number): number {
	// JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
	// Our system: 0=Monday, 1=Tuesday, ..., 6=Sunday
	return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Convert our day index (0=Monday, 6=Sunday) to JavaScript's Date.getDay() (0=Sunday, 1=Monday, ...)
 *
 * @param ourDay - Our day index (0=Monday, 1=Tuesday, ..., 6=Sunday)
 * @returns JavaScript day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export function ourDayToJsDay(ourDay: number): number {
	// Our system: 0=Monday, 1=Tuesday, ..., 6=Sunday
	// JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
	return ourDay === 6 ? 0 : ourDay + 1;
}

/**
 * Get day name from our day index (0=Monday, 6=Sunday)
 *
 * @param dayIndex - Our day index (0=Monday, 1=Tuesday, ..., 6=Sunday)
 * @returns Day name abbreviation (e.g., "Mon", "Tue")
 */
import { invariant } from '$lib/utils/invariant';

/**
 * Get full day name from our day index (0=Monday, 6=Sunday)
 *
 * @param dayIndex - Our day index (0=Monday, 1=Tuesday, ..., 6=Sunday)
 * @returns Full day name (e.g., "Monday", "Tuesday")
 */
export function getDayName(dayIndex: number): string {
	invariant(
		dayIndex >= 0 && dayIndex <= 6,
		`Invalid day index: ${dayIndex}. Must be 0-6 (0=Monday, 6=Sunday)`
	);
	return DAY_NAMES[dayIndex];
}

export function getDayNameFull(dayIndex: number): string {
	invariant(
		dayIndex >= 0 && dayIndex <= 6,
		`Invalid day index: ${dayIndex}. Must be 0-6 (0=Monday, 6=Sunday)`
	);
	return DAY_NAMES_FULL[dayIndex];
}

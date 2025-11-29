/**
 * Meeting utilities and constants
 */

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const RECURRENCE_FREQUENCY_OPTIONS = [
	{ value: 'daily', label: 'Day(s)' },
	{ value: 'weekly', label: 'Week(s)' },
	{ value: 'monthly', label: 'Month(s)' }
] as const;

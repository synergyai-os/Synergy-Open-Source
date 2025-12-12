/**
 * Meeting utilities and constants
 *
 * Note: DAY_NAMES moved to src/lib/utils/locale.ts for global consistency
 * This file re-exports it for backward compatibility
 */

export { DAY_NAMES } from '$lib/utils/locale';

export const RECURRENCE_FREQUENCY_OPTIONS = [
	{ value: 'daily', label: 'Day(s)' },
	{ value: 'weekly', label: 'Week(s)' },
	{ value: 'monthly', label: 'Month(s)' }
] as const;

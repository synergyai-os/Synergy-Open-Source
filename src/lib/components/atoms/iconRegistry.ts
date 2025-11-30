/**
 * Icon Registry
 *
 * Centralized registry of all available icons in the design system.
 * This ensures consistency - only predefined icons can be used.
 *
 * All icons use Heroicons outline style (24x24 viewBox, stroke-width="2").
 * Icons are rendered as inline SVGs with currentColor for theming.
 */

export type IconType =
	| 'add'
	| 'calendar'
	| 'check'
	| 'check-circle'
	| 'chevron-down'
	| 'chevron-right'
	| 'circle'
	| 'circles'
	| 'clipboard'
	| 'clock'
	| 'close'
	| 'dashboard'
	| 'delete'
	| 'document'
	| 'download'
	| 'edit'
	| 'flashcards'
	| 'inbox'
	| 'info'
	| 'lightbulb'
	| 'lock'
	| 'members'
	| 'moon'
	| 'more'
	| 'orgChart'
	| 'payment'
	| 'recurrence'
	| 'share'
	| 'study'
	| 'sun'
	| 'tags'
	| 'user';

export interface IconDefinition {
	path: string;
	viewBox?: string;
	strokeWidth?: string;
	strokeLinecap?: 'round' | 'butt' | 'square';
	strokeLinejoin?: 'round' | 'miter' | 'bevel';
}

/**
 * Icon Registry Map
 *
 * Maps icon types to their SVG path definitions.
 * All icons default to Heroicons outline style unless specified otherwise.
 */
export const iconRegistry: Record<IconType, IconDefinition> = {
	// Actions
	add: {
		path: 'M12 4v16m8-8H4',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	edit: {
		path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	delete: {
		path: 'M6 18L18 6M6 6l12 12',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	close: {
		path: 'M6 18L18 6M6 6l12 12',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	document: {
		path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	download: {
		path: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	share: {
		path: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},

	// Navigation
	'chevron-down': {
		path: 'M19 9l-7 7-7-7',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	'chevron-right': {
		path: 'M9 5l7 7-7 7',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},

	// Content/Features
	inbox: {
		path: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	info: {
		path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	flashcards: {
		path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	study: {
		path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	tags: {
		path: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	user: {
		path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	circle: {
		path: 'M12 2a10 10 0 1010 10A10 10 0 0012 2z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	circles: {
		path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	clipboard: {
		path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	clock: {
		path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	members: {
		path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	orgChart: {
		// Hierarchical org chart: parent node at top, two child nodes below, connected by lines
		path: 'M12 3v4m0 0a2 2 0 100 4 2 2 0 000-4zm0 4v2m0 0l-6 4m6-4l6 4m-12 0a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	dashboard: {
		path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	calendar: {
		path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	check: {
		path: 'M5 13l4 4L19 7',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	'check-circle': {
		path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	lightbulb: {
		path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	lock: {
		path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	moon: {
		path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	sun: {
		path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},

	// Placeholder (to be replaced with actual payment icon)
	payment: {
		path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	recurrence: {
		path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	more: {
		path: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
		viewBox: '0 0 24 24',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	}
};

/**
 * Get icon definition by type
 */
export function getIcon(type: IconType): IconDefinition {
	return iconRegistry[type];
}

/**
 * Check if an icon type exists
 */
export function isValidIconType(type: string): type is IconType {
	return type in iconRegistry;
}

export const ROLE_TABS = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'members', label: 'Members', showCount: true },
	{ id: 'documents', label: 'Documents', showCount: true },
	{ id: 'activities', label: 'Activities', showCount: true },
	{ id: 'metrics', label: 'Metrics', showCount: true },
	{ id: 'checklists', label: 'Checklists', showCount: true },
	{ id: 'projects', label: 'Projects', showCount: true }
] as const;

export const DEFAULT_ROLE_TAB_COUNTS = {
	overview: 0,
	members: 0,
	documents: 0,
	activities: 0,
	metrics: 0,
	checklists: 0,
	projects: 0
} as const;

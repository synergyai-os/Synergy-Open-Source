import type { Id } from '$lib/convex';

/**
 * Mode for PersonSelector component
 *
 * - workspace-all: All workspace members (default)
 * - circle-members: Only members of specific circle
 * - circle-aware: All workspace, but show circle badges
 * - role-fillers: Show roles with their fillers (for role-based assignment)
 * - task-assignee: Person-only, no placeholders (tasks, docs, proposals)
 * - document-owner: Same as task-assignee (semantic alias)
 */
export type PersonSelectorMode =
	| 'workspace-all'
	| 'circle-members'
	| 'circle-aware'
	| 'role-fillers'
	| 'task-assignee'
	| 'document-owner';

/**
 * Badge type for person selector options.
 * Maps to Badge component variants (see design-system.md):
 * - 'circle-member'     → variant="success"
 * - 'workspace-member'  → variant="default"
 * - 'placeholder'       → variant="warning"
 * - 'invited'           → variant="primary"
 */
export type PersonBadgeType = 'circle-member' | 'workspace-member' | 'placeholder' | 'invited';

/**
 * Circle membership signal for circle-aware mode.
 * Kept separate from `badge` because badge has priority rules (status overrides membership).
 */
export type PersonCircleMembership = 'in-circle' | 'outside-circle';

/**
 * Grouping strategy for PersonSelector dropdown rendering.
 * - auto: enable mode defaults (currently: circle-aware => circle membership grouping)
 * - off: disable grouping
 * - circle-membership: show "In this circle" / "Outside this circle" (only meaningful for circle-aware)
 */
export type PersonSelectorGrouping = 'auto' | 'off' | 'circle-membership';

/**
 * Person status from people table
 */
export type PersonStatus = 'placeholder' | 'invited' | 'active' | 'archived';

/**
 * Option displayed in PersonSelector dropdown
 */
export type PersonSelectorOption = {
	/** Unique key for rendering (personId or roleId-personId composite) */
	id: string;

	/** Person ID (required for selection, undefined for unfilled roles) */
	personId?: Id<'people'>;

	/** Role ID (only in role-fillers mode) */
	roleId?: Id<'circleRoles'>;

	/** Display text shown in dropdown */
	displayName: string;

	/** Text used for search/filter matching */
	searchableText: string;

	/** Name for Avatar component */
	avatarName?: string;

	/** Email for subtitle (optional) */
	email?: string;

	/** Badge type to display */
	badge?: PersonBadgeType;

	/** Circle membership (circle-aware mode only) */
	circleMembership?: PersonCircleMembership;

	/** Person status (for filtering and display) */
	status?: PersonStatus;
};

/**
 * Configuration for usePersonSelector composable
 */
export type PersonSelectorConfig = {
	mode: PersonSelectorMode;
	workspaceId: Id<'workspaces'>;
	sessionId: string;
	circleId?: Id<'circles'>;
	excludePersonIds?: Id<'people'>[];
	allowPlaceholders?: boolean;
};

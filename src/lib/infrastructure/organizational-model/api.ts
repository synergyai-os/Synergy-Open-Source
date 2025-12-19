/**
 * Organizational Model Infrastructure API
 *
 * Public interface for core organizational data (circles, circle members, circle roles).
 * This is infrastructure - foundational data that is always available, not behind feature flags.
 *
 * Core data composables:
 * - `useCircles` - Manage circles, members, roles, and mutations
 * - `useCircleMembers` - Query workspace members available for circles
 * - `useCircleRoles` - Query role fillers and available users
 *
 * @see dev-docs/master-docs/core-data-architecture-audit.md
 */

// Export composables
export { useCircles } from './composables/useCircles.svelte';
export { useCircleMembers } from './composables/useCircleMembers.svelte';
export { useCircleRoles } from './composables/useCircleRoles.svelte';

// Export types
export type {
	UseCircles,
	CircleSummary,
	CircleMember,
	CircleRole,
	RoleFiller
} from './composables/useCircles.svelte';

export type { UseCircleMembers } from './composables/useCircleMembers.svelte';
export type { UseCircleRoles } from './composables/useCircleRoles.svelte';

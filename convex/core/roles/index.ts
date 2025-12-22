/**
 * Roles Core Exports
 *
 * SYOS-707: Core domain scaffold with schema/queries/mutations/rules.
 * Existing rule helpers remain exported for reuse.
 */

export * from './schema';
export * from './queries';
export * from './mutations';
export * from './rules';
export * from './templates';

// Explicitly re-export mutations to ensure Convex picks them up
export {
	create,
	update,
	updateInline,
	archiveRole,
	restoreRole,
	restoreAssignment,
	assignPerson,
	removePerson
} from './mutations';

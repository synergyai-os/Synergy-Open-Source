/**
 * Roles mutations entrypoint.
 * SYOS-707 scaffolding: delegates to existing implementations in queries.ts.
 */

export {
	create,
	update,
	updateInline,
	archiveRole,
	assignUser,
	removeUser,
	restoreRole,
	restoreAssignment
} from './queries';

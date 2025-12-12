/**
 * Proposals mutations entrypoint.
 * SYOS-707 scaffolding: delegates to existing implementations in queries.ts.
 */

export {
	create,
	addEvolution,
	removeEvolution,
	submit,
	withdraw,
	importToMeeting,
	startProcessing,
	approve,
	reject,
	createFromDiff
} from './queries';

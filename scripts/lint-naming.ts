/**
 * Naming convention linter for Convex functions.
 *
 * Usage:
 *   npx tsx scripts/lint-naming.ts          # report, exit 0 (allows debt)
 *   npx tsx scripts/lint-naming.ts --strict # exit 1 if violations found
 */
import process from 'process';

import { isStrictMode } from './lint-naming/config';
import { runLintNaming } from './lint-naming/run';

export {
	parseNameClassification as classifyName,
	isConstantName as isConstant
} from './lint-naming/classification';
export {
	isAnalyzablePath as shouldAnalyze,
	listTypeScriptFiles as walk
} from './lint-naming/files';
export { listViolationsForFile as analyzeFile } from './lint-naming/violations';
export { describeResults as summarize } from './lint-naming/summary';
export {
	ALLOWED_BASES,
	ALLOWLIST,
	CONVEX_ROOT,
	EXCLUDED_PATH_PATTERNS,
	MODIFIER,
	STRICT,
	STRICT_FLAGS,
	isStrictMode
} from './lint-naming/config';
export { listNamingResults, runLintNaming } from './lint-naming/run';
export type { NamingResult as Result, ViolationType } from './lint-naming/types';

export function main(): void {
	const exitCode = runLintNaming(isStrictMode(process.argv));
	if (exitCode) process.exitCode = exitCode;
}

main();

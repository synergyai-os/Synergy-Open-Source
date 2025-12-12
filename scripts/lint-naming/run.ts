import { CONVEX_ROOT } from './config';
import { isAnalyzablePath, listTypeScriptFiles } from './files';
import { describeResults } from './summary';
import { listViolationsForFile } from './violations';
import type { NamingResult } from './types';

export function listNamingResults(): NamingResult[] {
	return listTypeScriptFiles(CONVEX_ROOT)
		.filter(isAnalyzablePath)
		.flatMap((file) => listViolationsForFile(file));
}

export function runLintNaming(strict: boolean): number {
	const results = listNamingResults();
	describeResults(results);
	return results.length > 0 && strict ? 1 : 0;
}

import path from 'path';

import type { NamingResult, ViolationType } from './types';

function getDomainKey(file: string): string {
	const parts = file.startsWith('convex/') ? file.replace(/^convex\//, '').split(path.sep) : [file];
	return parts.slice(0, 2).join('/') || parts[0];
}

function buildCounts<T extends string>(items: T[]): Map<T, number> {
	const counts = new Map<T, number>();
	items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
	return counts;
}

function formatCounts(counts: Map<string, number>): string {
	return (
		[...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([key, value]) => `- ${key}: ${value}`)
			.join('\n') || '- none'
	);
}

export function describeResults(results: NamingResult[]): void {
	const patternCounts = buildCounts<ViolationType>(results.flatMap((result) => result.violations));
	const domainCounts = buildCounts<string>(results.map((result) => getDomainKey(result.file)));

	console.log('## Naming Convention Audit');
	console.log(`Total violations: ${results.length}\n`);
	console.log('### By Pattern');
	console.log(formatCounts(patternCounts));
	console.log('\n### By Domain');
	console.log(formatCounts(domainCounts));
	console.log('\n### Details');
	results.forEach((result) => {
		console.log(`${result.file}:${result.line} ${result.name} -> ${result.violations.join(',')}`);
	});
}

export const describeViolationsSummary = describeResults;

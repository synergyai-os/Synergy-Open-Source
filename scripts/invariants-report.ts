import { exit, stdin } from 'node:process';

type InvariantResult = {
	id: string;
	name: string;
	passed: boolean;
	severity: 'critical' | 'warning';
	violationCount: number;
	sample: string[];
	message: string;
};

type InvariantRun = {
	summary: {
		total: number;
		passed: number;
		failed: number;
		criticalFailed: number;
	};
	allPassed: boolean;
	criticalsPassed: boolean;
	results: InvariantResult[];
};

async function readStdin(): Promise<string> {
	let data = '';

	for await (const chunk of stdin) {
		data += chunk;
	}

	return data.trim();
}

function parseResult(raw: string): InvariantRun {
	const start = raw.indexOf('{');
	const end = raw.lastIndexOf('}');

	if (start === -1 || end === -1 || end < start) {
		throw new Error('No JSON payload detected. Pipe convex output into this script.');
	}

	return JSON.parse(raw.slice(start, end + 1));
}

function printReport(result: InvariantRun) {
	const { summary, criticalsPassed, results } = result;

	console.log('=== Core Invariants Report ===');
	console.log(`Total: ${summary.total}`);
	console.log(`Passed: ${summary.passed}`);
	console.log(`Failed: ${summary.failed}`);
	console.log(`Critical Failed: ${summary.criticalFailed}`);
	console.log('');

	const failures = results.filter((r) => !r.passed);
	if (failures.length === 0) {
		console.log('All invariants passed.');
		return;
	}

	console.log('Failures:');
	for (const failure of failures) {
		const severityLabel = failure.severity === 'critical' ? '[CRITICAL]' : '[warning]';
		console.log(`- ${severityLabel} ${failure.id} - ${failure.name}`);
		console.log(`  Message: ${failure.message}`);
		if (failure.sample.length > 0) {
			console.log(`  Sample IDs: ${failure.sample.join(', ')}`);
		}
	}

	if (!criticalsPassed) {
		console.log('');
		console.log('Critical invariants failed. See failures above.');
	}
}

async function main() {
	try {
		const raw = process.argv[2] ? process.argv[2].trim() : await readStdin();
		if (!raw) {
			throw new Error('No input provided. Pipe the convex run output to this script.');
		}

		const result = parseResult(raw);
		printReport(result);
		exit(result.criticalsPassed ? 0 : 1);
	} catch (error) {
		console.error('Invariant reporter failed:', (error as Error).message);
		exit(1);
	}
}

void main();

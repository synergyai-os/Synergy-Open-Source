#!/usr/bin/env tsx
/**
 * CORE Audit Script: Mechanical checks for domain completeness
 *
 * This script collects raw facts about CORE domains—no interpretation.
 * Outputs findings to dev-docs/CORE-AUDIT-RAW.md
 *
 * Usage:
 *   npm run audit:core
 *   npx tsx scripts/audit-core.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const CORE_DIR = path.join(PROJECT_ROOT, 'convex/core');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'dev-docs/CORE-AUDIT-RAW.md');

// The 10 core domains from architecture.md
const CORE_DOMAINS = [
	'users',
	'people',
	'circles',
	'roles',
	'assignments',
	'proposals',
	'policies',
	'authority',
	'history',
	'workspaces'
] as const;

// Required files for each domain
const REQUIRED_FILES = ['tables.ts', 'queries.ts', 'mutations.ts', 'rules.ts', 'index.ts'] as const;

// Domains that don't require tables.ts (calculation-only domains)
const CALCULATION_ONLY_DOMAINS = ['authority'] as const;

// Optional files (not required but checked)
const OPTIONAL_FILES = ['schema.ts', 'constants.ts', 'README.md'] as const;

type DomainInventory = {
	domain: string;
	files: {
		exists: boolean;
		exports: string[];
	}[];
	testFile: {
		exists: boolean;
	};
};

type AuditResult = {
	timestamp: string;
	domainInventory: DomainInventory[];
	invariantResults: {
		success: boolean;
		output: string;
		summary?: {
			total: number;
			passed: number;
			failed: number;
			criticalFailed: number;
		};
		failures?: Array<{
			id: string;
			name: string;
			severity: string;
		}>;
	};
	testResults: {
		success: boolean;
		output: string;
		summary?: {
			total: number;
			passed: number;
			failed: number;
			skipped: number;
		};
	};
	schemaCheck: {
		success: boolean;
		output: string;
		errors?: number;
		warnings?: number;
	};
};

/**
 * Extract exported function/const names from a TypeScript file
 */
function extractExports(filePath: string): string[] {
	if (!fs.existsSync(filePath)) {
		return [];
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const exports: string[] = [];

	// Match: export const name = ...
	// Match: export function name(...) { ...
	// Match: export async function name(...) { ...
	const patterns = [
		/^export\s+const\s+(\w+)\s*=/gm,
		/^export\s+(?:async\s+)?function\s+(\w+)\s*\(/gm
	];

	for (const pattern of patterns) {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			exports.push(match[1]);
		}
	}

	return exports.sort();
}

/**
 * Check domain file inventory
 */
function checkDomainInventory(): DomainInventory[] {
	const inventory: DomainInventory[] = [];

	for (const domain of CORE_DOMAINS) {
		const domainPath = path.join(CORE_DIR, domain);
		const domainInfo: DomainInventory = {
			domain,
			files: [],
			testFile: { exists: false }
		};

		// Check required files
		for (const fileName of REQUIRED_FILES) {
			// Skip tables.ts for calculation-only domains
			if (fileName === 'tables.ts' && CALCULATION_ONLY_DOMAINS.includes(domain as any)) {
				domainInfo.files.push({
					exists: false, // Mark as missing but it's expected
					exports: []
				});
				continue;
			}

			const filePath = path.join(domainPath, fileName);
			const exists = fs.existsSync(filePath);
			const exports = exists ? extractExports(filePath) : [];

			domainInfo.files.push({
				exists,
				exports
			});
		}

		// Check optional files (for completeness, but don't count in required files)
		// Note: These are tracked separately in the report
		for (const fileName of OPTIONAL_FILES) {
			const filePath = path.join(domainPath, fileName);
			const exists = fs.existsSync(filePath);
			const exports = exists && fileName.endsWith('.ts') ? extractExports(filePath) : [];

			domainInfo.files.push({
				exists,
				exports
			});
		}

		// Check test file
		const testFileName = `${domain}.test.ts`;
		const testFilePath = path.join(domainPath, testFileName);
		domainInfo.testFile.exists = fs.existsSync(testFilePath);

		inventory.push(domainInfo);
	}

	return inventory;
}

/**
 * Run invariants check and parse output
 */
function runInvariants(): AuditResult['invariantResults'] {
	try {
		// Run the convex command directly to get JSON (before it goes through invariants-report.ts)
		const jsonOutput = execSync(
			'npx convex run internal.admin.invariants.runAll \'{"severityFilter":"critical"}\'',
			{
				cwd: PROJECT_ROOT,
				encoding: 'utf-8',
				stdio: ['ignore', 'pipe', 'pipe']
			}
		);

		// Also get the human-readable output for the report
		const humanOutput = execSync('npm run invariants:critical', {
			cwd: PROJECT_ROOT,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe']
		});

		// Parse JSON from convex output
		let summary;
		let failures: Array<{ id: string; name: string; severity: string }> = [];

		// Look for JSON in output
		const jsonMatch = jsonOutput.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			try {
				const parsed = JSON.parse(jsonMatch[0]);
				summary = parsed.summary;
				failures =
					parsed.results
						?.filter((r: any) => !r.passed)
						?.map((r: any) => ({
							id: r.id,
							name: r.name,
							severity: r.severity
						})) || [];
			} catch {
				// JSON parsing failed, continue with raw output
			}
		}

		return {
			success: true,
			output: humanOutput, // Use human-readable output for the report
			summary,
			failures: failures.length > 0 ? failures : undefined
		};
	} catch (error: any) {
		return {
			success: false,
			output: error.stdout || error.stderr || error.message
		};
	}
}

/**
 * Run unit tests and parse output
 */
function runTests(): AuditResult['testResults'] {
	try {
		const output = execSync('npm run test:unit:server', {
			cwd: PROJECT_ROOT,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe']
		});

		// Parse vitest output
		// Look for patterns like: "Test Files  1 passed (1)     100ms"
		const _testFileMatch = output.match(/Test Files\s+(\d+)\s+passed\s+\((\d+)\)/);
		const testMatch = output.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
		const failedMatch = output.match(/(\d+)\s+failed/);
		const skippedMatch = output.match(/(\d+)\s+skipped/);

		let summary;
		if (testMatch) {
			summary = {
				total: parseInt(testMatch[2], 10),
				passed: parseInt(testMatch[1], 10),
				failed: failedMatch ? parseInt(failedMatch[1], 10) : 0,
				skipped: skippedMatch ? parseInt(skippedMatch[1], 10) : 0
			};
		}

		return {
			success: true,
			output,
			summary
		};
	} catch (error: any) {
		return {
			success: false,
			output: error.stdout || error.stderr || error.message
		};
	}
}

/**
 * Run schema/type check
 */
function runSchemaCheck(): AuditResult['schemaCheck'] {
	try {
		const output = execSync('npm run check', {
			cwd: PROJECT_ROOT,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'pipe']
		});

		// Parse svelte-check output
		// Look for patterns like: "Found X errors and Y warnings"
		const errorMatch = output.match(/Found\s+(\d+)\s+error/i);
		const warningMatch = output.match(/(\d+)\s+warning/i);

		return {
			success: true,
			output,
			errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
			warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0
		};
	} catch (error: any) {
		// svelte-check exits with non-zero on errors, so this is expected
		const output = error.stdout || error.stderr || error.message;

		const errorMatch = output.match(/Found\s+(\d+)\s+error/i);
		const warningMatch = output.match(/(\d+)\s+warning/i);

		return {
			success: false,
			output,
			errors: errorMatch ? parseInt(errorMatch[1], 10) : 0,
			warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0
		};
	}
}

/**
 * Generate markdown report
 */
function generateMarkdown(result: AuditResult): string {
	const lines: string[] = [];

	lines.push('# CORE Audit Raw Data');
	lines.push(`Generated: ${result.timestamp}`);
	lines.push('');

	// Summary - count only required files (excluding calculation-only domains' tables.ts)
	const missingFiles = result.domainInventory.reduce((count, domain) => {
		const isCalcOnly = CALCULATION_ONLY_DOMAINS.includes(domain.domain as any);
		// Only count required files (first REQUIRED_FILES.length entries)
		return (
			count +
			domain.files.slice(0, REQUIRED_FILES.length).filter((f, idx) => {
				// Don't count missing tables.ts for calculation-only domains
				if (isCalcOnly && REQUIRED_FILES[idx] === 'tables.ts') {
					return false;
				}
				return !f.exists;
			}).length
		);
	}, 0);

	const totalDomains = result.domainInventory.length;
	const invariantPassed = result.invariantResults.summary?.passed || 0;
	const invariantTotal = result.invariantResults.summary?.total || 0;
	const testPassed = result.testResults.summary?.passed || 0;
	const testTotal = result.testResults.summary?.total || 0;
	const schemaErrors = result.schemaCheck.errors || 0;
	const schemaWarnings = result.schemaCheck.warnings || 0;

	lines.push('## Summary');
	lines.push(`- Domains checked: ${totalDomains}`);
	lines.push(`- Missing required files: ${missingFiles}`);
	lines.push(`- Invariants: ${invariantPassed}/${invariantTotal} passing`);
	lines.push(`- Tests: ${testPassed}/${testTotal} passing`);
	lines.push(`- TypeScript: ${schemaErrors} errors, ${schemaWarnings} warnings`);
	lines.push('');

	// Domain Inventory
	lines.push('## Domain Inventory');
	lines.push('');

	for (const domain of result.domainInventory) {
		lines.push(`### ${domain.domain}`);
		lines.push('');

		// Required files
		lines.push('**Required files:**');
		for (let i = 0; i < REQUIRED_FILES.length; i++) {
			const file = domain.files[i];
			const fileName = REQUIRED_FILES[i];

			// Special handling for calculation-only domains
			const isCalcOnly = CALCULATION_ONLY_DOMAINS.includes(domain.domain as any);
			const isTablesFile = fileName === 'tables.ts';

			if (isCalcOnly && isTablesFile) {
				lines.push(`⏭️ ${fileName} (not required - calculation-only domain)`);
				lines.push('');
				continue;
			}

			const status = file.exists ? '✅' : '❌';
			lines.push(`${status} ${fileName} ${file.exists ? '(exists)' : '(MISSING)'}`);

			if (file.exists && file.exports.length > 0) {
				lines.push(`   - exports: [${file.exports.join(', ')}]`);
				lines.push(`   - (${file.exports.length} total)`);
			}
			lines.push('');
		}

		// Optional files
		lines.push('**Optional files:**');
		for (let i = REQUIRED_FILES.length; i < domain.files.length; i++) {
			const file = domain.files[i];
			const fileName = OPTIONAL_FILES[i - REQUIRED_FILES.length];
			const status = file.exists ? '✅' : '❌';
			lines.push(`${status} ${fileName} ${file.exists ? '(exists)' : '(missing)'}`);
			if (file.exists && file.exports.length > 0) {
				lines.push(`   - exports: [${file.exports.join(', ')}]`);
			}
		}
		lines.push('');

		// Test file
		const testStatus = domain.testFile.exists ? '✅' : '❌';
		const testFileName = `${domain.domain}.test.ts`;
		lines.push(
			`${testStatus} ${testFileName} ${domain.testFile.exists ? '(exists)' : '(MISSING)'}`
		);
		lines.push('');
	}

	// Invariant Results
	lines.push('## Invariant Results');
	lines.push('');
	if (result.invariantResults.summary) {
		lines.push(`- Total: ${result.invariantResults.summary.total}`);
		lines.push(`- Passed: ${result.invariantResults.summary.passed}`);
		lines.push(`- Failed: ${result.invariantResults.summary.failed}`);
		lines.push(`- Critical Failed: ${result.invariantResults.summary.criticalFailed}`);
		lines.push('');

		if (result.invariantResults.failures && result.invariantResults.failures.length > 0) {
			lines.push('**Failures:**');
			for (const failure of result.invariantResults.failures) {
				lines.push(`- [${failure.severity}] ${failure.id} - ${failure.name}`);
			}
			lines.push('');
		}
	}
	lines.push('```');
	lines.push(result.invariantResults.output);
	lines.push('```');
	lines.push('');

	// Test Results
	lines.push('## Test Results');
	lines.push('');
	if (result.testResults.summary) {
		lines.push(`- Total: ${result.testResults.summary.total}`);
		lines.push(`- Passed: ${result.testResults.summary.passed}`);
		lines.push(`- Failed: ${result.testResults.summary.failed}`);
		lines.push(`- Skipped: ${result.testResults.summary.skipped}`);
		lines.push('');
	}
	lines.push('```');
	lines.push(result.testResults.output);
	lines.push('```');
	lines.push('');

	// Schema Check
	lines.push('## TypeScript Check');
	lines.push('');
	if (result.schemaCheck.errors !== undefined || result.schemaCheck.warnings !== undefined) {
		lines.push(`- Errors: ${result.schemaCheck.errors || 0}`);
		lines.push(`- Warnings: ${result.schemaCheck.warnings || 0}`);
		lines.push('');
	}
	lines.push('```');
	lines.push(result.schemaCheck.output);
	lines.push('```');

	return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
	console.log('🔍 Starting CORE audit...');
	console.log('');

	const result: AuditResult = {
		timestamp: new Date().toISOString(),
		domainInventory: [],
		invariantResults: { success: false, output: '' },
		testResults: { success: false, output: '' },
		schemaCheck: { success: false, output: '' }
	};

	// 1. Domain File Inventory
	console.log('1️⃣ Checking domain file inventory...');
	result.domainInventory = checkDomainInventory();
	console.log(`   ✅ Checked ${result.domainInventory.length} domains`);

	// 2. Invariant Run
	console.log('');
	console.log('2️⃣ Running invariant checks...');
	result.invariantResults = runInvariants();
	console.log(
		`   ${result.invariantResults.success ? '✅' : '❌'} Invariants check ${result.invariantResults.success ? 'completed' : 'failed'}`
	);

	// 3. Test Run
	console.log('');
	console.log('3️⃣ Running unit tests...');
	result.testResults = runTests();
	console.log(
		`   ${result.testResults.success ? '✅' : '❌'} Tests ${result.testResults.success ? 'completed' : 'failed'}`
	);

	// 4. Schema Check
	console.log('');
	console.log('4️⃣ Running TypeScript check...');
	result.schemaCheck = runSchemaCheck();
	console.log(
		`   ${result.schemaCheck.success ? '✅' : '❌'} TypeScript check ${result.schemaCheck.success ? 'completed' : 'completed with errors'}`
	);

	// Generate report
	console.log('');
	console.log('📝 Generating report...');
	const markdown = generateMarkdown(result);

	// Ensure dev-docs directory exists
	const devDocsDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(devDocsDir)) {
		fs.mkdirSync(devDocsDir, { recursive: true });
	}

	fs.writeFileSync(OUTPUT_FILE, markdown, 'utf-8');
	console.log(`   ✅ Report written to ${OUTPUT_FILE}`);
	console.log('');
	console.log('✅ Audit complete!');
}

void main().catch((error) => {
	console.error('❌ Audit failed:', error);
	process.exit(1);
});

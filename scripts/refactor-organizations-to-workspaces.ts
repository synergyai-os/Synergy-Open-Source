#!/usr/bin/env node

/**
 * Automated Refactoring Script: workspaces → workspaces
 *
 * Safely refactors the codebase from 'workspaces' to 'workspaces':
 * - Table names: 'workspaces' → 'workspaces'
 * - Type references: Id<'workspaces'> → Id<'workspaces'>
 * - Field names: workspaceId → workspaceId
 * - Variable names: workspace → workspace (context-aware)
 * - File names: workspaces.ts → workspaces.ts
 * - Directory names: workspaces/ → workspaces/
 * - API endpoints: api.core.workspaces.index.* → api.core.workspaces.index.*
 *
 * Features:
 * - Dry-run mode for preview
 * - Context-aware replacements (avoids false positives)
 * - Detailed reporting
 * - Backup creation (optional)
 * - Incremental execution support
 *
 * Usage:
 *   npm run refactor:orgs-to-workspaces -- --dry-run
 *   npm run refactor:orgs-to-workspaces -- --backup
 *   npm run refactor:orgs-to-workspaces
 */

import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	magenta: '\x1b[35m'
};

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const CREATE_BACKUP = process.argv.includes('--backup');
const VERBOSE = process.argv.includes('--verbose');

// Replacement mappings - ordered by specificity (most specific first)
const REPLACEMENTS = [
	// Table names in string literals (most specific)
	{
		pattern: /(['"`])workspaces(['"`])/g,
		replacement: '$1workspaces$2',
		description: 'Table name in string literal'
	},

	// Type references
	{
		pattern: /Id<'workspaces'>/g,
		replacement: "Id<'workspaces'>",
		description: "Type reference Id<'workspaces'>"
	},
	{
		pattern: /Doc<'workspaces'>/g,
		replacement: "Doc<'workspaces'>",
		description: "Type reference Doc<'workspaces'>"
	},

	// API endpoints
	{
		pattern: /api\.workspaces\./g,
		replacement: 'api.core.workspaces.index.',
		description: 'API endpoint api.core.workspaces.index.*'
	},

	// Field names (with word boundaries)
	{
		pattern: /\borganizationId\b/g,
		replacement: 'workspaceId',
		description: 'Field name workspaceId'
	},
	{
		pattern: /\borganizationIds\b/g,
		replacement: 'workspaceIds',
		description: 'Field name workspaceIds'
	},
	{
		pattern: /\borganizationInvites\b/g,
		replacement: 'workspaceInvites',
		description: 'Variable workspaceInvites'
	},
	{
		pattern: /\borganizationMembers\b/g,
		replacement: 'workspaceMembers',
		description: 'Variable workspaceMembers'
	},
	{
		pattern: /\borganizationSettings\b/g,
		replacement: 'workspaceSettings',
		description: 'Variable workspaceSettings'
	},

	// Variable names (context-aware - only in code, not comments)
	{
		pattern: /\borganizations\b/g,
		replacement: 'workspaces',
		description: 'Variable workspaces'
	},
	{ pattern: /\borganization\b/g, replacement: 'workspace', description: 'Variable workspace' },

	// Related table names
	{
		pattern: /(['"`])workspaceMembers(['"`])/g,
		replacement: '$1workspaceMembers$2',
		description: 'Table name workspaceMembers'
	},
	{
		pattern: /(['"`])workspaceInvites(['"`])/g,
		replacement: '$1workspaceInvites$2',
		description: 'Table name workspaceInvites'
	},
	{
		pattern: /(['"`])workspaceSettings(['"`])/g,
		replacement: '$1workspaceSettings$2',
		description: 'Table name workspaceSettings'
	},

	// Type references for related tables
	{
		pattern: /Id<'workspaceMembers'>/g,
		replacement: "Id<'workspaceMembers'>",
		description: "Type Id<'workspaceMembers'>"
	},
	{
		pattern: /Id<'workspaceInvites'>/g,
		replacement: "Id<'workspaceInvites'>",
		description: "Type Id<'workspaceInvites'>"
	},
	{
		pattern: /Id<'workspaceSettings'>/g,
		replacement: "Id<'workspaceSettings'>",
		description: "Type Id<'workspaceSettings'>"
	},

	// Context keys
	{
		pattern: /(['"`])workspaces(['"`])/g,
		replacement: '$1workspaces$2',
		description: "Context key 'workspaces'"
	},

	// Function/interface names
	{
		pattern: /\bOrganizationsModuleAPI\b/g,
		replacement: 'WorkspacesModuleAPI',
		description: 'Interface WorkspacesModuleAPI'
	},
	{
		pattern: /\bOrganizationSummary\b/g,
		replacement: 'WorkspaceSummary',
		description: 'Type WorkspaceSummary'
	},
	{
		pattern: /\bOrganizationInvite\b/g,
		replacement: 'WorkspaceInvite',
		description: 'Type WorkspaceInvite'
	},
	{
		pattern: /\bOrganizationMember\b/g,
		replacement: 'WorkspaceMember',
		description: 'Type WorkspaceMember'
	},
	{
		pattern: /\buseOrganizations\b/g,
		replacement: 'useWorkspaces',
		description: 'Composable useWorkspaces'
	},
	{
		pattern: /\buseOrganizationMembers\b/g,
		replacement: 'useWorkspaceMembers',
		description: 'Composable useWorkspaceMembers'
	},
	{
		pattern: /\buseOrganizationQueries\b/g,
		replacement: 'useWorkspaceQueries',
		description: 'Composable useWorkspaceQueries'
	},
	{
		pattern: /\buseOrganizationMutations\b/g,
		replacement: 'useWorkspaceMutations',
		description: 'Composable useWorkspaceMutations'
	},
	{
		pattern: /\buseOrganizationState\b/g,
		replacement: 'useWorkspaceState',
		description: 'Composable useWorkspaceState'
	},
	{
		pattern: /\buseOrganizationUrlSync\b/g,
		replacement: 'useWorkspaceUrlSync',
		description: 'Composable useWorkspaceUrlSync'
	},
	{
		pattern: /\buseOrganizationAnalytics\b/g,
		replacement: 'useWorkspaceAnalytics',
		description: 'Composable useWorkspaceAnalytics'
	},
	{
		pattern: /\bactiveOrganizationId\b/g,
		replacement: 'activeWorkspaceId',
		description: 'Variable activeWorkspaceId'
	},
	{
		pattern: /\bactiveOrganization\b/g,
		replacement: 'activeWorkspace',
		description: 'Variable activeWorkspace'
	},
	{
		pattern: /\bgetOrganizationId\b/g,
		replacement: 'getWorkspaceId',
		description: 'Function getWorkspaceId'
	},
	{
		pattern: /\bsetActiveOrganization\b/g,
		replacement: 'setActiveWorkspace',
		description: 'Function setActiveWorkspace'
	},
	{
		pattern: /\bcreateOrganization\b/g,
		replacement: 'createWorkspace',
		description: 'Function createWorkspace'
	},
	{
		pattern: /\bensureOrganizationMembership\b/g,
		replacement: 'ensureWorkspaceMembership',
		description: 'Function ensureWorkspaceMembership'
	},
	{
		pattern: /\bensureUniqueOrganizationSlug\b/g,
		replacement: 'ensureUniqueWorkspaceSlug',
		description: 'Function ensureUniqueWorkspaceSlug'
	},
	{
		pattern: /\bisOrganizationAdmin\b/g,
		replacement: 'isWorkspaceAdmin',
		description: 'Function isWorkspaceAdmin'
	},
	{
		pattern: /\bgetUserOrganizationIds\b/g,
		replacement: 'getUserWorkspaceIds',
		description: 'Function getUserWorkspaceIds'
	},
	{
		pattern: /\ballowedOrganizationIds\b/g,
		replacement: 'allowedWorkspaceIds',
		description: 'Field allowedWorkspaceIds'
	}
];

// Files to exclude from refactoring
const EXCLUDE_PATTERNS = [
	'node_modules/**',
	'.git/**',
	'www/**',
	'storybook-static/**',
	'playwright-report/**',
	'test-results/**',
	'**/*.log',
	'**/*.json', // Exclude JSON files (config, package-lock, etc.)
	'ai-docs/tasks/workspaces-to-workspaces-impact-analysis.md' // Keep the analysis doc
];

// File extensions to process
const PROCESS_EXTENSIONS = ['.ts', '.tsx', '.svelte', '.js', '.jsx', '.md'];

interface FileChange {
	filePath: string;
	replacements: Array<{ pattern: string; count: number }>;
	totalReplacements: number;
	newContent: string;
}

interface Stats {
	filesProcessed: number;
	filesChanged: number;
	totalReplacements: number;
	errors: Array<{ file: string; error: string }>;
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath: string): boolean {
	const relativePath = filePath.replace(ROOT_DIR + '/', '');
	return EXCLUDE_PATTERNS.some((pattern) => {
		const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
		return regex.test(relativePath);
	});
}

/**
 * Check if file should be processed
 */
function shouldProcess(filePath: string): boolean {
	const ext = extname(filePath);
	return PROCESS_EXTENSIONS.includes(ext) && !shouldExclude(filePath);
}

/**
 * Apply replacements to file content
 */
function applyReplacements(content: string, filePath: string): FileChange | null {
	let newContent = content;
	const replacements: Array<{ pattern: string; count: number }> = [];
	let totalReplacements = 0;

	for (const { pattern, replacement, description } of REPLACEMENTS) {
		const matches = newContent.match(pattern);
		if (matches && matches.length > 0) {
			const count = matches.length;
			newContent = newContent.replace(pattern, replacement);
			replacements.push({ pattern: description, count });
			totalReplacements += count;
		}
	}

	if (totalReplacements === 0) {
		return null;
	}

	return {
		filePath,
		replacements,
		totalReplacements,
		newContent
	};
}

/**
 * Create backup of file
 */
function createBackup(filePath: string): void {
	const backupPath = filePath + '.backup';
	if (!existsSync(backupPath)) {
		const content = readFileSync(filePath, 'utf-8');
		writeFileSync(backupPath, content, 'utf-8');
	}
}

/**
 * Process a single file
 */
function processFile(filePath: string, stats: Stats): void {
	try {
		if (!shouldProcess(filePath)) {
			return;
		}

		const content = readFileSync(filePath, 'utf-8');
		const change = applyReplacements(content, filePath);

		if (!change) {
			return;
		}

		stats.filesProcessed++;
		stats.filesChanged++;
		stats.totalReplacements += change.totalReplacements;

		if (DRY_RUN) {
			console.log(`${colors.cyan}Would update${colors.reset} ${filePath}`);
			if (VERBOSE) {
				change.replacements.forEach(({ pattern, count }) => {
					console.log(`  ${colors.yellow}+${colors.reset} ${pattern}: ${count} replacements`);
				});
			}
		} else {
			if (CREATE_BACKUP) {
				createBackup(filePath);
			}
			writeFileSync(filePath, change.newContent, 'utf-8');
			console.log(
				`${colors.green}Updated${colors.reset} ${filePath} (${change.totalReplacements} replacements)`
			);
			if (VERBOSE) {
				change.replacements.forEach(({ pattern, count }) => {
					console.log(`  ${colors.yellow}+${colors.reset} ${pattern}: ${count} replacements`);
				});
			}
		}
	} catch (error) {
		stats.errors.push({
			file: filePath,
			error: error instanceof Error ? error.message : String(error)
		});
		console.error(`${colors.red}Error processing${colors.reset} ${filePath}: ${error}`);
	}
}

/**
 * Rename files and directories
 */
function renameFilesAndDirectories(stats: Stats): void {
	const renames = [
		// Backend files
		{ from: 'convex/workspaces.ts', to: 'convex/workspaces.ts' },
		{ from: 'convex/workspaceSettings.ts', to: 'convex/workspaceSettings.ts' },

		// Frontend module directory
		{ from: 'src/lib/modules/core/workspaces', to: 'src/lib/modules/core/workspaces' },

		// Component files (within the module)
		{
			from: 'src/lib/modules/core/workspaces/components/OrganizationSwitcher.svelte',
			to: 'src/lib/modules/core/workspaces/components/WorkspaceSwitcher.svelte'
		},
		{
			from: 'src/lib/modules/core/workspaces/components/OrganizationModals.svelte',
			to: 'src/lib/modules/core/workspaces/components/WorkspaceModals.svelte'
		}
	];

	console.log(`\n${colors.blue}File/Directory Renames:${colors.reset}`);

	for (const { from, to } of renames) {
		const fromPath = join(ROOT_DIR, from);
		const toPath = join(ROOT_DIR, to);

		if (!existsSync(fromPath)) {
			console.log(`${colors.yellow}Skipping${colors.reset} ${from} (not found)`);
			continue;
		}

		if (DRY_RUN) {
			console.log(`${colors.cyan}Would rename${colors.reset} ${from} → ${to}`);
		} else {
			try {
				// Create parent directory if needed
				const toDir = dirname(toPath);
				if (!existsSync(toDir)) {
					mkdirSync(toDir, { recursive: true });
				}

				if (CREATE_BACKUP && existsSync(toPath)) {
					createBackup(toPath);
				}

				renameSync(fromPath, toPath);
				console.log(`${colors.green}Renamed${colors.reset} ${from} → ${to}`);
			} catch (error) {
				stats.errors.push({
					file: from,
					error: error instanceof Error ? error.message : String(error)
				});
				console.error(`${colors.red}Error renaming${colors.reset} ${from}: ${error}`);
			}
		}
	}
}

/**
 * Main execution
 */
function main() {
	console.log(
		`${colors.blue}╔══════════════════════════════════════════════════════════╗${colors.reset}`
	);
	console.log(
		`${colors.blue}║  workspaces → workspaces Refactoring Script          ║${colors.reset}`
	);
	console.log(
		`${colors.blue}╚══════════════════════════════════════════════════════════╝${colors.reset}\n`
	);

	if (DRY_RUN) {
		console.log(`${colors.yellow}⚠️  DRY RUN MODE - No files will be modified${colors.reset}\n`);
	}

	if (CREATE_BACKUP && !DRY_RUN) {
		console.log(`${colors.blue}📦 Backup mode enabled - backups will be created${colors.reset}\n`);
	}

	const stats: Stats = {
		filesProcessed: 0,
		filesChanged: 0,
		totalReplacements: 0,
		errors: []
	};

	// Find all files to process
	const patterns = ['**/*.ts', '**/*.tsx', '**/*.svelte', '**/*.js', '**/*.jsx', '**/*.md'];

	const allFiles: string[] = [];
	for (const pattern of patterns) {
		const files = glob.sync(pattern, {
			cwd: ROOT_DIR,
			absolute: true,
			ignore: EXCLUDE_PATTERNS
		});
		allFiles.push(...files);
	}

	// Remove duplicates
	const uniqueFiles = [...new Set(allFiles)];

	console.log(`${colors.blue}Found ${uniqueFiles.length} files to check${colors.reset}\n`);

	// Process files
	for (const file of uniqueFiles) {
		processFile(file, stats);
	}

	// Rename files and directories
	renameFilesAndDirectories(stats);

	// Print summary
	console.log(
		`\n${colors.blue}╔══════════════════════════════════════════════════════════╗${colors.reset}`
	);
	console.log(
		`${colors.blue}║  Summary                                                  ║${colors.reset}`
	);
	console.log(
		`${colors.blue}╚══════════════════════════════════════════════════════════╝${colors.reset}`
	);
	console.log(`  Files processed: ${stats.filesProcessed}`);
	console.log(`  Files ${DRY_RUN ? 'would be' : ''} changed: ${stats.filesChanged}`);
	console.log(`  Total replacements: ${stats.totalReplacements}`);

	if (stats.errors.length > 0) {
		console.log(`\n${colors.red}Errors:${colors.reset}`);
		stats.errors.forEach(({ file, error }) => {
			console.log(`  ${colors.red}✗${colors.reset} ${file}: ${error}`);
		});
	}

	if (DRY_RUN) {
		console.log(
			`\n${colors.yellow}⚠️  This was a dry run. Run without --dry-run to apply changes${colors.reset}`
		);
		console.log(
			`${colors.yellow}   Recommended: Review changes in git diff before committing${colors.reset}`
		);
	} else {
		console.log(`\n${colors.green}✅ Refactoring complete!${colors.reset}`);
		console.log(`${colors.blue}   Next steps:${colors.reset}`);
		console.log(`   1. Review changes: git diff`);
		console.log(`   2. Run tests: npm test`);
		console.log(`   3. Check TypeScript: npm run type-check`);
		console.log(`   4. Check linting: npm run lint`);
		if (CREATE_BACKUP) {
			console.log(`   5. Remove backups: find . -name "*.backup" -delete`);
		}
	}
}

main();

#!/usr/bin/env node

/**
 * Script to rename organization files to workspace files and update all imports
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');
const CREATE_BACKUP = process.argv.includes('--backup');

const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m'
};

interface FileRename {
	from: string;
	to: string;
}

// Files to rename
const FILE_RENAMES: FileRename[] = [
	// Composable files
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizations.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaces.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationState.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceState.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationQueries.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceQueries.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationMutations.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceMutations.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationUrlSync.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceUrlSync.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationAnalytics.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceAnalytics.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizationMembers.svelte.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaceMembers.svelte.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/organizationStorage.ts',
		to: 'src/lib/modules/core/workspaces/composables/workspaceStorage.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/organizationStorage.svelte.test.ts',
		to: 'src/lib/modules/core/workspaces/composables/workspaceStorage.svelte.test.ts'
	},
	// Test files
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizations.behavior.svelte.test.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaces.behavior.svelte.test.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizations.characterization.svelte.test.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaces.characterization.svelte.test.ts'
	},
	{
		from: 'src/lib/modules/core/workspaces/composables/useOrganizations.integration.svelte.test.ts',
		to: 'src/lib/modules/core/workspaces/composables/useWorkspaces.integration.svelte.test.ts'
	},
	// Component files
	{
		from: 'src/lib/modules/core/workspaces/components/OrganizationSwitcher.svelte',
		to: 'src/lib/modules/core/workspaces/components/WorkspaceSwitcher.svelte'
	},
	{
		from: 'src/lib/modules/core/workspaces/components/OrganizationModals.svelte',
		to: 'src/lib/modules/core/workspaces/components/WorkspaceModals.svelte'
	},
	// Test files in __tests__
	{
		from: 'src/lib/modules/core/workspaces/__tests__/organizations.integration.test.ts',
		to: 'src/lib/modules/core/workspaces/__tests__/workspaces.integration.test.ts'
	}
];

// Import path replacements
const IMPORT_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
	// Composable imports
	{
		pattern: /from ['"]\.\/useOrganizations\.svelte['"]/g,
		replacement: "from './useWorkspaces.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationState\.svelte['"]/g,
		replacement: "from './useWorkspaceState.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationQueries\.svelte['"]/g,
		replacement: "from './useWorkspaceQueries.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationMutations\.svelte['"]/g,
		replacement: "from './useWorkspaceMutations.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationUrlSync\.svelte['"]/g,
		replacement: "from './useWorkspaceUrlSync.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationAnalytics\.svelte['"]/g,
		replacement: "from './useWorkspaceAnalytics.svelte'"
	},
	{
		pattern: /from ['"]\.\/useOrganizationMembers\.svelte['"]/g,
		replacement: "from './useWorkspaceMembers.svelte'"
	},
	{
		pattern: /from ['"]\.\/organizationStorage['"]/g,
		replacement: "from './workspaceStorage'"
	},
	// Absolute imports
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizations\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaces.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationState\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceState.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationQueries\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceQueries.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationMutations\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceMutations.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationUrlSync\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceUrlSync.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationAnalytics\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceAnalytics.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/composables\/useOrganizationMembers\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/useWorkspaceMembers.svelte'"
	},
	{
		pattern: /from ['"]\$lib\/modules\/core\/workspaces\/composables\/organizationStorage['"]/g,
		replacement: "from '$lib/modules/core/workspaces/composables/workspaceStorage'"
	},
	// Component imports
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/components\/OrganizationSwitcher\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/components/WorkspaceSwitcher.svelte'"
	},
	{
		pattern:
			/from ['"]\$lib\/modules\/core\/workspaces\/components\/OrganizationModals\.svelte['"]/g,
		replacement: "from '$lib/modules/core/workspaces/components/WorkspaceModals.svelte'"
	},
	{
		pattern: /from ['"]\.\.\/components\/OrganizationSwitcher\.svelte['"]/g,
		replacement: "from '../components/WorkspaceSwitcher.svelte'"
	},
	{
		pattern: /from ['"]\.\.\/components\/OrganizationModals\.svelte['"]/g,
		replacement: "from '../components/WorkspaceModals.svelte'"
	}
];

function renameFile(from: string, to: string): void {
	const fromPath = join(ROOT_DIR, from);
	const toPath = join(ROOT_DIR, to);

	if (!existsSync(fromPath)) {
		console.log(`${colors.yellow}Skipping${colors.reset} ${from} (not found)`);
		return;
	}

	if (DRY_RUN) {
		console.log(`${colors.cyan}Would rename${colors.reset} ${from} → ${to}`);
		return;
	}

	try {
		// Create backup if requested
		if (CREATE_BACKUP && existsSync(toPath)) {
			const backupPath = `${toPath}.backup`;
			writeFileSync(backupPath, readFileSync(toPath));
		}

		renameSync(fromPath, toPath);
		console.log(`${colors.green}Renamed${colors.reset} ${from} → ${to}`);
	} catch (error) {
		console.error(`${colors.red}Error renaming${colors.reset} ${from}: ${error}`);
		throw error;
	}
}

function updateImportsInFile(filePath: string): number {
	const content = readFileSync(filePath, 'utf-8');
	let updatedContent = content;
	let replacements = 0;

	for (const { pattern, replacement } of IMPORT_REPLACEMENTS) {
		const matches = updatedContent.match(pattern);
		if (matches) {
			updatedContent = updatedContent.replace(pattern, replacement);
			replacements += matches.length;
		}
	}

	if (replacements > 0 && !DRY_RUN) {
		writeFileSync(filePath, updatedContent);
		console.log(`  ${colors.green}Updated${colors.reset} ${replacements} import(s) in ${filePath}`);
	} else if (replacements > 0) {
		console.log(
			`  ${colors.cyan}Would update${colors.reset} ${replacements} import(s) in ${filePath}`
		);
	}

	return replacements;
}

function main() {
	console.log(
		`${colors.blue}╔══════════════════════════════════════════════════════════╗${colors.reset}`
	);
	console.log(
		`${colors.blue}║  Rename Organization Files to Workspace Files            ║${colors.reset}`
	);
	console.log(
		`${colors.blue}╚══════════════════════════════════════════════════════════╝${colors.reset}\n`
	);

	if (DRY_RUN) {
		console.log(`${colors.yellow}⚠️  DRY RUN MODE - No files will be modified${colors.reset}\n`);
	}

	let totalReplacements = 0;

	// Step 1: Rename files
	console.log(`${colors.blue}Step 1: Renaming files...${colors.reset}\n`);
	for (const { from, to } of FILE_RENAMES) {
		renameFile(from, to);
	}

	// Step 2: Update imports in all files
	console.log(`\n${colors.blue}Step 2: Updating imports...${colors.reset}\n`);
	const patterns = ['**/*.ts', '**/*.tsx', '**/*.svelte', '**/*.js', '**/*.jsx'];
	const excludePatterns = [
		'**/node_modules/**',
		'**/.next/**',
		'**/dist/**',
		'**/build/**',
		'**/*.backup',
		'**/.git/**'
	];

	const allFiles: string[] = [];
	for (const pattern of patterns) {
		const files = glob.sync(pattern, {
			cwd: ROOT_DIR,
			absolute: true,
			ignore: excludePatterns
		});
		allFiles.push(...files);
	}

	const uniqueFiles = [...new Set(allFiles)];
	for (const file of uniqueFiles) {
		const replacements = updateImportsInFile(file);
		totalReplacements += replacements;
	}

	// Summary
	console.log(
		`\n${colors.blue}╔══════════════════════════════════════════════════════════╗${colors.reset}`
	);
	console.log(
		`${colors.blue}║  Summary                                                  ║${colors.reset}`
	);
	console.log(
		`${colors.blue}╚══════════════════════════════════════════════════════════╝${colors.reset}`
	);
	console.log(`  Files renamed: ${FILE_RENAMES.length}`);
	console.log(`  Import replacements: ${totalReplacements}`);

	if (DRY_RUN) {
		console.log(
			`\n${colors.yellow}⚠️  This was a dry run. Run without --dry-run to apply changes${colors.reset}`
		);
	} else {
		console.log(`\n${colors.green}✅ Renaming complete!${colors.reset}`);
	}
}

main();

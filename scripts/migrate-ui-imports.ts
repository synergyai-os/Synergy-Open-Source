#!/usr/bin/env tsx
/**
 * Migration Script: Migrate $lib/components/ui imports to atomic imports
 *
 * This script:
 * 1. Finds all files importing from $lib/components/ui
 * 2. Maps components to their atomic folders (atoms/molecules/organisms)
 * 3. Replaces imports with correct atomic imports
 * 4. Generates migration report
 *
 * Usage:
 *   npm run migrate-ui-imports [--dry-run] [--limit N] [--offset N]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Component mapping: component name -> atomic folder
const COMPONENT_MAP: Record<string, 'atoms' | 'molecules' | 'organisms'> = {
	// Atoms
	Button: 'atoms',
	Card: 'atoms',
	Badge: 'atoms',
	Chip: 'atoms',
	Icon: 'atoms',
	Text: 'atoms',
	Heading: 'atoms',
	Avatar: 'atoms',
	Loading: 'atoms',
	KeyboardShortcut: 'atoms',
	StatusPill: 'atoms',
	PinInput: 'atoms',
	FormInput: 'atoms',
	FormTextarea: 'atoms',
	Tabs: 'atoms',
	Checkbox: 'atoms',
	RadioGroup: 'atoms',
	Switch: 'atoms',
	Toggle: 'atoms',
	ToggleGroup: 'atoms',
	Slider: 'atoms',
	Label: 'atoms',
	Separator: 'atoms',
	AspectRatio: 'atoms',
	ScrollArea: 'atoms',
	Progress: 'atoms',
	Meter: 'atoms',
	Tooltip: 'atoms',
	IconButton: 'atoms',
	LoadingOverlay: 'atoms',
	SplitButton: 'atoms',

	// Molecules
	MetadataBar: 'molecules',
	PrioritySelector: 'molecules',
	AssigneeSelector: 'molecules',
	ProjectSelector: 'molecules',
	ContextSelector: 'molecules',
	AttachmentButton: 'molecules',
	ToggleSwitch: 'molecules',
	DropdownMenu: 'molecules',
	ContextMenu: 'molecules',
	Popover: 'molecules',
	ActionMenu: 'molecules',
	Select: 'molecules',
	Combobox: 'molecules',
	DateField: 'molecules',
	DatePicker: 'molecules',
	DateRangeField: 'molecules',
	DateRangePicker: 'molecules',
	TimeField: 'molecules',
	TimeRangeField: 'molecules',
	Pagination: 'molecules',
	PanelBreadcrumbs: 'molecules',
	LinkPreview: 'molecules',
	RatingGroup: 'molecules',

	// Organisms
	Dialog: 'organisms',
	AlertDialog: 'organisms',
	NavigationMenu: 'organisms',
	Menubar: 'organisms',
	Accordion: 'organisms',
	SidebarToggle: 'organisms',
	ThemeToggle: 'organisms',
	ResizableSplitter: 'organisms',
	ErrorBoundary: 'organisms',
	RateLimitError: 'organisms',
	Calendar: 'organisms',
	RangeCalendar: 'organisms',
	Command: 'organisms',
	Collapsible: 'organisms',
	Toolbar: 'organisms',
	StackedPanel: 'organisms'
};

interface MigrationResult {
	file: string;
	originalImport: string;
	newImport: string;
	components: string[];
	atomicFolder: 'atoms' | 'molecules' | 'organisms';
}

interface MigrationReport {
	totalFiles: number;
	migratedFiles: number;
	skippedFiles: number;
	results: MigrationResult[];
	errors: Array<{ file: string; error: string }>;
}

/**
 * Find all TypeScript/Svelte files in src directory
 */
function findSourceFiles(dir: string, fileList: string[] = []): string[] {
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			// Skip node_modules and other ignored directories
			if (['node_modules', '.git', 'dist', 'build', '.svelte-kit'].includes(file)) {
				continue;
			}
			findSourceFiles(filePath, fileList);
		} else if (
			(file.endsWith('.ts') || file.endsWith('.svelte') || file.endsWith('.tsx')) &&
			!file.endsWith('.d.ts')
		) {
			fileList.push(filePath);
		}
	}

	return fileList;
}

/**
 * Parse import statement and extract components
 */
function parseImport(importLine: string): {
	components: string[];
	typeOnly: boolean;
	namespace: boolean;
} | null {
	// Match: import { Component1, Component2 } from '$lib/components/ui';
	const namedImportMatch = importLine.match(
		/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]\$lib\/components\/ui['"]/
	);
	if (namedImportMatch) {
		const components = namedImportMatch[1]
			.split(',')
			.map((c) => c.trim())
			.filter(Boolean);
		return {
			components,
			typeOnly: importLine.includes('import type'),
			namespace: false
		};
	}

	// Match: import * as Something from '$lib/components/ui';
	const namespaceImportMatch = importLine.match(
		/import\s+\*\s+as\s+(\w+)\s+from\s+['"]\$lib\/components\/ui['"]/
	);
	if (namespaceImportMatch) {
		return {
			components: [namespaceImportMatch[1]],
			typeOnly: false,
			namespace: true
		};
	}

	return null;
}

/**
 * Migrate a single file
 */
function migrateFile(filePath: string, dryRun: boolean): MigrationResult | null {
	const content = readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const results: MigrationResult[] = [];
	let modified = false;
	let newContent = content;

	// Find all lines with ui imports
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// Skip comment lines
		if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
			continue;
		}
		const parsed = parseImport(line);

		if (!parsed) continue;

		// Group components by atomic folder
		const componentGroups: Record<'atoms' | 'molecules' | 'organisms', string[]> = {
			atoms: [],
			molecules: [],
			organisms: []
		};

		if (parsed.namespace) {
			// Namespace import - we can't determine which folder, skip for now
			console.warn(
				`⚠️  Namespace import found in ${relative(projectRoot, filePath)}: ${line.trim()}`
			);
			console.warn('   Namespace imports need manual migration');
			continue;
		}

		// Classify each component
		for (const component of parsed.components) {
			const atomicFolder = COMPONENT_MAP[component];
			if (atomicFolder) {
				componentGroups[atomicFolder].push(component);
			} else {
				console.warn(`⚠️  Unknown component "${component}" in ${relative(projectRoot, filePath)}`);
			}
		}

		// Generate new import statements
		const newImports: string[] = [];
		for (const [folder, components] of Object.entries(componentGroups)) {
			if (components.length === 0) continue;

			const importPrefix = parsed.typeOnly ? 'import type' : 'import';
			const componentsStr = components.join(', ');
			const newImport = `${importPrefix} { ${componentsStr} } from '$lib/components/${folder}';`;
			newImports.push(newImport);
		}

		if (newImports.length > 0) {
			// Replace the old import with new imports
			const oldImport = line;
			const replacement = newImports.join('\n');
			newContent = newContent.replace(oldImport, replacement);
			modified = true;

			results.push({
				file: relative(projectRoot, filePath),
				originalImport: oldImport.trim(),
				newImport: replacement,
				components: parsed.components,
				atomicFolder:
					componentGroups.atoms.length > 0
						? 'atoms'
						: componentGroups.molecules.length > 0
							? 'molecules'
							: 'organisms'
			});
		}
	}

	if (modified && !dryRun) {
		writeFileSync(filePath, newContent, 'utf-8');
	}

	return results.length > 0 ? results[0] : null;
}

/**
 * Main migration function
 */
function migrate(dryRun: boolean = false, limit?: number, offset: number = 0): MigrationReport {
	console.log('🔍 Finding files with $lib/components/ui imports...\n');

	const srcDir = join(projectRoot, 'src');
	const allFiles = findSourceFiles(srcDir);
	const filesWithUiImports: string[] = [];

	// Find files that import from ui
	for (const file of allFiles) {
		const content = readFileSync(file, 'utf-8');
		if (content.includes('$lib/components/ui')) {
			filesWithUiImports.push(file);
		}
	}

	console.log(`Found ${filesWithUiImports.length} files with ui imports\n`);

	// Apply limit and offset
	const filesToProcess = limit
		? filesWithUiImports.slice(offset, offset + limit)
		: filesWithUiImports.slice(offset);

	console.log(
		`Processing ${filesToProcess.length} files${limit ? ` (limit: ${limit}, offset: ${offset})` : ''}\n`
	);

	const report: MigrationReport = {
		totalFiles: filesToProcess.length,
		migratedFiles: 0,
		skippedFiles: 0,
		results: [],
		errors: []
	};

	for (const file of filesToProcess) {
		try {
			// Debug: show which file is being processed
			const fileRel = relative(projectRoot, file);
			const content = readFileSync(file, 'utf-8');
			const hasActualImport = /import\s+.*from\s+['"]\$lib\/components\/ui['"]/.test(content);

			if (!hasActualImport) {
				console.log(
					`Skipping ${fileRel} - contains 'components/ui' but no actual import statement`
				);
				report.skippedFiles++;
				continue;
			}

			const result = migrateFile(file, dryRun);
			if (result) {
				report.migratedFiles++;
				report.results.push(result);
			} else {
				console.log(`No migration result for ${fileRel} - check parseImport logic`);
				report.skippedFiles++;
			}
		} catch (error) {
			report.errors.push({
				file: relative(projectRoot, file),
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	return report;
}

/**
 * Print migration report
 */
function printReport(report: MigrationReport, dryRun: boolean): void {
	console.log('\n' + '='.repeat(80));
	console.log(dryRun ? '📋 DRY RUN REPORT' : '✅ MIGRATION REPORT');
	console.log('='.repeat(80));
	console.log(`Total files processed: ${report.totalFiles}`);
	console.log(`Migrated: ${report.migratedFiles}`);
	console.log(`Skipped: ${report.skippedFiles}`);
	console.log(`Errors: ${report.errors.length}`);

	if (report.errors.length > 0) {
		console.log('\n❌ Errors:');
		for (const error of report.errors) {
			console.log(`  - ${error.file}: ${error.error}`);
		}
	}

	if (report.results.length > 0) {
		console.log('\n📝 Migration Details:');
		for (const result of report.results) {
			console.log(`\n  File: ${result.file}`);
			console.log(`  Components: ${result.components.join(', ')}`);
			console.log(`  Atomic Folder: ${result.atomicFolder}`);
			console.log(`  Old: ${result.originalImport}`);
			console.log(
				`  New:\n${result.newImport
					.split('\n')
					.map((l) => `    ${l}`)
					.join('\n')}`
			);
		}
	}

	console.log('\n' + '='.repeat(80));
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const offsetIndex = args.indexOf('--offset');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined;
const offset = offsetIndex !== -1 ? parseInt(args[offsetIndex + 1], 10) : 0;

if (dryRun) {
	console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

const report = migrate(dryRun, limit, offset);
printReport(report, dryRun);

if (dryRun) {
	console.log('\n💡 Run without --dry-run to apply changes');
} else {
	console.log('\n✅ Migration complete!');
	console.log('💡 Next steps:');
	console.log('   1. Run: npm run check');
	console.log('   2. Run: npm run build');
	console.log('   3. Test critical pages');
}

process.exit(report.errors.length > 0 ? 1 : 0);

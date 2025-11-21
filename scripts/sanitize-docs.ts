/**
 * Sanitization script for confidential client information
 *
 * Replaces client names with generic placeholders in documentation files.
 * Supports dry-run mode to preview changes before applying.
 *
 * Usage:
 *   npx tsx scripts/sanitize-docs.ts                    # Dry-run (preview only)
 *   npx tsx scripts/sanitize-docs.ts --apply           # Apply changes
 *   npx tsx scripts/sanitize-docs.ts --apply --backup # Apply with backup
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SANITIZATION_MAP } from './confidentiality-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to scan
const DOC_DIRS = ['dev-docs', 'marketing-docs'];

// File extensions to process
const MARKDOWN_EXTENSIONS = ['.md', '.mdc'];

interface Replacement {
	file: string;
	line: number;
	original: string;
	replacement: string;
}

/**
 * Find all markdown files in directory
 */
function findMarkdownFiles(dir: string): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		// Skip node_modules, .git, and backup directories
		if (
			entry.name.startsWith('.') ||
			entry.name === 'node_modules' ||
			entry.name === 'backup' ||
			entry.name === '.backup'
		) {
			continue;
		}

		if (entry.isDirectory()) {
			files.push(...findMarkdownFiles(fullPath));
		} else if (MARKDOWN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Sanitize file content
 */
function sanitizeFile(filePath: string): Replacement[] {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const replacements: Replacement[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let modifiedLine = line;

		for (const [confidential, sanitized] of Object.entries(SANITIZATION_MAP)) {
			// Use word boundaries to avoid partial matches
			const regex = new RegExp(`\\b${confidential}\\b`, 'gi');
			if (regex.test(line)) {
				modifiedLine = modifiedLine.replace(regex, sanitized);
				replacements.push({
					file: filePath,
					line: i + 1,
					original: line.trim(),
					replacement: modifiedLine.trim()
				});
			}
		}

		lines[i] = modifiedLine;
	}

	return replacements;
}

/**
 * Create backup directory
 */
function createBackup(): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backupDir = path.join(__dirname, '..', '.backup', `sanitize-${timestamp}`);
	fs.mkdirSync(backupDir, { recursive: true });
	return backupDir;
}

/**
 * Backup file
 */
function backupFile(filePath: string, backupDir: string): void {
	const relativePath = path.relative(path.join(__dirname, '..'), filePath);
	const backupPath = path.join(backupDir, relativePath);
	const backupFileDir = path.dirname(backupPath);

	fs.mkdirSync(backupFileDir, { recursive: true });
	fs.copyFileSync(filePath, backupPath);
}

/**
 * Main execution
 */
function main() {
	const args = process.argv.slice(2);
	const apply = args.includes('--apply');
	const backup = args.includes('--backup');

	console.log('🔍 Scanning documentation files...\n');

	const allFiles: string[] = [];
	for (const dir of DOC_DIRS) {
		const dirPath = path.join(__dirname, '..', dir);
		if (fs.existsSync(dirPath)) {
			allFiles.push(...findMarkdownFiles(dirPath));
		}
	}

	console.log(`Found ${allFiles.length} markdown files\n`);

	const allReplacements: Replacement[] = [];
	const filesWithReplacements: string[] = [];

	for (const file of allFiles) {
		const replacements = sanitizeFile(file);
		if (replacements.length > 0) {
			allReplacements.push(...replacements);
			filesWithReplacements.push(file);
		}
	}

	if (allReplacements.length === 0) {
		console.log('✅ No confidential information found. All files are clean!\n');
		return;
	}

	console.log(
		`⚠️  Found ${allReplacements.length} replacements in ${filesWithReplacements.length} files\n`
	);

	// Show preview
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('PREVIEW: Files that will be modified:\n');

	for (const file of filesWithReplacements) {
		const fileReplacements = allReplacements.filter((r) => r.file === file);
		console.log(`📄 ${file}`);
		console.log(`   ${fileReplacements.length} replacement(s)`);
		for (const rep of fileReplacements.slice(0, 3)) {
			console.log(`   Line ${rep.line}: "${rep.original.substring(0, 60)}..."`);
		}
		if (fileReplacements.length > 3) {
			console.log(`   ... and ${fileReplacements.length - 3} more`);
		}
		console.log('');
	}

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

	if (!apply) {
		console.log('💡 This is a DRY-RUN. No files were modified.');
		console.log('💡 Run with --apply to apply changes.');
		console.log('💡 Run with --apply --backup to create backups first.\n');
		return;
	}

	// Create backup if requested
	let backupDir: string | null = null;
	if (backup) {
		backupDir = createBackup();
		console.log(`📦 Backup directory: ${backupDir}\n`);
	}

	// Apply changes
	console.log('🔧 Applying sanitization...\n');

	for (const file of filesWithReplacements) {
		if (backupDir) {
			backupFile(file, backupDir);
		}

		const content = fs.readFileSync(file, 'utf-8');
		let modifiedContent = content;

		for (const [confidential, sanitized] of Object.entries(SANITIZATION_MAP)) {
			const regex = new RegExp(`\\b${confidential}\\b`, 'gi');
			modifiedContent = modifiedContent.replace(regex, sanitized);
		}

		fs.writeFileSync(file, modifiedContent, 'utf-8');
		console.log(`✅ Sanitized: ${file}`);
	}

	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`✅ Sanitization complete! Modified ${filesWithReplacements.length} files.`);
	if (backupDir) {
		console.log(`📦 Backups saved to: ${backupDir}`);
	}
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();

/**
 * Svelte Parser Utilities
 *
 * Parses Svelte component files and extracts:
 * - Imports (atom imports, recipe imports, etc.)
 * - Component metadata (name, type)
 *
 * Uses svelte/compiler for AST parsing and regex for import extraction.
 */

import { parse } from 'svelte/compiler';
import fs from 'fs';
import path from 'path';

/**
 * Parse a Svelte file and return the AST
 * @param {string} filePath - Path to .svelte file
 * @returns {{ ast: object, source: string, parseTime: number }}
 */
export function parseSvelteFile(filePath) {
	const startTime = performance.now();
	const source = fs.readFileSync(filePath, 'utf-8');
	const ast = parse(source, { modern: true });
	const parseTime = performance.now() - startTime;

	return { ast, source, parseTime };
}

/**
 * Extract all imports from a Svelte file
 * @param {string} filePath - Path to .svelte file
 * @returns {Array<{
 *   namedImports: string[],
 *   defaultImport: string | null,
 *   namespaceImport: string | null,
 *   modulePath: string,
 *   isAtomImport: boolean,
 *   isMoleculeImport: boolean,
 *   isOrganismImport: boolean,
 *   isRecipeImport: boolean,
 *   line: number
 * }>}
 */
export function extractImports(filePath) {
	const source = fs.readFileSync(filePath, 'utf-8');
	const lines = source.split('\n');

	// Match various import patterns
	const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;

	const imports = [];
	let match;

	while ((match = importRegex.exec(source)) !== null) {
		const namedImportsRaw = match[1] || '';
		const namespaceImport = match[2] || null;
		const defaultImport = match[3] || null;
		const modulePath = match[4];

		// Parse named imports (handle "Name as Alias" syntax)
		const namedImports = namedImportsRaw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.map((s) => {
				const parts = s.split(/\s+as\s+/);
				return parts[0].replace(/^type\s+/, '').trim(); // Remove 'type' prefix
			})
			.filter((s) => !s.startsWith('type ')); // Filter out type-only imports

		// Find line number
		const matchIndex = match.index;
		let lineNumber = 1;
		let charCount = 0;
		for (const line of lines) {
			charCount += line.length + 1; // +1 for newline
			if (charCount > matchIndex) break;
			lineNumber++;
		}

		imports.push({
			namedImports,
			defaultImport,
			namespaceImport,
			modulePath,
			isAtomImport: modulePath.includes('$lib/components/atoms'),
			isMoleculeImport: modulePath.includes('$lib/components/molecules'),
			isOrganismImport: modulePath.includes('$lib/components/organisms'),
			isRecipeImport: modulePath.includes('$lib/design-system/recipes'),
			line: lineNumber
		});
	}

	return imports;
}

/**
 * Get component type from file path
 * @param {string} filePath - Path to component file
 * @returns {'atom' | 'molecule' | 'organism' | 'module' | 'unknown'}
 */
export function getComponentType(filePath) {
	if (filePath.includes('/components/atoms/')) return 'atom';
	if (filePath.includes('/components/molecules/')) return 'molecule';
	if (filePath.includes('/components/organisms/')) return 'organism';
	if (filePath.includes('/modules/')) return 'module';
	return 'unknown';
}

/**
 * Get component name from file path
 * @param {string} filePath - Path to component file
 * @returns {string}
 */
export function getComponentName(filePath) {
	return path.basename(filePath, '.svelte');
}

/**
 * Check if file is a Storybook story
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
export function isStoryFile(filePath) {
	return filePath.includes('.stories.');
}

/**
 * Parse multiple Svelte files in parallel
 * @param {string[]} filePaths - Array of file paths
 * @returns {Promise<Array<{ filePath: string, ast: object, source: string, parseTime: number, error?: string }>>}
 */
export async function parseSvelteFiles(filePaths) {
	const results = [];

	for (const filePath of filePaths) {
		try {
			const { ast, source, parseTime } = parseSvelteFile(filePath);
			results.push({ filePath, ast, source, parseTime });
		} catch (error) {
			results.push({ filePath, ast: null, source: null, parseTime: 0, error: error.message });
		}
	}

	return results;
}

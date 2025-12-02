import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import { existsSync, statSync } from 'fs';

// Utility: Strip PARA numbering (1-, 2-, 3-, 4-) from folder/file names
function cleanParaName(name: string): string {
	return name.replace(/^\d+-/, '');
}

/**
 * Dynamic file discovery system - builds index of all markdown files
 * This replaces hardcoded parent directories with dynamic discovery
 */
let fileIndex: Map<string, string> | null = null;
let indexBuildTime: number = 0;

/**
 * Build file index by scanning dev-docs directory recursively
 * Cached for performance - only rebuilds if files change
 */
async function buildFileIndex(): Promise<Map<string, string>> {
	const docsDir = join(cwd(), 'dev-docs');
	const index = new Map<string, string>();

	async function scanDir(dir: string, relativePath = ''): Promise<void> {
		try {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

				if (entry.isDirectory()) {
					await scanDir(fullPath, relPath);
				} else if (entry.isFile() && entry.name.endsWith('.md')) {
					// Store key without .md extension (for matching)
					// Key is relative to dev-docs/ (e.g., "2-areas/architecture/system-architecture")
					const key = relPath.replace(/\.md$/, '');
					// Store full relative path (with .md) for file reading
					// Value includes .md extension (e.g., "2-areas/architecture/system-architecture.md")
					index.set(key, relPath);
				}
			}
		} catch (err) {
			// Silently skip directories we can't read
			console.error(`Failed to scan directory ${dir}:`, err);
		}
	}

	await scanDir(docsDir);
	return index;
}

/**
 * Get file index (builds if needed or cache is stale)
 */
async function getFileIndex(): Promise<Map<string, string>> {
	const now = Date.now();
	// Rebuild index if it doesn't exist or is older than 5 minutes
	if (!fileIndex || now - indexBuildTime > 5 * 60 * 1000) {
		fileIndex = await buildFileIndex();
		indexBuildTime = now;
	}
	return fileIndex;
}

/**
 * Generate path variations for dynamic resolution:
 * 1. Exact path (as provided)
 * 2. Remove parent directories one by one
 * 3. Add common parent directories (discovered dynamically)
 * 4. Try with/without segments
 */
function generatePathVariations(path: string, fileIndex: Map<string, string>): string[] {
	const variations = new Set<string>();
	const segments = path.split('/');

	// 1. Exact path variations
	variations.add(path);
	variations.add(`${path}.md`);
	variations.add(`${path}/README`);
	variations.add(`${path}/index`);

	// 2. Try removing parent directories one by one
	// e.g., '2-areas/architecture/product/principles' ->
	//   '2-areas/product/principles', 'product/principles', 'principles'
	for (let i = 1; i < segments.length; i++) {
		const variant = segments.slice(i).join('/');
		variations.add(variant);
		variations.add(`${variant}.md`);
		variations.add(`${variant}/README`);
		variations.add(`${variant}/index`);
	}

	// 3. Try removing architecture/ if present (bidirectional resolution)
	if (path.includes('/architecture/')) {
		const withoutArch = path.replace('/architecture/', '/');
		variations.add(withoutArch);
		variations.add(`${withoutArch}.md`);
		variations.add(`${withoutArch}/README`);
		variations.add(`${withoutArch}/index`);
	}

	// 4. Try adding common parent directories (only for 2-areas/ paths)
	if (segments.length >= 2 && segments[0] === '2-areas') {
		// Discover parent directories dynamically from file index
		const parentDirs = new Set<string>();
		for (const key of fileIndex.keys()) {
			if (key.startsWith('2-areas/')) {
				const parts = key.split('/');
				if (parts.length >= 3 && parts[0] === '2-areas') {
					parentDirs.add(parts[1]); // Second segment is parent dir
				}
			}
		}

		// If path doesn't already have a parent dir, try adding discovered ones
		if (segments.length === 2 && !path.includes('/architecture/')) {
			for (const parentDir of parentDirs) {
				const withParent = `2-areas/${parentDir}/${segments[1]}`;
				variations.add(withParent);
				variations.add(`${withParent}.md`);
				variations.add(`${withParent}/README`);
				variations.add(`${withParent}/index`);
			}
		}
	}

	// 5. Try directory access (for trailing slash cases)
	if (path.endsWith('/')) {
		const withoutSlash = path.slice(0, -1);
		variations.add(withoutSlash);
		variations.add(`${withoutSlash}/README`);
		variations.add(`${withoutSlash}/index`);
	}

	return Array.from(variations);
}

/**
 * Intelligently resolve file path using dynamic file discovery
 * Tries variations and matches against actual file index
 */
async function generatePossiblePaths(path: string): Promise<string[]> {
	const index = await getFileIndex();
	const variations = generatePathVariations(path, index);
	const possiblePaths: string[] = [];

	// Convert variations to actual file paths and check if they exist in index
	for (const variant of variations) {
		// Check exact match (index keys are stored without .md)
		if (index.has(variant)) {
			const filePath = index.get(variant);
			if (filePath) {
				possiblePaths.push(`dev-docs/${filePath}`);
			}
			continue;
		}

		// Check as directory with README.md
		if (index.has(`${variant}/README`)) {
			const filePath = index.get(`${variant}/README`);
			if (filePath) {
				possiblePaths.push(`dev-docs/${filePath}`);
			}
			continue;
		}

		// Check as directory with index.md
		if (index.has(`${variant}/index`)) {
			const filePath = index.get(`${variant}/index`);
			if (filePath) {
				possiblePaths.push(`dev-docs/${filePath}`);
			}
			continue;
		}

		// Fallback: try direct file system check (for edge cases)
		const directPath = `dev-docs/${variant}.md`;
		if (existsSync(join(cwd(), directPath))) {
			possiblePaths.push(directPath);
		}
	}

	// Also try exact path variations as fallback
	possiblePaths.push(`dev-docs/${path}.md`);
	possiblePaths.push(`dev-docs/${path}/README.md`);
	possiblePaths.push(`dev-docs/${path}/index.md`);

	// Remove duplicates
	return Array.from(new Set(possiblePaths));
}

export const load: PageServerLoad = async ({ params, locals }) => {
	// Check permission: require docs.view permission
	const sessionId = locals.auth.sessionId;
	if (!sessionId) {
		throw error(403, 'Authentication required to view documentation');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const userPermissions = await client.query(api.rbac.permissions.getUserPermissionsQuery, {
		sessionId
	});

	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view');
	if (!hasDocsPermission) {
		throw error(403, 'Permission denied: docs.view permission required');
	}

	const { path } = params;

	// Generate all possible paths to try using dynamic file discovery
	const possiblePaths = await generatePossiblePaths(path);

	for (const filePath of possiblePaths) {
		try {
			const fullPath = join(cwd(), filePath);

			// Check if file exists before trying to read
			if (!existsSync(fullPath)) {
				continue;
			}

			const content = await readFile(fullPath, 'utf-8');

			// Extract title from frontmatter or first heading
			const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^title:\s*(.+)$/m);
			let title = titleMatch ? titleMatch[1].trim() : path.split('/').pop() || 'Documentation';

			// Clean PARA prefix from title (strip "1-", "2-", etc. and trailing slashes)
			title = cleanParaName(title).replace(/\/$/, '');

			// If we found the file with a different path (e.g., added architecture/), redirect
			// Extract the actual path from filePath (remove dev-docs/ prefix and .md extension)
			const actualPath = filePath
				.replace(/^dev-docs\//, '')
				.replace(/\.md$/, '')
				.replace(/\/README$/, '')
				.replace(/\/index$/, '');

			// Only redirect if the resolved path differs from requested path
			if (actualPath !== path && actualPath !== path.replace(/\/$/, '')) {
				// ✅ SKIP LOGGING: File found, just wrong path - redirect is successful resolution
				// We don't log this as a 404 because:
				// 1. The file exists (successful resolution)
				// 2. Redirect fixes the issue automatically
				// 3. 404 log should only track actual missing files
				throw redirect(301, `/dev-docs/${actualPath}`);
			}

			return {
				content,
				title,
				path: `/${actualPath}`
			};
		} catch (err) {
			// If it's a redirect, throw it (don't catch)
			if (err && typeof err === 'object' && 'status' in err && err.status === 301) {
				throw err;
			}
			// Otherwise, try next path
			continue;
		}
	}

	// Check if this might be a directory - try to list files in the directory
	const possibleDirPath = join(cwd(), 'dev-docs', path);
	if (existsSync(possibleDirPath)) {
		try {
			// Verify it's actually a directory, not a file
			const stats = statSync(possibleDirPath);
			if (!stats.isDirectory()) {
				throw new Error('Not a directory');
			}

			const entries = await readdir(possibleDirPath, { withFileTypes: true });
			const markdownFiles = entries
				.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
				.map((entry) => {
					const fileName = entry.name.replace(/\.md$/, '');
					const filePath = `${path}/${fileName}`;
					return {
						name: fileName,
						displayName: cleanParaName(fileName),
						path: filePath,
						href: `/dev-docs/${filePath}`
					};
				})
				.sort((a, b) => {
					// Sort by numeric prefix if present, otherwise alphabetically
					const aNum = parseInt(a.name.match(/^(\d+)-/)?.[1] || '999');
					const bNum = parseInt(b.name.match(/^(\d+)-/)?.[1] || '999');
					if (aNum !== bNum) return aNum - bNum;
					return a.name.localeCompare(b.name);
				});

			if (markdownFiles.length > 0) {
				// Extract titles from files for better display
				const filesWithTitles = await Promise.all(
					markdownFiles.map(async (file) => {
						try {
							const fileContent = await readFile(join(possibleDirPath, `${file.name}.md`), 'utf-8');
							const titleMatch =
								fileContent.match(/^#\s+(.+)$/m) || fileContent.match(/^title:\s*(.+)$/m);
							const title = titleMatch ? titleMatch[1].trim() : file.displayName;
							return {
								...file,
								title: cleanParaName(title)
							};
						} catch {
							return {
								...file,
								title: file.displayName
							};
						}
					})
				);

				const dirName = path.split('/').pop() || path;
				return {
					isDirectory: true,
					content: '',
					title: cleanParaName(dirName),
					path: `/${path}`,
					files: filesWithTitles
				};
			}
		} catch (_err) {
			// Not a readable directory or error reading it, continue to 404
		}
	}

	// ❌ LOG 404: No file found after trying all variations
	// This is a true 404 - file doesn't exist anywhere
	// We log this to track:
	// 1. Broken links that need fixing
	// 2. Missing documentation that should exist
	// 3. Common typos or patterns to add to redirects
	const url = `/dev-docs/${path}`;

	// Log 404 asynchronously (don't block error response)
	// Use fire-and-forget pattern to avoid blocking error page
	// Reuse existing client and sessionId from above
	client
		.mutation(api.docs.doc404Tracking.log404, {
			url,
			referrer: undefined, // Could extract from event.request.headers.get('referer') if needed
			userAgent: undefined, // Could extract from event.request.headers.get('user-agent') if needed
			ipAddress: undefined, // Could extract from event.getClientAddress() if needed
			sessionId: sessionId ?? undefined
		})
		.catch((err) => {
			// Silently fail - don't break error page if logging fails
			console.error('Failed to log 404:', err);
		});

	throw error(
		404,
		`Documentation page not found: ${path}. Check that the markdown file exists in the dev-docs/ folder.`
	);
};

import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import { existsSync } from 'fs';

// Utility: Strip PARA numbering (1-, 2-, 3-, 4-) from folder/file names
function cleanParaName(name: string): string {
	return name.replace(/^\d+-/, '');
}

// Common parent directories to try when path doesn't match
// These are directories that commonly contain files accessed without the parent directory
const COMMON_PARENT_DIRS = ['architecture'];

/**
 * Intelligently resolve file path by trying variations:
 * 1. Exact path (as provided)
 * 2. With common parent directories (e.g., architecture/)
 * 3. As directory with README.md
 */
function generatePossiblePaths(path: string): string[] {
	const paths: string[] = [];

	// 1. Try exact path variations
	paths.push(`dev-docs/${path}.md`);
	paths.push(`dev-docs/${path}/README.md`);
	paths.push(`dev-docs/${path}/index.md`);

	// 2. Try with common parent directories
	// Only if path starts with "2-areas/" and doesn't already include the parent dir
	if (path.startsWith('2-areas/') && !path.includes('/architecture/')) {
		for (const parentDir of COMMON_PARENT_DIRS) {
			// Insert parent directory after "2-areas"
			const withParent = path.replace(/^2-areas\//, `2-areas/${parentDir}/`);
			paths.push(`dev-docs/${withParent}.md`);
			paths.push(`dev-docs/${withParent}/README.md`);
			paths.push(`dev-docs/${withParent}/index.md`);
		}
	}

	// 3. Try directory access (for trailing slash cases)
	if (path.endsWith('/')) {
		const withoutSlash = path.slice(0, -1);
		paths.push(`dev-docs/${withoutSlash}/README.md`);
		paths.push(`dev-docs/${withoutSlash}/index.md`);
	}

	return paths;
}

export const load: PageServerLoad = async ({ params }) => {
	const { path } = params;

	// Generate all possible paths to try
	const possiblePaths = generatePossiblePaths(path);

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

	// ❌ LOG 404: No file found after trying all variations
	// This is a true 404 - file doesn't exist anywhere
	// We log this to track:
	// 1. Broken links that need fixing
	// 2. Missing documentation that should exist
	// 3. Common typos or patterns to add to redirects
	const url = `/dev-docs/${path}`;

	// Log 404 asynchronously (don't block error response)
	// Use fire-and-forget pattern to avoid blocking error page
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = undefined; // Could extract from event.locals.auth.sessionId if available

	client
		.mutation(api.doc404Tracking.log404, {
			url,
			referrer: undefined, // Could extract from event.request.headers.get('referer') if needed
			userAgent: undefined, // Could extract from event.request.headers.get('user-agent') if needed
			ipAddress: undefined, // Could extract from event.getClientAddress() if needed
			sessionId
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

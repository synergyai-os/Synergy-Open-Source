import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Check permission: require docs.view permission
	const sessionId = locals.auth.sessionId;
	if (!sessionId) {
		throw error(403, 'Authentication required to view documentation');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const userPermissions = await client.query(
		api.infrastructure.rbac.permissions.getUserPermissionsQuery,
		{
			sessionId
		}
	);

	const hasDocsPermission = userPermissions.some((p) => p.permissionSlug === 'docs.view');
	if (!hasDocsPermission) {
		throw error(403, 'Permission denied: docs.view permission required');
	}

	const { path } = params;

	// Try common variations: exact path, with .md, as README
	const possiblePaths = [
		`marketing-docs/${path}.md`,
		`marketing-docs/${path}/README.md`,
		`marketing-docs/${path}/index.md`,
		`marketing-docs/${path}`
	];

	for (const filePath of possiblePaths) {
		try {
			const fullPath = join(cwd(), filePath);
			const content = await readFile(fullPath, 'utf-8');

			// Extract title from frontmatter or first heading
			const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^title:\s*(.+)$/m);
			const title = titleMatch
				? titleMatch[1].trim()
				: path.split('/').pop() || 'Marketing Documentation';

			return {
				content,
				title,
				path: `/${path}`
			};
		} catch (_err) {
			// Try next path
			continue;
		}
	}

	// No file found
	throw error(
		404,
		`Marketing documentation page not found: ${path}. Check that the markdown file exists in the marketing-docs/ folder.`
	);
};

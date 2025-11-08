import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

export const load: PageServerLoad = async ({ params }) => {
	const { path } = params;
	
	// Try common variations: exact path, with .md, as README
	const possiblePaths = [
		`dev-docs/${path}.md`,
		`dev-docs/${path}/README.md`,
		`dev-docs/${path}/index.md`,
		`dev-docs/${path}`
	];
	
	for (const filePath of possiblePaths) {
		try {
			const fullPath = join(cwd(), filePath);
			const content = await readFile(fullPath, 'utf-8');
			
			// Extract title from frontmatter or first heading
			const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^title:\s*(.+)$/m);
			const title = titleMatch ? titleMatch[1].trim() : path.split('/').pop() || 'Documentation';
			
			return {
				content,
				title,
				path: `/${path}`
			};
		} catch (err) {
			// Try next path
			continue;
		}
	}
	
	// No file found
	throw error(404, {
		message: `Documentation page not found: ${path}`,
		hint: 'Check that the markdown file exists in the dev-docs/ folder'
	});
};


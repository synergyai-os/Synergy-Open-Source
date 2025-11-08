import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const load: PageServerLoad = async ({ params }) => {
	const docsPath = join(__dirname, '../../../../marketing-docs');
	const requestedPath = params.path;

	let filePath = '';
	let content = '';
	let title = 'Marketing Documentation';

	const possiblePaths = [
		join(docsPath, `${requestedPath}.md`),
		join(docsPath, requestedPath, 'README.md'),
		join(docsPath, requestedPath, 'index.md')
	];

	for (const p of possiblePaths) {
		try {
			content = readFileSync(p, 'utf-8');
			filePath = p;
			break;
		} catch (e) {
			// Try next path
		}
	}

	if (!content) {
		error(404, {
			message: `Marketing documentation page not found: ${requestedPath}`,
			hint: 'Check that the markdown file exists in the marketing-docs/ folder'
		});
	}

	// Extract title from frontmatter or first heading
	const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
	if (frontmatterMatch) {
		const frontmatter = frontmatterMatch[1];
		const titleMatch = frontmatter.match(/^title:\s*(.*)/m);
		if (titleMatch) {
			title = titleMatch[1].trim();
		}
		content = content.replace(frontmatterMatch[0], ''); // Remove frontmatter from content
	} else {
		const firstHeadingMatch = content.match(/^(#+)\s*(.*)/);
		if (firstHeadingMatch) {
			title = firstHeadingMatch[2].trim();
		}
	}

	return {
		content,
		title,
		path: requestedPath
	};
};


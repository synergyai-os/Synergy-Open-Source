import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ params }) => {
	// On server: just return params, actual doc loading happens in page component
	const path = params.path || 'README';
	
	// Convert URL path to file path
	// e.g., "2-areas/architecture" -> "/dev-docs/2-areas/architecture.md"
	const filePath = `/dev-docs/${path}${path.endsWith('.md') ? '' : '.md'}`;
	
	return {
		path,
		filePath
	};
};


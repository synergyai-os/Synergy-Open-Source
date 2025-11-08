import { error } from '@sveltejs/kit';
import { createConvexHttpClient } from '$lib/server/auth';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const client = await createConvexHttpClient(event);
	
	const { slug } = event.params;
	
	// Query notes to find one with matching slug
	const notes = await client.query(api.notes.listNotes, {
		processed: false,
		blogOnly: false
	});
	
	const note = notes.find((n: any) => n.slug === slug);
	
	if (!note) {
		throw error(404, 'Note not found');
	}
	
	return {
		note,
		slug
	};
};


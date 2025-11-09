import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async (event) => {
	// Create Convex client for public documentation queries
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	
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


import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async (event) => {
	// Create Convex client for documentation queries
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	const { slug } = event.params;

	// Get userId from session (required for listNotes query)
	const userId = event.locals.auth.user?.userId;
	if (!userId) {
		// If not authenticated, return empty array (no notes shown)
		return {
			note: null,
			slug
		};
	}

	// Query notes to find one with matching slug
	const notes = await client.query(api.notes.listNotes, {
		userId,
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

import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async (event) => {
	// Create Convex client for documentation queries
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	const { slug } = event.params;

	// Get sessionId from session (required for listNotes query)
	const sessionId = event.locals.auth.sessionId;
	if (!sessionId) {
		// If not authenticated, return empty array (no notes shown)
		return {
			note: null,
			slug
		};
	}

	// Query notes to find one with matching slug
	const notes = await client.query(api.notes.listNotes, {
		sessionId,
		processed: false,
		blogOnly: false
	});

	// listNotes only returns notes (type === 'note'), so we can safely access slug property
	// Type assertion needed because Convex return types are union types
	const note = notes.find((n) => {
		if (n.type !== 'note') return false;
		const noteItem = n as typeof n & { type: 'note'; slug?: string };
		return noteItem.slug === slug;
	});

	if (!note) {
		throw error(404, 'Note not found');
	}

	return {
		note,
		slug
	};
};

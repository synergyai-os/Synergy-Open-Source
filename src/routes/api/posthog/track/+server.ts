import { json, error } from '@sveltejs/kit';
import { getPostHogClient } from '$lib/server/posthog';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';

type TrackRequestBody = {
	event?: unknown;
	distinctId?: unknown;
	properties?: unknown;
};

export const POST = async ({ request }) => {
	if (!PUBLIC_POSTHOG_KEY) {
		return json({ skipped: true }, { status: 200 });
	}

	let payload: TrackRequestBody;

	try {
		payload = (await request.json()) as TrackRequestBody;
	} catch (cause) {
		throw error(400, 'Invalid JSON payload');
	}

	const { event, distinctId, properties } = payload;

	if (typeof event !== 'string' || event.length === 0) {
		throw error(400, 'Missing event name');
	}

	if (typeof distinctId !== 'string' || distinctId.length === 0) {
		throw error(400, 'Missing distinctId');
	}

	const client = getPostHogClient();

	await client.capture({
		event,
		distinctId,
		properties:
			properties && typeof properties === 'object'
				? (properties as Record<string, unknown>)
				: undefined
	});

	return json({ ok: true });
};

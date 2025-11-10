import { PostHog } from 'posthog-node';
import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public';
import type { AnalyticsEvent, AnalyticsEventName } from '$lib/analytics/events';

let _client: PostHog | null = null;

export function getPostHogClient() {
	if (!_client) {
		if (!PUBLIC_POSTHOG_KEY) {
			throw new Error('Missing PostHog key. Ensure PUBLIC_POSTHOG_KEY is configured.');
		}

		_client = new PostHog(PUBLIC_POSTHOG_KEY, {
			host: PUBLIC_POSTHOG_HOST
		});
	}
	return _client;
}

export async function captureAnalyticsEvent<K extends AnalyticsEventName>(
	event: AnalyticsEvent<K>
) {
	const client = getPostHogClient();
	if (!client) return;

	await client.capture({
		event: event.name,
		distinctId: event.distinctId,
		groups: event.groups,
		properties: event.properties
	});
}

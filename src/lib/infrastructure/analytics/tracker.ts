import type { AnalyticsEvent, AnalyticsEventName } from './events';

export async function trackAnalyticsEvent<K extends AnalyticsEventName>(event: AnalyticsEvent<K>) {
	try {
		await fetch('/api/posthog/track', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				event: event.name,
				distinctId: event.distinctId,
				properties: event.properties,
				groups: event.groups
			})
		});
	} catch (error) {
		console.warn('Failed to send analytics event', event.name, error);
	}
}

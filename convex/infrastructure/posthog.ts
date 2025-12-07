'use node';

import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

type AnalyticsEventName = string;
type AnalyticsEvent<K extends AnalyticsEventName = AnalyticsEventName> = {
	name: K;
	distinctId: string;
	groups?: Record<string, string | undefined>;
	properties?: Record<string, unknown>;
};

async function posthogCapture(event: string, distinctId: string, properties?: Record<string, unknown>) {
	const apiKey = process.env.PUBLIC_POSTHOG_KEY;
	const host = process.env.PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
	if (!apiKey) return;

	await fetch(`${host}/capture/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			api_key: apiKey,
			event,
			properties: properties ?? {},
			distinct_id: distinctId
		})
	});
}

export async function captureAnalyticsEvent<K extends AnalyticsEventName>(event: AnalyticsEvent<K>) {
	await posthogCapture(event.name, event.distinctId, event.properties);
}

/**
 * Internal action to capture analytics events from Convex functions
 * Used by queries/mutations to track events without blocking execution
 */
export const captureEvent = internalAction({
	args: {
		distinctId: v.string(),
		event: v.string(),
		properties: v.optional(v.any()),
		groups: v.optional(
			v.object({ workspace: v.optional(v.string()), team: v.optional(v.string()) })
		)
	},
	handler: async (_ctx, { distinctId, event, properties, groups }) => {
		await posthogCapture(event, distinctId, { ...properties, ...groups });
	}
});

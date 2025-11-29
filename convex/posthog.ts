'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { PostHog } from 'posthog-node';
import type {
	AnalyticsEvent,
	AnalyticsEventName
} from '../src/lib/infrastructure/analytics/events';

let cachedClient: PostHog | null = null;

function getClient() {
	if (!cachedClient) {
		const apiKey = process.env.PUBLIC_POSTHOG_KEY;
		if (!apiKey) {
			return null;
		}

		cachedClient = new PostHog(apiKey, {
			host: process.env.PUBLIC_POSTHOG_HOST
		});
	}

	return cachedClient;
}

export async function captureAnalyticsEvent<K extends AnalyticsEventName>(
	event: AnalyticsEvent<K>
) {
	const client = getClient();
	if (!client) {
		return;
	}

	await client.capture({
		event: event.name,
		distinctId: event.distinctId,
		groups: event.groups,
		properties: event.properties
	});
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
		const client = getClient();
		if (!client) {
			console.warn('PostHog client not initialized - skipping event:', event);
			return;
		}

		await client.capture({
			event,
			distinctId,
			groups,
			properties
		});
	}
});

"use node";

import { PostHog } from 'posthog-node';
import type { AnalyticsEvent, AnalyticsEventName } from '../src/lib/analytics/events';

let cachedClient: PostHog | null = null;

function getClient() {
  if (!cachedClient) {
    const apiKey = process.env.PUBLIC_POSTHOG_KEY;
    if (!apiKey) {
      return null;
    }

    cachedClient = new PostHog(apiKey, {
      host: process.env.PUBLIC_POSTHOG_HOST,
    });
  }

  return cachedClient;
}

export async function captureAnalyticsEvent<K extends AnalyticsEventName>(event: AnalyticsEvent<K>) {
  const client = getClient();
  if (!client) {
    return;
  }

  await client.capture({
    event: event.name,
    distinctId: event.distinctId,
    groups: event.groups,
    properties: event.properties,
  });
}


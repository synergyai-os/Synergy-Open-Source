import { PostHog } from 'posthog-node';
import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public';

let _client: PostHog | null = null;

export function getPostHogClient() {
  if (!_client) {
    if (!PUBLIC_POSTHOG_KEY) {
      throw new Error('Missing PostHog key. Ensure PUBLIC_POSTHOG_KEY is configured.');
    }

    _client = new PostHog(PUBLIC_POSTHOG_KEY, {
      host: PUBLIC_POSTHOG_HOST,
    });
  }
  return _client;
}

import { PUBLIC_POSTHOG_KEY } from '$env/static/public';

type TrackEventInput = {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
};

const isPosthogEnabled = typeof PUBLIC_POSTHOG_KEY === 'string' && PUBLIC_POSTHOG_KEY.length > 0;

export async function trackPosthogEvent({ event, distinctId, properties }: TrackEventInput) {
  if (!isPosthogEnabled) return;

  if (!event || !distinctId) return;

  try {
    await fetch('/api/posthog/track', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ event, distinctId, properties })
    });
  } catch (error) {
    console.warn('Failed to send PostHog event', error);
  }
}



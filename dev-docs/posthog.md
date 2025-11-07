# PostHog Integration

## Overview

Axon uses PostHog for product analytics. The setup comes from the PostHog Svelte wizard but has been adapted to work cleanly with our Convex-based auth flow and local development constraints.

This document captures how the integration works today so we can maintain it confidently and extend it later.

## Environment

The wizard added two public env vars that must be present in `.env.local` (and any deployment secrets):

- `PUBLIC_POSTHOG_KEY` – Project API key
- `PUBLIC_POSTHOG_HOST` – Ingestion endpoint. Defaults to `https://eu.posthog.com` but you can switch to a custom domain if we proxy PostHog through our own host.

The browser SDK is optional in development: when `PUBLIC_POSTHOG_KEY` is missing, the layout simply skips initialization and the capture endpoint short-circuits.

## Server-First Capture Strategy

Most Axon analytics should flow through the backend. PostHog’s own guidance for server libraries (for example their [Node integration](https://github.com/PostHog/posthog/wiki/node-integration)) highlights that calling `client.capture({ distinctId, event, properties })` from a trusted environment guarantees delivery even when browsers block scripts or third-party requests. We follow that pattern for all key product events.

- `src/lib/server/posthog.ts` lazily creates a singleton `PostHog` client from `posthog-node` using `PUBLIC_POSTHOG_KEY`/`PUBLIC_POSTHOG_HOST`.
- `src/routes/api/posthog/track/+server.ts` exposes `POST /api/posthog/track`. It validates `{ event, distinctId, properties }` and forwards the payload to `client.capture()`.
- When the public key is missing we return `{ skipped: true }` so local development doesn’t log errors.
- Auth flows (`login/+page.svelte`, `register/+page.svelte`) call this endpoint after successful sign-in so we never miss `user_signed_in` / `user_registered`, even if the browser SDK is blocked.
- Future server-triggered analytics (Convex actions, cron jobs) should also go through this helper for consistency and delivery guarantees.

> For high-volume server pipelines we can swap `/api/posthog/track` for direct usage of the `PostHog` client instance (e.g. inside Convex actions) to avoid the extra HTTP hop.

## Browser SDK (minimal usage)

We still load PostHog on the client for features that only exist in-browser (session replay, feature flags, surveys), but it’s deliberately lightweight:

- Initialization happens once in `src/routes/+layout.svelte`, guarded by `browser && PUBLIC_POSTHOG_KEY` and with autocapture/pageview disabled.
- After auth state changes, the layout decodes the Convex JWT via `identityFromToken()` and calls `posthog.identify()` so the browser session links to the same distinct ID the server is using.
- On logout we call `posthog.reset()`.
- If Safari or extensions block the SDK you’ll only see console warnings; the server-captured events still succeed.

If we decide that replay/flags/surveys aren’t needed we can remove the client bootstrap entirely—critical analytics will continue to flow through the server pipeline.

## Auth Flows

- `src/routes/login/+page.svelte` and `src/routes/register/+page.svelte` send a `user_signed_in` / `user_registered` event via the server endpoint after successful `signIn`. We attach the email plus a few context props.
- The layout-level `identify` runs immediately after navigation, ensuring the browser session is tied to the same distinct ID.

## Local Testing Tips

- Run `npm run dev`, sign in or register, and watch the console network tab for requests to `eu.i.posthog.com` (or your custom host). Expect blockers in Safari unless you disable tracking protection.
- Check PostHog’s live events to confirm both the server capture and the client-side `identify` arrived.
- If you don’t want the browser SDK during dev, remove the public key from `.env.local`; server events won’t be sent either, so remember to restore it before testing analytics.

## Future Work

- Consider adding a first-party proxy (custom domain or reverse proxy) so Safari users with tracking prevention enabled still send analytics.
- Expand the server-side capture helper with typed events to avoid magic strings and centralise naming.
- Add automated smoke tests that assert the identify call is issued when auth state changes (e.g. Playwright with network interception).



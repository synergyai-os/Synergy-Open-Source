# Analytics Patterns (PostHog)

> **Server-First Strategy**: Critical events must be captured server-side to bypass browser blockers.

---

## #L10: Server-Side Tracking for Critical Events [🟡 IMPORTANT]

**Symptom**: Sign-in/registration events never reach PostHog  
**Root Cause**: Browser privacy tools block `*.posthog.com` requests  
**Fix**:

```typescript
// ❌ WRONG: Client-side only (blocked by privacy tools)
import posthog from 'posthog-js';
posthog.capture('user_signed_in', { method: 'password' }); // ❌ Blocked

// ✅ CORRECT: Server-side via SvelteKit API route
// src/lib/server/posthog.ts
import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPostHogClient() {
	if (!client) {
		client = new PostHog(PUBLIC_POSTHOG_KEY, { host: PUBLIC_POSTHOG_HOST });
	}
	return client;
}

// src/routes/api/posthog/track/+server.ts
export const POST = async ({ request }) => {
	const { event, distinctId, properties } = await request.json();
	await getPostHogClient().capture({ event, distinctId, properties });
	return json({ ok: true });
};

// src/routes/login/+page.svelte
await trackPosthogEvent({
	event: 'user_signed_in',
	distinctId: email,
	properties: { method: 'password' }
});
```

**Why**: Server-to-server requests bypass browser blockers, guaranteeing delivery.  
**Apply when**: Tracking critical funnel events (auth, payment, onboarding)  
**Related**: #L60 (Event naming)

**Note on Convex**: Cannot use `posthog-node` directly in mutations (see [convex-integration.md#L50](convex-integration.md#L50)). Use SvelteKit API routes instead, or implement HTTP action bridge pattern.

---

## #L60: Event Naming Taxonomy [🟡 IMPORTANT]

**Symptom**: Duplicate/inconsistent event names break funnels  
**Root Cause**: No shared naming convention, manual strings at each callsite  
**Fix**:

```typescript
// ❌ WRONG: Mixed casing, present tense, no enum
posthog.capture('TeamInviteSent', { teamId: team.id });
posthog.capture('team_invite_sent', { team_id: team.id });
posthog.capture('Team Invite Sent', { teamID: team.id });

// ✅ CORRECT: Enum + snake_case + past tense
// src/lib/analytics/events.ts
export enum AnalyticsEventName {
	USER_SIGNED_IN = 'user_signed_in',
	USER_SIGNED_UP = 'user_signed_up',
	TEAM_INVITE_SENT = 'team_invite_sent',
	ORGANIZATION_CREATED = 'organization_created'
}

// Usage
captureAnalyticsEvent(ctx, AnalyticsEventName.TEAM_INVITE_SENT, {
	distinctId,
	groups: { organization: orgId, team: teamId },
	properties: { scope: 'team', team_id: teamId, invite_channel: 'email' }
});
```

**Naming Rules**:

- **Events**: `snake_case` + past tense (e.g., `user_signed_in`, `organization_created`)
- **Properties**: `snake_case` (e.g., `team_id`, `organization_id`, `invite_channel`)
- **Booleans**: Prefix with verb (e.g., `is_active`, `has_subscription`)
- **IDs**: Suffix with `_id` (e.g., `user_id`, `team_id`)

**Why**: Enum prevents typos, consistent casing enables reliable queries, past tense clarifies completion.  
**Apply when**: Adding new analytics events  
**Related**: #L10 (Server-side tracking)

---

## #L110: Group Analytics for Multi-Tenant Data [🟢 REFERENCE]

**Symptom**: Can't filter analytics by organization or team  
**Root Cause**: Missing group properties in capture calls  
**Fix**:

```typescript
// ❌ WRONG: No group context
posthog.capture('feature_used', {
	distinctId: userId,
	properties: { feature_name: 'exports' }
});

// ✅ CORRECT: Include groups for filtering
captureAnalyticsEvent(ctx, AnalyticsEventName.FEATURE_USED, {
	distinctId: userId,
	groups: {
		organization: organizationId, // ✅ Filter by org
		team: teamId // ✅ Filter by team
	},
	properties: {
		feature_name: 'exports',
		organization_id: organizationId, // ✅ Redundant for filtering
		team_id: teamId
	}
});
```

**Why**: Groups enable PostHog org-level and team-level analytics filtering.  
**Apply when**: Multi-tenant apps (organizations, teams, workspaces)  
**Related**: #L60 (Event naming)

---

## #L160: Display Names in PostHog UI, Not Code [🟢 REFERENCE]

**Symptom**: Event names changed in PostHog but code still uses old names  
**Root Cause**: Human-friendly names in code drift from PostHog definitions  
**Fix**:

```typescript
// ❌ WRONG: Human-friendly names in code
export enum AnalyticsEventName {
	USER_SIGNED_IN = 'User Signed In' // ❌ Display name in code
}

// ✅ CORRECT: Machine-friendly names, tweak display in PostHog UI
export enum AnalyticsEventName {
	USER_SIGNED_IN = 'user_signed_in' // ✅ Machine name
}

// In PostHog UI Event Definitions:
// Name: user_signed_in
// Display Name: User Signed In  ← Edit here, not in code
```

**Why**: Display names can evolve without code changes, preventing drift.  
**Apply when**: Defining analytics events  
**Related**: #L60 (Naming taxonomy)

---

**Pattern Count**: 4  
**Last Updated**: 2025-11-07  
**Full Strategy**: `dev-docs/multi-tenancy-analytics.md`

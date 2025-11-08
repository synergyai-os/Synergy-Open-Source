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

Most Axon analytics should flow through the backend. PostHog's own guidance for server libraries (for example their [Node integration](https://github.com/PostHog/posthog/wiki/node-integration)) highlights that calling `client.capture({ distinctId, event, properties })` from a trusted environment guarantees delivery even when browsers block scripts or third-party requests. We follow that pattern for all key product events.

### SvelteKit Implementation (Working)

- `src/lib/server/posthog.ts` lazily creates a singleton `PostHog` client from `posthog-node` using `PUBLIC_POSTHOG_KEY`/`PUBLIC_POSTHOG_HOST`.
- `src/routes/api/posthog/track/+server.ts` exposes `POST /api/posthog/track`. It validates `{ event, distinctId, properties }` and forwards the payload to `client.capture()`.
- When the public key is missing we return `{ skipped: true }` so local development doesn't log errors.
- Auth flows (`login/+page.svelte`, `register/+page.svelte`) call this endpoint after successful sign-in so we never miss `user_signed_in` / `user_registered`, even if the browser SDK is blocked.

### Convex Implementation (Temporarily Disabled)

**Current State**: Server-side analytics in Convex mutations are temporarily disabled due to runtime restrictions.

**The Problem**: 
- `posthog-node` requires Node.js runtime, which in Convex requires the `"use node"` directive
- Files with `"use node"` can **only contain actions**, not mutations or queries
- This is a Convex runtime limitation that cannot be bypassed

**Files Affected**:
- `convex/posthog.ts` – Has `"use node"` directive but is not currently used
- `convex/organizations.ts` – Organization lifecycle events commented out with TODO markers
- `convex/teams.ts` – Team lifecycle events commented out with TODO markers
- `convex/tags.ts` – Tag assignment events commented out with TODO markers

**Temporary Solution**: All analytics calls in mutations are commented out with `// TODO: Re-enable server-side analytics via HTTP action bridge`

**Future Solution**: Implement HTTP action bridge pattern where:
1. Mutations call a Convex action (with `"use node"`) via `ctx.runAction()`
2. The action uses `posthog-node` to send analytics to PostHog
3. This adds latency but respects Convex runtime restrictions

**Alternative**: Use the `/api/posthog/track` SvelteKit endpoint from Convex actions (HTTP call), though this adds an extra network hop.

> **Note**: For critical multi-tenancy analytics (organization/team events), we'll need to implement one of the solutions above before shipping multi-tenant features.

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

## Naming Conventions (Events & Properties)

We treat analytics names as immutable contracts. Consistent naming prevents duplicate metrics, keeps dashboards readable, and makes ad-hoc HogQL queries painless.

### Event Names

- **Format**: lowercase `snake_case`, composed as `noun_pasttenseverb`. Example: `organization_created`, `team_invite_accepted`.
- **Perspective**: past tense highlights that the milestone already happened; we only emit events after the action completes.
- **Scoping prefixes**: prepend the owning domain when ambiguous (`organization_switched`, `team_tag_assigned`).
- **No spaces or special characters**: stick to `[a-z0-9_]`. Reserved PostHog events keep their `$` prefix (e.g. `$pageview`).
- **Display names**: if we want UI-friendly casing, edit the event definition inside PostHog to “Organization Created”. The raw key in code always stays `snake_case`.
- **Single source**: declare all event keys in `src/lib/analytics/events.ts` (enum); never hardcode strings in callsites.

### Event Properties

- **Format**: lowercase `snake_case`, describing the attribute (`organization_id`, `team_name`, `tag_hierarchy_depth`).
- **Booleans**: prefix with `is_` or `has_` (
  `is_default_team`, `has_pending_invites`).
- **Timestamps / dates**: suffix with `_timestamp` (ISO-8601 string) or `_date` (YYYY-MM-DD) for clarity.
- **Reuse shared keys**: if multiple events send the same dimension, reuse the same property name (`link_url`, `invite_channel`) to keep analysis consistent.
- **Sensitive data**: never encode user PII in event names. Put it in properties only when necessary and vetted.

### User & Group Properties

- Follow the same `snake_case` rules (`plan_tier`, `organization_size_bucket`).
- Trait-style booleans still use `is_` / `has_` prefixes.
- Store identifiers under `*_id` to align with event property naming (`active_team_id`).

### Operational Checklist

- Capture helpers validate event/property names against the enum before sending.
- New events require a short entry in this doc plus dashboard updates or alerts that depend on them.
- Quarterly taxonomy review: clean unused events, confirm naming consistency, and align display names in PostHog.

## AARRR Pirate Metrics (Business Validation)

The AARRR framework (Acquisition, Activation, Retention, Referral, Revenue) provides a structured approach to track the user journey and validate product-market fit. All AARRR events should be defined in `src/lib/analytics/events.ts` and tracked via the server-side endpoint for reliability.

### Acquisition Events
**Goal**: Understand how users discover the product

- `user_registered` - New user signup completed
  - Properties: `source` (direct/referral/social), `referrer`, `utm_campaign`, `signup_method` (email/google/github)
- `landing_page_viewed` - User visits marketing site
  - Properties: `page` (home/features/pricing), `utm_params`, `referrer`
- `referral_link_clicked` - Referral source tracking
  - Properties: `referrer_id`, `campaign`

**Key Metrics**: Total signups, signups per channel, conversion rate (visitor → signup)

### Activation Events
**Goal**: Measure first valuable experience (time to "aha moment")

- `user_onboarded` - Completed onboarding flow
  - Properties: `time_to_activate_minutes`, `onboarding_version`, `skipped_steps`
- `first_note_created` - First valuable action (notes)
  - Properties: `content_length_chars`, `has_tags`, `created_via` (quick_create/inbox)
- `first_flashcard_created` - First valuable action (flashcards)
  - Properties: `source_type` (note/highlight), `ai_generated`
- `readwise_synced` - Integration activated
  - Properties: `highlights_count`, `sync_duration_seconds`

**Key Metrics**: Activation rate (% completing activation), time to first value

**Activation Definition**: User completes at least one of:
1. Creates first note
2. Creates first flashcard
3. Syncs Readwise highlights

### Retention Events
**Goal**: Track repeat usage and engagement over time

- `session_started` - User logs in and starts session
  - Properties: `session_length_minutes`, `previous_session_days_ago`, `session_number`
- `inbox_viewed` - Core feature usage
  - Properties: `items_count`, `unprocessed_count`, `view_duration_seconds`
- `flashcard_studied` - Core feature usage (study mode)
  - Properties: `cards_studied`, `session_duration_minutes`, `algorithm` (fsrs/anki2)
- `note_edited` - Content engagement
  - Properties: `edit_duration_seconds`, `words_added`, `is_existing_note`
- `weekly_active` - User active at least once this week
  - Properties: `sessions_this_week`, `features_used` (array)

**Key Metrics**: DAU, WAU, MAU, DAU/MAU ratio, Day 1/7/30 retention, churn rate

**Target**: DAU/MAU > 0.4 (indicates daily habit)

### Referral Events
**Goal**: Measure viral growth and word-of-mouth

- `invite_sent` - User invites someone
  - Properties: `method` (email/link/team_invite), `invitee_email`, `custom_message`
- `invite_accepted` - Referred user joins
  - Properties: `referrer_id`, `invite_method`, `time_to_accept_days`
- `user_referred` - Attribution tracking
  - Properties: `referee_id`, `referral_source`, `cohort`
- `share_action` - User shares content externally
  - Properties: `content_type` (note/blog), `platform` (twitter/linkedin)

**Key Metrics**: Referrals per user, viral coefficient (k-factor), invite acceptance rate

**Target**: 1+ referral per power user by Month 3

### Revenue Events
**Goal**: Track monetization and financial sustainability

- `subscription_started` - New paying customer
  - Properties: `plan` (managed_hosting/enterprise), `price_monthly`, `billing_cycle`, `trial_days`
- `payment_successful` - Revenue received
  - Properties: `amount`, `currency`, `plan`, `billing_period`, `is_first_payment`
- `subscription_cancelled` - Churn tracking
  - Properties: `reason`, `tenure_days`, `final_plan`, `churn_feedback`
- `plan_upgraded` - Expansion revenue
  - Properties: `from_plan`, `to_plan`, `mrr_change`, `upgrade_reason`
- `marketplace_purchase` - Builder app revenue
  - Properties: `app_id`, `price`, `builder_id`, `builder_revenue` (80%), `platform_revenue` (20%)

**Key Metrics**: MRR, ARPU, churn rate, LTV, expansion revenue

**Revenue Streams**:
1. Managed Hosting: $X/org/month
2. Enterprise Support: Custom
3. Marketplace: 20% of builder revenue
4. Consulting: Hourly/project

**Targets**:
- Month 1: First paying customer
- Month 3: $60 MRR (break-even)
- Year 1: $1,000 MRR (sustainable)

---

### AARRR Implementation Checklist

**Phase 1: Foundation (Now)**
- [ ] Add all AARRR events to `src/lib/analytics/events.ts` enum
- [ ] Update server endpoint `/api/posthog/track` to validate AARRR events
- [ ] Instrument registration and onboarding flows
- [ ] Add session tracking to layout

**Phase 2: Activation & Retention (Month 1)**
- [ ] Track first valuable actions (note/flashcard creation)
- [ ] Track core feature usage (inbox, study, notes)
- [ ] Set up PostHog retention analysis dashboards
- [ ] Define activation criteria and measure rate

**Phase 3: Referral & Revenue (Month 2-3)**
- [ ] Build invite/referral system with tracking
- [ ] Implement subscription and payment tracking
- [ ] Add marketplace revenue tracking
- [ ] Create AARRR funnel dashboard in PostHog

**Phase 4: Optimization (Ongoing)**
- [ ] Set up automated alerts for metric drops
- [ ] Weekly AARRR review (identify bottlenecks)
- [ ] A/B test improvements at each stage
- [ ] Cohort analysis for retention improvements

---

### PostHog Dashboards

**Recommended Dashboards**:
1. **AARRR Funnel** - Full pirate metrics overview
2. **Acquisition** - Signups by channel, conversion rates
3. **Activation** - Time to first value, activation rate
4. **Retention** - DAU/WAU/MAU, cohort retention
5. **Revenue** - MRR, ARPU, churn, expansion

**See**: [Metrics Dashboard](./metrics.md) for current targets and real numbers

---

## Multi-Tenant Lifecycle Analytics

> **📖 For detailed guidance**, see **[Multi-Tenancy Analytics Guide](./multi-tenancy-analytics.md)**
> 
> This section provides a quick reference. The full guide covers:
> - Data ownership models (user/org/team)
> - Tag-level vs content-level sharing
> - Event patterns and privacy rules
> - Analytics views and dashboards
> - Testing scenarios and validation

The workspace success criteria introduce organization and team lifecycles that must be captured consistently. All lifecycle events should originate from trusted environments (Convex mutations/actions or authenticated Svelte server loaders) and use PostHog [group analytics](https://posthog.com/docs/product-analytics/libraries/js#group-analytics) to guarantee org/team scoping.

### Success Criteria Coverage

- **Create / join organization (including second org)** → emit `organization_created` or `organization_joined` from Convex mutations handling creation/acceptance. Include `groups: { organization: organizationId }` and increment counters (`totalOrganizationsOwned`, `totalOrganizationsJoined`) so dashboards can segment first vs. subsequent orgs.
- **Create / join team (org-scoped)** → Convex team mutations send `team_created` or `team_joined` with `groups: { organization: organizationId, team: teamId }`. Enforce that the active organization matches the team’s parent prior to capture.
- **Receive and accept team invite** → invitation issuance triggers `team_invite_sent`; acceptance triggers `team_invite_accepted` with inviter metadata and invite delivery channel.
- **Assign tags to organization / team** → Tag-management mutations emit `organization_tag_assigned` or `team_tag_assigned`, scoped to the correct group. Include tag hierarchy (parentId) to power roll-up reporting.
- **Study a tag that belongs to a team** → Study session start mutation emits `tag_study_started` with `groups: { organization: orgId, team: teamId }`, the `tagId`, and study mode (`spaced_repetition`, `quick_review`, etc.).
- **Switch active organization** → Client-side account switcher mutation/action emits `organization_switched`, recording `fromOrganizationId`, `toOrganizationId`, and available team counts. This ensures views only show teams for the active organization.

### Typed Event Schema

Create a shared analytics helper (e.g. `src/lib/analytics/events.ts`) that defines the allowed event names, payloads, and ownership scope. All capture calls (browser or server) must route through this helper to maintain parity with `groups` metadata.

```typescript
// src/lib/analytics/events.ts
export const enum AnalyticsEventName {
  ORGANIZATION_CREATED = 'organization_created',
  ORGANIZATION_JOINED = 'organization_joined',
  ORGANIZATION_SWITCHED = 'organization_switched',
  TEAM_CREATED = 'team_created',
  TEAM_JOINED = 'team_joined',
  TEAM_INVITE_SENT = 'team_invite_sent',
  TEAM_INVITE_ACCEPTED = 'team_invite_accepted',
  ORGANIZATION_TAG_ASSIGNED = 'organization_tag_assigned',
  TEAM_TAG_ASSIGNED = 'team_tag_assigned',
  TAG_STUDY_STARTED = 'tag_study_started'
}

type OwnershipScope = 'user' | 'organization' | 'team';

type BaseEvent = {
  distinctId: string;
  groups?: {
    organization?: string;
    team?: string;
  };
  properties: {
    scope: OwnershipScope;
    organizationId?: string;
    organizationName?: string;
    teamId?: string;
    teamName?: string;
    tagId?: string;
    tagName?: string;
    tagsAssignedCount?: number;
    inviterId?: string;
    inviteChannel?: 'email' | 'link' | 'manual';
    createdVia?: 'dashboard' | 'api' | 'import';
    studyMode?: 'spaced_repetition' | 'quick_review';
    totalOrganizationsOwned?: number;
    totalOrganizationsJoined?: number;
    totalTeamsJoined?: number;
    fromOrganizationId?: string;
    toOrganizationId?: string;
  } & Record<string, unknown>;
};

export type AnalyticsEventPayloads = {
  [AnalyticsEventName.ORGANIZATION_CREATED]: BaseEvent;
  [AnalyticsEventName.ORGANIZATION_JOINED]: BaseEvent;
  [AnalyticsEventName.ORGANIZATION_SWITCHED]: BaseEvent;
  [AnalyticsEventName.TEAM_CREATED]: BaseEvent;
  [AnalyticsEventName.TEAM_JOINED]: BaseEvent;
  [AnalyticsEventName.TEAM_INVITE_SENT]: BaseEvent;
  [AnalyticsEventName.TEAM_INVITE_ACCEPTED]: BaseEvent;
  [AnalyticsEventName.ORGANIZATION_TAG_ASSIGNED]: BaseEvent;
  [AnalyticsEventName.TEAM_TAG_ASSIGNED]: BaseEvent;
  [AnalyticsEventName.TAG_STUDY_STARTED]: BaseEvent;
};

export type AnalyticsEventNameKey = keyof AnalyticsEventPayloads;
```

Add narrow helper functions (e.g. `captureOrganizationCreated(ctx, params)`) that:

1. Validate org/team access by calling `canAccessContent()` and verifying parent organization relationships.
2. Construct the correct `groups` object.
3. Forward the payload to `/api/posthog/track` (SvelteKit) or `getPostHogClient().capture()` (Convex).

### Group Metadata & Views

- **Active organization enforcement**: Store `activeOrganizationId` and `activeTeamId` in the session/server auth context. Inject them into each analytics call to avoid leaking cross-org data. Deny capture if the requested team does not belong to the active organization.
- **PostHog views**: Create dashboards that filter by `organization` group for organization health, `team` group for team adoption, and tag usage views that segment by `properties.scope`. Saved insight examples:
  - Organization Funnel: `organization_created` → `organization_joined` → `team_created` → `tag_study_started`.
  - Team Growth: cumulative line chart of `team_joined` grouped by organization.
  - Tag Engagement: table of `tag_study_started` segmented by `tagName`, filtered to `properties.scope = 'team'`.

### Instrumentation Notes

- **Convex mutations/actions**: Update organization/team CRUD mutations to call the typed helper. Ensure `getUserOrganizationIds` / `getUserTeamIds` are resolved so we can set `totalOrganizationsJoined` and enforce visibility.
- **Svelte routes**: When a user switches organizations, the client should call a mutation that updates the active organization, then emit `organization_switched` through the helper with both old and new org IDs.
- **Tag assignment**: Centralize tag ownership changes (likely Convex mutation) and capture analytics there. Include the list size (`tagsAssignedCount`) to measure tagging adoption.
- **Study sessions**: The study start mutation/action already knows the flashcards and associated tags; extend it to resolve tag ownership, populate team/org groups, and emit `tag_study_started` only when the tag is team-owned.
- **Access control**: Never emit events unless `canAccessContent()` confirms that the user is allowed to see the referenced organization/team/tag. This guarantees "User can only see teams of that organisation" extends to analytics visibility.

### Implementation Checklist

- `src/lib/analytics/events.ts` (new): implement the typed event definitions and shared capture helper wrapping `/api/posthog/track` and Convex server usage.
- `src/lib/server/posthog.ts`: expose a `captureAnalyticsEvent()` utility that validates payloads against `AnalyticsEventPayloads` before invoking the PostHog client.
- `convex/organizations.ts` (new): create mutations for organization create/join/switch flows, enforce permission helpers, and emit organization lifecycle events.
- `convex/teams.ts` (new): handle team creation, membership, and invitations; ensure team ↔ organization validation before capturing team events.
- `convex/tags.ts`: extend tag mutations to include organization/team ownership metadata and emit the new tag assignment events.
- `convex/studySessions.ts` (new or existing study entry point): emit `tag_study_started` when the selected tag belongs to the active team, attaching group metadata and study mode.
- `src/routes/(app)/organizations/*` (future UI): call the typed capture helper after optimistic UI updates so browser-only behaviour remains synchronised with server captures.
- `src/routes/+layout.svelte`: persist active organization/team state (e.g. via load function or store) and emit `organization_switched` after the server confirms the change.

## Local Testing Tips

- Run `npm run dev`, sign in or register, and watch the console network tab for requests to `eu.i.posthog.com` (or your custom host). Expect blockers in Safari unless you disable tracking protection.
- Check PostHog’s live events to confirm both the server capture and the client-side `identify` arrived.
- If you don’t want the browser SDK during dev, remove the public key from `.env.local`; server events won’t be sent either, so remember to restore it before testing analytics.

## Future Work

- Consider adding a first-party proxy (custom domain or reverse proxy) so Safari users with tracking prevention enabled still send analytics.
- Expand the server-side capture helper with typed events to avoid magic strings and centralise naming.
- Add automated smoke tests that assert the identify call is issued when auth state changes (e.g. Playwright with network interception).

## Organization & Team Analytics

- Multi-tenancy groundwork in `dev-docs/multi-tenancy-migration.md` adds `organizationId`, `teamId`, and ownership fields to all content. Once the permission helpers (`getUserOrganizationIds`, `getUserTeamIds`, `canAccessContent`) are implemented, every Convex query/mutation can derive the correct org/team context for the current PostHog `distinct_id`.
- PostHog group analytics should mirror that context: call `posthog.group("organization", orgId, properties)` / `posthog.group("team", teamId, properties)` client-side after auth, or include `groups: { organization: orgId, team: teamId }` when capturing from the server helper. Keep the authoritative properties (plan tier, seats, active features) in Convex and sync changes to PostHog so dashboards stay accurate.
- Feature flags that target orgs or teams must use PostHog group feature flags. Declare flag names in a single enum/const (per workspace rules) and gate UI or Convex actions only after confirming `posthog.isFeatureEnabled(flag, distinctId, { groups })`. Avoid scattering the same flag string across files.
- Organization/team events must still pass authorization: reuse `canAccessContent` (or equivalent ownership checks) before emitting any analytics tied to shared content. This keeps captured data consistent with the access model described in `dev-docs/product-vision-and-plan.md`.

## Private & Server-Only Events

- User-private events should omit the `groups` object and can be captured either via the browser SDK (if enabled) or through `/api/posthog/track` with only the `distinctId`. For sensitive events (billing, AI token consumption, admin-only actions), prefer server-side capture so payloads never leave trusted infrastructure.
- When emitting server-only events from Convex functions, import the shared `posthog` client and include the same `distinctId`/group metadata schema to keep identity aligned across channels.
- Document which events are user-only vs. shared to prevent accidental data leaks. Consider a typed event layer (see TODOs) with categories like `"user" | "team" | "organization" | "internal"` so reviewers can spot mistakes quickly.

## Data Governance & Reporting

- Align event naming with the CODE workflow in `dev-docs/product-vision-and-plan.md` (collect, organise, distill, express). For example, `inbox_item_processed` can include optional `organization`/`team` group context when the item is shared, while personal inbox items stay user-scoped.
- Build dashboards that slice metrics by org/team using PostHog’s group analytics (funnels, retention, breakdowns). Verify that group properties are populated before shipping multi-tenant features—missing properties will lead to fragmented data.
- For compliance/privacy, decide which events (if any) should be sent to a separate PostHog project or redacted. Private events can be stored under a different API key while still using the same authentication flow.

## Quick Create Feature - Tracking Plan

### Overview

The Quick Create feature allows users to rapidly create new content items (Notes, Flashcards, Highlights) with minimal friction. The long-term vision includes auto-detecting content type and tags to reduce time-to-input from multiple steps to a single action.

**Success Metrics**:
- Adoption rate: % of users who use Quick Create vs traditional flows
- Speed improvement: Time from start to completion
- Completion rate: % of started creations that complete
- Auto-detection accuracy (future): % of auto-detected types/tags that users accept without editing

### Event Taxonomy

#### Core Creation Events

**`quick_create_opened`** - User initiates Quick Create flow
```typescript
{
  distinctId: string;
  properties: {
    trigger_method: 'keyboard_n' | 'header_button' | 'footer_button';
    has_active_item: boolean; // Was another item selected?
    current_view: 'inbox' | 'flashcards' | 'tags' | 'my_mind' | 'study';
    items_in_view: number; // Context for when user creates
  }
}
```

**`quick_create_type_selected`** - User selects content type
```typescript
{
  distinctId: string;
  properties: {
    content_type: 'note' | 'flashcard' | 'highlight';
    selection_method: 'click' | 'keyboard_c' | 'keyboard_nav'; // How they chose
    time_to_select_ms: number; // Time from open to type selection
    was_auto_detected: boolean; // Future: was this pre-selected?
    auto_detection_confidence?: number; // Future: 0-1 confidence score
  }
}
```

**`quick_create_tags_modified`** - User adds/removes tags during creation
```typescript
{
  distinctId: string;
  properties: {
    content_type: 'note' | 'flashcard' | 'highlight';
    tags_added_count: number;
    tags_removed_count: number; // Future: when auto-detected tags are removed
    total_tags: number;
    used_tag_search: boolean;
    created_new_tag: boolean;
    tag_assignment_time_ms: number; // Time spent on tags
  }
}
```

**`quick_create_completed`** - Creation successfully saved
```typescript
{
  distinctId: string;
  properties: {
    content_type: 'note' | 'flashcard' | 'highlight';
    trigger_method: 'keyboard_n' | 'header_button' | 'footer_button';
    total_time_ms: number; // Total time from open to save
    type_selection_time_ms: number;
    tag_assignment_time_ms: number;
    content_length_chars: number; // For notes/highlights
    has_tags: boolean;
    tag_count: number;
    // Future auto-detection metrics
    was_type_auto_detected?: boolean;
    type_auto_detect_accepted?: boolean; // Did user keep the suggestion?
    were_tags_auto_detected?: boolean;
    tags_auto_detect_accepted_count?: number;
    tags_auto_detect_rejected_count?: number;
    auto_detection_edit_count?: number; // How many edits after auto-detect?
  }
}
```

**`quick_create_abandoned`** - User closed without saving
```typescript
{
  distinctId: string;
  properties: {
    content_type?: 'note' | 'flashcard' | 'highlight'; // May be undefined if not selected
    abandon_stage: 'type_selection' | 'tag_assignment' | 'content_entry';
    time_to_abandon_ms: number;
    abandon_method: 'escape_key' | 'click_outside' | 'back_button';
    had_content: boolean; // Did they enter any text before abandoning?
    had_tags: boolean;
  }
}
```

#### Auto-Detection Events (Future)

**`quick_create_auto_detection_started`** - Auto-detection triggered
```typescript
{
  distinctId: string;
  properties: {
    detection_trigger: 'paste' | 'typing' | 'context_switch';
    content_preview_length: number; // First 50 chars for pattern analysis
    has_context: boolean; // Was there a selected item providing context?
    context_type?: string; // Type of selected item if any
  }
}
```

**`quick_create_auto_detection_result`** - Auto-detection completed
```typescript
{
  distinctId: string;
  properties: {
    detected_type: 'note' | 'flashcard' | 'highlight';
    type_confidence: number; // 0-1
    detected_tags: string[]; // Tag IDs or names
    tag_confidences: number[]; // Parallel array of confidences
    detection_time_ms: number; // AI processing time
    detection_method: 'pattern_match' | 'ai_classification' | 'context_inference';
  }
}
```

**`quick_create_auto_detection_accepted`** - User kept auto-detected values
```typescript
{
  distinctId: string;
  properties: {
    accepted_type: boolean;
    accepted_tags_count: number;
    rejected_tags_count: number;
    type_confidence: number;
    avg_tag_confidence: number;
    time_to_accept_ms: number; // How quickly they accepted
  }
}
```

**`quick_create_auto_detection_corrected`** - User edited auto-detected values
```typescript
{
  distinctId: string;
  properties: {
    changed_type: boolean;
    original_type?: string;
    final_type: string;
    added_tags_count: number;
    removed_tags_count: number;
    correction_time_ms: number;
    correction_reason?: 'wrong_type' | 'wrong_tags' | 'incomplete_tags';
  }
}
```

### Key Metrics & Dashboards

#### 1. Adoption Funnel
```
quick_create_opened 
  → quick_create_type_selected 
  → quick_create_tags_modified (optional)
  → quick_create_completed
```

**Metrics**:
- Conversion rate at each stage
- Drop-off points (where users abandon)
- Time spent at each stage
- Trigger method preference (keyboard vs buttons)

#### 2. Speed Efficiency Dashboard

**Current State Metrics**:
- Average `total_time_ms` by content type
- Median `type_selection_time_ms`
- Median `tag_assignment_time_ms`
- 90th percentile completion time (identify slow workflows)

**Target KPIs** (Future with Auto-Detection):
- Reduce total creation time by 70% (from ~30s to ~10s)
- 80% of users accept auto-detected type without editing
- 60% of users accept at least 2 auto-detected tags
- Auto-detection accuracy: 85%+ (user accepts without changes)

#### 3. Auto-Detection Performance (Future)

**Accuracy Metrics**:
- Type detection accuracy: `accepted_type / total_detections`
- Tag detection precision: `accepted_tags / suggested_tags`
- Tag detection recall: `accepted_tags / final_tags_count`
- Edit rate: `auto_detection_corrected / (accepted + corrected)`

**Confidence Correlation**:
- Plot confidence scores vs actual acceptance rates
- Identify confidence threshold for auto-commit (no user confirmation needed)
- A/B test: Show suggestions above confidence X, auto-apply above Y

#### 4. User Behavior Insights

**Segmentation**:
- Power users: High Quick Create usage, fast completion times
- Tag enthusiasts: High tag count, uses tag search frequently
- Minimalists: Few/no tags, fast type selection
- Explorers: Frequently abandons, tries different types

**Cohort Analysis**:
- Week 1 Quick Create users: Do they stick with it?
- Traditional flow converts: When do they discover Quick Create?
- Feature discovery: How long until first `keyboard_n` usage?

### Implementation Checklist

#### Phase 1: Core Tracking (Now)
- [ ] Add events to `src/lib/analytics/events.ts` enum
- [ ] Create tracking helper: `trackQuickCreateEvent()`
- [ ] Instrument "New Item" menu open (header + footer buttons)
- [ ] Track keyboard shortcut usage (N key, C key)
- [ ] Track type selection in modal
- [ ] Track tag assignment in creation flow
- [ ] Track completion with timing metrics
- [ ] Track abandonment with stage tracking

#### Phase 2: Auto-Detection Tracking (Future)
- [ ] Track auto-detection trigger conditions
- [ ] Capture AI inference results (type + tags)
- [ ] Track user acceptance/rejection of suggestions
- [ ] Measure correction behavior (what users change)
- [ ] A/B test confidence thresholds

#### Phase 3: Optimization (Future)
- [ ] Set up automated alerts for drop in completion rate
- [ ] Create weekly report: Quick Create adoption & speed
- [ ] Build ML training set: Accepted detections → improve model
- [ ] Implement progressive auto-commit based on confidence

### Privacy & Compliance

**Content Redaction**:
- Never log actual note/flashcard content text
- Use `content_length_chars` for size analysis only
- Tag names can be logged (user-created metadata)

**Sensitive Events**:
- Quick Create is user-scoped by default
- Add `groups: { organization, team }` when creating org/team content
- Respect workspace privacy: Don't log org-specific patterns

### Testing Scenarios

**Manual Testing**:
1. Open Quick Create via 'N' key → Verify `quick_create_opened` with `trigger_method: 'keyboard_n'`
2. Click header button → Verify different `trigger_method`
3. Select Note type → Verify `quick_create_type_selected` with timing
4. Add 3 tags → Verify `quick_create_tags_modified` with correct count
5. Complete creation → Verify `quick_create_completed` with all timing metrics
6. Press ESC mid-flow → Verify `quick_create_abandoned` with stage

**Automated Tests** (Future):
```typescript
// Playwright test
test('Quick Create tracks full funnel', async ({ page }) => {
  await page.goto('/inbox');
  await page.keyboard.press('n'); // Trigger 'N' key
  
  // Assert event sent: quick_create_opened
  expect(await getLastPostHogEvent()).toMatchObject({
    event: 'quick_create_opened',
    properties: { trigger_method: 'keyboard_n' }
  });
  
  await page.keyboard.press('c'); // Type selection
  // Assert: quick_create_type_selected
  
  // ... complete flow assertions
});
```

### Success Criteria

**Launch Metrics** (First 30 Days):
- ✅ 25% of active users try Quick Create
- ✅ 60% completion rate (opened → completed)
- ✅ Average creation time < 20 seconds
- ✅ 70% of Quick Creates use keyboard shortcuts

**Auto-Detection Goals** (3 Months Post-Launch):
- ✅ Type detection accuracy > 85%
- ✅ Tag suggestion acceptance > 60%
- ✅ Time-to-create reduced by 70% vs current flow
- ✅ 90% of power users rely on auto-detection

### Related Documentation

- Event naming conventions: See "Naming Conventions" section above
- Multi-tenancy analytics: `dev-docs/multi-tenancy-analytics.md`
- Feature flag strategy: Consider `quick_create_auto_detection` flag for gradual rollout

---

## TODO

- [x] Implement typed analytics helpers covering event names, ownership level (user/team/org/internal), and shared property schemas. (`src/lib/analytics/events.ts` - created)
- [x] Extend Convex permission helpers to expose organization/team metadata needed for analytics payloads. (`convex/organizations.ts`, `convex/teams.ts` - implemented but analytics calls disabled)
- [ ] **Re-enable Convex analytics**: Implement HTTP action bridge pattern to allow mutations to emit analytics without violating Node.js runtime restrictions
- [ ] Add automated tests ensuring group metadata (org/team IDs) is present when shared content events are emitted.
- [ ] Create PostHog dashboards or notebooks that slice key CODE workflow events by organization/team once multi-tenancy ships.
- [ ] **Quick Create tracking**: Implement Phase 1 tracking (core events) in `src/lib/analytics/events.ts`
- [ ] **Quick Create tracking**: Create PostHog dashboard for adoption funnel and speed metrics



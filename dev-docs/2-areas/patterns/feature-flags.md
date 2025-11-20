# Feature Flags Pattern

**Philosophy**: Ship code to production constantly, control feature exposure with flags, roll out progressively.

---

## Why Feature Flags?

### Problems They Solve

- **Long-lived feature branches** - Code sits unmerged for weeks, accumulates conflicts
- **Big bang releases** - Deploy everything at once, high risk
- **Cannot test in production** - No way to test with real data before 100% rollout
- **Rollback requires redeployment** - Minutes to rollback instead of seconds

### Benefits

- **Continuous Deployment** - Merge to main daily, deploy constantly
- **Progressive Rollout** - Start at 1%, expand to 100% gradually
- **Instant Rollback** - Toggle flag off, no redeploy needed
- **Test in Production** - Use real data with zero user impact
- **A/B Testing Ready** - Infrastructure supports experimentation

---

## Feature Flag System

### Architecture

**Frontend** (`src/lib/infrastructure/feature-flags/constants.ts`):

- TypeScript constants for all flags
- Helper functions for percentage rollout
- Svelte composable for reactive flag checks (`src/lib/infrastructure/feature-flags/composables/useFeatureFlag.svelte.ts`)

**Backend** (`convex/featureFlags.ts`):

- Server-side flag evaluation
- Queries for checking flags
- Mutations for managing flags (admin)

**Database** (`convex/schema.ts`):

- `featureFlags` table
- Indexed by flag name for fast lookups

---

## Naming Convention

**Format**: `<area>_<feature>_<status>`

**Components**:

- **Area**: Product area (notes, inbox, sync, auth, etc.)
- **Feature**: What it does (editor, batch_actions, v2, etc.)
- **Status**: Rollout phase (beta, dev, rollout)

**Examples**:

```typescript
export const FeatureFlags = {
	// New notes editor in beta testing
	NOTES_PROSEMIRROR_BETA: 'notes_prosemirror_beta',

	// Batch actions - developer only
	INBOX_BATCH_ACTIONS_DEV: 'inbox_batch_actions_dev',

	// Readwise sync v2 - progressive rollout
	SYNC_READWISE_V2_ROLLOUT: 'sync_readwise_v2_rollout',

	// New auth flow - A/B testing
	AUTH_PASSWORDLESS_TEST: 'auth_passwordless_test'
} as const;
```

**Rules**:

- Use `SCREAMING_SNAKE_CASE` for TypeScript const
- Use `snake_case` for database flag value
- Prefix clearly identifies product area
- Suffix indicates rollout status

---

## Usage Patterns

### Pattern 1: Simple Boolean Flag

**Use when**: On/off toggle, no gradual rollout needed

```svelte
<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { FeatureFlags } from '$lib/featureFlags';

	const user = useCurrentUser();

	const showNewEditor = useQuery(api.featureFlags.checkFlag, () =>
		user._id
			? {
					flag: FeatureFlags.NOTES_PROSEMIRROR_BETA,
					userId: user._id
				}
			: 'skip'
	);
</script>

{#if $showNewEditor}
	<NewNotesEditor />
{:else}
	<OldNotesEditor />
{/if}
```

### Pattern 2: Percentage-Based Rollout

**Use when**: Gradual rollout to reduce risk

**Server-side**:

```typescript
// In convex/featureFlags.ts
// Set rolloutPercentage: 10 for 10% of users
await upsertFlag({
	flag: 'sync_readwise_v2_rollout',
	enabled: true,
	rolloutPercentage: 10 // Start at 10%
});
```

**Client-side**:

```svelte
<script lang="ts">
	// Same as Pattern 1 - server handles percentage logic
	const useNewSync = useQuery(api.featureFlags.checkFlag, () => ({
		flag: FeatureFlags.SYNC_READWISE_V2_ROLLOUT,
		userId: $user._id
	}));
</script>

{#if $useNewSync}
	<NewSyncFlow />
{:else}
	<OldSyncFlow />
{/if}
```

**Key**: Same user always gets same result (consistent hashing)

### Pattern 3: User-Specific Access

**Use when**: Testing with specific users or team members only

```typescript
// Enable for specific user IDs
await upsertFlag({
	flag: 'notes_prosemirror_beta',
	enabled: true,
	allowedUserIds: [userId1, userId2] // Only these users
});

// Enable for team members
await upsertFlag({
	flag: 'inbox_batch_actions_dev',
	enabled: true,
	allowedDomains: ['@yourcompany.com'] // Anyone with this email domain
});

// Enable for specific organizations (multi-tenancy)
await upsertFlag({
	flag: 'meetings-module',
	enabled: true,
	allowedOrganizationIds: ['org-id-1', 'org-id-2'] // All members of these orgs
});
```

### Pattern 4: Organization-Based Access (Multi-Tenancy)

**Use when**: Enabling features for specific organizations/tenants

**Backend**:

```typescript
// Enable for specific organizations
await upsertFlag({
	flag: 'meetings-module',
	enabled: true,
	allowedOrganizationIds: [
		'mx7ecpdw61qbsfj3488xaxtd7x7veq2w' as Id<'organizations'>
	]
});
```

**Frontend** (automatic):

```svelte
<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';

	// Flag automatically checks user's organization membership
	const canAccessMeetings = useQuery(api.featureFlags.checkFlag, () => ({
		flag: 'meetings-module',
		sessionId: getSessionId()
	}));
</script>

{#if $canAccessMeetings}
	<MeetingsModule />
{:else}
	<ComingSoonMessage />
{/if}
```

**Script Example**:

```bash
# Create script to enable flag
npx tsx scripts/enable-meetings-module-flag.ts

# Verify flag configuration
npx convex run featureFlags:getFlag '{"flag":"meetings-module"}'
```

**Key Benefits**:
- ✅ Automatic organization membership check
- ✅ No need to manually add user IDs as org grows
- ✅ Perfect for multi-tenant B2B SaaS
- ✅ Clean separation of tenants

### Pattern 5: Backend Feature Gating

**Use when**: Feature needs server-side gating

```typescript
// In convex mutation/action
export const processInboxItem = mutation({
	args: { itemId: v.id('inboxItems') },
	handler: async (ctx, { itemId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// Check feature flag
		const useNewProcessor = await checkFlagInternal(
			ctx,
			'inbox_new_processor_rollout',
			identity.subject as Id<'users'>
		);

		if (useNewProcessor) {
			return await newProcessingLogic(ctx, itemId);
		} else {
			return await oldProcessingLogic(ctx, itemId);
		}
	}
});
```

### Pattern 5: Feature with Error Boundary

**Use when**: New feature might be unstable

```svelte
<script lang="ts">
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { FeatureFlags } from '$lib/featureFlags';

	const showNewFeature = useQuery(api.featureFlags.checkFlag, () => ({
		flag: FeatureFlags.NEW_FEATURE_BETA,
		userId: $user._id
	}));
</script>

{#if $showNewFeature}
	<ErrorBoundary fallback={OldFeatureFallback}>
		<NewFeatureComponent />
	</ErrorBoundary>
{:else}
	<OldFeatureComponent />
{/if}
```

---

## Progressive Rollout Workflow

### Phase 0: Development

**Timeline**: During development
**Flag State**: Doesn't exist yet

```bash
# Work on feature branch
git checkout -b feature/SYN-123-new-editor

# Implement feature with flag check (defaults to false)
# Merge to main - feature is hidden
```

### Phase 1: Developer Only

**Timeline**: Day 1 after merge
**Exposure**: You only
**Goal**: Test in production with real data

```typescript
// In Convex dashboard or admin panel
await upsertFlag({
	flag: 'notes_prosemirror_beta',
	enabled: true,
	allowedUserIds: ['your-user-id'] // Only you
});
```

**Checklist**:

- [ ] Test all user flows
- [ ] Check browser console for errors
- [ ] Verify PostHog events firing
- [ ] Monitor error rate (should be 0)
- [ ] Use for 1 hour minimum

### Phase 2: Team Testing

**Timeline**: Day 2-3
**Exposure**: Team members
**Goal**: Get feedback, find edge cases

```typescript
await upsertFlag({
	flag: 'notes_prosemirror_beta',
	enabled: true,
	allowedDomains: ['@yourcompany.com'] // All team members
});
```

**Checklist**:

- [ ] Team has tested for 1+ day
- [ ] No critical bugs reported
- [ ] Performance is acceptable
- [ ] Error rate < 0.1%

### Phase 3: Beta Users

**Timeline**: Week 1
**Exposure**: 5-10% or opt-in users
**Goal**: Real user feedback

**Option A: Percentage Rollout**

```typescript
await upsertFlag({
	flag: 'notes_prosemirror_beta',
	enabled: true,
	rolloutPercentage: 5 // 5% of all users
});
```

**Option B: Opt-in Users**

```typescript
// Add "beta program" flag to user settings
// Check both flags: beta_program && feature_flag
```

**Checklist**:

- [ ] Monitor error rate daily
- [ ] Review session replays in PostHog
- [ ] Gather user feedback
- [ ] Performance metrics stable

### Phase 4: Gradual Rollout

**Timeline**: Week 2
**Exposure**: 10% → 25% → 50% → 100%
**Goal**: Safe production rollout

**Schedule**:

```
Day 1: 10%  → Monitor for 24h
Day 2: 25%  → Monitor for 24h
Day 3: 50%  → Monitor for 24h
Day 4: 100% → Monitor for 48h
```

**Implementation**:

```typescript
// Day 1
await updateRollout({ flag: 'notes_prosemirror_beta', percentage: 10 });

// Day 2 (if no issues)
await updateRollout({ flag: 'notes_prosemirror_beta', percentage: 25 });

// Continue...
```

**Emergency Rollback**:

```typescript
// If issues detected, instant rollback
await toggleFlag({ flag: 'notes_prosemirror_beta', enabled: false });
```

### Phase 5: Cleanup

**Timeline**: Week 3-4 after 100%
**Goal**: Remove flag code, make feature default

```bash
# Create cleanup PR
git checkout -b chore/SYN-124-remove-editor-flag

# Remove flag checks
# Make new feature the default code path
# Delete old code

# Merge and monitor
```

---

## Flag Management

### Creating a Flag

**1. Add to constants**:

```typescript
// src/lib/infrastructure/feature-flags/constants.ts
export const FeatureFlags = {
	NEW_FEATURE_BETA: 'new_feature_beta'
} as const;
```

**2. Wrap feature in check**:

```svelte
<script>
	const enabled = useQuery(api.featureFlags.checkFlag, () => ({
		flag: FeatureFlags.NEW_FEATURE_BETA,
		userId: $user._id
	}));
</script>

{#if $enabled}
	<NewFeature />
{/if}
```

**3. Create flag in database**:

```typescript
// Via Convex dashboard function runner
await upsertFlag({
	flag: 'new_feature_beta',
	enabled: false // Start disabled
});
```

### Updating a Flag

**Via Admin Panel** (future):

- Toggle on/off
- Adjust percentage
- Add/remove users
- Set allowed domains

**Via Convex Function Runner** (now):

```typescript
// Enable flag
await toggleFlag({ flag: 'new_feature_beta', enabled: true });

// Update rollout percentage
await updateRollout({ flag: 'new_feature_beta', percentage: 25 });

// Add specific users
await upsertFlag({
	flag: 'new_feature_beta',
	enabled: true,
	allowedUserIds: [userId1, userId2]
});
```

### Monitoring Flags

**PostHog Integration**:

```typescript
// Track flag checks
posthog.capture('feature_flag_checked', {
	flag: 'notes_prosemirror_beta',
	enabled: true,
	userId: user._id,
	rolloutPercentage: 10
});

// Track feature usage
posthog.capture('feature_used', {
	feature: 'new_notes_editor',
	flag: 'notes_prosemirror_beta'
});
```

**Query in PostHog**:

- Error rate by feature flag
- Feature usage by flag status
- Conversion rate: flagged vs non-flagged users

---

## Best Practices

### ✅ DO

**Always Use Flags for New Features**:

```svelte
<!-- Good: Feature behind flag -->
{#if $showNewFeature}
	<NewFeature />
{:else}
	<OldFeature />
{/if}
```

**Default to Disabled**:

```typescript
// Good: Flag starts as false
await upsertFlag({
	flag: 'new_feature',
	enabled: false // Explicit false
});
```

**Remove Flags After Rollout**:

```typescript
// After 2 weeks at 100%, remove flag
// Make new code the default, delete old code
```

**Use Consistent Hashing**:

```typescript
// User sees same experience every time
// Built into checkFlag() function
```

**Monitor Everything**:

```typescript
// Track flag evaluations
posthog.capture('feature_flag_checked', { flag, enabled });

// Track feature usage
posthog.capture('feature_used', { feature, flag });
```

### ❌ DON'T

**Don't Skip Flags for "Small" Changes**:

```svelte
<!-- Bad: No flag, goes to 100% immediately -->
<NewFeatureWithoutFlag />
```

**Don't Leave Flags Forever**:

```typescript
// Bad: Flag from 6 months ago still in code
// Clean up after 100% rollout is stable
```

**Don't Nest Flags Deeply**:

```svelte
<!-- Bad: Too many nested flags -->
{#if $flag1}
	{#if $flag2}
		{#if $flag3}
			<Feature />
		{/if}
	{/if}
{/if}

<!-- Good: Single flag per feature -->
{#if $newFeatureEnabled}
	<Feature />
{/if}
```

**Don't Use Flags for Config**:

```typescript
// Bad: Using flags for configuration
const apiUrl = $flags.apiUrl;

// Good: Use environment variables
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Troubleshooting

### Flag Not Updating

**Problem**: Changed flag in database, but users still see old behavior

**Solution**: Flags are cached briefly. Wait 30-60 seconds or force refresh.

### User Seeing Inconsistent Experience

**Problem**: User sometimes sees new feature, sometimes old

**Possible Causes**:

1. **Percentage rollout** - User is on the boundary
   - Solution: Use allowedUserIds for testing
2. **Multiple user IDs** - User has multiple accounts
   - Solution: Check which userId is being passed
3. **Flag evaluation error** - Server returning false on error
   - Solution: Check Convex logs for errors

### Feature Not Showing for Anyone

**Problem**: Flag is enabled but nobody sees feature

**Debug**:

```typescript
// 1. Check flag exists
await getFlag({ flag: 'your_flag_name' });

// 2. Check flag is enabled
// Should return: { enabled: true, ... }

// 3. Check user ID is being passed
console.log('Checking flag for user:', userId);

// 4. Check flag evaluation
const result = await checkFlag({ flag: 'your_flag', userId });
console.log('Flag result:', result);
```

---

## Quick Reference

### Adding a New Flag

```bash
# 1. Add to constants
# src/lib/infrastructure/feature-flags/constants.ts
export const FeatureFlags = {
  MY_FEATURE: 'my_feature',
};

# 2. Wrap feature
# YourComponent.svelte
{#if $flagEnabled}
  <NewFeature />
{/if}

# 3. Create in database
# Convex function runner
await upsertFlag({
  flag: 'my_feature',
  enabled: false
});
```

### Progressive Rollout

```typescript
// Day 0: You only
allowedUserIds: ['your-id']

// Day 2: Team
allowedDomains: ['@yourcompany.com']

// Week 1: Start rollout
rolloutPercentage: 10

// Week 2: Increase gradually
rolloutPercentage: 25 → 50 → 100
```

### Emergency Rollback

```typescript
// Instant disable
await toggleFlag({
	flag: 'problematic_feature',
	enabled: false
});
```

### Performance: Batch Queries

When checking multiple flags, use `checkFlags` batch query instead of multiple `checkFlag` calls:

```typescript
// ✅ CORRECT: Batch query (fast - < 1 second)
const flagsQuery = useQuery(api.featureFlags.checkFlags, () => ({
	sessionId,
	flags: [FeatureFlags.FLAG1, FeatureFlags.FLAG2, FeatureFlags.FLAG3]
}));
const flag1 = $derived(flagsQuery?.data?.[FeatureFlags.FLAG1] ?? false);

// ❌ WRONG: Multiple queries (slow - 3-5 seconds)
const flag1Query = useQuery(api.featureFlags.checkFlag, () => ({ flag: FeatureFlags.FLAG1, sessionId }));
const flag2Query = useQuery(api.featureFlags.checkFlag, () => ({ flag: FeatureFlags.FLAG2, sessionId }));
```

**Performance**: 3-5x faster (1 network call vs 3, 1x session validation vs 3x)  
**See**: [convex-integration.md#L1360](../patterns/convex-integration.md#L1360) for complete pattern

---

## #L750: Sidebar Navigation with Feature Flags [🟢 REFERENCE]

**Symptom**: New feature pages exist but not discoverable - users can't navigate to them  
**Root Cause**: Sidebar navigation not updated to include feature-flagged routes  
**Fix**: Pass feature flag state to Sidebar component, conditionally render navigation links

**Apply when**: Adding new feature routes that should appear in sidebar navigation when enabled

### Pattern

**1. Load feature flag in layout** (server-side for instant rendering):

```typescript
// src/routes/(authenticated)/+layout.svelte
const meetingsEnabled = $derived(data.meetingsEnabled ?? false);
const dashboardEnabled = $derived(data.meetingsEnabled ?? false); // Reuse same flag
```

**2. Pass to Sidebar component**:

```svelte
<Sidebar
	{circlesEnabled}
	{meetingsEnabled}
	{dashboardEnabled}
/>
```

**3. Add prop to Sidebar**:

```typescript
// src/lib/components/Sidebar.svelte
type Props = {
	// ... other props
	dashboardEnabled?: boolean;
};

let { dashboardEnabled = false }: Props = $props();
```

**4. Conditional navigation link**:

```svelte
<!-- Dashboard (Beta - Feature Flag) -->
{#if dashboardEnabled}
	<a
		href={resolveRoute('/dashboard')}
		class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
		title="Dashboard"
	>
		<svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
		</svg>
		<span class="font-normal">Dashboard</span>
	</a>
{/if}
```

### Benefits

- **Progressive Disclosure**: Users only see features they have access to
- **Instant Rendering**: Server-side flag loading = no UI flicker
- **Clean UX**: Navigation appears/disappears based on access
- **Consistent Pattern**: Same approach for all feature-flagged routes

### Common Mistakes

❌ **Loading flag client-side** → UI flicker on page load  
✅ Load in layout.server.ts, pass as prop

❌ **Separate flag per nav item** → Flag sprawl  
✅ Reuse module-level flags (e.g., `meetings-module` for Dashboard + Meetings)

❌ **Forgetting to update sidebar** → Features exist but hidden  
✅ Add navigation when creating feature routes

### Related

- **#L180**: Organization-based feature flags (multi-tenancy)
- **[ui-patterns.md#L1870](ui-patterns.md#L1870)**: resolveRoute() for navigation
- **Pattern 4**: Organization-based access (allowedOrganizationIds)

---

## Further Reading

- [Git Workflow Guide](../../3-resources/git-workflow.md)
- [Error Boundaries Pattern](./svelte-reactivity.md#error-boundaries)
- [PostHog Integration](./analytics.md)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)

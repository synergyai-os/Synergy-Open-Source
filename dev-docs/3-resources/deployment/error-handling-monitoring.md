# Error Handling & Monitoring

**Philosophy**: Catch errors before users report them. Monitor everything. Roll back instantly.

---

## Error Boundaries

### What They Are

Error boundaries catch JavaScript errors in child components, preventing full app crashes. They provide:

- Graceful degradation (show fallback UI)
- Error reporting to PostHog
- User recovery options (retry, reload)
- Feature flag association (for instant rollback)

### Basic Usage

```svelte
<script>
	import ErrorBoundary from '$lib/components/ui/ErrorBoundary.svelte';
	import RiskyNewFeature from './RiskyNewFeature.svelte';
</script>

<ErrorBoundary componentName="RiskyNewFeature" featureFlag="new_feature_beta">
	<RiskyNewFeature />
</ErrorBoundary>
```

### With Custom Fallback

```svelte
<ErrorBoundary componentName="NotesEditor">
	<NotesEditor />

	{#snippet fallback(error)}
		<div class="custom-error">
			<h2>Editor Failed to Load</h2>
			<p>Your notes are safe. Try refreshing the page.</p>
			<button onclick={() => window.location.reload()}> Refresh </button>
		</div>
	{/snippet}
</ErrorBoundary>
```

### With Error Callback

```svelte
<script>
	import { toast } from '$lib/components/Toast.svelte';

	function handleError(error: Error) {
		toast.error('Feature failed to load');
		// Maybe disable feature flag automatically
	}
</script>

<ErrorBoundary componentName="SyncButton" featureFlag="sync_v2_rollout" onError={handleError}>
	<SyncButton />
</ErrorBoundary>
```

---

## Error Reporting

### Manual Error Reporting

```typescript
import { reportError } from '$lib/utils/errorReporting';

try {
	await riskyOperation();
} catch (error) {
	reportError({
		error: error as Error,
		componentName: 'SyncFlow',
		featureFlag: 'sync_v2_rollout',
		userAction: 'clicked_sync_button',
		severity: 'high',
		context: {
			itemCount: items.length,
			lastSyncAt: user.lastSyncAt
		}
	});

	// Show user-friendly error
	toast.error('Sync failed. Please try again.');
}
```

### With Error Boundary Function

```typescript
import { withErrorBoundary } from '$lib/utils/errorReporting';

// Automatically catches and reports errors
const result = await withErrorBoundary(
	async () => {
		return await syncReadwise();
	},
	{
		componentName: 'SyncButton',
		featureFlag: 'sync_v2_rollout',
		userAction: 'manual_sync',
		severity: 'medium'
	}
);

if (!result) {
	toast.error('Sync failed');
}
```

---

## Feature Flag Tracking

### Track Flag Evaluations

```typescript
import { reportFeatureFlagCheck } from '$lib/utils/errorReporting';

const showNewEditor = await checkFlag('notes_editor_beta', userId);

reportFeatureFlagCheck('notes_editor_beta', showNewEditor, userId, {
	rolloutPercentage: 10,
	source: 'NotesPage'
});
```

### Track Feature Usage

```typescript
import { reportFeatureUsed } from '$lib/utils/errorReporting';

// User actually uses the flagged feature
function handleCreateNote() {
	reportFeatureUsed('new_notes_editor', 'notes_editor_beta', {
		noteType: 'markdown',
		hasAttachments: false
	});

	createNote();
}
```

---

## Performance Monitoring

### Track Slow Operations

```typescript
import { reportPerformance } from '$lib/utils/errorReporting';

const start = performance.now();
await syncReadwise();
const duration = performance.now() - start;

reportPerformance('sync_readwise', duration, {
	itemCount: items.length,
	hasErrors: false
});
```

### With Timing Helper

```typescript
import { withTiming } from '$lib/utils/errorReporting';

// Automatically tracks and reports timing
const result = await withTiming(
	'sync_readwise',
	async () => {
		return await syncReadwise();
	},
	{
		itemCount: items.length,
		userId: user._id
	}
);
```

---

## User Flow Tracking

### Track Multi-Step Processes

```typescript
import { reportFlowCompletion } from '$lib/utils/errorReporting';

// Step 1: Started
reportFlowCompletion('onboarding', 'started', true);

// Step 2: API key entered
reportFlowCompletion('onboarding', 'api_key_entered', true, {
	provider: 'readwise'
});

// Step 3: First sync
reportFlowCompletion('onboarding', 'first_sync', true, {
	itemsImported: 150
});

// Step 4: Completed
reportFlowCompletion('onboarding', 'completed', true);
```

### Identifying Drop-offs

In PostHog, filter by:

- Flow: "onboarding"
- Step: "api_key_entered"
- Completed: false

Shows where users abandon the flow.

---

## PostHog Integration

### What Gets Tracked

**Automatic** (via error boundary):

- `error_occurred` - Any error caught
- `error_boundary_caught` - Errors caught by boundary
- Component name
- Feature flag
- Error stack trace
- User context

**Manual** (via reporting functions):

- `feature_flag_checked` - Flag evaluation
- `feature_used` - Feature actually used
- `performance_metric` - Slow operations
- `flow_step` - User flow progress

### Querying in PostHog

**Error Rate by Feature Flag**:

```
Events: error_occurred
Filter: feature_flag = "notes_editor_beta"
Group by: day
```

**Feature Usage After Flag Check**:

```
Funnel:
1. feature_flag_checked (flag = "notes_editor_beta", enabled = true)
2. feature_used (feature = "new_notes_editor")
```

**Performance Over Time**:

```
Events: performance_metric
Filter: operation = "sync_readwise"
Formula: average(duration_ms)
Group by: day
```

---

## Monitoring Dashboards

### Real-time Error Dashboard

**Create in PostHog**:

1. **Error Rate** - Count of `error_occurred` events (last hour)
2. **Errors by Component** - Group by `component_name`
3. **Errors by Feature Flag** - Group by `feature_flag`
4. **Error Severity Distribution** - Group by `severity`

**Alert Conditions**:

- Error rate > 10 per minute → Slack alert
- High severity error → Immediate notification
- Feature flag error rate > 1% → Consider rollback

### Feature Flag Dashboard

**Track per Flag**:

1. **Evaluation Count** - How many times checked
2. **Enabled Rate** - % of checks that returned true
3. **Feature Usage Rate** - % of enabled users who actually use it
4. **Error Rate** - Errors associated with this flag
5. **Performance Impact** - Avg duration of operations

### Rollout Monitoring

**When rolling out new feature**:

1. **Baseline Error Rate** (before rollout)
2. **Current Error Rate** (with flag at X%)
3. **Difference** - Should be < 0.1% increase
4. **Session Replay** - Watch users interacting with feature
5. **User Feedback** - Qualitative data

---

## Emergency Procedures

### High Error Rate Detected

**1. Check PostHog Dashboard**:

- Which component?
- Which feature flag?
- Error message pattern?

**2. Disable Feature Flag** (if flagged):

```typescript
// In Convex function runner or admin panel
await toggleFlag({
	flag: 'problematic_feature',
	enabled: false
});
```

**3. Monitor Error Rate Drop**:

- Should drop immediately (within 1 minute)
- Users get old (working) version

**4. Investigate**:

- Check session replays
- Review error stacks
- Identify root cause

**5. Fix and Re-enable**:

- Fix the bug
- Deploy fix
- Re-enable flag (start at 5%)
- Monitor closely

### Gradual Performance Degradation

**Symptoms**:

- Increasing `duration_ms` in performance metrics
- Users reporting slowness

**Investigation**:

1. **Check PostHog**:
   - Which operations are slow?
   - Pattern over time?
2. **Check Recent Deployments**:
   - Did a recent feature cause this?
   - Check feature flag timeline

3. **Profile in Browser**:
   - Use Chrome DevTools Performance tab
   - Identify bottleneck

4. **Rollback if Necessary**:
   - Disable feature flag
   - Or rollback deployment

---

## Best Practices

### ✅ DO

**Wrap Risky Components**:

```svelte
<!-- Any new feature should be wrapped -->
<ErrorBoundary componentName="NewFeature" featureFlag="new_feature_beta">
	<NewFeature />
</ErrorBoundary>
```

**Report with Context**:

```typescript
reportError({
	error,
	componentName: 'SyncButton',
	featureFlag: 'sync_v2_rollout',
	context: {
		itemCount: 150,
		lastSyncAt: Date.now(),
		userTier: 'pro'
	}
});
```

**Track Feature Usage**:

```typescript
// Not just flag checks, but actual usage
reportFeatureUsed('new_editor', 'notes_editor_beta');
```

**Monitor Progressive Rollouts**:

```typescript
// At 10%
await updateRollout({ flag: 'feature', percentage: 10 });
// Wait 24h, check error rate
// If stable, increase to 25%
```

### ❌ DON'T

**Don't Swallow Errors**:

```typescript
// Bad: Silent failure
try {
  await operation();
} catch (e) {
  // Nothing - error lost forever
}

// Good: Report and handle
try {
  await operation();
} catch (e) {
  reportError({ error: e, ... });
  toast.error('Operation failed');
}
```

**Don't Skip Error Boundaries**:

```svelte
<!-- Bad: No error boundary -->
<NewFeature />

<!-- Good: Always wrap new features -->
<ErrorBoundary componentName="NewFeature">
	<NewFeature />
</ErrorBoundary>
```

**Don't Ignore Performance**:

```typescript
// Bad: No performance tracking
await slowOperation();

// Good: Track it
await withTiming('slow_operation', async () => {
	return await slowOperation();
});
```

---

## Quick Reference

### Wrap Component

```svelte
<ErrorBoundary componentName="X" featureFlag="x_beta">
	<Component />
</ErrorBoundary>
```

### Report Error

```typescript
reportError({ error, componentName, featureFlag, severity });
```

### Track Performance

```typescript
await withTiming('operation_name', async () => operation());
```

### Track Feature Usage

```typescript
reportFeatureUsed('feature_name', 'feature_flag');
```

### Emergency Rollback

```typescript
await toggleFlag({ flag: 'problematic_feature', enabled: false });
```

---

## Further Reading

- [Feature Flags Pattern](../2-areas/patterns/feature-flags.md)
- [PostHog Integration](../2-areas/patterns/analytics.md)
- [Deployment Rollback](./git-workflow.md#emergency-procedures)

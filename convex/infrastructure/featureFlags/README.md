# Feature Flags

**Location:** `convex/infrastructure/featureFlags/`

**Purpose:** Enable trunk-based development — all code ships to production, features are controlled via flags.

---

## Why Feature Flags?

SynergyOS ships directly to production on a single branch. Feature flags let us:

- **Ship incomplete features** — Code is deployed but not visible to users
- **Gradual rollout** — Enable for 10% → 50% → 100% of users
- **Kill switch** — Disable broken features instantly without deployment
- **A/B testing** — Compare feature variants

---

## Architecture

### Tables

| Table                  | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `featureFlags`         | Flag definitions (name, description, default state) |
| `featureFlagTargeting` | Targeting rules (user, workspace, percentage)       |
| `featureFlagOverrides` | Per-user or per-workspace overrides                 |

### Files

| File            | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `tables.ts`     | Table definitions                               |
| `types.ts`      | TypeScript types                                |
| `queries.ts`    | Read operations (check if flag enabled)         |
| `mutations.ts`  | Write operations (create, update, toggle flags) |
| `access.ts`     | Permission checks for flag management           |
| `store.ts`      | Flag state management                           |
| `targeting.ts`  | Targeting rule evaluation                       |
| `lifecycle.ts`  | Flag lifecycle (create → rollout → cleanup)     |
| `validation.ts` | Input validation                                |

---

## How to Check a Flag

### In Convex (Backend)

```typescript
import { isFeatureEnabled } from '../infrastructure/featureFlags/queries';

export const myMutation = mutation({
  args: { sessionId: v.string(), ... },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

    // Check if feature is enabled for this user
    if (await isFeatureEnabled(ctx, 'new-dashboard', { userId })) {
      // New behavior
    } else {
      // Old behavior
    }
  }
});
```

### In Svelte (Frontend)

```svelte
<script lang="ts">
	import { useFeatureFlag } from '$lib/composables/featureFlags.svelte';

	const showNewDashboard = useFeatureFlag('new-dashboard');
</script>

{#if showNewDashboard}
	<NewDashboard />
{:else}
	<OldDashboard />
{/if}
```

---

## Flag Lifecycle

### 1. Create Flag (Disabled)

```typescript
// In admin or via API
await createFeatureFlag(ctx, {
	name: 'new-dashboard',
	description: 'Redesigned dashboard with new metrics',
	defaultEnabled: false
});
```

### 2. Enable for Developers

```typescript
await addFlagTargeting(ctx, {
	flagName: 'new-dashboard',
	targetType: 'role',
	targetValue: 'developer', // systemRole
	enabled: true
});
```

### 3. Percentage Rollout

```typescript
await addFlagTargeting(ctx, {
	flagName: 'new-dashboard',
	targetType: 'percentage',
	targetValue: '25', // 25% of users
	enabled: true
});
```

### 4. Full Rollout

```typescript
await updateFeatureFlag(ctx, {
	name: 'new-dashboard',
	defaultEnabled: true // Now on for everyone
});

// Clean up targeting rules
await removeFlagTargeting(ctx, { flagName: 'new-dashboard' });
```

### 5. Remove Flag (After Stable)

Once the feature is stable and the old code path is removed:

```typescript
await archiveFeatureFlag(ctx, { name: 'new-dashboard' });
```

**Important:** Remove the flag check from code before archiving. Dead flag checks are tech debt.

---

## Targeting Options

| Target Type  | Description                                  | Example                  |
| ------------ | -------------------------------------------- | ------------------------ |
| `user`       | Specific userId                              | Enable for QA tester     |
| `workspace`  | Specific workspaceId                         | Enable for beta customer |
| `role`       | systemRole (platform_admin, developer, etc.) | Enable for internal team |
| `percentage` | Random percentage of users                   | Gradual rollout          |
| `default`    | Everyone (when defaultEnabled=true)          | Full rollout             |

### Evaluation Order

1. User-specific override → highest priority
2. Workspace-specific targeting
3. Role-based targeting
4. Percentage-based targeting
5. Default value → lowest priority

---

## Naming Conventions

| Pattern           | Example                    | Use For           |
| ----------------- | -------------------------- | ----------------- |
| `feature-name`    | `new-dashboard`            | New features      |
| `experiment-name` | `experiment-checkout-flow` | A/B tests         |
| `release-name`    | `release-v2-api`           | Major releases    |
| `kill-name`       | `kill-legacy-export`       | Deprecation flags |

**Rules:**

- Use kebab-case
- Be descriptive (not `flag1`)
- Include context (not just `dashboard`)

---

## Best Practices

### DO

- ✅ Create flag before writing feature code
- ✅ Use flags for anything user-facing
- ✅ Remove flag checks after full rollout
- ✅ Document what the flag controls
- ✅ Set up monitoring before percentage rollout

### DON'T

- ❌ Leave flag checks in code after removing flag
- ❌ Use flags for A/B tests without measurement plan
- ❌ Create flags for internal/backend-only changes
- ❌ Nest flag checks (if flag1 && flag2 && flag3)
- ❌ Use flags as permanent configuration

---

## Admin Access

Feature flag management requires `systemRole`:

| Role             | Can Do                         |
| ---------------- | ------------------------------ |
| `platform_admin` | Create, update, delete flags   |
| `developer`      | Create, update flags; view all |
| `support`        | View flags only                |

---

## Troubleshooting

### Flag not working?

1. **Check targeting** — Is the user/workspace in a targeted group?
2. **Check evaluation order** — A user override beats percentage
3. **Check cache** — Flags are cached; may take a few seconds to propagate
4. **Check flag exists** — Typos in flag names fail silently (return default)

### Need to emergency disable?

```typescript
// Instant kill switch
await updateFeatureFlag(ctx, {
	name: 'broken-feature',
	defaultEnabled: false
});
await removeFlagTargeting(ctx, { flagName: 'broken-feature' });
```

---

## Related Documentation

- [Architecture: Feature Flags section](../../../architecture.md#feature-flags)
- [Admin operations](../../admin/README.md)

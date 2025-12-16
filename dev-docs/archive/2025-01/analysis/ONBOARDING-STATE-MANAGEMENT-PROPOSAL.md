# Onboarding State Management Proposal

## Current State Analysis

### Existing Infrastructure
- ✅ `onboardingProgress` table exists with `currentStep` and `completedSteps` fields
- ✅ `updateOnboardingStep` mutation available to track progress
- ✅ `findOnboardingProgress` query to check user's current state
- ✅ Route guards exist but only check completion, not step progression
- ✅ Steps defined: `workspace_created`, `root_circle_created`, `governance_chosen`, etc.

### Current Problems
1. **No step tracking**: Steps are NOT updated when actions complete (e.g., creating circle doesn't mark `root_circle_created`)
2. **No step enforcement**: Users can navigate to any onboarding URL directly
3. **No step validation**: Pages don't check if user should be on that step
4. **No automatic redirects**: Wrong step access doesn't redirect to correct step

### Onboarding Flow
```
/onboarding → Create Workspace
/onboarding/terminology → Customize Terminology  
/onboarding/circle → Create Root Circle
/onboarding/invite → Invite Team (optional)
/onboarding/complete → Complete Setup
```

---

## Option 1: Server-Side Step Guards with Progress Tracking (Recommended)

### Approach
- Add `+page.server.ts` to each onboarding route that checks current step
- Update `onboardingProgress` when each step completes
- Redirect to correct step if user accesses wrong one
- Use `currentStep` field to track where user is

### Implementation

#### 1. Define Step-to-Route Mapping
```typescript
// convex/features/onboarding/rules.ts
export const ONBOARDING_ROUTE_STEPS = {
  'workspace': 'workspace_created',
  'terminology': 'terminology_customized', 
  'circle': 'root_circle_created',
  'invite': 'team_invited',
  'complete': 'setup_completed'
} as const;

export function getRouteForStep(step: string): string | null {
  const entry = Object.entries(ONBOARDING_ROUTE_STEPS).find(([_, s]) => s === step);
  return entry ? `/onboarding/${entry[0]}` : null;
}

export function getStepForRoute(route: string): string | null {
  const routeKey = route.replace('/onboarding/', '') || 'workspace';
  return ONBOARDING_ROUTE_STEPS[routeKey as keyof typeof ONBOARDING_ROUTE_STEPS] || null;
}
```

#### 2. Create Helper Query: `findNextOnboardingStep`
```typescript
// convex/features/onboarding/queries.ts
export const findNextOnboardingStep = query({
  args: {
    sessionId: v.string(),
    workspaceId: v.id('workspaces')
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
    
    const progress = await ctx.db
      .query('onboardingProgress')
      .withIndex('by_person_workspace', (q) =>
        q.eq('personId', person._id).eq('workspaceId', args.workspaceId)
      )
      .first();
    
    if (!progress) {
      return { nextStep: 'workspace_created', nextRoute: '/onboarding' };
    }
    
    // Determine next incomplete step
    const steps = ['workspace_created', 'terminology_customized', 'root_circle_created', 'team_invited'];
    const nextStep = steps.find(step => !progress.completedSteps.includes(step));
    
    if (!nextStep) {
      return { nextStep: null, nextRoute: '/onboarding/complete' };
    }
    
    const nextRoute = getRouteForStep(nextStep);
    return { nextStep, nextRoute: nextRoute || '/onboarding/complete' };
  }
});
```

#### 3. Add Server Load Guards to Each Route
```typescript
// src/routes/(authenticated)/onboarding/circle/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
  if (!locals.auth.sessionId) {
    throw redirect(302, '/login');
  }
  
  const sessionId = locals.auth.sessionId;
  const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
  const parentData = await parent();
  const workspaces = parentData.workspaces as Array<{ workspaceId: string }>;
  
  if (!workspaces || workspaces.length === 0) {
    throw redirect(302, '/onboarding');
  }
  
  const workspaceId = workspaces[0].workspaceId;
  
  // Check if root circle already exists
  const circles = await client.query(api.core.circles.index.list, {
    sessionId,
    workspaceId
  });
  
  const rootCircle = circles.find(c => !c.parentCircleId);
  if (rootCircle) {
    // Already completed - redirect to next step
    throw redirect(302, '/onboarding/invite');
  }
  
  // Check onboarding progress
  const nextStep = await client.query(api.features.onboarding.index.findNextOnboardingStep, {
    sessionId,
    workspaceId
  });
  
  // If user shouldn't be on this step, redirect to correct one
  if (nextStep.nextRoute !== '/onboarding/circle') {
    throw redirect(302, nextStep.nextRoute);
  }
  
  return {};
};
```

#### 4. Update Steps When Actions Complete
```typescript
// src/routes/(authenticated)/onboarding/circle/+page.svelte
async function handleContinue() {
  // ... existing circle creation code ...
  
  try {
    await convexClient.mutation(api.core.circles.index.create, {
      sessionId,
      workspaceId: activeWorkspace.workspaceId,
      name: circleName.trim(),
      circleType: circleType
    });
    
    // Mark steps as completed
    await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
      sessionId,
      workspaceId: activeWorkspace.workspaceId,
      step: 'root_circle_created',
      completed: true
    });
    
    await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
      sessionId,
      workspaceId: activeWorkspace.workspaceId,
      step: 'governance_chosen',
      completed: true
    });
    
    goto(resolveRoute('/onboarding/invite'));
  } catch (error) {
    // ... error handling ...
  }
}
```

### Pros
- ✅ Server-side enforcement (can't bypass)
- ✅ Uses existing infrastructure
- ✅ Clear step progression
- ✅ Works with browser refresh/back button
- ✅ Follows architecture patterns (server load functions)

### Cons
- ⚠️ Requires adding `+page.server.ts` to each route
- ⚠️ Need to update steps in multiple places
- ⚠️ Slightly more complex than client-only

---

## Option 2: Client-Side Step Guard with Shared Composable

### Approach
- Create a shared `useOnboardingProgress` composable
- Check progress on each page mount
- Redirect client-side if wrong step
- Update progress after each action

### Implementation

#### 1. Create Onboarding Composable
```typescript
// src/lib/infrastructure/onboarding/composables/useOnboardingProgress.svelte.ts
import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import { goto } from '$app/navigation';
import { resolveRoute } from '$lib/utils/navigation';

export function useOnboardingProgress(sessionId: string, workspaceId: string) {
  const convexClient = useConvexClient();
  
  const progress = $state<{
    currentStep: string | null;
    completedSteps: string[];
    nextRoute: string | null;
  } | null>(null);
  
  const isLoading = $state(true);
  
  async function loadProgress() {
    try {
      isLoading = true;
      const result = await convexClient.query(
        api.features.onboarding.index.findNextOnboardingStep,
        { sessionId, workspaceId }
      );
      
      progress = {
        currentStep: result.nextStep,
        completedSteps: result.completedSteps || [],
        nextRoute: result.nextRoute
      };
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    } finally {
      isLoading = false;
    }
  }
  
  async function completeStep(step: string) {
    await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
      sessionId,
      workspaceId,
      step,
      completed: true
    });
    await loadProgress();
  }
  
  function ensureOnRoute(expectedRoute: string) {
    if (!progress || !progress.nextRoute) return;
    
    if (progress.nextRoute !== expectedRoute) {
      goto(resolveRoute(progress.nextRoute));
    }
  }
  
  return {
    progress: () => progress,
    isLoading: () => isLoading,
    loadProgress,
    completeStep,
    ensureOnRoute
  };
}
```

#### 2. Use in Each Onboarding Page
```typescript
// src/routes/(authenticated)/onboarding/circle/+page.svelte
<script lang="ts">
  import { useOnboardingProgress } from '$lib/infrastructure/onboarding/composables/useOnboardingProgress.svelte';
  
  let { data } = $props();
  const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
  
  const onboarding = useOnboardingProgress(
    data.sessionId,
    workspaces?.activeWorkspace?.workspaceId
  );
  
  $effect(() => {
    if (workspaces?.activeWorkspace?.workspaceId) {
      onboarding.loadProgress();
    }
  });
  
  $effect(() => {
    if (!onboarding.isLoading() && onboarding.progress()) {
      onboarding.ensureOnRoute('/onboarding/circle');
    }
  });
  
  async function handleContinue() {
    // ... create circle ...
    
    await onboarding.completeStep('root_circle_created');
    await onboarding.completeStep('governance_chosen');
    
    goto(resolveRoute('/onboarding/invite'));
  }
</script>
```

### Pros
- ✅ Simpler implementation (no server files needed)
- ✅ Reactive updates
- ✅ Reusable composable
- ✅ Client-side is faster

### Cons
- ⚠️ Can be bypassed (client-side only)
- ⚠️ Requires JavaScript enabled
- ⚠️ Less secure than server-side
- ⚠️ Flash of wrong content possible

---

## Option 3: Hybrid Approach - Server Guard + Client Updates

### Approach
- Server-side guards for security (Option 1)
- Client-side composable for reactive updates (Option 2)
- Best of both worlds

### Implementation
- Combine Option 1's `+page.server.ts` guards
- Combine Option 2's `useOnboardingProgress` composable
- Server guards redirect on initial load
- Client composable handles real-time updates and navigation

### Pros
- ✅ Server-side security
- ✅ Client-side reactivity
- ✅ Best user experience
- ✅ Can't bypass guards

### Cons
- ⚠️ Most complex implementation
- ⚠️ Requires both server and client code
- ⚠️ More files to maintain

---

## Recommendation: **Option 1 (Server-Side Guards)**

### Why Option 1?
1. **Security**: Server-side enforcement can't be bypassed
2. **Architecture Compliance**: Uses existing patterns (server load functions)
3. **Simplicity**: Single source of truth (server)
4. **Reliability**: Works even if JavaScript fails
5. **SEO/Performance**: Server redirects are faster

### Implementation Steps
1. Add step-to-route mapping in `rules.ts`
2. Create `findNextOnboardingStep` query
3. Add `+page.server.ts` to each onboarding route
4. Update step completion in each page's action handlers
5. Test step progression and redirects

### Migration Path
1. Start with `/onboarding/circle` (most critical)
2. Add guards to other routes incrementally
3. Update step tracking as you go
4. Test each step thoroughly

---

## Additional Considerations

### Step Naming Consistency
Current steps in `rules.ts`:
- `workspace_created`
- `root_circle_created` 
- `governance_chosen`

But routes use different names. Need to align:
- `terminology` → `terminology_customized` (new step)
- `circle` → `root_circle_created` + `governance_chosen`
- `invite` → `team_invited` (optional step)

### Backward Navigation
Should users be able to go back to previous steps?
- **Yes**: Allow "Back" button to previous completed steps
- **No**: Only allow forward progression

Recommendation: **Allow backward navigation** for better UX, but still enforce that they can't skip ahead.

### Edge Cases
1. **Multiple workspaces**: Each workspace has separate onboarding
2. **Browser refresh**: Server guards handle this
3. **Direct URL access**: Server guards redirect
4. **Completed onboarding**: Route guards already handle this


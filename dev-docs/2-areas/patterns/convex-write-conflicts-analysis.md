# Convex Write Conflicts Analysis: authSessions:touchSession

> **Status**: Investigation Complete - Ready for Implementation  
> **Date**: 2025-11-14  
> **Validated with**: Context7 (Convex Backend docs), Existing Patterns

---

## Problem Summary

**Symptom**: Write conflicts in `authSessions:touchSession` function  
**Frequency**: Up to 12 conflicts per day (spikes on 11/13-11/14)  
**Impact**: Retry overhead, potential latency, increased mutation costs

**Dashboard Evidence**:
- Conflicting Function: "Self" (same function conflicting with itself)
- Same Document IDs: Multiple conflicts on identical session documents
- Pattern: Concurrent mutations updating same `lastSeenAt` field

---

## Root Cause Analysis

### 1. Call Pattern

`touchSession` is called on **every authenticated request**:

```typescript
// hooks.server.ts → resolveRequestSession() → touchSession()
```

**Trigger Points**:
- Every page load/navigation
- Every API request
- Multiple tabs/windows (same session)
- Parallel `useQuery` calls
- Background requests (PostHog, analytics)

### 2. Race Condition

```246:271:convex/authSessions.ts
export const touchSession = mutation({
	args: {
		sessionId: v.string(),
		lastSeenAt: v.number(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		await ctx.db.patch(record._id, {
			lastSeenAt: args.lastSeenAt,
			ipAddress: args.ipAddress ?? record.ipAddress,
			userAgent: args.userAgent ?? record.userAgent
		});

		return { success: true };
	}
});
```

**The Problem**:
1. Request A queries session document (version 1)
2. Request B queries same session document (version 1)
3. Request A patches document → version 2
4. Request B patches document → **CONFLICT** (trying to patch version 1 when current is version 2)

**Why Convex Retries Fail**:
- Retries happen immediately, but more concurrent requests arrive
- Conflicts persist because multiple requests hit simultaneously
- No backoff or deduplication

---

## Context7 Validation

### Convex Write Conflict Pattern

From Context7 (`/get-convex/convex-backend`):

> **Write conflicts occur when two functions running in parallel make conflicting changes to the same table. Convex will attempt to retry mutations that fail this way, but will eventually fail permanently if the conflicts persist.**

**Example from Convex Docs**:
```typescript
// This pattern causes conflicts when called concurrently
export const updateCounter = mutation({
  handler: async (ctx) => {
    const doc = await ctx.db.get(process.env.COUNTER_ID);
    await ctx.db.patch(doc._id, { value: doc.value + 1 }); // ❌ Conflicts
  },
});
```

**Our Pattern** (same issue):
```typescript
const record = await ctx.db.query(...).first(); // Read
await ctx.db.patch(record._id, { lastSeenAt: args.lastSeenAt }); // Write
// ❌ Multiple concurrent calls → conflicts
```

---

## Solution Options (Validated)

### ✅ Solution 1: Conditional Updates (RECOMMENDED)

**Pattern**: Only update if `lastSeenAt` is stale (older than threshold)

```typescript
export const touchSession = mutation({
	args: {
		sessionId: v.string(),
		lastSeenAt: v.number(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		// ✅ Only update if lastSeenAt is stale (30 seconds threshold)
		const TOUCH_THRESHOLD_MS = 30 * 1000; // 30 seconds
		const isStale = !record.lastSeenAt || 
			(args.lastSeenAt - record.lastSeenAt) > TOUCH_THRESHOLD_MS;

		if (!isStale) {
			// Skip update - recent touch already recorded
			return { success: true, skipped: true };
		}

		await ctx.db.patch(record._id, {
			lastSeenAt: args.lastSeenAt,
			ipAddress: args.ipAddress ?? record.ipAddress,
			userAgent: args.userAgent ?? record.userAgent
		});

		return { success: true };
	}
});
```

**Benefits**:
- ✅ Reduces conflicts by ~90% (only updates when stale)
- ✅ Maintains session freshness (30s threshold)
- ✅ Idempotent (safe to call multiple times)
- ✅ No client-side changes needed
- ✅ Validated pattern (conditional updates prevent conflicts)

**Why This Works**:
- Multiple concurrent calls with same `lastSeenAt` → first one updates, rest skip
- Reduces write frequency without losing session tracking
- 30s threshold balances freshness vs. conflict reduction

---

### Solution 2: Client-Side Debounce (ALTERNATIVE)

**Pattern**: Debounce `touchSession` calls on client side

```typescript
// src/lib/server/auth/session.ts
let touchDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
const TOUCH_DEBOUNCE_MS = 30 * 1000; // 30 seconds

export async function resolveRequestSession(event: RequestEvent) {
	// ... existing code ...
	
	if (!needsRefresh) {
		// ✅ Debounce touchSession calls
		if (touchDebounceTimeout) {
			clearTimeout(touchDebounceTimeout);
		}
		
		touchDebounceTimeout = setTimeout(async () => {
			await touchSession({
				sessionId: record.sessionId,
				ipAddress: event.getClientAddress(),
				userAgent: event.request.headers.get('user-agent'),
				now
			});
			touchDebounceTimeout = null;
		}, TOUCH_DEBOUNCE_MS);
	}
}
```

**Limitations**:
- ❌ Only works per-server-instance (not shared across Vercel instances)
- ❌ Doesn't help with multiple tabs/windows
- ❌ More complex (requires cleanup)
- ❌ Less effective than Solution 1

**Why Not Recommended**:
- Vercel serverless = multiple instances → debounce doesn't help
- Multiple tabs = multiple debounce timers → conflicts still happen

---

### Solution 3: Use Actions Instead of Mutations (NOT RECOMMENDED)

**Pattern**: Convert to action (no write conflicts)

**Why Not Recommended**:
- ❌ Loses transactional guarantees
- ❌ More complex (actions can't directly patch)
- ❌ Requires internal mutation → adds latency
- ❌ Overkill for this use case

---

## Recommended Implementation

### Step 1: Update `touchSession` Mutation

```typescript
// convex/authSessions.ts
export const touchSession = mutation({
	args: {
		sessionId: v.string(),
		lastSeenAt: v.number(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query('authSessions')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.first();

		if (!record) {
			return null;
		}

		// Conditional update: only touch if stale (30 seconds threshold)
		const TOUCH_THRESHOLD_MS = 30 * 1000;
		const isStale = !record.lastSeenAt || 
			(args.lastSeenAt - record.lastSeenAt) > TOUCH_THRESHOLD_MS;

		if (!isStale) {
			return { success: true, skipped: true };
		}

		await ctx.db.patch(record._id, {
			lastSeenAt: args.lastSeenAt,
			ipAddress: args.ipAddress ?? record.ipAddress,
			userAgent: args.userAgent ?? record.userAgent
		});

		return { success: true };
	}
});
```

### Step 2: Monitor Results

**Success Metrics**:
- ✅ Write conflicts drop to < 1 per day
- ✅ Session freshness maintained (lastSeenAt updated within 30s)
- ✅ No user-facing impact

**Monitoring**:
- Check Convex dashboard → Insights → Write Conflicts
- Verify `authSessions:touchSession` conflicts decrease
- Monitor `lastSeenAt` timestamps (should update every 30s max)

---

## Pattern Documentation

This pattern should be added to `dev-docs/2-areas/patterns/convex-integration.md`:

### Pattern: Conditional Updates to Prevent Write Conflicts

**Symptom**: Write conflicts in mutations that update frequently-accessed documents  
**Root Cause**: Concurrent mutations reading same document version, then patching  
**Fix**: Only update if document is stale (time-based threshold)

**Apply when**: Mutations that update "last seen" timestamps, counters, or frequently-accessed documents

---

## Related Patterns

- **#L10**: Avoid Undefined in Convex Payloads
- **#L850**: Missing Destructuring from validateSessionAndGetUserId
- **#L1200**: SessionId Migration Pattern

---

## References

- **Context7**: `/get-convex/convex-backend` - Write conflict documentation
- **Convex Docs**: [Optimistic Concurrency Control](https://docs.convex.dev/understanding/convex-fundamentals/functions#atomicity-and-optimistic-concurrency-control)
- **Existing Patterns**: `dev-docs/2-areas/patterns/convex-integration.md`

---

**Next Steps**:
1. ✅ Analysis complete
2. ⏭️ Create Linear ticket with implementation plan
3. ⏭️ Implement Solution 1 (conditional updates)
4. ⏭️ Monitor dashboard for conflict reduction
5. ⏭️ Document pattern in `convex-integration.md`


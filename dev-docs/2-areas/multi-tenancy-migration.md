# Multi-Tenancy Migration Guide

This document outlines the architecture for future multi-tenancy support and provides a migration path when organizations and teams are implemented.

## Current State (User-Scoped)

**Status**: All content is user-scoped. Each user only sees and can access their own content.

**Schema**:

- All content tables have `userId` field
- All queries filter by `userId` using indexes like `by_user`
- No organization or team concepts exist in queries

**Access Control**:

- Simple: `userId` match = access granted
- No permission checks needed beyond authentication

## Future State (Multi-Tenant)

**Vision**: Organizations and teams can share content. Users can be part of multiple organizations and teams. Content can be:

- **User-owned**: Personal content (current state)
- **Organization-owned**: Shared across organization
- **Team-owned**: Shared within a team
- **Purchased**: Content bought by user/org/team

**Schema** (Already in place):

- `organizations` table - Organizations
- `teams` table - Teams within organizations
- `organizationMembers` table - Many-to-many: users ↔ organizations
- `teamMembers` table - Many-to-many: users ↔ teams
- Content tables have nullable `organizationId`, `teamId`, `ownershipType` fields
- Indexes exist for `by_organization` and `by_team` (unused for now)

**Access Control** (Stub functions in `convex/permissions.ts`):

- `getUserOrganizationIds()` - Get user's org memberships
- `getUserTeamIds()` - Get user's team memberships
- `canAccessContent()` - Check if user can access specific content
- `getContentAccessFilter()` - Build query filter for accessible content

## Migration Steps

### Step 1: Implement Permission Helpers (2-3 days)

**File**: `convex/permissions.ts`

Update stub functions to query membership tables:

```typescript
export async function getUserOrganizationIds(
	ctx: QueryCtx | MutationCtx,
	userId: string
): Promise<string[]> {
	const memberships = await ctx.db
		.query('organizationMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	return memberships.map((m) => m.organizationId);
}

export async function getUserTeamIds(
	ctx: QueryCtx | MutationCtx,
	userId: string
): Promise<string[]> {
	const memberships = await ctx.db
		.query('teamMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	return memberships.map((m) => m.teamId);
}

export async function canAccessContent(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	content: { userId: string; organizationId?: string; teamId?: string; ownershipType?: string }
): Promise<boolean> {
	// User owns it
	if (content.userId === userId) {
		return true;
	}

	// Check org membership
	if (content.organizationId) {
		const orgIds = await getUserOrganizationIds(ctx, userId);
		if (orgIds.includes(content.organizationId)) {
			return true;
		}
	}

	// Check team membership
	if (content.teamId) {
		const teamIds = await getUserTeamIds(ctx, userId);
		if (teamIds.includes(content.teamId)) {
			return true;
		}
	}

	// Check purchased content (future)
	if (content.ownershipType === 'purchased') {
		// TODO: Check if user has purchased this content
	}

	return false;
}
```

### Step 2: Update Queries (3-5 days)

**Challenge**: Convex queries with indexes don't support `$or` directly. Need to query separately and combine.

**Pattern**: Query user content, org content, and team content separately, then combine and deduplicate.

**Example**: Update `convex/flashcards.ts`

```typescript
// Before (user-scoped only):
export const getUserFlashcards = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcards = await ctx.db
			.query('flashcards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		return flashcards;
	}
});

// After (multi-tenant):
export const getUserFlashcards = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get user's accessible org/team IDs
		const orgIds = await getUserOrganizationIds(ctx, userId);
		const teamIds = await getUserTeamIds(ctx, userId);

		// Query user-owned content
		const userFlashcards = await ctx.db
			.query('flashcards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Query org-owned content
		const orgFlashcards =
			orgIds.length > 0
				? await Promise.all(
						orgIds.map((orgId) =>
							ctx.db
								.query('flashcards')
								.withIndex('by_organization', (q) => q.eq('organizationId', orgId))
								.collect()
						)
					).then((results) => results.flat())
				: [];

		// Query team-owned content
		const teamFlashcards =
			teamIds.length > 0
				? await Promise.all(
						teamIds.map((teamId) =>
							ctx.db
								.query('flashcards')
								.withIndex('by_team', (q) => q.eq('teamId', teamId))
								.collect()
						)
					).then((results) => results.flat())
				: [];

		// Combine and deduplicate
		const allFlashcards = [...userFlashcards, ...orgFlashcards, ...teamFlashcards];
		const uniqueFlashcards = Array.from(
			new Map(allFlashcards.map((card) => [card._id, card])).values()
		);

		return uniqueFlashcards;
	}
});
```

**Files to Update**:

- `convex/inbox.ts` - `listInboxItems`, `getInboxItem`, `getInboxItemWithDetails`
- `convex/flashcards.ts` - `getUserFlashcards`, `getDueFlashcards`, `getFlashcard`
- Any other queries that filter by `userId` only

### Step 3: Update Mutations (2-3 days)

**Pattern**: Use `canAccessContent()` to verify access before allowing mutations.

**Example**: Update `convex/flashcards.ts`

```typescript
// Before:
export const reviewFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards'),
		rating: v.union(v.literal('again'), v.literal('hard'), v.literal('good'), v.literal('easy'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			throw new Error('Flashcard not found');
		}

		if (flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		// ... rest of logic
	}
});

// After:
export const reviewFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards'),
		rating: v.union(v.literal('again'), v.literal('hard'), v.literal('good'), v.literal('easy'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			throw new Error('Flashcard not found');
		}

		// Use permission helper instead of direct userId check
		const hasAccess = await canAccessContent(ctx, userId, flashcard);
		if (!hasAccess) {
			throw new Error('Not authorized');
		}

		// ... rest of logic
	}
});
```

### Step 4: Add Organization/Team UI (1-2 weeks)

**Tasks**:

1. Create organization management UI
   - Create organization
   - Invite members
   - Manage roles (owner, admin, member)
2. Create team management UI
   - Create teams within organizations
   - Add/remove team members
   - Manage team roles

3. Add content ownership UI
   - Set ownership type when creating content
   - Transfer ownership
   - View shared content

4. Add account switcher (if implementing multiple accounts)
   - Dropdown menu to switch between accounts
   - Store active account in localStorage
   - Each account can belong to different organizations

## Permission Helper Usage

### In Queries

Use `getUserOrganizationIds()` and `getUserTeamIds()` to build access filters:

```typescript
const orgIds = await getUserOrganizationIds(ctx, userId);
const teamIds = await getUserTeamIds(ctx, userId);
// Query separately and combine
```

### In Mutations

Use `canAccessContent()` to verify access:

```typescript
const hasAccess = await canAccessContent(ctx, userId, content);
if (!hasAccess) {
	throw new Error('Not authorized');
}
```

### In Actions

Same patterns apply - use permission helpers to check access before operations.

## Query Update Patterns

### Pattern 1: Separate Queries + Combine

**Use when**: Need to query across user/org/team content

```typescript
const userContent = await ctx.db.query("table").withIndex("by_user", ...).collect();
const orgContent = await Promise.all(orgIds.map(id => ...)).then(flat);
const teamContent = await Promise.all(teamIds.map(id => ...)).then(flat);
const allContent = [...userContent, ...orgContent, ...teamContent];
const unique = deduplicate(allContent);
```

### Pattern 2: Single Query with Access Check

**Use when**: Getting single item by ID

```typescript
const item = await ctx.db.get(itemId);
const hasAccess = await canAccessContent(ctx, userId, item);
if (!hasAccess) return null;
```

### Pattern 3: Filter After Query

**Use when**: Small dataset, can filter in memory

```typescript
const allItems = await ctx.db.query('table').collect();
const accessibleItems = await Promise.all(
	allItems.map((item) =>
		canAccessContent(ctx, userId, item).then((hasAccess) => (hasAccess ? item : null))
	)
).then((items) => items.filter(Boolean));
```

**Note**: Pattern 3 is less efficient for large datasets. Prefer Pattern 1.

## Performance Considerations

### Index Usage

- Use `by_organization` index for org-owned content queries
- Use `by_team` index for team-owned content queries
- Keep `by_user` index for user-owned content (most common)

### Query Optimization

- Cache org/team IDs in permission helpers (if called multiple times)
- Consider composite indexes if querying by userId + organizationId frequently
- Batch queries when possible (Promise.all for multiple org/team queries)

### Data Volume

- For large datasets (10,000+ items), prefer separate queries over filtering
- Consider pagination for org/team content queries
- Monitor query performance and optimize indexes as needed

## Testing Strategy

### Unit Tests

Test permission helpers:

- `getUserOrganizationIds()` returns correct org IDs
- `getUserTeamIds()` returns correct team IDs
- `canAccessContent()` correctly grants/denies access based on ownership

### Integration Tests

Test queries:

- User sees their own content
- User sees org content when member
- User sees team content when member
- User doesn't see content from other orgs/teams
- Deduplication works correctly

### E2E Tests

Test UI:

- Organization creation and membership
- Team creation and membership
- Content sharing across org/team
- Access control enforcement

## Rollout Plan

1. **Phase 1**: Implement permission helpers (backend only)
   - Update `convex/permissions.ts`
   - Test with unit tests
   - Deploy (no breaking changes - helpers still return user-scoped)

2. **Phase 2**: Update queries incrementally
   - Start with read-only queries (less risk)
   - Test each query thoroughly
   - Deploy one query at a time

3. **Phase 3**: Update mutations
   - Add access checks to mutations
   - Test mutation access control
   - Deploy incrementally

4. **Phase 4**: Add UI
   - Organization/team management
   - Content ownership UI
   - Account switcher (if needed)

## Multiple Accounts Support

**Status**: Deferred - Easy to add later

**Why Deferred**:

- Current architecture already supports it (each email = separate `userId`)
- No schema changes needed now
- Low migration cost (~1-2 days when needed)

**Future Implementation**:

1. Add `userAccounts` table to link multiple `userId`s to same person (optional)
2. Add account switcher UI component (dropdown menu)
3. Store active account in localStorage
4. Convex Auth handles multiple sessions automatically

**Note**: Multi-tenancy schema already supports this - each account can belong to different organizations, and permission helpers can check org membership per account.

## Related Documentation

- `dev-docs/product-vision-and-plan.md` - Product vision and multi-tenancy goals
- `convex/schema.ts` - Database schema with multi-tenancy fields
- `convex/permissions.ts` - Permission helper functions

# Phase 2: Tag Sharing Test Instructions

## What We're Testing

Validating that:

1. User can share a personal tag with an organization
2. `tag_shared` event is captured with correct properties
3. PostHog receives the event with proper group analytics

## Prerequisites

- [x] `shareTag` mutation created in `convex/tags.ts`
- [x] Temporary client-side capture for testing
- [ ] At least one personal tag exists
- [ ] User is member of "Test Org"

## Test Steps

### 1. Create a Personal Tag (If Needed)

**Via Browser Console:**

```javascript
// Get Convex client from the page
const convexClient = window.__CONVEX_CLIENT__; // or however you access it

// Create a test tag
await convexClient.mutation(api.tags.createTag, {
	displayName: 'JavaScript Concepts',
	color: '#3B82F6',
	ownership: 'user'
});
```

**Or via UI** (if tag creation UI exists):

- Navigate to tags/collections
- Create a new tag named "JavaScript Concepts"
- Ensure it's created in your personal workspace

### 2. Share the Tag with Organization

**Via Browser Console:**

```javascript
// First, get the tag ID
const tags = await convexClient.query(api.tags.listUserTags, {});
console.log('Your tags:', tags);

// Find your test tag
const testTag = tags.find((t) => t.displayName === 'JavaScript Concepts');
console.log('Test tag:', testTag);

// Get your active organization ID
const orgs = await convexClient.query(api.organizations.listOrganizations, {});
console.log('Your orgs:', orgs);
const testOrg = orgs[0]; // Use first org

// Share the tag
const result = await convexClient.mutation(api.tags.shareTag, {
	tagId: testTag._id,
	shareWith: 'organization',
	organizationId: testOrg.organizationId
});

console.log('Share result:', result);
```

### 3. Verify Console Output

You should see:

```
📊 [TAG SHARED] {
  tagId: 'j57xxxxx',
  tagName: 'JavaScript Concepts',
  sharedBy: 'j57xxxxx',
  shareWith: 'organization',
  organizationId: 'j57xxxxx',
  organizationName: 'Test Org',
  teamId: undefined,
  teamName: undefined
}
```

### 4. Add Client-Side Analytics Capture

Once the mutation works, we'll add PostHog capture to test the full flow.

**Expected PostHog Event:**

```typescript
{
  event: 'tag_shared',
  distinctId: 'user_123',
  groups: {
    organization: 'org_456'
  },
  properties: {
    scope: 'organization',
    tag_id: 'tag_001',
    tag_name: 'JavaScript Concepts',
    shared_from: 'user',
    shared_at: 1699123456789,
    organization_id: 'org_456',
    organization_name: 'Test Org'
  }
}
```

## Success Criteria

- ✅ `shareTag` mutation executes without errors
- ✅ Tag `ownershipType` changes from `user` to `organization`
- ✅ Tag `organizationId` is set correctly
- ✅ Console log shows correct tag sharing details
- ✅ PostHog event appears in Live Events (once we add capture)
- ✅ Event has correct `groups.organization` property
- ✅ Properties follow `snake_case` naming

## Next Steps

After validation:

1. Add client-side PostHog capture to mutation
2. Test event appears in PostHog
3. Verify different user can see/use the shared tag
4. Add UI for tag sharing (button/modal)
5. Document pattern in multi-tenancy-analytics.md

## Troubleshooting

**Error: "Tag not found"**

- Verify tag ID is correct
- Check tag exists in database

**Error: "You are not a member of this organization"**

- Verify you've joined "Test Org"
- Check organization membership

**Error: "Tag is already shared"**

- Tag was already shared previously
- Create a new personal tag for testing

**Error: "Tag name already exists in this organization"**

- Another user already has a tag with that name in the org
- Try a different tag name

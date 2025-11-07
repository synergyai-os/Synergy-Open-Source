# PostHog Analytics Test Plan

## Test 1: Organization Switching Event

**Goal**: Validate that `organization_switched` events are captured correctly with proper properties.

### Setup
- ✅ Temporary client-side capture added to `useOrganizations.svelte.ts`
- ✅ Event: `organization_switched`
- ✅ Console logging enabled for debugging

### Test Scenarios

#### Scenario 1: Personal Workspace → Organization
**Steps:**
1. Start in personal workspace (no organization active)
2. Open organization switcher dropdown
3. Click "Test Org" to switch to it
4. Check browser console for: `📊 [TEST] PostHog event captured: organization_switched`
5. Check PostHog Live Events for the event

**Expected Properties:**
```json
{
  "scope": "organization",
  "toOrganizationId": "<test-org-id>",
  "availableTeamCount": 0,
  // fromOrganizationId should NOT be present (switched from personal)
}
```

#### Scenario 2: Organization → Personal Workspace
**Steps:**
1. Start in "Test Org" (organization active)
2. Open organization switcher dropdown
3. Click "Personal workspace"
4. Check browser console for the event
5. Check PostHog Live Events

**Expected Properties:**
```json
{
  "scope": "organization",
  "toOrganizationId": "<test-org-id>",
  "fromOrganizationId": "<test-org-id>",
  "availableTeamCount": 0
}
```

**Note**: When switching TO personal workspace, we currently set `toOrganizationId` to the org ID. This might need adjustment - switching to personal should probably have `toOrganizationId: null` or omit it.

#### Scenario 3: Organization A → Organization B (if you have multiple orgs)
**Steps:**
1. Start in "Test Org"
2. Switch to a different organization
3. Check console and PostHog

**Expected Properties:**
```json
{
  "scope": "organization",
  "fromOrganizationId": "<test-org-id>",
  "toOrganizationId": "<other-org-id>",
  "availableTeamCount": 0
}
```

### Success Criteria
- ✅ Event appears in browser console with correct properties
- ✅ Event appears in PostHog Live Events within 30 seconds
- ✅ Event name is `organization_switched` (snake_case)
- ✅ Properties follow our naming conventions (snake_case)
- ✅ `fromOrganizationId` is only present when switching from an organization
- ✅ `availableTeamCount` matches the number of teams in the target organization

### Where to Check PostHog
1. Go to PostHog dashboard: https://eu.posthog.com (or your custom host)
2. Navigate to: **Activity → Live Events**
3. Filter by event name: `organization_switched`
4. Click on an event to see full properties

### Debugging
- **Console logs**: Look for `📊 [TEST] PostHog event captured:` in browser console
- **Network tab**: Check for requests to PostHog API (`posthog.com` or your host)
- **PostHog delays**: Events may take 10-30 seconds to appear in Live Events
- **Browser blockers**: If using Safari or ad blockers, events might be blocked (this is why we need server-side!)

### Issues to Note
1. **Personal workspace handling**: When switching TO personal workspace, should `toOrganizationId` be `null`? Currently it's set to the previous org ID.
2. **Browser blockers**: This client-side test validates the pattern, but in production we'll need the server-side bridge.

### Next Steps After Success
Once this test passes:
1. Validate the event structure matches our schema
2. Test with Safari/ad blockers to confirm blocking (expected to fail)
3. Implement HTTP action bridge for server-side capture
4. Re-test with server-side implementation
5. Remove temporary client-side capture
6. Move to next event type (organization creation, team switching, etc.)


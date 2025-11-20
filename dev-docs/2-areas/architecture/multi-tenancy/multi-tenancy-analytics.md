# Multi-Tenancy Analytics Guide

> **Status**: Living document - hypotheses will be validated through testing
>
> **Last Updated**: 2025-11-07
>
> **Purpose**: Define how SynergyOS captures and analyzes user activity across organizations and teams using PostHog group analytics. Personal content is tracked with `scope: 'user'` within organization context.

---

## Table of Contents

1. [Overview](#overview)
2. [Data Model](#data-model)
3. [Event Patterns](#event-patterns)
4. [Analytics Views](#analytics-views)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Testing & Validation](#testing--validation)
7. [Migration Path](#migration-path)

---

## Overview

### The Challenge

SynergyOS needs to track user behavior across organizations and teams. Personal content is distinguished by ownership type (`scope: 'user'`) within an organization context:

- **Organizations**: Required context for all users (users always have at least one org)
- **Teams**: Sub-groups within organizations
- **Personal content**: User-owned content (`scope: 'user'`) within organization context

Users should be able to:

1. Create content privately
2. Share collections (tags) with organizations or teams
3. Collaborate on shared collections
4. Take their personal contributions with them if they leave
5. Switch between contexts seamlessly

### The Solution

Use PostHog's **group analytics** to track events at multiple levels:

- `distinctId`: Always the individual user
- `groups.organization`: When content is org-scoped
- `groups.team`: When content is team-scoped
- `properties.scope`: Explicit ownership level (`user`, `organization`, `team`)

This enables analytics views for:

- Individual user performance across all contexts
- Team collaboration and engagement
- Organization-wide adoption and usage
- Content ownership and attribution

---

## Data Model

### Ownership Scopes

Every piece of content and every event has an explicit **scope**:

```typescript
type ContentScope = 'user' | 'organization' | 'team';

interface ContentOwnership {
	scope: ContentScope;
	owner: string; // distinctId of creator
	sharedWith?: {
		organizationId?: string;
		teamId?: string;
	};
}
```

### Sharing Model: Tag-Level (Not Content-Level)

**[HYPOTHESIS]** Users share **collections (tags)**, not individual pieces of content.

**Why:**

- ✅ Natural mental model: "Share this collection with my team"
- ✅ Simpler implementation: One sharing action per tag
- ✅ Clear ownership: Tag owner ≠ content contributors
- ✅ Better analytics: Easy to track tag engagement & collaboration

**Example:**

```
Tag: "JavaScript Concepts" (created by Alice, shared with Engineering team)
├─ 50 flashcards total
├─ Contributors:
│  ├─ Alice: 5 flashcards
│  ├─ Bob: 5 flashcards
│  ├─ Carol: 5 flashcards
│  └─ ... 7 more users: 35 flashcards
└─ Analytics:
   • Tag owner: Alice
   • Tag scope: team
   • Total contributors: 10
   • Content distribution: 5 items per user
```

**Content Ownership Rules:**

- **Tag owner**: User who created/shared the tag (Alice)
- **Content owner**: User who created each flashcard (Alice, Bob, Carol, etc.)
- **Permissions**:
  - Anyone on the team can add flashcards to shared tag
  - Only flashcard owner OR tag owner can delete a flashcard
  - Tag owner can unshare the tag

**Data Portability:**

- User leaves team → their flashcards **stay** (collaborative content)
- User can **export** their contributions (CSV, JSON)
- Tag owner leaves → ownership transfers to org admin OR becomes "community-owned"

**[TO VALIDATE]**: Does this model make sense when users see shared tags?

---

## Event Patterns

### 1. Personal Content Events (Within Organization)

**[HYPOTHESIS]** Personal content events have `groups.organization` set (users always have orgs) and `scope: 'user'`.

```typescript
// User creates a personal tag (within organization context)
posthog.capture('tag_created', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456' // Required - users always have orgs
	},
	properties: {
		scope: 'user', // Personal content
		tag_id: 'tag_001',
		tag_name: 'My Personal Notes',
		tag_type: 'collection',
		created_via: 'manual'
	}
});

// User adds flashcard to personal tag
posthog.capture('flashcard_added_to_tag', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456' // Required - users always have orgs
	},
	properties: {
		scope: 'user',
		tag_id: 'tag_001',
		flashcard_id: 'card_001',
		flashcard_owner: 'user_123',
		tag_owner: 'user_123'
	}
});
```

**Privacy guarantee**: Events without `groups` are NEVER visible in org/team analytics.

**[TO VALIDATE]**: Can org admins see these events in PostHog?

---

### 2. Organization-Scoped Events

**[HYPOTHESIS]** Org events include `groups.organization` and `scope: 'organization'`.

```typescript
// User shares tag with entire organization
posthog.capture('tag_shared', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456'
	},
	properties: {
		scope: 'organization',
		tag_id: 'tag_001',
		tag_name: 'Company Handbook',
		shared_from: 'user', // Originally private
		shared_at: Date.now(),
		organization_id: 'org_456',
		organization_name: 'Acme Corp'
	}
});

// Different user adds content to org-shared tag
posthog.capture('flashcard_added_to_tag', {
	distinctId: 'user_789', // Different user
	groups: {
		organization: 'org_456'
	},
	properties: {
		scope: 'organization',
		tag_id: 'tag_001',
		flashcard_id: 'card_042',
		flashcard_owner: 'user_789', // Who created THIS flashcard
		tag_owner: 'user_123', // Who owns the TAG
		is_collaboration: true // Multiple contributors
	}
});
```

**[TO VALIDATE]**: Do org-level events show up correctly in PostHog group analytics?

---

### 3. Team-Scoped Events

**[HYPOTHESIS]** Team events include BOTH `groups.organization` AND `groups.team`.

```typescript
// User shares tag with specific team
posthog.capture('tag_shared', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456',
		team: 'team_engineering'
	},
	properties: {
		scope: 'team',
		tag_id: 'tag_002',
		tag_name: 'JavaScript Concepts',
		shared_from: 'user',
		organization_id: 'org_456',
		team_id: 'team_engineering',
		team_name: 'Engineering'
	}
});

// Team member studies shared tag
posthog.capture('tag_study_started', {
	distinctId: 'user_456',
	groups: {
		organization: 'org_456',
		team: 'team_engineering'
	},
	properties: {
		scope: 'team',
		tag_id: 'tag_002',
		tag_owner: 'user_123',
		study_mode: 'spaced_repetition',
		flashcard_count: 50,
		contributor_count: 10
	}
});
```

**[TO VALIDATE]**: Can we filter PostHog by team AND see parent organization context?

---

### 4. Organization Switching Events

**[✅ VALIDATED - 2025-11-07]** User switches between workspaces (personal → org → team).

```typescript
// User switches from personal to organization
posthog.capture('organization_switched', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456' // Switching TO this org
	},
	properties: {
		scope: 'organization',
		fromOrganizationId: 'org_123', // Previous organization
		toOrganizationId: 'org_456',
		availableTeamCount: 3
	}
});

// User switches from org to team context (within same org)
posthog.capture('team_switched', {
	distinctId: 'user_123',
	groups: {
		organization: 'org_456',
		team: 'team_engineering' // Switching TO this team
	},
	properties: {
		scope: 'team',
		fromTeamId: null, // Was viewing org-level
		toTeamId: 'team_engineering',
		organizationId: 'org_456'
	}
});
```

**Status**: Currently testing with temporary client-side capture.

---

### 5. Content Contribution Events

**[HYPOTHESIS]** Track individual contributions to shared collections.

```typescript
// Multiple users contribute to shared tag
// User 1 adds flashcards
posthog.capture('flashcard_added_to_tag', {
	distinctId: 'user_001',
	groups: { organization: 'org_456', team: 'team_eng' },
	properties: {
		scope: 'team',
		tag_id: 'tag_shared_001',
		flashcard_id: 'card_001',
		flashcard_owner: 'user_001',
		tag_owner: 'user_123',
		is_first_contribution: true
	}
});

// User 2 adds flashcards (same tag)
posthog.capture('flashcard_added_to_tag', {
	distinctId: 'user_002',
	groups: { organization: 'org_456', team: 'team_eng' },
	properties: {
		scope: 'team',
		tag_id: 'tag_shared_001',
		flashcard_id: 'card_002',
		flashcard_owner: 'user_002',
		tag_owner: 'user_123',
		is_first_contribution: true
	}
});
```

**Analytics queries:**

- How many unique contributors per tag?
- Distribution of contributions (who adds most content)?
- Time to first contribution after tag is shared?

**[TO VALIDATE]**: Can we aggregate by tag_id and count distinct distinctId values?

---

## Analytics Views

### Personal Analytics (User Dashboard)

**Filters**: `distinctId = user_123`

**Metrics**:

- Total tags created (all scopes)
- Tags shared with teams/orgs
- Flashcards created (personal vs shared)
- Study sessions (personal vs team tags)
- Contributions to team collections

**Example Insights**:

```
User: Alice (user_123)
├─ Personal Tags: 15
├─ Shared Tags: 5
│  ├─ With Organization: 2
│  └─ With Teams: 3
├─ Flashcards Created:
│  ├─ Personal: 42
│  └─ In Shared Tags: 23
└─ Collaboration Score:
   • Contributed to 8 team tags
   • 3 tags have multiple contributors
```

**[TO VALIDATE]**: Create this dashboard in PostHog.

---

### Team Analytics (Team Lead Dashboard)

**Filters**: `groups.team = team_engineering`

**Metrics**:

- Active team members (distinct users with events)
- Shared tags in team
- Total flashcards in team tags
- Top contributors (by flashcard count)
- Collaboration rate (tags with >1 contributor)
- Study engagement (study sessions per user)

**Example Insights**:

```
Team: Engineering (team_engineering)
├─ Active Members: 25/30 (83%)
├─ Shared Tags: 12
├─ Total Flashcards: 347
├─ Top Contributors:
│  ├─ Alice: 58 flashcards
│  ├─ Bob: 42 flashcards
│  └─ Carol: 31 flashcards
└─ Collaboration:
   • 8 tags with multiple contributors
   • Avg contributors per tag: 3.2
   • Most collaborative tag: "JavaScript Concepts" (10 contributors)
```

**[TO VALIDATE]**: Verify group filtering works correctly.

---

### Organization Analytics (Admin Dashboard)

**Filters**: `groups.organization = org_456`

**Metrics**:

- Active users across all teams
- Organizations vs teams activity
- Cross-team collaboration
- Content growth over time
- Adoption metrics (% of users creating shared content)

**Example Insights**:

```
Organization: Acme Corp (org_456)
├─ Total Users: 150
├─ Active Users (30d): 127 (85%)
├─ Teams: 8
├─ Organization-Wide Tags: 5
├─ Team Tags: 47
├─ Cross-Team Collaboration:
│  • 3 users contribute to multiple teams
│  • 2 tags used by >1 team
└─ Adoption:
   • 45% of users created shared content
   • 78% of users studied team content
```

**[TO VALIDATE]**: Test cross-team analytics work.

---

### Content Ownership Analysis

**Purpose**: Track orphaned content, collaboration patterns, data portability.

**Queries**:

```typescript
// 1. Orphaned content (owner left org)
posthog.query({
	event: 'flashcard_added_to_tag',
	filters: {
		'properties.is_orphaned': true
	}
});

// 2. Most collaborative tags
posthog.query({
	event: 'flashcard_added_to_tag',
	groupBy: 'properties.tag_id',
	aggregation: 'unique_users'
});

// 3. User's exportable content
posthog.query({
	event: 'flashcard_added_to_tag',
	filters: {
		distinctId: 'user_123',
		'properties.scope': ['organization', 'team']
	}
});
```

**[TO VALIDATE]**: Create these queries in PostHog.

---

## Implementation Guidelines

### When to Add `groups` Property

```typescript
// Decision tree:
if (scope === 'user') {
	// NO groups property
	properties.scope = 'user';
} else if (scope === 'organization') {
	groups = { organization: orgId };
	properties.scope = 'organization';
} else if (scope === 'team') {
	groups = { organization: orgId, team: teamId };
	properties.scope = 'team';
	// ALWAYS include parent organization
}
```

**Rule**: If scope is NOT 'user', ALWAYS include groups.

**[TO VALIDATE]**: Verify this pattern in code.

---

### Privacy Considerations

**Critical Rules**:

1. **Personal events MUST NOT have groups**:
   - ❌ `groups: { organization: 'org_456' }` + `scope: 'user'` = WRONG
   - ✅ No groups + `scope: 'user'` = CORRECT

2. **Org admins can ONLY see org-scoped events**:
   - Filter: `groups.organization = org_456`
   - Cannot see: User-scoped events (no groups)

3. **Team members can ONLY see team-scoped events**:
   - Filter: `groups.team = team_engineering`
   - Cannot see: User-scoped OR other teams

4. **Users can see ALL their own events**:
   - Filter: `distinctId = user_123`
   - Can see: Personal + all orgs/teams they're part of

**[TO VALIDATE]**: Test PostHog dashboard permissions.

---

### Context Switching Pattern

**[HYPOTHESIS]** Users switch contexts to see different content scopes.

**View Modes**:

1. **Personal Content View** (within organization):
   - Shows: User-owned content (`scope: 'user'`) within current organization
   - Filter: `scope = 'user'`
   - No organization context visible

2. **Organization View**:
   - Shows: Organization-scoped tags
   - Filter: `scope = 'organization'` + `groups.organization = org_456`
   - User can switch between orgs if member of multiple

3. **Team View**:
   - Shows: Team-scoped tags
   - Filter: `scope = 'team'` + `groups.team = team_engineering`
   - User can switch between teams within org

**Analytics for Context Switches**:

```typescript
posthog.capture('workspace_context_changed', {
	distinctId: 'user_123',
	groups: contextGroups, // Depends on new context
	properties: {
		from_context: 'personal',
		to_context: 'team',
		organization_id: 'org_456',
		team_id: 'team_engineering'
	}
});
```

**[TO VALIDATE]**: Implement context switching and track events.

---

## Testing & Validation

### Test Plan

#### Phase 1: Basic Organization Switching ✅ COMPLETED (2025-11-07)

- [x] Temporary client-side capture added
- [x] Event: `organization_switched`
- [x] **Test**: Switch between personal ↔ "Test Org"
- [x] Verify event in browser console ✅ Works!
- [x] Verify event in PostHog Live Events ✅ Confirmed!
- [x] Validate properties: `fromOrganizationId`, `toOrganizationId`, `availableTeamCount` ✅ All present

**Key Learnings**:

- Client-side capture works reliably for testing
- Event appears in console immediately with proper formatting
- PostHog receives events within expected timeframe
- Property structure matches our schema exactly
- `snake_case` naming convention validated
- Group analytics pattern confirmed working

#### Phase 2: Tag Sharing (Next)

- [ ] Create personal tag
- [ ] Share tag with organization
- [ ] Verify `tag_shared` event with correct groups
- [ ] Different user adds flashcard to shared tag
- [ ] Verify `flashcard_added_to_tag` event with contributor attribution

#### Phase 3: Team Collaboration

- [ ] Share tag with specific team
- [ ] Multiple users contribute flashcards
- [ ] Verify group analytics shows all contributors
- [ ] Test team switching events

#### Phase 4: Privacy & Permissions

- [ ] Verify personal events have NO groups
- [ ] Test PostHog dashboard filters
- [ ] Confirm org admins cannot see personal events
- [ ] Confirm team members cannot see other teams

#### Phase 5: Migration

- [ ] Test data portability (user leaves org)
- [ ] Orphaned content handling
- [ ] Tag ownership transfer

### Success Criteria

For each test phase:

- ✅ Event appears in PostHog within 30 seconds
- ✅ Event name follows `snake_case` convention
- ✅ Properties are correctly typed and named
- ✅ `groups` property present only when appropriate
- ✅ `scope` property always present and correct
- ✅ User attribution (`distinctId`) always set

---

## Migration Path

### Current State

- Single-user application
- All content is user-scoped
- No organization/team support

### Phase 1: Add Organization Support

1. Add `organizationId` to schema
2. Implement organization CRUD
3. Add `organization_created`, `organization_joined`, `organization_switched` events
4. **Validate**: Events flow to PostHog with correct groups

### Phase 2: Add Team Support

1. Add `teamId` to schema
2. Implement team CRUD within orgs
3. Add `team_created`, `team_joined`, `team_switched` events
4. **Validate**: Hierarchical groups (org + team) work

### Phase 3: Add Tag Sharing

1. Add `scope` and `sharedWith` to tags schema
2. Implement share tag mutation
3. Add `tag_shared` event
4. **Validate**: Shared tags visible to org/team members

### Phase 4: Add Content Contribution Tracking

1. Track `flashcard_owner` separately from `tag_owner`
2. Add `flashcard_added_to_tag` event with attribution
3. **Validate**: Contributor analytics work

### Phase 5: Enable Server-Side Analytics

1. Implement HTTP action bridge pattern
2. Re-enable Convex mutation analytics
3. **Validate**: All events flow through server

---

## Appendix: Event Schema Reference

See `src/lib/infrastructure/analytics/events.ts` for full typed event definitions.

**Key Events**:

- `organization_created`
- `organization_joined`
- `organization_switched` ← **Currently testing**
- `team_created`
- `team_joined`
- `team_switched`
- `tag_created`
- `tag_shared` ← **Next to implement**
- `flashcard_added_to_tag` ← **Key collaboration event**
- `tag_study_started`

**Naming Conventions**: See `dev-docs/posthog.md` for full reference.

---

## Questions & Decisions Log

### Open Questions

1. When user leaves org, should their flashcards stay or be deleted?
   - **Decision**: Stay (collaborative content), but user can export
2. Should team tags appear in personal content view?
   - **Decision**: No - context-based view (switch to team to see team tags)
3. Can a tag be shared with multiple teams simultaneously?
   - **To Decide**: Probably not initially (simplicity)
4. What happens to a tag when the owner leaves?
   - **To Decide**: Transfer to org admin OR mark as "community-owned"

### Validated Decisions

- ✅ Tag-level sharing (not content-level)
- ✅ Context-based workspace view
- ✅ Temporary client-side capture for testing

---

**Next Update**: After completing Phase 1 testing (organization switching).

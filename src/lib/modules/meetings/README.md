# Meetings Module

**Team Ownership**: Meetings Team  
**Status**: ✅ Active  
**Feature Flag**: `meetings-module` (workspace-based)

---

## Overview

The Meetings module provides meeting management, agenda tracking, action items, and decision recording.

## User Outcomes

**Problem**: Teams waste time in unproductive meetings, lose track of decisions, and struggle with follow-up.

**Outcome**: Teams run effective meetings with clear agendas, documented decisions, and actionable follow-ups.

**Before (Pain)**:

- Meetings lack structure → wasted time, unclear purpose
- Decisions forgotten → repeated discussions, confusion
- Action items lost → nothing gets done, no accountability

**After (Outcome)**:

- Structured meetings with agendas → focused discussions, time saved
- Decisions documented → referenceable history, reduced rework
- Action items tracked → accountability and follow-through

## Success Metrics

### Leading Indicators (What we can control)

- ✅ Meetings created with agendas: 80%+ of meetings have agenda items
- ✅ Decisions documented: 90%+ of meetings result in documented decisions
- ✅ Action items assigned: 100% of action items have owners

### Lagging Indicators (What we measure)

- 🎯 **Meeting effectiveness**: Teams report 30%+ time saved per meeting
- 🎯 **Decision recall**: Past decisions referenced 3x more often
- 🎯 **Action item completion**: 80%+ completion rate within deadline

### Impact (Why it matters)

- **Team productivity**: Less time in meetings, more time building
- **Alignment**: Clear decisions reduce confusion and rework
- **Accountability**: Action items tracked → higher completion rates

## Module Structure

```
meetings/
├── components/         # Meeting-specific UI components
│   ├── ActionItemsList.svelte
│   ├── AgendaItemView.svelte
│   ├── AttendeeSelector.svelte
│   ├── CreateMeetingModal.svelte
│   ├── MeetingCard.svelte
│   ├── SecretaryConfirmationDialog.svelte
│   ├── SecretarySelector.svelte
│   └── TodayMeetingCard.svelte
├── composables/       # Meeting-specific composables
│   ├── useAgendaNotes.svelte.ts
│   ├── useMeetingPresence.svelte.ts
│   ├── useMeetings.svelte.ts
│   └── useMeetingSession.svelte.ts
├── api.ts             # Module API contract
├── feature-flags.ts   # Feature flag definitions
└── manifest.ts        # Module registration
```

## API Contract

See [`api.ts`](./api.ts) for the complete `MeetingsModuleAPI` interface.

## Dependencies

### Blockers (What's Slowing Us Down)

- **None currently** ✅

### Enablers (What We Have)

- **Core Module**: Organization context, shared components (TagSelector, etc.)
- **RBAC System**: Permission checks for meeting access and secretary roles
- **Convex Backend**: Real-time meeting state, agenda items, decisions, action items

### Interaction Patterns

- **Collaboration** with Core module (workspace context, shared components)
- **X-as-a-Service** to other modules (provides meeting APIs for future integrations)
- **Facilitating** for users (meeting workflows, templates, best practices)

## Feature Flag

**Flag**: `meetings-module`  
**Scope**: Organization-based  
**Default**: Disabled (requires explicit enablement per workspace)

## Usage

### Checking Module Availability

```typescript
import { isModuleEnabled } from '$lib/modules/registry';

const enabled = await isModuleEnabled('meetings', sessionId, client);
```

### Basic: List Today's Meetings

```typescript
import { getContext } from 'svelte';
import type { MeetingsModuleAPI } from '$lib/modules/meetings/api';

const meetingsAPI = getContext<MeetingsModuleAPI | undefined>('meetings-api');
if (meetingsAPI) {
	const meetings = meetingsAPI.useMeetings({
		workspaceId: () => currentOrgId,
		sessionId: () => sessionId
	});

	// Reactive: todayMeetings updates automatically
	$: console.log('Today:', meetings.todayMeetings);
}
```

### Advanced: Meeting Session Management

```typescript
const session = meetingsAPI.useMeetingSession({
	meetingId: () => selectedMeetingId,
	sessionId: () => sessionId,
	userId: () => currentUserId
});

// Start meeting
await session.startMeeting();

// Check elapsed time
$: console.log(`Meeting running: ${session.elapsedTimeFormatted}`);

// Add agenda item
await session.addAgendaItem('Review Q4 roadmap');
```

## Team Ownership

**Team Type**: Stream-aligned team (owns full meeting workflow)

**Owner**: Meetings Team  
**Contact**: See Linear team assignments

**Interaction Patterns**:

- **Collaboration** with Core module (workspace context, shared components)
- **X-as-a-Service** to other modules (provides meeting APIs for future integrations)
- **Facilitating** for users (meeting workflows, templates, best practices)

**Responsibilities**:

- Maintain meeting functionality
- Manage feature flag rollout
- Review PRs affecting meetings module
- Coordinate with Core module for shared components
- Provide meeting APIs for other modules (future)

## Testing

### Running Module Tests

```bash
# Run all meetings module tests (component, composable, and integration)
npm run test:unit:server -- src/lib/modules/meetings

# Run only integration tests
npm run test:integration -- src/lib/modules/meetings/__tests__/

# Run specific test file
npm run test:unit:server -- src/lib/modules/meetings/__tests__/meetings.integration.test.ts

# Watch mode (runs tests on file changes)
npm run test:unit:server -- src/lib/modules/meetings --watch
```

### Test Structure

```
meetings/
├── __tests__/                          # ✅ Module test suite (colocated)
│   ├── meetings.integration.test.ts
│   ├── meetingActionItems.integration.test.ts
│   └── meetingTemplates.integration.test.ts
├── components/                         # Component tests colocated here (when added)
│   └── MeetingCard.svelte.test.ts
└── composables/                        # Composable tests colocated here (when added)
    └── useMeetings.svelte.test.ts
```

### Writing New Tests

**Integration Tests** (Module `__tests__/` folder):

```typescript
// src/lib/modules/meetings/__tests__/new-feature.integration.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../../../convex/_generated/api';
import schema from '../../../../../convex/schema';
import { modules } from '../../../../../tests/convex/integration/test.setup';
import { createTestSession, cleanupTestData } from '../../../../../tests/convex/integration/setup';

describe('New Feature Integration Tests', () => {
	const cleanupQueue: Array<{ userId?: any }> = [];

	afterEach(async () => {
		const t = convexTest(schema, modules);
		for (const item of cleanupQueue) {
			if (item.userId) {
				await cleanupTestData(t, item.userId);
			}
		}
		cleanupQueue.length = 0;
	});

	it('should test new feature', async () => {
		const t = convexTest(schema, modules);
		const { sessionId, userId } = await createTestSession(t);
		cleanupQueue.push({ userId });

		const result = await t.query(api.meetings.newFunction, { sessionId });
		expect(result).toBeDefined();
	});
});
```

**See**: [Test Organization Strategy](../../../../dev-docs/2-areas/development/test-workspace-strategy.md) for complete testing patterns.

## Development Guidelines

1. **Module Boundaries**: Don't import from other feature modules
2. **Feature Flags**: Always check feature flag before rendering
3. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
4. **Testing**: Add tests for new features (colocate with code)

## Related Documentation

- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)
- [Feature Flags](../../../../dev-docs/2-areas/patterns/feature-flags.md)

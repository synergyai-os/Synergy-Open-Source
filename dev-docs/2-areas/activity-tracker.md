# Global Activity Tracker System

## Overview

The Global Activity Tracker is a universal system for tracking and displaying background operations across the entire application. It provides persistent, user-friendly progress tracking that remains visible regardless of navigation, enabling users to continue browsing while operations complete in the background.

## Architecture

### Core Components

1. **`src/lib/stores/activityTracker.svelte.ts`** - Global state store using Svelte 5 `$state`
2. **`src/lib/components/GlobalActivityTracker.svelte`** - Main tracker component (rendered in layout)
3. **`src/lib/components/ActivityCard.svelte`** - Individual activity display component

### Key Features

- ✅ **Persistent across navigation** - Activities remain visible on all routes
- ✅ **Multiple simultaneous activities** - Track sync, generation, export, etc. at once
- ✅ **Real-time progress updates** - Polling system keeps progress current
- ✅ **Auto-dismiss** - Completed activities automatically disappear
- ✅ **Quick actions** - Contextual actions per activity (copy link, view item, etc.)
- ✅ **Error handling** - Clear error states with extended visibility
- ✅ **Cancel support** - Cancellable operations can be stopped

## Usage

### Adding an Activity

```typescript
import { addActivity, updateActivity, removeActivity } from '$lib/stores/activityTracker.svelte';

// Add a new activity
const activityId = addActivity({
	id: `sync-readwise-${Date.now()}`, // Unique ID
	type: 'sync', // Activity type: 'sync' | 'generation' | 'bulk' | 'notification' | 'export' | etc.
	status: 'running', // 'pending' | 'running' | 'completed' | 'error' | 'cancelled'
	metadata: {
		source: 'readwise', // Source of the activity
		operation: 'import' // Type of operation
	},
	progress: {
		step: 'Starting sync...',
		current: 0,
		total: 100,
		message: 'Fetching highlights...'
	},
	quickActions: [
		{
			label: 'View Inbox',
			action: () => navigate('/inbox')
		}
	],
	onCancel: () => {
		// Handle cancellation
		cancelSync();
	},
	autoDismiss: true,
	dismissAfter: 5000 // milliseconds
});
```

### Updating Activity Progress

```typescript
// Update activity progress
updateActivity(activityId, {
	status: 'running',
	progress: {
		step: 'Importing highlights',
		current: 45,
		total: 100,
		message: 'Processing highlight 45 of 100...'
	}
});
```

### Completing an Activity

```typescript
// Mark as completed
updateActivity(activityId, {
	status: 'completed',
	progress: {
		message: 'Imported 25 new highlights'
	}
});

// Auto-dismiss after delay (if autoDismiss is enabled)
// Or manually remove:
setTimeout(() => {
	removeActivity(activityId);
}, 3000);
```

### Handling Errors

```typescript
// Update activity with error
updateActivity(activityId, {
	status: 'error',
	progress: {
		message: error instanceof Error ? error.message : 'Failed to sync'
	}
});

// Keep error visible longer
setTimeout(() => {
	removeActivity(activityId);
}, 5000);
```

### Cancelling an Activity

```typescript
// Mark as cancelled
updateActivity(activityId, {
	status: 'cancelled'
});

// Remove after delay
setTimeout(() => {
	removeActivity(activityId);
}, 1000);
```

## Activity Types

The system supports any activity type. Common types:

- **`sync`** - Data synchronization (Readwise, etc.)
- **`generation`** - Background generation (flashcards, AI processing)
- **`bulk`** - Bulk operations (delete, mark processed)
- **`notification`** - User notifications with quick actions
- **`export`** - Data export operations
- **`import`** - Data import operations

## Progress Tracking Options

### Determinate Progress (X/Y)

```typescript
progress: {
  current: 45,
  total: 100,
  step: 'Processing items',
  message: 'Processing item 45 of 100...'
}
```

### Indeterminate Progress

```typescript
progress: {
  indeterminate: true,
  step: 'Analyzing content...'
}
```

### Step-Based Progress

```typescript
progress: {
  currentStep: 2,
  totalSteps: 5,
  steps: [
    { id: 1, name: 'Fetch data', completed: true },
    { id: 2, name: 'Process items', completed: false, current: true },
    { id: 3, name: 'Generate cards', completed: false }
  ]
}
```

### Queue-Based Progress

```typescript
progress: {
  queuePosition: 3,
  totalInQueue: 15,
  current: 2,
  step: 'Processing queue item 2 of 15'
}
```

## Quick Actions

Add contextual actions to activities:

```typescript
quickActions: [
	{
		label: 'Copy Link',
		action: () => navigator.clipboard.writeText(item.link),
		icon: '📋' // Optional
	},
	{
		label: 'View Item',
		action: () => navigate(`/inbox/${itemId}`)
	},
	{
		label: 'Share',
		action: () => shareItem(itemId),
		variant: 'primary' // 'primary' | 'secondary' | 'danger'
	}
];
```

## Integration Example: Readwise Sync

See `src/routes/(authenticated)/inbox/+page.svelte` for a complete integration example:

```typescript
// 1. Import tracker functions
import { addActivity, updateActivity, removeActivity } from '$lib/stores/activityTracker.svelte';

// 2. Track activity ID
let syncActivityId: string | null = null;

// 3. Add activity when sync starts
async function handleImport(options) {
	syncActivityId = addActivity({
		id: `sync-readwise-${Date.now()}`,
		type: 'sync',
		status: 'running',
		metadata: { source: 'readwise', operation: 'import' },
		progress: { step: 'Starting sync...', indeterminate: true },
		onCancel: () => handleCancelSync(),
		autoDismiss: true,
		dismissAfter: 5000
	});

	// ... start sync operation
}

// 4. Update progress during sync
const pollSyncProgress = async () => {
	const progress = await convexClient.query(api.inbox.getSyncProgress, {});
	if (progress && syncActivityId) {
		updateActivity(syncActivityId, {
			status: 'running',
			progress: {
				step: progress.step,
				current: progress.current,
				total: progress.total,
				message: progress.message
			}
		});
	}
};

// 5. Complete activity
if (syncActivityId) {
	updateActivity(syncActivityId, {
		status: 'completed',
		progress: { message: `Imported ${result.newCount} highlights` }
	});
	setTimeout(() => removeActivity(syncActivityId!), 3000);
}
```

## Design Tokens

The tracker uses semantic design tokens for consistent styling:

- **Spacing**: `px-menu-item`, `py-menu-item`, `gap-icon`
- **Colors**: `bg-elevated`, `border-base`, `text-primary`, `text-secondary`, `text-tertiary`
- **Typography**: `text-sm`, `text-xs`

See `dev-docs/design-tokens.md` for complete token reference.

## Positioning

The tracker is fixed in the bottom-right corner (`fixed bottom-4 right-4 z-50`) and stacks activities vertically. It appears only when activities exist.

## Auto-Dismiss Behavior

Activities with `autoDismiss: true` will automatically be removed after `dismissAfter` milliseconds when they reach `completed` or `error` status.

## Polling System

The `GlobalActivityTracker` component automatically polls for activity updates:

1. Starts polling when activities exist
2. Stops polling when no activities remain
3. Polls every 500ms by default
4. Handles multiple activity types (currently sync, extensible for others)

The polling is managed by the tracker component and doesn't require manual setup for each activity type.

## Best Practices

1. **Unique IDs**: Always use unique IDs (e.g., `sync-readwise-${Date.now()}`)
2. **Clean up**: Always remove activities when done (via auto-dismiss or manual removal)
3. **Error visibility**: Keep errors visible longer (5+ seconds) so users can read them
4. **Progress updates**: Update progress frequently during long operations
5. **User actions**: Provide quick actions for common operations (view, copy, share)
6. **Status accuracy**: Keep activity status in sync with actual operation state

## Future Extensions

The tracker is designed to be extensible:

1. **New activity types**: Add new types without modifying core infrastructure
2. **Custom UI per type**: Each activity type can have custom rendering (future enhancement)
3. **Convex subscriptions**: Could replace polling with real-time subscriptions
4. **Persistent storage**: Could persist active activities across page reloads
5. **Activity history**: Could maintain a history of completed activities

## Files

- **Store**: `src/lib/stores/activityTracker.svelte.ts`
- **Main Component**: `src/lib/components/GlobalActivityTracker.svelte`
- **Card Component**: `src/lib/components/ActivityCard.svelte`
- **Layout Integration**: `src/routes/(authenticated)/+layout.svelte`
- **Example Usage**: `src/routes/(authenticated)/inbox/+page.svelte`

## See Also

- `dev-docs/design-tokens.md` - Design token system
- `dev-docs/architecture.md` - Overall architecture
- `dev-docs/QUICK-START.md` - Getting started guide

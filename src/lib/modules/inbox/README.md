# Inbox Module

**Team Ownership**: Inbox Team  
**Status**: ✅ Active  
**Feature Flag**: None (always enabled)

---

## Overview

The Inbox module handles content collection, synchronization with Readwise, and content management workflows.

## Module Structure

```
inbox/
├── components/         # Inbox-specific UI components
│   ├── FlashcardReviewModal.svelte
│   ├── InboxCard.svelte
│   ├── InboxFilterMenu.svelte
│   ├── InboxHeader.svelte
│   ├── ManualDetail.svelte
│   ├── NoteDetail.svelte
│   ├── PhotoDetail.svelte
│   ├── ReadwiseDetail.svelte
│   ├── SyncProgressTracker.svelte
│   └── SyncReadwiseConfig.svelte
├── composables/       # Inbox-specific composables
│   ├── useInboxItems.svelte.ts
│   ├── useInboxLayout.svelte.ts
│   ├── useInboxSync.svelte.ts
│   ├── useKeyboardNavigation.svelte.ts
│   ├── useNote.svelte.ts
│   └── useSelectedItem.svelte.ts
├── api.ts             # Module API contract
├── feature-flags.ts   # Feature flag definitions
└── manifest.ts        # Module registration
```

## API Contract

See [`api.ts`](./api.ts) for the complete `InboxModuleAPI` interface.

**Exposed Composables**:

- `useTagging` - Tag management for inbox items

## Dependencies

- **Core** - Uses `TagSelector` component and organization context

## Usage

### Using Module API

```typescript
import { getContext } from 'svelte';
import type { InboxModuleAPI } from '$lib/modules/inbox/api';

const inboxAPI = getContext<InboxModuleAPI | undefined>('inbox-api');
if (inboxAPI) {
  const tagging = inboxAPI.useTagging({ ... });
}
```

## Team Ownership

**Owner**: Inbox Team  
**Contact**: See Linear team assignments

**Responsibilities**:

- Maintain inbox functionality
- Manage Readwise sync features
- Review PRs affecting inbox module
- Coordinate with Core module for shared components

## Development Guidelines

1. **Module Boundaries**: Don't import from other feature modules (meetings, flashcards, etc.)
2. **Shared Components**: Use Core module components (TagSelector, etc.)
3. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
4. **Testing**: Add tests for new features

## Related Documentation

- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)

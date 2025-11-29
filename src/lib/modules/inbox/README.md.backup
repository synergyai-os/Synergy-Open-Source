# Inbox Module

**Team Ownership**: Inbox Team  
**Status**: ✅ Active  
**Feature Flag**: None (always enabled)

---

## Core Ideas & Principles

### Inbox as Temporary Staging Area

**"Inbox is a simple way to create a document and organize it. Once it's organized, it should become a real document."**

The inbox serves as a **temporary staging area** for unorganized content:

- **Collection Point**: Content arrives here from various sources (Readwise, manual entry, etc.)
- **Organization Hub**: Users process and organize content before it becomes permanent
- **Temporary by Design**: Content moves out of inbox once organized/processed
- **Gateway to Documents**: Processed content becomes documents (via Documents module)

### Key Principles

1. **Inbox = Temporary, Unorganized Content**
   - Content arrives unorganized (highlights, notes, photos)
   - Users process content (review, tag, organize)
   - Once processed, content becomes a document

2. **Processing Workflow**
   - Content enters inbox → User reviews → User organizes → Content becomes document
   - `processed` flag tracks organization status
   - Processed items can be archived or migrated to documents

3. **Unified Creation Interface**
   - QuickCreateModal supports creating inbox items
   - Same interface for documents, inbox items, and other content types
   - Seamless transition from inbox to documents

4. **Source-Agnostic Collection**
   - Readwise highlights sync automatically
   - Manual notes can be created
   - Photos can be uploaded (future)
   - Any content type can enter inbox

---

## Core Ideas & Principles

### Inbox as Temporary Staging Area

**"Inbox is a simple way to create a document and organize it. Once it's organized, it should become a real document."**

The inbox serves as a **temporary staging area** for unorganized content:

- **Collection Point**: Content arrives here from various sources (Readwise, manual entry, etc.)
- **Organization Hub**: Users process and organize content before it becomes permanent
- **Temporary by Design**: Content moves out of inbox once organized/processed
- **Gateway to Documents**: Processed content becomes documents (via Documents module)

### Key Principles

1. **Inbox = Temporary, Unorganized Content**
   - Content arrives unorganized (highlights, notes, photos)
   - Users process content (review, tag, organize)
   - Once processed, content becomes a document

2. **Processing Workflow**
   - Content enters inbox → User reviews → User organizes → Content becomes document
   - `processed` flag tracks organization status
   - Processed items can be archived or migrated to documents

3. **Unified Creation Interface**
   - QuickCreateModal supports creating inbox items
   - Same interface for documents, inbox items, and other content types
   - Seamless transition from inbox to documents

4. **Source-Agnostic Collection**
   - Readwise highlights sync automatically
   - Manual notes can be created
   - Photos can be uploaded (future)
   - Any content type can enter inbox

---

## Overview

The Inbox module handles content collection, synchronization with Readwise, and content management workflows. It serves as a temporary staging area where unorganized content is processed before becoming permanent documents. It serves as a temporary staging area where unorganized content is processed before becoming permanent documents.

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

## Technical Requirements

### Current Implementation

- **inboxItems Table**: Polymorphic table with types (`readwise_highlight`, `photo_note`, `manual_text`, `note`)
- **Processing Workflow**: `processed` flag tracks organization status
- **Tagging**: Uses core tagging system via junction tables
- **Readwise Sync**: Automatic synchronization of highlights

### Missing Features & Gaps

#### Inbox → Documents Migration

- [ ] **Migration Path**: No automatic migration from inbox to documents
- [ ] **Processing Action**: No "Convert to Document" action in UI
- [ ] **Bulk Processing**: No bulk convert to documents
- [ ] **Document Creation**: Processed items don't automatically become documents

#### Document Integration

- [ ] **Document Types**: QuickCreateModal doesn't support document types yet
- [ ] **Document Creation**: Can't create documents directly (only inbox items)
- [ ] **Document Linking**: No way to link inbox items to documents

#### Workflow Improvements

- [ ] **Processing UI**: No clear "Process" action that converts to document
- [ ] **Archive**: No archive functionality for processed items
- [ ] **Bulk Actions**: Limited bulk processing capabilities

---

## Development Guidelines

1. **Module Boundaries**: Don't import from other feature modules (meetings, flashcards, etc.)
2. **Shared Components**: Use Core module components (TagSelector, etc.)
3. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
4. **Testing**: Add tests for new features
5. **Inbox Philosophy**: Remember inbox is temporary - content should move to documents

## Related Documentation

- [Documents Module](../documents/README.md) - Where processed inbox content becomes documents
- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)
- [mem.ai Documentation System Analysis](../../../../dev-docs/2-areas/patterns/ANALYSIS-mem-ai-documentation-system.md)

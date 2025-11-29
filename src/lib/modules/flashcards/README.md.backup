# Flashcards Module

**Team Ownership**: Flashcards Team  
**Status**: ✅ Active  
**Feature Flag**: None (always enabled)

---

## Overview

The Flashcards module provides spaced repetition learning, flashcard creation, and study session management.

## Module Structure

```
flashcards/
├── components/         # Flashcard-specific UI components
│   ├── FlashcardCollectionCard.svelte
│   ├── FlashcardDetailModal.svelte
│   └── FlashcardMetadata.svelte
├── composables/       # Flashcard-specific composables
│   └── useStudySession.svelte.ts
├── api.ts             # Module API contract
├── feature-flags.ts   # Feature flag definitions
└── manifest.ts        # Module registration
```

## API Contract

See [`api.ts`](./api.ts) for the complete `FlashcardsModuleAPI` interface.

**Exposed Composables**:

- `useStudySession` - Study session management with spaced repetition

## Dependencies

- **Core** - Uses organization context and shared components

## Usage

### Using Module API

```typescript
import { getContext } from 'svelte';
import type { FlashcardsModuleAPI } from '$lib/modules/flashcards/api';

const flashcardsAPI = getContext<FlashcardsModuleAPI | undefined>('flashcards-api');
if (flashcardsAPI) {
	const study = flashcardsAPI.useStudySession({ sessionId: getSessionId });
}
```

## Team Ownership

**Owner**: Flashcards Team  
**Contact**: See Linear team assignments

**Responsibilities**:

- Maintain flashcard functionality
- Manage spaced repetition algorithms
- Review PRs affecting flashcards module
- Coordinate with Core module for shared components

## Development Guidelines

1. **Module Boundaries**: Don't import from other feature modules
2. **Composables**: Use `.svelte.ts` extension (required for Svelte 5 runes)
3. **Testing**: Add tests for new features
4. **Performance**: Optimize for large flashcard collections

## Testing

### Running Module Tests

```bash
# Run all flashcards module tests
npm run test:unit:server -- src/lib/modules/flashcards

# Run specific test file
npm run test:unit:server -- src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts

# Run in watch mode for development
npm run test:unit:server -- src/lib/modules/flashcards --watch
```

### Test Structure

Module integration tests are colocated in `__tests__/` folder:

```
flashcards/
└── __tests__/
    └── flashcards.integration.test.ts
```

**Test Coverage**:

- ✅ Flashcard creation
- ✅ Spaced repetition algorithms
- ✅ Study session management

**See**: [Test Organization Strategy](../../../../dev-docs/2-areas/development/test-organization-strategy.md) for complete testing patterns.

## Related Documentation

- [System Architecture](../../../../dev-docs/2-areas/architecture/system-architecture.md)
- [Module System](../../../../dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)

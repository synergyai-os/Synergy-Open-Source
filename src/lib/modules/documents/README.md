# Documents Module

**Team Ownership**: Documents Team  
**Status**: 🚧 Planned  
**Feature Flag**: `documents-module` (workspace-based)

---

## Core Ideas & Principles

### The mem.ai Philosophy

**"One way to write docs. No workspace required. Documents surface when you need them."**

This module implements a zero-workspace documentation system where:

- **Just write** - No folders, no categories, no manual workspace required
- **Intelligent surfacing** - Documents appear automatically when relevant
- **Semantic search** - Natural language queries that understand meaning
- **Context-aware** - Documents surface based on what you're working on

### Key Principles

1. **Documents are Persistent, Organized Content**
   - Documents are the "real" content after inbox items are processed
   - Once organized, inbox items become documents
   - Documents are searchable, linkable, and discoverable

2. **Zero-Organization Writing**
   - Users don't need to decide where to save documents
   - No folder structures or manual categorization required
   - System understands content semantically

3. **Semantic Discovery**
   - Documents surface contextually based on current work
   - Search understands meaning, not just keywords
   - Related documents are automatically suggested

4. **Unified Document Model**
   - All document types (decisions, notes, proposals, etc.) use same base structure
   - Polymorphic via `type` field
   - Shared tagging, search, and linking capabilities

---

## Document Types

### Core Document Types

- **`note`** - General notes and documentation
- **`decision`** - Meeting decisions with approval workflow
- **`proposal`** - Proposals and recommendations
- **`spec`** - Technical specifications
- **`meeting-summary`** - Meeting summaries and recaps

### Extensibility

New document types can be added without schema changes:

- Add new type to union
- Type-specific fields stored in optional fields
- All types share common document capabilities

---

## Technical Requirements

### Schema Design

```typescript
documents: defineTable({
  userId: v.id('users'),
  workspaceId: v.id('workspaces'), // Required for decisions

  // Document type (polymorphic)
  type: v.union(
    v.literal('note'),
    v.literal('decision'),
    v.literal('proposal'),
    v.literal('spec'),
    v.literal('meeting-summary')
  ),

  // Common document fields
  title: v.string(),
  content: v.string(), // Markdown - searchable
  contentProseMirror: v.optional(v.string()), // Rich text JSON

  // Type-specific fields (optional, based on type)
  // Decision-specific
  decidedAt: v.optional(v.number()),
  status: v.optional(v.union(...)), // Decision lifecycle
  approvedBy: v.optional(v.id('users')),
  approvedAt: v.optional(v.number()),
  approvedByRole: v.optional(v.id('circleRoles')),

  // Meeting context (for decisions, summaries)
  meetingId: v.optional(v.id('meetings')),
  agendaItemId: v.optional(v.id('meetingAgendaItems')),

  // Semantic search
  embedding: v.optional(v.array(v.number())), // Vector embedding

  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id('users'),

  // Multi-tenancy
  circleId: v.optional(v.id('circles')),
  ownershipType: v.optional(v.union(
    v.literal('user'),
    v.literal('workspace'),
    v.literal('circle')
  ))
})
.index('by_user', ['userId'])
.index('by_organization', ['workspaceId'])
.index('by_type', ['type'])
.index('by_meeting', ['meetingId'])
.index('by_circle', ['circleId'])

// Junction table for document tags
documentTags: defineTable({
  documentId: v.id('documents'),
  tagId: v.id('tags')
})
.index('by_document', ['documentId'])
.index('by_tag', ['tagId'])
.index('by_document_tag', ['documentId', 'tagId'])
```

### Semantic Search Requirements

1. **Embedding Generation**
   - Generate embeddings on document create/update
   - Use OpenAI `text-embedding-3-small` (or similar)
   - Store embeddings in document record (MVP) or vector DB (production)

2. **Search Implementation**
   - Convert search queries to embeddings
   - Calculate cosine similarity
   - Return top N most relevant documents

3. **Context-Aware Surfacing**
   - Track user context (open files, recent searches)
   - Generate context embedding
   - Surface relevant documents proactively

### Integration Points

- **Inbox Module**: Processed inbox items become documents
- **Meetings Module**: Decisions created during meetings become documents
- **Core Module**: Uses tagging system, QuickCreateModal
- **QuickCreateModal**: Add `decision` and other document types

---

## Current Gaps & Missing Features

### Phase 1: Foundation (Not Started)

- [ ] **Documents Table**: Schema not yet created
- [ ] **Document CRUD**: No create/read/update/delete operations
- [ ] **Tagging Integration**: No documentTags junction table
- [ ] **QuickCreateModal Integration**: Document types not yet supported

### Phase 2: Semantic Search (Not Started)

- [ ] **Embedding Generation**: No embedding API or processing
- [ ] **Vector Storage**: No vector database or storage strategy
- [ ] **Semantic Search Query**: No search implementation
- [ ] **Search UI**: No search interface component

### Phase 3: Context-Aware Surfacing (Not Started)

- [ ] **Context Tracking**: No user context tracking
- [ ] **Context Embeddings**: No context embedding generation
- [ ] **Proactive Surfacing**: No document surfacing logic
- [ ] **Surfacing UI**: No sidebar/suggestions component

### Phase 4: Intelligent Organization (Not Started)

- [ ] **Auto-Categorization**: No topic extraction
- [ ] **Dynamic Collections**: No collections system
- [ ] **Relationship Detection**: No document linking
- [ ] **Related Documents**: No relationship suggestions

### Integration Gaps

- [ ] **Inbox → Documents**: No migration path from inbox to documents
- [ ] **Meetings → Decisions**: Decisions not yet created as documents
- [ ] **Tagging System**: Document tagging not integrated with core tagging

---

## Implementation Roadmap

### MVP (Phase 1): Basic Documents

**Goal**: Enable document creation and basic CRUD

**Tasks**:

1. Create `documents` table schema
2. Create `documentTags` junction table
3. Implement document CRUD operations
4. Add document types to QuickCreateModal
5. Basic document list/view UI

**Timeline**: 1-2 weeks

### Phase 2: Semantic Search

**Goal**: Enable natural language search of documents

**Tasks**:

1. Set up embedding generation (OpenAI API)
2. Store embeddings in documents table
3. Implement cosine similarity search
4. Add semantic search UI component
5. Test with existing documents

**Timeline**: 1-2 weeks  
**Cost**: ~$10-20/month (OpenAI API)

### Phase 3: Context-Aware Surfacing

**Goal**: Documents surface automatically based on context

**Tasks**:

1. Implement context tracking
2. Build context embedding system
3. Create proactive surfacing query
4. Add UI for surfaced documents (sidebar, suggestions)
5. Test and tune similarity thresholds

**Timeline**: 1 week  
**Cost**: Minimal (uses existing embedding infrastructure)

### Phase 4: Intelligent Organization

**Goal**: Automatic categorization and linking

**Tasks**:

1. Implement topic extraction
2. Create collections system
3. Auto-assign documents to collections
4. Implement relationship detection
5. Add UI for collections and related documents

**Timeline**: 1-2 weeks  
**Cost**: ~$5-10/month (GPT-4o-mini for topic extraction)

---

## Dependencies

### Required Modules

- **Core Module**: Tagging system, QuickCreateModal, workspace context
- **Inbox Module**: Migration path from inbox to documents

### Optional Integrations

- **Meetings Module**: Decisions as documents
- **Flashcards Module**: Flashcards could reference documents

---

## Success Metrics

### Phase 1 (Basic Documents)

- ✅ Documents can be created and edited
- ✅ Documents are searchable (keyword search)
- ✅ Documents support tagging

### Phase 2 (Semantic Search)

- ✅ Can find documents using natural language queries
- ✅ Search results are relevant (>80% relevance)
- ✅ Search completes in <500ms

### Phase 3 (Context-Aware)

- ✅ Relevant documents surface automatically
- ✅ Users find surfaced documents helpful (>60% click-through)
- ✅ Reduces need for manual search

### Phase 4 (Intelligent Organization)

- ✅ Documents automatically categorized
- ✅ Related documents suggested accurately
- ✅ Users click suggested links (>40% click-through)

---

## Related Documentation

- [mem.ai Documentation System Analysis](../../../../dev-docs/2-areas/patterns/ANALYSIS-mem-ai-documentation-system.md)
- [Meetings Module - Decisions](../../meetings/docs/essentials.md#decisions)
- [Inbox Module](../inbox/README.md)
- [Core Module - Tagging](../core/README.md)

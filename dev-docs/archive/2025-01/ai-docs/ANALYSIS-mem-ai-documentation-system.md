# Analysis: mem.ai Documentation System

**Date**: 2025-01-27  
**Purpose**: Analyze mem.ai's "one way to write docs" approach and determine what it takes to build a similar system

---

## What Makes mem.ai Special

### Core Value Proposition

**"One way to write docs. No workspace required. Documents surface when you need them."**

This eliminates the cognitive overhead of:
- Deciding where to save documents
- Creating folder structures
- Maintaining workspace systems
- Remembering where you put things

### Key Features

1. **Zero-Organization Writing**: Just write. No folders, no categories, no manual tagging required.
2. **Intelligent Surfacing**: Documents appear automatically when relevant to your current context.
3. **Semantic Search**: Natural language queries that understand meaning, not just keywords.
4. **AI-Powered Collections**: Automatic categorization into dynamic collections that evolve with your needs.
5. **Contextual Linking**: AI suggests connections between related documents.

---

## Technical Architecture

### Core Components

#### 1. **Vector Embeddings & Semantic Search**

**What it is**: Convert document content into high-dimensional vectors (embeddings) that capture semantic meaning.

**How it works**:
- Each document is processed through an embedding model (e.g., OpenAI `text-embedding-3-small`)
- Embeddings are stored in a vector database (e.g., Pinecone, Qdrant, or pgvector)
- Search queries are also converted to embeddings
- Similarity search finds documents with similar meaning, not just matching keywords

**Example**:
- Document: "How to handle authentication errors in SvelteKit"
- Query: "fix login problems"
- Result: Document surfaces even though no keywords match

#### 2. **Automatic Categorization (Collections)**

**What it is**: AI analyzes document content and automatically assigns it to relevant collections.

**How it works**:
- Extract key topics/themes from document content
- Use embeddings to find similar documents
- Group documents into dynamic collections
- Collections can overlap (document can belong to multiple collections)

**Example**:
- Document about "SvelteKit authentication" automatically appears in:
  - "Authentication" collection
  - "SvelteKit" collection
  - "Error Handling" collection

#### 3. **Context-Aware Surfacing**

**What it is**: Documents appear automatically based on what you're currently working on.

**How it works**:
- Track current context (open files, recent searches, active project)
- Use embeddings to find relevant documents
- Surface documents proactively, not just on search

**Example**:
- Working on authentication code → Related auth docs appear in sidebar
- Writing about design patterns → Pattern documentation surfaces automatically

#### 4. **Intelligent Tagging & Linking**

**What it is**: AI suggests tags and connections between documents.

**How it works**:
- Analyze document content for key concepts
- Suggest relevant tags automatically
- Identify related documents and suggest links
- Learn from user behavior (which tags/links are accepted/rejected)

---

## Current System Analysis

### What We Have

1. **Notes Storage**: `inboxItems` table with notes stored as ProseMirror JSON + markdown
2. **Basic Filtering**: Filter by user, type, processed status, workspace, circle
3. **Manual Organization**: Notes require manual categorization (processed flag, blog category)
4. **Keyword Search**: No semantic search capability
5. **Embeddings Field**: Exists but used for external links (miro, notion, figma), not vector embeddings

### What We're Missing

1. **Vector Embeddings**: No way to generate or store document embeddings
2. **Semantic Search**: No natural language search capability
3. **Automatic Categorization**: No AI-powered collections or auto-tagging
4. **Context Awareness**: No proactive document surfacing
5. **Intelligent Linking**: No automatic relationship detection between documents

---

## What It Takes to Build

### Phase 1: Foundation (Semantic Search)

#### 1.1 Embedding Generation

**Requirements**:
- Embedding model API (OpenAI, Cohere, or open-source like `all-MiniLM-L6-v2`)
- Process documents on create/update
- Store embeddings efficiently

**Implementation**:
```typescript
// convex/embeddings.ts
export const generateEmbedding = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    // Call embedding API
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: args.text
    });
    return embedding.data[0].embedding;
  }
});

// Update note creation to generate embeddings
export const createNoteWithEmbedding = mutation({
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert('inboxItems', { ... });
    
    // Generate embedding from markdown content
    const embedding = await ctx.runAction(api.embeddings.generateEmbedding, {
      text: args.contentMarkdown || extractText(args.content)
    });
    
    // Store embedding (see 1.2)
    await ctx.db.insert('documentEmbeddings', {
      documentId: noteId,
      embedding: embedding,
      model: 'text-embedding-3-small'
    });
    
    return noteId;
  }
});
```

#### 1.2 Vector Storage

**Options**:

**Option A: Convex Vector Search (if available)**
- Native integration with Convex
- Simplest if supported

**Option B: pgvector (PostgreSQL extension)**
- Requires separate PostgreSQL database
- Good performance, industry standard
- Need to sync Convex → PostgreSQL

**Option C: Pinecone/Qdrant (Managed service)**
- Easiest to set up
- Scales automatically
- Additional cost (~$70/month for Pinecone starter)
- Need to sync Convex → Pinecone

**Option D: In-Memory Vector Search (for MVP)**
- Use libraries like `ml-distance` or `@pinecone-database/pinecone`
- Store embeddings in Convex (as arrays)
- Slower for large datasets but works for MVP

**Recommendation**: Start with Option D for MVP, migrate to Option C (Pinecone) for production.

#### 1.3 Semantic Search Query

**Implementation**:
```typescript
// convex/search.ts
export const semanticSearch = query({
  args: {
    sessionId: v.string(),
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // Generate embedding for search query
    const queryEmbedding = await ctx.runAction(api.embeddings.generateEmbedding, {
      text: args.query
    });
    
    // Get all user's document embeddings
    const userNotes = await ctx.db
      .query('inboxItems')
      .withIndex('by_user_type', (q) => q.eq('userId', userId).eq('type', 'note'))
      .collect();
    
    // Calculate cosine similarity for each document
    const results = await Promise.all(
      userNotes.map(async (note) => {
        const docEmbedding = await getDocumentEmbedding(ctx, note._id);
        if (!docEmbedding) return null;
        
        const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
        return { note, similarity };
      })
    );
    
    // Sort by similarity and return top results
    return results
      .filter(r => r !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, args.limit || 10)
      .map(r => r.note);
  }
});
```

### Phase 2: Automatic Categorization

#### 2.1 Topic Extraction

**Requirements**:
- Extract key topics from document content
- Use LLM or keyword extraction
- Store topics for filtering

**Implementation**:
```typescript
// convex/categorization.ts
export const extractTopics = action({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    // Use LLM to extract topics
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Extract 3-5 key topics from this document. Return as JSON array."
      }, {
        role: "user",
        content: args.content
      }]
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
});

// Auto-categorize on note creation
export const autoCategorizeNote = mutation({
  handler: async (ctx, args) => {
    const topics = await ctx.runAction(api.categorization.extractTopics, {
      content: args.contentMarkdown
    });
    
    // Create or link to collections based on topics
    for (const topic of topics) {
      await ensureCollection(ctx, topic, args.noteId);
    }
  }
});
```

#### 2.2 Dynamic Collections

**Requirements**:
- Collections table (or tags repurposed)
- Auto-assign documents to collections
- Allow manual override

**Schema Addition**:
```typescript
// convex/schema.ts
collections: defineTable({
  userId: v.id('users'),
  name: v.string(),
  description: v.optional(v.string()),
  autoGenerated: v.boolean(), // true if AI-generated
  createdAt: v.number()
})
.index('by_user', ['userId']),

collectionDocuments: defineTable({
  collectionId: v.id('collections'),
  documentId: v.id('inboxItems'),
  confidence: v.optional(v.number()), // AI confidence score
  autoAssigned: v.boolean()
})
.index('by_collection', ['collectionId'])
.index('by_document', ['documentId'])
```

### Phase 3: Context-Aware Surfacing

#### 3.1 Context Tracking

**Requirements**:
- Track current context (open files, recent activity)
- Store context embeddings
- Match context to relevant documents

**Implementation**:
```typescript
// Track user context
export const updateUserContext = mutation({
  args: {
    sessionId: v.string(),
    context: v.object({
      openFiles: v.array(v.string()),
      recentSearches: v.array(v.string()),
      activeProject: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    // Generate context embedding
    const contextText = [
      ...args.context.openFiles,
      ...args.context.recentSearches
    ].join(' ');
    
    const contextEmbedding = await ctx.runAction(api.embeddings.generateEmbedding, {
      text: contextText
    });
    
    // Store context
    await ctx.db.patch(userId, {
      currentContext: args.context,
      contextEmbedding: contextEmbedding,
      contextUpdatedAt: Date.now()
    });
  }
});
```

#### 3.2 Proactive Document Surfacing

**Requirements**:
- Query runs periodically or on context change
- Find documents relevant to current context
- Surface in UI (sidebar, suggestions, etc.)

**Implementation**:
```typescript
// convex/surfacing.ts
export const getRelevantDocuments = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    const user = await ctx.db.get(userId);
    if (!user?.contextEmbedding) return [];
    
    // Find documents similar to current context
    const allNotes = await ctx.db
      .query('inboxItems')
      .withIndex('by_user_type', (q) => q.eq('userId', userId).eq('type', 'note'))
      .collect();
    
    // Calculate similarity to context
    const relevant = await Promise.all(
      allNotes.map(async (note) => {
        const docEmbedding = await getDocumentEmbedding(ctx, note._id);
        if (!docEmbedding) return null;
        
        const similarity = cosineSimilarity(user.contextEmbedding, docEmbedding);
        return { note, similarity };
      })
    );
    
    // Return top 5 most relevant
    return relevant
      .filter(r => r !== null && r.similarity > 0.7) // Threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(r => r.note);
  }
});
```

### Phase 4: Intelligent Linking

#### 4.1 Relationship Detection

**Requirements**:
- Analyze document content for relationships
- Suggest links between related documents
- Learn from user behavior

**Implementation**:
```typescript
// convex/linking.ts
export const findRelatedDocuments = query({
  args: {
    sessionId: v.string(),
    documentId: v.id('inboxItems')
  },
  handler: async (ctx, args) => {
    const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
    
    const document = await ctx.db.get(args.documentId);
    if (!document || document.type !== 'note') return [];
    
    const docEmbedding = await getDocumentEmbedding(ctx, args.documentId);
    if (!docEmbedding) return [];
    
    // Find similar documents
    const allNotes = await ctx.db
      .query('inboxItems')
      .withIndex('by_user_type', (q) => q.eq('userId', userId).eq('type', 'note'))
      .collect();
    
    const related = await Promise.all(
      allNotes
        .filter(n => n._id !== args.documentId)
        .map(async (note) => {
          const noteEmbedding = await getDocumentEmbedding(ctx, note._id);
          if (!noteEmbedding) return null;
          
          const similarity = cosineSimilarity(docEmbedding, noteEmbedding);
          return { note, similarity };
        })
    );
    
    return related
      .filter(r => r !== null && r.similarity > 0.75)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(r => r.note);
  }
});
```

---

## Implementation Roadmap

### MVP (Phase 1): Semantic Search

**Goal**: Enable natural language search of documents

**Tasks**:
1. Set up embedding generation (OpenAI API)
2. Store embeddings in Convex (as arrays)
3. Implement cosine similarity search
4. Add semantic search UI component
5. Test with existing notes

**Timeline**: 1-2 weeks  
**Cost**: ~$10-20/month (OpenAI API for embeddings)

### Phase 2: Auto-Categorization

**Goal**: Automatically categorize documents into collections

**Tasks**:
1. Implement topic extraction
2. Create collections system
3. Auto-assign documents to collections
4. UI for viewing collections
5. Allow manual override

**Timeline**: 1 week  
**Cost**: ~$5-10/month (GPT-4o-mini for topic extraction)

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

### Phase 4: Intelligent Linking

**Goal**: Automatically suggest connections between documents

**Tasks**:
1. Implement relationship detection
2. Create document linking system
3. Add UI for related documents
4. Learn from user behavior (which links are clicked)

**Timeline**: 1 week  
**Cost**: Minimal (uses existing embedding infrastructure)

---

## Technical Stack Recommendations

### Embedding Model

**Option 1: OpenAI `text-embedding-3-small`** (Recommended)
- **Pros**: High quality, fast, reliable
- **Cons**: Cost (~$0.02 per 1M tokens)
- **Best for**: Production use

**Option 2: OpenAI `text-embedding-3-large`**
- **Pros**: Better quality for complex documents
- **Cons**: More expensive (~$0.13 per 1M tokens)
- **Best for**: Complex technical documentation

**Option 3: Cohere `embed-english-v3.0`**
- **Pros**: Good quality, competitive pricing
- **Cons**: Less common, smaller ecosystem
- **Best for**: Cost-sensitive production

**Option 4: Open-source (e.g., `all-MiniLM-L6-v2`)**
- **Pros**: Free, no API limits
- **Cons**: Lower quality, requires self-hosting
- **Best for**: MVP or privacy-sensitive use cases

### Vector Database

**For MVP**: Store in Convex as arrays, use in-memory similarity search  
**For Production**: Migrate to Pinecone or pgvector

### LLM for Topic Extraction

**Recommended**: GPT-4o-mini
- Fast and cheap (~$0.15 per 1M input tokens)
- Good enough quality for topic extraction
- Reliable API

---

## Cost Estimates

### Monthly Costs (1000 documents, ~100K tokens each)

| Component | Cost |
|-----------|------|
| Embedding Generation (initial) | $2 |
| Embedding Updates (10% change rate) | $0.20 |
| Semantic Search (100 queries/month) | $0.02 |
| Topic Extraction (1000 docs) | $1.50 |
| **Total** | **~$3.72/month** |

### Scaling Costs

- **10,000 documents**: ~$37/month
- **100,000 documents**: ~$370/month
- **1M documents**: ~$3,700/month

**Note**: Costs scale linearly with document count and query volume.

---

## Key Design Decisions

### 1. When to Generate Embeddings

**Option A: On Create/Update** (Recommended)
- Pros: Always up-to-date, immediate searchability
- Cons: Slight delay on save

**Option B: Background Job**
- Pros: Non-blocking saves
- Cons: Delay before searchable, more complex

**Recommendation**: Generate on create/update, show loading state if needed.

### 2. Embedding Storage

**Option A: In Convex** (MVP)
- Pros: Simple, no external dependencies
- Cons: Limited by Convex document size limits

**Option B: External Vector DB** (Production)
- Pros: Optimized for vector search, scales better
- Cons: Additional infrastructure, sync complexity

**Recommendation**: Start with Convex, migrate to Pinecone when needed.

### 3. Search Strategy

**Option A: Pure Semantic** (Recommended)
- Pros: Best relevance, understands meaning
- Cons: Can miss exact keyword matches

**Option B: Hybrid (Semantic + Keyword)**
- Pros: Best of both worlds
- Cons: More complex, need to combine results

**Recommendation**: Start with pure semantic, add keyword fallback if needed.

### 4. Collection Strategy

**Option A: Auto-Generated Only**
- Pros: Zero manual work
- Cons: Less control, may create too many collections

**Option B: Hybrid (Auto + Manual)**
- Pros: Best of both worlds
- Cons: More complex UI

**Recommendation**: Auto-generate, allow manual override and creation.

---

## Success Metrics

### Phase 1 (Semantic Search)
- ✅ Can find documents using natural language queries
- ✅ Search results are relevant (>80% relevance)
- ✅ Search completes in <500ms

### Phase 2 (Auto-Categorization)
- ✅ Documents automatically categorized
- ✅ Collections are useful (>70% user acceptance)
- ✅ No manual workspace required

### Phase 3 (Context-Aware Surfacing)
- ✅ Relevant documents surface automatically
- ✅ Users find surfaced documents helpful (>60% click-through)
- ✅ Reduces need for manual search

### Phase 4 (Intelligent Linking)
- ✅ Related documents suggested accurately
- ✅ Users click suggested links (>40% click-through)
- ✅ Knowledge graph forms organically

---

## Risks & Mitigations

### Risk 1: Embedding Quality
**Mitigation**: Test with diverse document types, tune model selection

### Risk 2: Cost Scaling
**Mitigation**: Monitor usage, implement caching, consider open-source models

### Risk 3: Privacy Concerns
**Mitigation**: Use open-source models or ensure API provider compliance

### Risk 4: Performance at Scale
**Mitigation**: Migrate to dedicated vector DB when needed, implement pagination

### Risk 5: User Adoption
**Mitigation**: Make it opt-in initially, show clear value, allow fallback to manual workspace

---

## Conclusion

Building a mem.ai-like system requires:

1. **Semantic Search Foundation** (Phase 1)
   - Embedding generation
   - Vector storage
   - Similarity search

2. **Intelligent Organization** (Phase 2)
   - Auto-categorization
   - Dynamic collections

3. **Proactive Surfacing** (Phase 3)
   - Context tracking
   - Relevant document discovery

4. **Knowledge Graph** (Phase 4)
   - Relationship detection
   - Intelligent linking

**Total Effort**: ~4-5 weeks  
**Total Cost**: ~$4-40/month (depending on scale)  
**Key Benefit**: Zero-workspace documentation system where documents surface when needed

The core insight: **Don't organize documents. Let the system understand them and surface them when relevant.**


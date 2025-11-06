# Axon: Product Vision, Strategy & Development Plan

## 🎯 Product Vision

**Problem Statement:**
Learning a lot and consuming lots of content (books, Kindle, web articles, job experience) but struggling to retain information. Focus is on building organizations that can build champions league level products - need to improve processes, flow, collaboration, and everything related to product development.

**Core Value Proposition:**
Axon helps users collect, organize, distill, and express knowledge from diverse sources into actionable learning tools (primarily flashcards, but also notes, templates, frameworks, how-to guides).

## 🗺️ Core Workflow: CODE Framework

**Collect → Organise → Distill → Express**

1. **Collect**: Gather information from multiple sources
2. **Organise**: Review and categorize in an "inbox" (user reviews before processing)
3. **Distill**: Extract key insights (currently: AI-powered flashcard generation)
4. **Express**: Study and use the distilled content (flashcards, notes, templates, etc.)

## 📊 Architecture Principles

### Universal Inbox System
- **Core Concept**: A unified inbox that receives content from ANY source
- **User Review**: Every item must be reviewed by user before AI processing (to avoid wasting tokens on irrelevant data)
- **Scalable**: Designed to handle 100+ different content types (messages, notifications, updates, etc.)
- **Source-Agnostic**: Inbox is content-type agnostic; each source type has its own detail view

### Polymorphic Data Model
- Using discriminated unions in database schema
- Each content type (Readwise highlight, photo note, manual text) stored with type discriminator
- Different detail views for each type in the UI

### Output Flexibility
- **Flashcards**: Primary output (for now)
- **Future Outputs**: Notes, templates, frameworks, vector search results
- **Organized by**: Categories/topics (supporting nested topics)

## 🎨 UI/UX Vision

### Three-Column Layout (Linear-style)
- **Left**: Navigation sidebar (collapsible, resizable)
- **Middle**: Inbox list (narrow: 175-250px, resizable)
- **Right**: Detail panel (takes most space, dynamic based on content type)

### Design System
- **Approach**: Semantic design tokens (spacing, colors, typography)
- **Token-based**: All spacing/colors use semantic tokens that adapt to light/dark mode
- **Scalable**: Change once in CSS variables, updates everywhere
- **Documentation**: See `dev-docs/design-tokens.md`

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript
- **UI**: Bits UI (headless) + Tailwind CSS v4
- **Backend**: Convex (real-time database, serverless functions)
- **AI**: Claude (primary), OpenRouter (future option)
- **Mobile**: Capacitor 7 (iOS configured)
- **Email**: Resend

## 📋 Updated Development Plan

### Phase 1: UI/UX with Mock Data ✅ COMPLETE
**Goal**: Validate workflow and user experience before backend integration

**Completed:**
- ✅ Three-column inbox layout (Linear-style)
- ✅ Resizable sidebar with hover-to-reveal
- ✅ Resizable inbox column
- ✅ Polymorphic source detail views (Readwise, Photo, Manual)
- ✅ Flashcard review modal with study interface
- ✅ Full CODE workflow with mock data
- ✅ Design token system (spacing, colors, typography)
- ✅ Light/dark mode theming system

### Phase 2: Flashcard Creation & Storage (CURRENT FOCUS)
**Goal**: AI-powered flashcard generation from inbox items and storage in database

**Key Separation of Concerns:**
- **Flashcard Creation**: Generate flashcards from inbox items via AI (this phase)
- **Study Sessions**: Review and study flashcards using SRS algorithms (Phase 3+)

**Tasks:**
1. **Enhanced Convex Schema Design**
   - ✅ `userSettings` (already exists)
   - ✅ `inboxItems` (already exists, polymorphic)
   - ⏳ `flashcards` table (needs SRS algorithm support)
   - ⏳ `flashcardTags` (many-to-many with tags)
   - ⏳ `flashcardReviews` (review history for SRS)
   - ⏳ `studySessions` (future: track study sessions)
   - ⏳ `userAlgorithmSettings` (algorithm selection per user)

2. **Settings Page**
   - `/settings` route
   - Readwise API key input (secure storage in Convex)
   - Theme preference (already has UI, needs Convex sync)

3. **Readwise Integration**
   - Readwise API client (Convex action)
   - Fetch highlights and populate inbox
   - Manual sync trigger
   - Automatic sync option (future)

4. **Inbox Connection**
   - Replace mock data with Convex queries
   - Real-time updates via Convex subscriptions
   - User review/approve workflow
   - Filtering by source type

### Phase 2A: AI Flashcard Generation (Current Priority)
**Goal**: Generate flashcards from approved inbox items using AI

**Tasks:**
1. **Claude Integration**
   - Convex action for Claude API calls
   - Prompt engineering for flashcard generation (JSON output format)
   - Batch processing option
   - Error handling and retry logic

2. **Flashcard Creation Workflow**
   - User selects inbox item → clicks "Generate Flashcard"
   - AI generates flashcards (1-N cards per item)
   - User reviews in modal (Phase 1 UI complete)
   - User approves/rejects cards
   - Approved cards stored in database with tags
   - Inbox item marked as "processed" (or archived)

3. **Tagging System Integration**
   - Flashcards inherit tags from source inbox item
   - User can add/remove tags during review
   - Tags stored in `flashcardTags` junction table
   - Support hierarchical tags (already in schema)

4. **Inbox Item Lifecycle**
   - **Unprocessed**: New item in inbox, awaiting review
   - **Tagged** (optional): User adds tags during organize phase
   - **Action Required**: User decides to create flashcard OR archive
   - **Processed**: Flashcard created OR item archived
   - **Archived**: Item removed from active inbox (kept for history)

### Phase 3: Study Session System (Future)
**Goal**: Implement spaced repetition study sessions

**Prerequisites**: Phase 2 complete (flashcards in database)

**Tasks:**
1. **Study Session Loading**
   - Efficient querying for large datasets (10,000+ cards)
   - Default session size: 10 cards (user-configurable in settings)
   - Algorithm-based card selection (due cards, new cards, etc.)
   - Index optimization for performance
   - Pagination/cursor-based loading to minimize database costs

2. **Spaced Repetition Algorithm Integration**
   - Algorithm selection: FSRS (recommended), Anki2, or custom
   - User-configurable algorithm per deck/category
   - Feature flags for A/B testing algorithm effectiveness
   - Algorithm-specific data structures in schema

3. **Review Interface**
   - Single-card study mode (Phase 1 UI foundation)
   - Rating system: Again/Hard/Good/Easy (not Approve/Reject)
   - Visual feedback for ratings
   - Progress tracking
   - Session statistics

4. **Review History & Analytics**
   - Store review logs with ratings
   - Calculate next review date based on algorithm
   - Track accuracy, time per card
   - Analytics dashboard

### Phase 4: Additional Sources & Features
**Goal**: Expand input sources and outputs

**Tasks:**
1. **Photo Input**
   - Photo capture/upload
   - OCR/vision AI for text extraction
   - Convert to inbox item for review

2. **Manual Input**
   - Direct text input to inbox
   - Rich text editor option

3. **Additional Outputs**
   - Notes generation
   - Template creation
   - Framework extraction

## ✅ What We've Accomplished

### Design Token System (Major Achievement)
- **Semantic Spacing Tokens**: 14 tokens (px-nav-item, py-nav-item, gap-icon, etc.)
- **Semantic Color Tokens**: 10 tokens (bg-sidebar, text-sidebar-primary, etc.)
- **Typography Tokens**: text-label custom size
- **Auto Light/Dark Mode**: Colors adapt automatically via CSS custom properties
- **Global Control**: Change one CSS variable, updates everywhere
- **Documentation**: Complete reference in `dev-docs/design-tokens.md`
- **Enforcement**: Rules in `.cursor/rules/way-of-working.mdc`

### UI Components
- **Sidebar**: Fully functional with resizable, collapsible, hover-to-reveal
- **ResizableSplitter**: Reusable component for dynamic layouts
- **WorkspaceMenu**: Dropdown with theme toggle (Bits UI Switch)
- **SidebarHeader**: Sticky header with search/edit buttons
- **Inbox UI**: Three-column layout with source-specific detail views
- **Flashcard UI**: Basic list and study interface

### Theme System
- **Theme Store**: Svelte store with localStorage persistence
- **FOUC Prevention**: Inline script in app.html
- **Workspace Menu Toggle**: Bits UI Switch component
- **Future Ready**: Documented Convex sync approach in `dev-docs/theme-sync.md`

## 📍 Current State

### What Works
- ✅ Complete sidebar navigation system
- ✅ Three-column inbox layout with mock data
- ✅ Design token system (fully functional)
- ✅ Light/dark mode (persistent, app-wide)
- ✅ Responsive mobile considerations
- ✅ Component architecture (reusable, modular)

### What's Mocked
- ⚠️ Inbox items (mock data in component state)
- ⚠️ Flashcards (mock data array)
- ⚠️ Readwise highlights (hardcoded sample data)
- ⚠️ Categories (hardcoded list)

### What's Missing
- ❌ Convex schema for data storage
- ❌ Readwise API integration
- ❌ Settings page
- ❌ Real data queries/subscriptions
- ❌ AI flashcard generation
- ❌ Category management
- ❌ Photo capture/upload

## 🎯 Recommended Next Steps (Broken Into Focused Tasks)

### Task 1: Convex Schema Design & Setup
**Scope**: Database foundation
- Design schema for inboxItems, flashcards, categories, userSettings
- Implement discriminated unions for polymorphic inbox items
- Add indexes for queries
- Test with sample data insertion

**Deliverable**: Schema file with types, working Convex queries

---

### Task 2: Settings Page & User Preferences
**Scope**: Settings UI + Convex storage
- Create `/settings` route
- Build Readwise API key input form
- Store API key securely in Convex userSettings
- Sync theme preference to Convex (extend existing theme store)
- Form validation and error handling

**Deliverable**: Functional settings page with secure API key storage

---

### Task 3: Readwise API Integration
**Scope**: Backend integration
- Create Convex action for Readwise API
- Fetch highlights endpoint
- Transform Readwise data to inboxItem format
- Manual sync button in UI
- Error handling and rate limiting

**Deliverable**: Ability to import Readwise highlights into inbox

---

### Task 4: Connect Inbox to Convex
**Scope**: Replace mock data with real queries
- Replace mock inboxItems with Convex query
- Real-time subscriptions for live updates
- Filtering by source type (Convex query filters)
- Review/approve workflow (mutation to mark as reviewed)

**Deliverable**: Inbox shows real data with real-time updates

---

### Task 5: AI Flashcard Generation (Claude)
**Scope**: AI integration
- Convex action for Claude API
- Prompt engineering for flashcard generation
- Batch processing for multiple highlights
- Error handling and retry logic
- Store generated flashcards in Convex

**Deliverable**: Generate flashcards from selected inbox items

---

### Task 6: Category Management
**Scope**: Organization system
- CRUD operations for categories
- Nested topic support
- UI for creating/editing categories
- Category assignment during flashcard creation
- Category filtering in flashcard view

**Deliverable**: Full category management system

---

### Task 7: Photo Input & OCR
**Scope**: Additional input source
- Photo capture/upload UI
- Image processing (Convex action)
- OCR/vision AI integration
- Convert extracted text to inbox item
- Review workflow for photo notes

**Deliverable**: Photo capture → inbox item workflow

---

### Task 8: Flashcard Study Interface Enhancement
**Scope**: Improve learning experience
- Spaced repetition algorithm
- Study session tracking
- Progress indicators
- Better card flip animations
- Mobile-optimized study mode

**Deliverable**: Enhanced flashcard study experience

## 📚 Key Files Reference

### Documentation
- `dev-docs/design-tokens.md` - Complete design token reference
- `dev-docs/architecture.md` - Tech stack & authentication details
- `dev-docs/theme-sync.md` - Theme sync to Convex guide
- `dev-docs/product-vision-and-plan.md` - This file

### Rules & Guidelines
- `.cursor/rules/way-of-working.mdc` - **CRITICAL**: Token usage rules (ALWAYS check)

### Core Components
- `src/lib/components/Sidebar.svelte` - Main sidebar component
- `src/lib/components/sidebar/SidebarHeader.svelte` - Sidebar header
- `src/lib/components/sidebar/WorkspaceMenu.svelte` - Workspace dropdown
- `src/lib/components/ResizableSplitter.svelte` - Resizable panel component
- `src/routes/inbox/+page.svelte` - Inbox UI (currently uses mock data)
- `src/routes/flashcards/+page.svelte` - Flashcard UI (currently uses mock data)

### Design System
- `src/app.css` - **ALL DESIGN TOKENS HERE** (spacing, colors, typography)
- `src/lib/stores/theme.ts` - Theme management store

### Backend (Convex)
- `convex/schema.ts` - Database schema (needs to be created/expanded)
- `convex/auth.ts` - Authentication setup
- `convex/http.ts` - HTTP routes

## 🚀 How to Continue

### For Next Chat Session

1. **Start with this document** - It captures everything
2. **Reference key files** - Check `dev-docs/design-tokens.md` and `.cursor/rules/way-of-working.mdc`
3. **Pick a focused task** - Start with Task 1 (Convex Schema)
4. **Follow the plan** - Each task is scoped and has clear deliverables

### Starting Prompt Example

> "I'm continuing work on Axon. We've completed Phase 1 (UI/UX with mock data) and built a design token system. See `dev-docs/product-vision-and-plan.md` for full context. Let's start with Task 1: Convex Schema Design. Review the current schema and plan the inboxItems, flashcards, and categories tables with polymorphic support."

### Important Reminders

- **ALWAYS use design tokens** - Check `way-of-working.mdc` rules
- **Follow CODE workflow** - Collect → Organise → Distill → Express
- **User reviews before AI** - Don't auto-process, save tokens
- **Scalable architecture** - Inbox handles 100+ content types
- **Mobile-first** - Consider mobile in all UI work

## 🎨 Design Token Quick Reference

**Spacing**: Use `px-nav-item`, `py-nav-item`, `gap-icon`, etc. (NOT `px-2`, `py-1.5`)
**Colors**: Use `bg-sidebar`, `text-sidebar-primary`, etc. (NOT `bg-gray-900`, `text-white`)
**Typography**: Use `text-label` (NOT `text-[10px]`)

**See**: `dev-docs/design-tokens.md` for complete reference
**See**: `src/app.css` for all token definitions

## 🗄️ Data Structure Considerations

### Flashcard Schema Design

**Core Flashcard Table:**
```typescript
flashcards: defineTable({
  userId: v.id("users"),
  question: v.string(),
  answer: v.string(),
  sourceInboxItemId: v.optional(v.id("inboxItems")), // Link to source
  sourceType: v.optional(v.string()), // "readwise_highlight", "photo_note", etc.
  // SRS Algorithm Support
  algorithm: v.string(), // "fsrs", "anki2", "custom" (user-selectable)
  // FSRS-specific fields (if algorithm = "fsrs")
  fsrsStability: v.optional(v.number()),
  fsrsDifficulty: v.optional(v.number()),
  fsrsDue: v.optional(v.number()), // Next review timestamp
  fsrsState: v.optional(v.union(
    v.literal("new"),
    v.literal("learning"),
    v.literal("review"),
    v.literal("relearning")
  )),
  // Anki2-specific fields (if algorithm = "anki2")
  ankiEase: v.optional(v.number()),
  ankiInterval: v.optional(v.number()),
  ankiDue: v.optional(v.number()),
  // Common fields
  reps: v.number(), // Total reviews
  lapses: v.number(), // Times forgotten
  lastReviewAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_algorithm", ["userId", "algorithm"])
  .index("by_user_due", ["userId", "algorithm", "fsrsDue"]) // For FSRS
  .index("by_user_anki_due", ["userId", "algorithm", "ankiDue"]) // For Anki2
  .index("by_source", ["sourceInboxItemId"])
```

**Review History Table:**
```typescript
flashcardReviews: defineTable({
  flashcardId: v.id("flashcards"),
  userId: v.id("users"),
  rating: v.union(
    v.literal("again"), // Rating.Again
    v.literal("hard"),  // Rating.Hard
    v.literal("good"),  // Rating.Good
    v.literal("easy")   // Rating.Easy
  ),
  algorithm: v.string(), // Which algorithm was used
  reviewTime: v.number(), // Time spent (seconds)
  reviewedAt: v.number(), // Timestamp
  // Algorithm-specific review data
  fsrsLog: v.optional(v.object({
    stability: v.number(),
    difficulty: v.number(),
    scheduledDays: v.number(),
  })),
})
  .index("by_flashcard", ["flashcardId"])
  .index("by_user", ["userId"])
  .index("by_user_reviewed", ["userId", "reviewedAt"])
```

**User Algorithm Settings:**
```typescript
userAlgorithmSettings: defineTable({
  userId: v.id("users"),
  defaultAlgorithm: v.string(), // "fsrs" | "anki2" | "custom"
  fsrsParams: v.optional(v.object({
    // FSRS parameters (customizable)
    enableFuzz: v.boolean(),
    maximumInterval: v.number(),
    // ... other FSRS params
  })),
  anki2Params: v.optional(v.object({
    // Anki2 parameters
    initialFactor: v.number(),
    // ... other Anki2 params
  })),
  // Feature flags for A/B testing
  algorithmFeatureFlags: v.optional(v.object({
    testFSRS: v.boolean(),
    testAnki2: v.boolean(),
    // ... other flags
  })),
})
  .index("by_user", ["userId"])
```

**Flashcard Tags (Many-to-Many):**
```typescript
flashcardTags: defineTable({
  flashcardId: v.id("flashcards"),
  tagId: v.id("tags"),
})
  .index("by_flashcard", ["flashcardId"])
  .index("by_tag", ["tagId"])
  .index("by_flashcard_tag", ["flashcardId", "tagId"])
```

### Study Session Loading Strategy

**Problem**: With 10,000+ cards, loading all cards is inefficient and expensive.

**Solution**: Query only cards needed for current session

**Efficient Query Pattern:**
```typescript
// Get next 10 cards due for review (FSRS example)
const getDueCards = query({
  args: {
    userId: v.id("users"),
    algorithm: v.string(),
    limit: v.number(), // Default: 10, user-configurable
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("flashcards")
      .withIndex("by_user_due", (q) =>
        q.eq("userId", args.userId)
         .eq("algorithm", args.algorithm)
         .lte("fsrsDue", now) // Only due cards
      )
      .order("asc") // Oldest due first
      .take(args.limit); // Limit to session size
  },
});
```

**Performance Optimizations:**
- Use indexes on `(userId, algorithm, dueDate)` for efficient queries
- Limit query results to session size (default 10)
- Cache algorithm parameters in user settings
- Use cursor-based pagination for very large result sets
- Consider materialized views for complex queries

## 🤔 Open Questions & Decisions Needed

### Algorithm Selection

**Question**: Which SRS algorithm(s) should we support?

**Options:**
1. **FSRS (Free Spaced Repetition Scheduler)** - Recommended
   - Modern, ML-optimized
   - TypeScript library available (`ts-fsrs`)
   - Better than Anki2 for most users
   - **Decision**: ✅ Primary algorithm

2. **Anki2** - Legacy support
   - Well-known, proven
   - Users familiar with Anki
   - **Decision**: ⏳ Secondary option (user-selectable)

3. **Custom Algorithm**
   - Future: allow users to define custom algorithms
   - **Decision**: ⏳ Future feature

**Recommendation**: Start with FSRS, add Anki2 as option, allow user to switch per deck/category.

**Feature Flags for Testing:**
- Allow A/B testing between algorithms
- Track effectiveness metrics
- User can opt-in to algorithm testing

### Inbox Item Lifecycle

**Question**: When is an inbox item "done"?

**Current Understanding:**
1. **Unprocessed**: New item in inbox
2. **Tagged** (optional): User adds tags during organize phase
3. **Action Required**: User decides:
   - **Option A**: Create flashcard(s) → Item marked as "processed"
   - **Option B**: Archive item → Item marked as "archived"
4. **Processed/Archived**: Removed from active inbox

**Open Questions:**
- Should tagging be required before creating flashcards?
- Can items be processed multiple times (create flashcards, then archive later)?
- Should we track "flashcards created from this item" count?
- Do we need an "archive" status or just "processed"?

**Recommendation**: 
- Tagging is optional (user can skip organize phase)
- Items can have multiple actions (create flashcards AND archive)
- Track `flashcardsCreatedCount` on inbox items
- Use `processed: true` for "done", add `archived: boolean` for explicit archiving

### Tagging System

**Question**: How should tags work across inbox items and flashcards?

**Current Schema**: Tags table exists, junction tables for sources/highlights

**Decisions Needed:**
1. **Flashcard Tags**: 
   - ✅ Flashcards inherit tags from source inbox item
   - ✅ User can add/remove tags during review
   - ✅ Tags stored in `flashcardTags` junction table

2. **Inbox Item Tags**:
   - ✅ Inbox items can have tags (via source/highlight tags)
   - ✅ User can add tags during organize phase
   - ⏳ Should we add direct `inboxItemTags` table? (Currently via source/highlight)

3. **Tag Hierarchy**:
   - ✅ Already supported in schema (`parentId` field)
   - ⏳ UI for hierarchical tag management

**Recommendation**: 
- Use existing tag system (tags table + junction tables)
- Add `inboxItemTags` if needed for direct tagging
- Support tag inheritance: inbox item → flashcard

### Study Session Defaults

**Question**: What should be the default session size and behavior?

**Decisions:**
- ✅ Default session size: **10 cards** (user-configurable in settings)
- ⏳ Default algorithm: **FSRS** (user can change)
- ⏳ Session behavior: Show only due cards, or mix new + due?
- ⏳ Should sessions be time-limited or card-limited?

**Recommendation**:
- Default: 10 cards, FSRS algorithm, due cards only
- User can configure in settings
- Future: "Study for 15 minutes" mode

## 🏁 Success Criteria for MVP

### Minimum Viable Product (MVP) - Phase 2 Focus
1. ✅ Universal inbox UI (DONE)
2. ⏳ Readwise highlights import
3. ⏳ User review workflow (tagging optional)
4. ⏳ AI flashcard generation (Claude) with review modal
5. ⏳ Flashcard storage in database with tags
6. ⏳ Inbox item lifecycle (processed/archived)

### Phase 3: Study System (Future)
7. ⏳ Study session loading (efficient queries)
8. ⏳ FSRS algorithm integration
9. ⏳ Rating system (Again/Hard/Good/Easy)
10. ⏳ Review history tracking

### Beyond MVP
- Photo input & OCR
- Additional output types (notes, templates)
- Anki2 algorithm support
- Algorithm A/B testing
- Vector search
- Cross-device sync

---

**Last Updated**: January 2025
**Status**: Phase 1 Complete, Phase 2A (Flashcard Creation) In Progress

## 📚 Related Documentation

- `dev-docs/flashcard-review-optimization-analysis.md` - Detailed UX improvements for study system
- `dev-docs/architecture.md` - Tech stack and authentication details
- `dev-docs/design-tokens.md` - Design system reference
- `convex/schema.ts` - Current database schema


# SynergyOS: Product Vision, Strategy & Development Plan

**OS = Open Source**

## 🎯 Product Vision

**Problem Statement:**
Learning a lot and consuming lots of content (books, Kindle, web articles, job experience) but struggling to retain information. Focus is on building organizations that can build champions league level products - need to improve processes, flow, collaboration, and everything related to product development.

**Core Value Proposition:**
SynergyOS helps users collect, organize, distill, and express knowledge from diverse sources into actionable learning tools (flashcards, rich notes, templates, frameworks, how-to guides). Built as an open source side project, evolving through real-world usage and community collaboration.

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

### Future Architecture: Multi-Tenancy & Multiple Accounts

**Status**: Architecture future-proofed, implementation deferred

**Multi-Tenancy Vision** (Future):
- Organizations and teams can share content
- Users can be part of multiple organizations and teams
- Content ownership: user-owned, organization-owned, team-owned, or purchased
- Training bundles can be created and sold/bought (individual or team-based)

**Current Approach**: Minimal future-proofing
- Schema includes nullable `organizationId`, `teamId`, and `ownershipType` fields
- Permission helper patterns created (stub functions, user-scoped for now)
- All queries remain user-scoped (no breaking changes)
- Migration path documented for when multi-tenancy is validated

**Multiple Accounts Vision** (Future):
- Users can login with multiple email accounts (personal + work)
- Account switcher UI (like Linear/Slack)
- Each account can belong to different organizations
- Switch between accounts via menu bar

**Why Deferred**:
- Current architecture already supports multiple accounts (each email = separate `userId`)
- No schema changes needed now - add account linking table when implementing
- Low migration cost (~1-2 days when needed)
- Focus on Phase 3 (study system) is priority

**When to Implement**:
- Multi-tenancy: When organizations/teams are validated as needed
- Multiple accounts: Before public launch or when users request it

**See**: `dev-docs/2-areas/multi-tenancy-migration.md` for detailed migration guide

## 🎨 UI/UX Vision

### Three-Column Layout (Linear-style)
- **Left**: Navigation sidebar (collapsible, resizable)
- **Middle**: Inbox list (narrow: 175-250px, resizable)
- **Right**: Detail panel (takes most space, dynamic based on content type)

### Design System
- **Approach**: Semantic design tokens (spacing, colors, typography)
- **Token-based**: All spacing/colors use semantic tokens that adapt to light/dark mode
- **Scalable**: Change once in CSS variables, updates everywhere
- **Documentation**: See `dev-docs/2-areas/design-tokens.md`

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

### Phase 2: Flashcard Creation & Storage ✅ NEARLY COMPLETE
**Goal**: AI-powered flashcard generation from inbox items and storage in database

**Key Separation of Concerns:**
- **Flashcard Creation**: Generate flashcards from inbox items via AI (✅ 95% Complete)
- **Study Sessions**: Review and study flashcards using SRS algorithms (Phase 3+)

**Tasks:**
1. ✅ **Enhanced Convex Schema Design** (COMPLETE)
   - ✅ `userSettings` (already exists)
   - ✅ `inboxItems` (already exists, polymorphic)
   - ✅ `flashcards` table (with FSRS algorithm support)
   - ✅ `flashcardTags` (many-to-many with tags - schema ready)
   - ✅ `flashcardReviews` (review history for SRS)
   - ⏳ `studySessions` (future: track study sessions)
   - ✅ `userAlgorithmSettings` (algorithm selection per user)

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

### Phase 2A: AI Flashcard Generation ✅ MOSTLY COMPLETE
**Goal**: Generate flashcards from approved inbox items using AI

**Status**: 95% Complete - Only tagging integration remaining

**Completed Tasks:**
1. ✅ **Claude Integration**
   - ✅ Convex action for Claude API calls (`api.flashcards.generateFlashcard`)
   - ✅ Prompt engineering with XML templates and variable interpolation
   - ✅ Prompt management system (TypeScript exports, no file system access)
   - ✅ Error handling and retry logic
   - ✅ JSON output format parsing (handles arrays and single objects)

2. ✅ **Flashcard Creation Workflow**
   - ✅ User selects inbox item → clicks "Generate Flashcard" button
   - ✅ AI generates flashcards (1-3 cards per item)
   - ✅ User reviews in modal (Phase 1 UI complete)
   - ✅ User approves/rejects cards (keyboard shortcuts: ArrowLeft/Right)
   - ✅ Approved cards stored in database with FSRS initialization
   - ✅ Inbox item marked as "processed" after flashcard creation
   - ✅ Queue-based card removal (Tinder-like UX)
   - ✅ Visual feedback for user actions

3. ✅ **Database Integration**
   - ✅ `flashcards` table with FSRS algorithm support
   - ✅ `flashcardReviews` table for review history
   - ✅ `userAlgorithmSettings` table for algorithm preferences
   - ✅ FSRS state conversion functions (enum ↔ string)
   - ✅ Flashcard creation mutations (`createFlashcard`, `createFlashcards`)

4. ✅ **Inbox Item Lifecycle**
   - ✅ **Unprocessed**: New item in inbox, awaiting review
   - ✅ **Processed**: Flashcard created → item marked as processed
   - ✅ `markProcessed` mutation implemented
   - ✅ Processed items filtered from active inbox view

**Remaining Tasks:**
1. ⏳ **Tagging System Integration** (Last 5%)
   - ⏳ Flashcards inherit tags from source inbox item
   - ⏳ User can add/remove tags during flashcard review
   - ⏳ Tags stored in `flashcardTags` junction table
   - ⏳ Support hierarchical tags (schema ready, UI needed)

### Phase 3: Study Session System (NEXT PHASE)
**Goal**: Implement spaced repetition study sessions

**Prerequisites**: Phase 2A complete (flashcards in database) ✅ Ready
**Status**: Can start after tagging integration (or start in parallel)

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
- ✅ Three-column inbox layout with real Convex data
- ✅ Design token system (fully functional)
- ✅ Light/dark mode (persistent, app-wide)
- ✅ Responsive mobile considerations
- ✅ Component architecture (reusable, modular)
- ✅ AI flashcard generation (Claude API integration)
- ✅ Flashcard storage in database (FSRS algorithm support)
- ✅ Inbox item lifecycle (mark as processed)
- ✅ Real-time data updates (Convex useQuery subscriptions)
- ✅ Prompt management system (TypeScript exports)
- ✅ Convex API naming conventions (file = module, function = action)

### What's Complete
- ✅ Convex schema for data storage (flashcards, reviews, settings)
- ✅ Real data queries/subscriptions (useQuery for real-time updates)
- ✅ AI flashcard generation (Claude with prompt templates)
- ✅ Flashcard review UI (keyboard shortcuts, queue-based removal)
- ✅ FSRS algorithm integration (state conversion, card initialization)

### What's Remaining
- ⏳ Tagging system integration (inherit tags from inbox items to flashcards)
- ⏳ Readwise API integration (Phase 2B - future)
- ⏳ Settings page (API key management)
- ⏳ Category management UI
- ⏳ Photo capture/upload
- ⏳ Study session system (Phase 3)

## 🚀 Current Focus: Notes System & Blog Workflow

### Phase 2B: Rich Note-Taking System (In Progress)
**Status**: Building comprehensive note system with ProseMirror

**Features**:
- Rich text editor with Notion-like feel
- AI content detection and tagging
- Blog content workflow (`/ai-content-blog/`)
- Hotkey-driven create menu (C key)
- Markdown export with frontmatter
- Embedding support (Miro, Figma, Linear, Notion)

**Definition of Done**: First blog post "Rebirth of SynergyOS" created and in inbox

---

### Next: Complete Phase 2A (Tagging Integration)
**Status**: 95% Complete - Only tagging remaining

**Task**: Tagging System Integration
- Inherit tags from inbox items when creating flashcards
- Allow tag editing during flashcard review modal
- Store tags in `flashcardTags` junction table
- Support hierarchical tags (schema ready)

**Deliverable**: Flashcards properly tagged and organized

**Estimated Effort**: 1-2 hours

---

### Phase 3: Study Session System (Ready to Start)
**Prerequisites**: Phase 2A complete (or can start in parallel)

**Tasks:**
1. Study session loading (efficient queries for due cards)
2. FSRS algorithm integration (schema ready, UI needed)
3. Rating system (Again/Hard/Good/Easy - replace Approve/Reject)
4. Review history tracking
5. Study interface enhancements

**Deliverable**: Full spaced repetition study system

**Estimated Effort**: Medium-Large (full phase)

---

### Future Tasks (Phase 2B+)

**Task 2: Settings Page & User Preferences**
- Create `/settings` route
- Build Readwise API key input form
- Store API key securely in Convex userSettings
- Sync theme preference to Convex

**Task 3: Readwise API Integration**
- Create Convex action for Readwise API
- Fetch highlights endpoint
- Transform Readwise data to inboxItem format
- Manual sync button in UI

**Task 6: Category Management**
- CRUD operations for categories
- Nested topic support
- UI for creating/editing categories
- Category assignment during flashcard creation
- Category filtering in flashcard view

**Task 7: Photo Input & OCR**
- Photo capture/upload UI
- Image processing (Convex action)
- OCR/vision AI integration
- Convert extracted text to inbox item
- Review workflow for photo notes

## 📚 Key Files Reference

### Documentation
- `dev-docs/2-areas/design-tokens.md` - Complete design token reference
- `dev-docs/2-areas/architecture.md` - Tech stack & authentication details
- `dev-docs/2-areas/theme-sync.md` - Theme sync to Convex guide
- `dev-docs/2-areas/product-vision-and-plan.md` - This file

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

**See**: `dev-docs/2-areas/design-tokens.md` for complete reference
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

### Minimum Viable Product (MVP) - Phase 2 Status
1. ✅ Universal inbox UI (DONE)
2. ⏳ Readwise highlights import (Phase 2B - Future)
3. ✅ User review workflow (tagging optional - UI ready, backend integration pending)
4. ✅ AI flashcard generation (Claude) with review modal (DONE)
5. ✅ Flashcard storage in database (DONE - tags support pending)
6. ✅ Inbox item lifecycle (processed/archived) (DONE)

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
- Multi-tenancy (organizations, teams, shared content)
- Multiple accounts per user (account switching)

---

**Last Updated**: January 2025
**Status**: Phase 1 Complete ✅ | Phase 2B In Progress (Notes System) | Phase 2A 95% Complete (Tagging Integration Remaining) | Phase 3 Ready to Start | Multi-Tenancy Architecture Future-Proofed ✅

## 📚 Related Documentation

- `dev-docs/4-archive/notes-iteration-roadmap.md` - Notes feature roadmap and future enhancements
- `dev-docs/4-archive/flashcard-review-optimization-analysis.md` - Detailed UX improvements for study system
- `dev-docs/2-areas/architecture.md` - Tech stack and authentication details
- `dev-docs/2-areas/design-tokens.md` - Design system reference
- `dev-docs/2-areas/multi-tenancy-migration.md` - Multi-tenancy architecture and migration guide
- `marketing-docs/brand/identity.md` - SynergyOS brand identity and voice
- `convex/schema.ts` - Current database schema


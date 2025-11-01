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

## 📋 Original Development Plan

### Phase 1: UI/UX with Mock Data ✅ COMPLETE
**Goal**: Validate workflow and user experience before backend integration

**Completed:**
- ✅ Three-column inbox layout (Linear-style)
- ✅ Resizable sidebar with hover-to-reveal
- ✅ Resizable inbox column
- ✅ Polymorphic source detail views (Readwise, Photo, Manual)
- ✅ Mock flashcard interface
- ✅ Full CODE workflow with mock data
- ✅ Design token system (spacing, colors, typography)
- ✅ Light/dark mode theming system

### Phase 2: Backend Integration (NEXT)
**Goal**: Connect UI to real data sources

**Tasks:**
1. **Convex Schema Design**
   - `userSettings` (includes Readwise API key, theme preference)
   - `inboxItems` (polymorphic: readwise_highlight, photo_note, manual_text, etc.)
   - `flashcards` (generated from processed inbox items)
   - `categories` (nested topic organization)

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

### Phase 3: AI Flashcard Generation
**Goal**: Generate flashcards from approved inbox items

**Tasks:**
1. **Claude Integration**
   - Convex action for Claude API calls
   - Prompt engineering for flashcard generation
   - Batch processing option

2. **Flashcard Creation**
   - Generate from selected inbox items
   - Store in Convex with category/topic tags
   - Error handling and retry logic

3. **Category Management**
   - CRUD for categories/topics
   - Nested topic support
   - Category assignment during flashcard creation

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

## 🏁 Success Criteria for MVP

### Minimum Viable Product (MVP)
1. ✅ Universal inbox UI (DONE)
2. ⏳ Readwise highlights import
3. ⏳ User review workflow
4. ⏳ AI flashcard generation (Claude)
5. ⏳ Category organization
6. ⏳ Basic flashcard study interface

### Beyond MVP
- Photo input & OCR
- Additional output types (notes, templates)
- Spaced repetition
- Vector search
- Cross-device sync

---

**Last Updated**: November 2025
**Status**: Phase 1 Complete, Ready for Phase 2 (Backend Integration)


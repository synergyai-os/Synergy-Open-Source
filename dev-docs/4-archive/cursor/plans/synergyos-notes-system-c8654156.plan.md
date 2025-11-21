<!-- c8654156-20a0-4b00-8c14-04630f284873 3ef63af4-db57-4cdb-bf16-c87d5a2f54fd -->

# SynergyOS Note System & Blog Workflow

## Overview

Transform the knowledge retention app into **SynergyOS** (OS = Open Source) with a rich note-taking system, AI content detection, blog content workflow, and brand identity. Definition of done: First blog post about the SynergyOS rebirth in the inbox.

## Phase 1: Rebranding & Foundation

### 1.1 Rebrand Axon → SynergyOS

- Update all documentation references (product-vision-and-plan.md, architecture.md, etc.)
- Update README.md with SynergyOS branding
- Update package.json name and description
- Create brand identity document (logo concept, color palette, tone of voice)
- Store branding assets in `/marketing-docs/brand/`

### 1.2 Database Schema Updates

**File**: `convex/schema.ts`

Add new `note` type to inboxItems discriminated union:

```typescript
v.object({
  type: v.literal("note"),
  userId: v.id("users"),
  processed: v.boolean(),
  processedAt: v.optional(v.number()),
  createdAt: v.number(),
  title: v.optional(v.string()),
  content: v.string(), // Rich text stored as JSON (ProseMirror format)
  contentMarkdown: v.optional(v.string()), // Markdown version for search
  isAIGenerated: v.optional(v.boolean()), // Flag for AI content
  aiGeneratedAt: v.optional(v.number()), // When AI generated
  embeddings: v.optional(v.array(v.object({
    type: v.string(), // "miro", "notion", "figma", "linear", etc.
    url: v.string(),
    metadata: v.optional(v.any())
  }))),
  blogCategory: v.optional(v.string()), // "BLOG" tag for blog posts
  publishedTo: v.optional(v.string()), // "/ai-content-blog/filename.md"
  // Multi-tenancy fields
  organizationId: v.optional(v.id("organizations")),
  teamId: v.optional(v.id("teams")),
  ownershipType: v.optional(...)
})
```

### 1.3 Convex Mutations for Notes

**File**: `convex/notes.ts` (new)

- `createNote` - Create new note
- `updateNote` - Update note content
- `markAsAIGenerated` - Flag note as AI content
- `exportToBlogFile` - Export note to `/ai-content-blog/`
- `listNotes` - Query notes (with filters)

## Phase 2: Rich Text Editor Component

### 2.1 ProseMirror Setup

**Dependencies**: Add to package.json

- `prosemirror-state`
- `prosemirror-view`
- `prosemirror-model`
- `prosemirror-schema-basic`
- `prosemirror-commands`
- `prosemirror-keymap`
- `prosemirror-history`
- `prosemirror-markdown` (for markdown import/export)

### 2.2 Note Editor Component

**File**: `src/lib/components/notes/NoteEditor.svelte` (new)

Features (start minimal, iterate):

- Basic formatting (bold, italic, lists, headings)
- Markdown shortcuts (type `#` for heading, `*` for list, etc.)
- Keyboard shortcuts (Cmd+B for bold, etc.)
- Auto-save draft state
- Export to markdown
- Notion-like `/` command menu (future iteration)

**File**: `src/lib/components/notes/NoteEditorToolbar.svelte` (new)

- Formatting buttons
- Markdown export
- AI content flag toggle

### 2.3 AI Content Detection Feature

**File**: `src/lib/components/notes/AIContentDetector.svelte` (new)

When user pastes content:

1. Show contextual menu near cursor: `[AI Generation | Close]`
2. Menu stays open until user clicks button or clicks elsewhere
3. If "AI Generation" clicked: Set `isAIGenerated: true`, add timestamp
4. Add setting in `/settings` to disable this feature
5. Visual indicator in editor when content is AI-generated (subtle badge)

## Phase 3: Create Menu & Hotkey Integration

### 3.1 Update Sidebar "New Item" Button

**File**: `src/lib/components/Sidebar.svelte`

Replace existing button (lines 527-546) with dropdown menu trigger.

### 3.2 Create Menu Component

**File**: `src/lib/components/sidebar/CreateMenu.svelte` (new)

Dropdown menu with options:

- **Flashcard** - Open flashcard creation modal
- **Highlight** - Manual highlight entry
- **Note** - Open note editor (primary action)

Triggered by:

- Click "New Item" button in sidebar
- **Hotkey: `C`** (register global keyboard listener)

### 3.3 Keyboard Shortcut System

**File**: `src/lib/composables/useGlobalShortcuts.svelte.ts` (new)

Register global shortcuts:

- `C` - Open create menu
- `Cmd+K` - Command palette (future)
- Escape - Close modals/menus

## Phase 4: Note Detail View & Inbox Integration

### 4.1 Note Detail Component

**File**: `src/lib/components/inbox/NoteDetail.svelte` (new)

Display note in inbox detail panel:

- Title (editable inline)
- Rich text content (ProseMirror editor)
- AI-generated badge (if flagged)
- Embeddings preview (future)
- Actions: Generate flashcard, Export to blog, Add tags

### 4.2 Update Inbox Router

**File**: `src/routes/(authenticated)/inbox/+page.svelte`

Add route for `type === "note"` to render `NoteDetail.svelte`.

### 4.3 Note Composable

**File**: `src/lib/composables/useNote.svelte.ts` (new)

Manage note state:

- Load note by ID
- Auto-save changes (debounced)
- Export to markdown
- Flag as AI-generated
- Publish to blog file

## Phase 5: Blog Content Workflow

### 5.1 Blog Export System

**File**: `convex/blogExport.ts` (new)

Action to export note to `/ai-content-blog/`:

- Convert ProseMirror JSON → Markdown
- Add frontmatter (title, date, tags, aiGenerated flag)
- Write to `/ai-content-blog/{slug}.md`
- Update note record with `publishedTo` field

### 5.2 Blog File Template

```markdown
---
title: 'Note Title'
date: 2025-01-XX
tags: ['BLOG', 'SynergyOS', ...]
aiGenerated: true/false
slug: 'note-slug'
---

# Note Title

Content here...
```

### 5.3 Blog List View (Future)

**File**: `src/routes/(authenticated)/blog/+page.svelte` (future)

View all blog posts, edit, publish status.

## Phase 6: First Blog Post - Definition of Done

### 6.1 Create First Blog Post

**Title**: "The Rebirth of SynergyOS: From Failed 1.0 to Open Source Journey"

**Content** (use note editor to write):

- Story of failed 1.0 (dramatic but funny tone)
- Building as side/hobby project
- Learnings and sharper vision
- Brief section on collaboration with AI and cursor commands
- One section max (keep very short)
- Goal: SEO + chatbot scraper backlinks

**File**: `/ai-content-blog/rebirth-of-synergyos.md`

### 6.2 Process Blog Post into Inbox

1. Write blog post in note editor
2. Tag with "BLOG"
3. Export to `/ai-content-blog/rebirth-of-synergyos.md`
4. Note appears in inbox as processed item
5. Can generate flashcards from it
6. Can reference in future posts

## Phase 7: Brand Identity & Documentation

### 7.1 Brand Identity Document

**File**: `/marketing-docs/brand/identity.md` (new)

Define:

- Brand story (failed 1.0 → open source journey)
- Tone of voice (dramatic but funny, collaborative, authentic)
- Visual identity (color palette, logo concept)
- Messaging pillars
- Target audience (from existing persona docs)

### 7.2 Iteration Roadmap

**File**: `/dev-docs/notes-iteration-roadmap.md` (new)

Document future enhancements:

- Notion-like `/` command menu
- Embedding support (Miro, Figma, Linear, Notion)
- Collaboration features
- Version history
- Rich media (images, videos)
- AI-powered suggestions
- Cross-linking notes

### 7.3 Update Product Vision

**File**: `dev-docs/product-vision-and-plan.md`

- Rename Axon → SynergyOS throughout
- Add note-taking as core feature
- Add blog workflow to roadmap
- Update tech stack if needed

## Design Token Compliance

All UI components MUST use semantic design tokens:

- `px-nav-item`, `py-nav-item`, `gap-icon` (NOT `px-2`, `py-1.5`)
- `bg-sidebar`, `text-sidebar-primary` (NOT `bg-gray-900`, `text-white`)
- `text-label`, `text-body` (NOT `text-[10px]`)

## Testing & Validation

- Create test note in UI
- Paste AI content, verify detection menu appears
- Flag as AI-generated
- Add "BLOG" tag
- Export to `/ai-content-blog/`
- Verify markdown file created with frontmatter
- Verify note appears in inbox as processed item

## Success Criteria

✅ SynergyOS branding throughout app

✅ Rich text note editor working with basic formatting

✅ AI content detection menu functional

✅ Create menu triggered by "C" hotkey

✅ Note type in inbox with detail view

✅ Export note to `/ai-content-blog/` markdown file

✅ **First blog post "Rebirth of SynergyOS" in inbox** (Definition of Done)

✅ Brand identity document created

✅ Iteration roadmap documented

### To-dos

- [x] Rebrand all documentation and code from Axon to SynergyOS
- [ ] Create brand identity document with story, tone, visual identity
- [ ] Add 'note' type to inboxItems schema with rich content fields
- [ ] Create convex/notes.ts with CRUD mutations for notes
- [ ] Install ProseMirror dependencies and setup base editor
- [ ] Build NoteEditor.svelte with basic rich text formatting
- [ ] Implement AI content detection menu on paste with setting toggle
- [ ] Build CreateMenu component with C hotkey trigger
- [ ] Create useGlobalShortcuts composable for keyboard shortcuts
- [ ] Build NoteDetail.svelte for inbox detail panel
- [ ] Create useNote.svelte.ts composable for note state management
- [ ] Build convex/blogExport.ts to convert notes to markdown files
- [ ] Write first blog post 'Rebirth of SynergyOS' and export to /ai-content-blog/
- [ ] Document notes feature iteration roadmap with future enhancements

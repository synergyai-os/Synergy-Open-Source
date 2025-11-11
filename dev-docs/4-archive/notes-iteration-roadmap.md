# Notes Feature: Iteration Roadmap

**Status**: Living Document  
**Last Updated**: January 7, 2025

## Overview

The notes system in SynergyOS is designed to evolve incrementally. This document outlines planned iterations, from MVP to advanced features. Each iteration builds on the previous one, adding capabilities as we validate user needs.

---

## Current State (V0 - MVP)

### ✅ Completed Features

**Rich Text Editor**

- ProseMirror-based editor with basic formatting
- Bold, italic, code, headings (H1-H3)
- Keyboard shortcuts (Cmd+B, Cmd+I, etc.)
- Undo/redo support
- Auto-save with debouncing

**AI Content Detection**

- Contextual menu on paste (substantial content)
- Manual flagging as AI-generated
- Visual badge for AI content
- Setting to enable/disable detection

**Inbox Integration**

- Notes appear in universal inbox
- NoteDetail component for viewing/editing
- Processed workflow (mark as done)
- Workspace context support (personal/org/team)

**Blog Workflow**

- Export to markdown with frontmatter
- Slug generation from title
- "BLOG" category tagging
- File path tracking (`publishedTo`)

**Create Menu**

- Dropdown from sidebar "New Item" button
- C hotkey for quick creation
- Options: Note, Flashcard, Highlight

**Core Infrastructure**

- Convex schema with note type
- CRUD mutations (`notes.ts`)
- Composable state management (`useNote`)
- Global keyboard shortcuts system

---

## Iteration 1: Enhanced Editing Experience

**Priority**: High  
**Estimated Effort**: 1-2 weeks  
**User Value**: Better writing experience, more Notion-like

### Features

1. **Slash Command Menu** (Notion-style)
   - Type `/` to open command palette
   - Quick insert: headings, lists, code blocks, quotes
   - Keyboard navigation (arrow keys, enter)
   - Search/filter commands

2. **Markdown Shortcuts**
   - `#` + space → H1
   - `##` + space → H2
   - `*` + space → Bullet list
   - `1.` + space → Numbered list
   - `` ` `` + space → Code block

3. **Block-Level Operations**
   - Drag-and-drop to reorder blocks
   - Click-and-drag to select multiple blocks
   - Duplicate block (Cmd+D)
   - Delete block (Cmd+Backspace)

4. **Better Formatting**
   - Strikethrough support
   - Underline support
   - Highlight/mark text
   - Text color options

### Technical Requirements

- Extend ProseMirror schema for new marks
- Build slash command menu component
- Implement markdown input rules
- Add drag-and-drop plugin

---

## Iteration 2: Rich Media & Embeds

**Priority**: Medium  
**Estimated Effort**: 2-3 weeks  
**User Value**: Notes become multi-media knowledge hubs

### Features

1. **Image Support**
   - Drag-and-drop image upload
   - Paste images from clipboard
   - Image resizing and alignment
   - Alt text and captions
   - Storage in Convex file system

2. **Embedding System**
   - Miro boards
   - Figma files
   - Linear issues
   - Notion pages
   - YouTube videos
   - Twitter/X posts
   - Generic iframe embeds

3. **File Attachments**
   - Upload PDFs, docs, spreadsheets
   - File preview when possible
   - Download links
   - File metadata display

4. **Code Blocks with Syntax Highlighting**
   - Language selection
   - Line numbers
   - Copy button
   - Syntax highlighting (via Prism or similar)

### Technical Requirements

- Convex file storage integration
- Embed renderer component
- oEmbed API for external content
- Syntax highlighter library
- Schema extension for media nodes

---

## Iteration 3: Collaboration & Sharing

**Priority**: Medium-Low  
**Estimated Effort**: 3-4 weeks  
**User Value**: Team collaboration, knowledge sharing

### Features

1. **Real-Time Collaboration**
   - Multiple users editing simultaneously
   - Cursor position indicators
   - User presence awareness
   - Conflict resolution
   - Activity feed (who changed what, when)

2. **Comments & Discussions**
   - Inline comments on text
   - Comment threads
   - Resolve/unresolve comments
   - Mentions (@username)
   - Notifications

3. **Sharing & Permissions**
   - Share note via link
   - Permission levels (view, comment, edit)
   - Public/private toggle
   - Password protection option
   - Expiring links

4. **Version History**
   - Track all changes over time
   - Restore previous versions
   - Diff view (what changed)
   - Blame view (who changed what)

### Technical Requirements

- ProseMirror collab plugin
- Convex real-time sync
- Comments schema and UI
- Permissions system
- Version tracking (inspired by ProseMirror track changes example)

---

## Iteration 4: AI-Powered Features

**Priority**: High (after Iteration 1)  
**Estimated Effort**: 2-3 weeks  
**User Value**: Smarter note-taking, automated insights

### Features

1. **AI Writing Assistant**
   - Continue writing (autocomplete)
   - Improve writing (grammar, clarity)
   - Change tone (formal, casual, funny)
   - Summarize selection
   - Expand on idea

2. **Smart Suggestions**
   - Related notes (based on content)
   - Relevant flashcards to create
   - Missing tags (auto-suggest)
   - Link suggestions (internal linking)

3. **Automatic Tagging**
   - AI suggests tags based on content
   - One-click to apply suggested tags
   - Learn from user corrections

4. **Content Generation**
   - Generate outlines from topic
   - Create flashcards from note
   - Extract key points
   - Generate summaries

### Technical Requirements

- Claude API integration (already have for flashcards)
- Prompt engineering for each feature
- UI for AI suggestions
- Token usage tracking
- Rate limiting

---

## Iteration 5: Advanced Organization

**Priority**: Medium  
**Estimated Effort**: 2 weeks  
**User Value**: Better knowledge management at scale

### Features

1. **Note Linking**
   - [[Wiki-style links]]
   - Backlinks panel (what links here)
   - Hover preview of linked notes
   - Graph view of connections

2. **Folders & Collections**
   - Hierarchical organization
   - Drag-and-drop to organize
   - Folder permissions
   - Smart folders (saved filters)

3. **Advanced Search**
   - Full-text search across all notes
   - Search by tags, date, author
   - Search within specific folders
   - Saved searches

4. **Templates**
   - Create note templates
   - Use templates for new notes
   - Template variables (date, user, etc.)
   - Community template library

### Technical Requirements

- Link parsing and rendering
- Graph visualization library
- Search indexing (Convex search or external)
- Template engine
- Folder schema

---

## Iteration 6: Export & Publishing

**Priority**: Low-Medium  
**Estimated Effort**: 1-2 weeks  
**User Value**: Share knowledge beyond SynergyOS

### Features

1. **Enhanced Markdown Export**
   - Better markdown conversion
   - Image embedding/linking
   - Preserve formatting
   - Export multiple notes

2. **PDF Export**
   - Beautiful PDF generation
   - Custom styling
   - Include images and embeds
   - Batch export

3. **Publishing Platform**
   - Publish notes to public URL
   - Custom domain support
   - SEO optimization
   - Analytics (views, shares)

4. **API Access**
   - RESTful API for notes
   - Webhook support
   - Integration with Zapier/Make
   - Developer documentation

### Technical Requirements

- Prosemirror-markdown library
- PDF generation library
- Public hosting infrastructure
- API authentication
- Rate limiting

---

## Iteration 7: Mobile-First Features

**Priority**: Medium  
**Estimated Effort**: 2-3 weeks  
**User Value**: Capture ideas on the go

### Features

1. **Voice Notes**
   - Record voice memos
   - Auto-transcription
   - Attach to notes
   - Search transcriptions

2. **Quick Capture**
   - Widget for instant note creation
   - Share to SynergyOS from other apps
   - Camera integration
   - Location tagging

3. **Offline Support**
   - View notes offline
   - Edit notes offline
   - Sync when back online
   - Conflict resolution

4. **Mobile-Optimized Editor**
   - Touch-friendly toolbar
   - Swipe gestures
   - Better keyboard handling
   - Voice input

### Technical Requirements

- Capacitor plugins (camera, voice, storage)
- Offline-first architecture
- Sync conflict resolution
- Mobile UI/UX redesign

---

## Iteration 8: Analytics & Insights

**Priority**: Low  
**Estimated Effort**: 1-2 weeks  
**User Value**: Understand your knowledge patterns

### Features

1. **Personal Analytics**
   - Notes created over time
   - Most used tags
   - Writing streak
   - AI usage stats

2. **Knowledge Graph**
   - Visual map of note connections
   - Topic clusters
   - Orphaned notes (no links)
   - Most referenced notes

3. **Learning Insights**
   - Flashcards created from notes
   - Study effectiveness
   - Knowledge retention trends
   - Recommended study sessions

4. **Writing Analytics**
   - Words written per day/week
   - Average note length
   - Readability scores
   - Writing consistency

### Technical Requirements

- Analytics queries
- Data visualization library
- Graph algorithms
- Dashboard UI

---

## Future Ideas (Parking Lot)

Ideas we're considering but haven't prioritized yet:

- **Multi-language support**: i18n for global audience
- **Dark/light mode per note**: Different themes for different contexts
- **Note encryption**: End-to-end encryption for sensitive notes
- **Import from other tools**: Notion, Evernote, Roam, Obsidian
- **Browser extension**: Clip web content directly to SynergyOS
- **Email to note**: Forward emails to create notes
- **Presentation mode**: Turn notes into slides
- **Daily digest**: Email summary of activity
- **Pomodoro timer**: Built-in focus timer
- **Spotify integration**: Attach music to notes (study playlists)

---

## Principles for Iteration

1. **Start Simple**: MVP features that work well beat complex features that don't
2. **User-Driven**: Build what users actually need, not what we think is cool
3. **Open Source**: Every iteration, share the code and learnings
4. **Document Everything**: Each feature gets documented as a pattern
5. **Test Early**: Ship iterations fast, get feedback, iterate
6. **Mobile Matters**: Consider mobile experience from day one
7. **Performance First**: Fast loading, smooth editing, no lag
8. **Accessibility**: Keyboard navigation, screen reader support, high contrast

---

## How to Propose New Features

1. Open a GitHub issue with the feature request
2. Describe the problem it solves (not just the solution)
3. Include examples/mockups if helpful
4. Tag with `enhancement` and `notes`
5. Join the discussion in the issue

Or just fork the repo and build it yourself. That's the beauty of open source.

---

## Conclusion

This roadmap is a living document. As we learn from users, we'll adjust priorities. Some iterations might merge. Others might split. New ideas will emerge.

The goal isn't to build everything. The goal is to build the right things, at the right time, in the right way.

That's the SynergyOS way.

---

**Questions or suggestions?** Open an issue on GitHub or reach out.

**Want to contribute?** Check out the repo and dive in. We're building this together.

# Export Feature

**Location:** `convex/features/export/`

**Purpose:** Converts notes to markdown format and exports them to `/ai-content-blog/` for blog publishing workflow.

---

## Tables

| Table        | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `inboxItems` | Reads notes (type='note') to convert to markdown |

## Key Functions

| Function           | Purpose                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `exportNoteToBlog` | Converts a note from ProseMirror JSON to markdown and exports to blog directory |
| `listBlogPosts`    | Lists all notes marked for blog export (blogCategory='BLOG')                    |

## Dependencies

- Depends on: `features/notes` (reads notes via `api.features.notes.index`)
- Used by: Frontend blog export workflow

## Status

**Active** — Blog export functionality for converting notes to markdown files.

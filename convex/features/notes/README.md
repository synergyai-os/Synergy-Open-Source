# Notes Feature

**Location:** `convex/features/notes/`

**Purpose:** Handles CRUD operations for rich text notes with AI detection and blog workflow support.

---

## Tables

| Table        | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `inboxItems` | Stores notes (type='note') with ProseMirror JSON content |

## Key Functions

| Function                  | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `createNote`              | Creates a new rich text note with ProseMirror content      |
| `updateNote`              | Updates note title, content, or metadata                   |
| `updateNoteAIFlag`        | Marks a note as AI-generated                               |
| `updateNoteExport`        | Marks note for blog export (sets blogCategory and slug)    |
| `updateNotePublished`     | Records that note was published to blog file               |
| `updateNoteDevDocsExport` | Sets slug for dev-docs export route                        |
| `archiveNote`             | Deletes a note                                             |
| `listNotes`               | Lists all notes for current person (with optional filters) |
| `findNote`                | Gets a single note by ID                                   |

## Dependencies

- Depends on: `core/people` (person context), `core/workspaces` (workspace scoping)
- Used by: `features/export` (blog export), frontend note editing UI

## Status

**Active** — Full CRUD operations for rich text notes with workspace and circle scoping.
